import { getServiceClient, getUserClient, getSecret } from "./_supabase.js";

const SONNET_INPUT_COST = 3.0;
const SONNET_OUTPUT_COST = 15.0;

export default async function handler(req, res) {
  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const jwt = req.headers.authorization?.replace("Bearer ", "");
  const userClient = jwt ? getUserClient(jwt) : null;

  // GET /api/agents — list catalog + user's deployments
  if (req.method === "GET") {
    const action = req.query.action;

    if (action === "catalog") {
      const { data } = await supabase.from("batcave_agent_catalog").select("*").order("level");
      return res.json({ catalog: data || [] });
    }

    if (action === "deployments") {
      if (!userClient) return res.status(401).json({ error: "Auth required" });
      const { data } = await userClient.from("batcave_agent_deployments").select("*, catalog:batcave_agent_catalog(*)").order("created_at", { ascending: false });
      return res.json({ deployments: data || [] });
    }

    if (action === "runs" && req.query.deployment_id) {
      if (!userClient) return res.status(401).json({ error: "Auth required" });
      const { data } = await userClient.from("batcave_agent_runs")
        .select("*").eq("deployment_id", req.query.deployment_id)
        .order("started_at", { ascending: false }).limit(20);
      return res.json({ runs: data || [] });
    }

    if (action === "goals" && req.query.deployment_id) {
      if (!userClient) return res.status(401).json({ error: "Auth required" });
      const { data } = await userClient.from("batcave_agent_goals")
        .select("*").eq("deployment_id", req.query.deployment_id)
        .order("created_at");
      return res.json({ goals: data || [] });
    }

    if (action === "approvals") {
      if (!userClient) return res.status(401).json({ error: "Auth required" });
      const { data } = await userClient.from("batcave_agent_approvals")
        .select("*, deployment:batcave_agent_deployments(catalog_id)")
        .eq("status", "pending")
        .order("created_at");
      return res.json({ approvals: data || [] });
    }

    // Default: catalog + deployments + pending approvals
    const [catalogRes, deploymentsRes, approvalsRes] = await Promise.all([
      supabase.from("batcave_agent_catalog").select("*").order("level"),
      userClient ? userClient.from("batcave_agent_deployments").select("*, catalog:batcave_agent_catalog(*)").order("created_at", { ascending: false }) : { data: [] },
      userClient ? userClient.from("batcave_agent_approvals").select("*").eq("status", "pending").order("created_at") : { data: [] },
    ]);
    return res.json({
      catalog: catalogRes.data || [],
      deployments: deploymentsRes.data || [],
      approvals: approvalsRes.data || [],
    });
  }

  // POST /api/agents — deploy, run, approve, pause, retire
  if (req.method === "POST") {
    if (!userClient) return res.status(401).json({ error: "Auth required" });

    const { action, catalog_id, deployment_id, approval_id, config, goals, decision } = req.body || {};
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return res.status(401).json({ error: "Invalid session" });

    // Deploy a new agent
    if (action === "deploy") {
      if (!catalog_id) return res.status(400).json({ error: "catalog_id required" });

      const { data: catalog } = await supabase.from("batcave_agent_catalog")
        .select("*").eq("id", catalog_id).single();
      if (!catalog) return res.status(404).json({ error: "Agent not found in catalog" });

      const { data: deployment, error } = await userClient.from("batcave_agent_deployments").insert({
        user_id: user.id,
        catalog_id,
        config: config || catalog.config_schema || {},
        schedule: catalog.schedule_default || null,
      }).select().single();

      if (error) return res.status(500).json({ error: error.message });

      // Create goals if provided
      if (goals && Array.isArray(goals)) {
        for (const g of goals) {
          await userClient.from("batcave_agent_goals").insert({
            deployment_id: deployment.id, user_id: user.id,
            title: g.title, target_value: g.target || null,
          });
        }
      }

      return res.json({ deployment, message: `${catalog.name} deployed` });
    }

    // Run an agent
    if (action === "run") {
      if (!deployment_id) return res.status(400).json({ error: "deployment_id required" });

      const { data: dep } = await userClient.from("batcave_agent_deployments")
        .select("*, catalog:batcave_agent_catalog(*)").eq("id", deployment_id).single();
      if (!dep) return res.status(404).json({ error: "Deployment not found" });

      // Create run record
      const { data: run } = await userClient.from("batcave_agent_runs").insert({
        deployment_id, user_id: user.id, trigger_type: "manual",
      }).select().single();

      try {
        const result = await executeAgent(dep, run, supabase, userClient, user);

        // Update run
        await supabase.from("batcave_agent_runs").update({
          status: result.approvals?.length > 0 ? "pending_approval" : "completed",
          completed_at: new Date().toISOString(),
          result: result.data || {},
          summary: result.summary || "",
          tokens_used: result.tokens || 0,
          cost_cents: result.cost || 0,
        }).eq("id", run.id);

        // Update deployment stats
        await supabase.from("batcave_agent_deployments").update({
          last_run_at: new Date().toISOString(),
          total_runs: (dep.total_runs || 0) + 1,
          total_cost_cents: parseFloat(dep.total_cost_cents || 0) + (result.cost || 0),
          updated_at: new Date().toISOString(),
        }).eq("id", deployment_id);

        // Create approval records if agent proposed actions
        if (result.approvals?.length > 0) {
          for (const a of result.approvals) {
            await userClient.from("batcave_agent_approvals").insert({
              run_id: run.id, deployment_id, user_id: user.id,
              action_type: a.type, action_payload: a.payload,
              description: a.description,
            });
          }
        }

        return res.json({ run: { ...run, status: "completed", summary: result.summary }, result: result.data, approvals: result.approvals || [] });
      } catch (err) {
        await supabase.from("batcave_agent_runs").update({
          status: "failed", completed_at: new Date().toISOString(), error: err.message,
        }).eq("id", run.id);
        return res.status(500).json({ error: err.message });
      }
    }

    // Approve/reject a proposed action
    if (action === "decide") {
      if (!approval_id || !decision) return res.status(400).json({ error: "approval_id and decision required" });

      await userClient.from("batcave_agent_approvals").update({
        status: decision === "approve" ? "approved" : "rejected",
        decided_at: new Date().toISOString(),
      }).eq("id", approval_id);

      // If approved, execute the action
      if (decision === "approve") {
        const { data: approval } = await userClient.from("batcave_agent_approvals")
          .select("*").eq("id", approval_id).single();
        if (approval) {
          await executeApprovedAction(approval, supabase, userClient, user);
        }
      }

      return res.json({ status: decision === "approve" ? "approved" : "rejected" });
    }

    // Pause/resume/retire
    if (action === "pause" || action === "resume" || action === "retire") {
      const newStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "retired";
      await userClient.from("batcave_agent_deployments").update({
        status: newStatus, updated_at: new Date().toISOString(),
      }).eq("id", deployment_id);
      return res.json({ status: newStatus });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "GET or POST" });
}

// ─── Agent Execution Engine ──────────────────────────────────────

async function executeAgent(deployment, run, supabase, userClient, user) {
  const catalogId = deployment.catalog?.id || deployment.catalog_id;

  switch (catalogId) {
    case "deploy-health":
      return await runDeployHealth(deployment, supabase);
    case "task-velocity":
      return await runTaskVelocity(deployment, supabase, userClient);
    case "repo-pulse":
      return await runRepoPulse(deployment, supabase);
    case "weekly-review":
      return await runAIAgent(deployment, supabase, userClient, user, buildWeeklyReviewPrompt);
    case "priority-rebalancer":
      return await runAIAgent(deployment, supabase, userClient, user, buildPriorityPrompt);
    default:
      return { summary: `Agent ${catalogId} execution not yet implemented.`, data: {} };
  }
}

// ─── Deploy Health (Level 1: Observer) ───────────────────────────
async function runDeployHealth(deployment, supabase) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { summary: "Vercel token not configured.", data: {} };

  const teamId = process.env.VERCEL_TEAM_ID || "team_KhfsGH2C6La9tyHfxicteccL";
  const resp = await fetch(`https://api.vercel.com/v6/deployments?teamId=${teamId}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return { summary: "Failed to fetch Vercel deployments.", data: {} };

  const { deployments } = await resp.json();
  const errors = deployments.filter(d => d.state === "ERROR");
  const ready = deployments.filter(d => d.state === "READY");
  const building = deployments.filter(d => d.state === "BUILDING");

  const projects = {};
  for (const d of deployments) {
    const name = d.meta?.githubCommitRepo || d.name;
    if (!projects[name]) projects[name] = { total: 0, errors: 0, ready: 0, latest: d.state };
    projects[name].total++;
    if (d.state === "ERROR") projects[name].errors++;
    if (d.state === "READY") projects[name].ready++;
  }

  const summary = errors.length > 0
    ? `${errors.length} deploy error(s) detected across ${Object.keys(projects).length} projects. ${ready.length} successful, ${building.length} building.`
    : `All clear. ${ready.length} successful deployments across ${Object.keys(projects).length} projects. No errors.`;

  return {
    summary,
    data: { deployments: deployments.length, errors: errors.length, ready: ready.length, building: building.length, projects },
    approvals: errors.length > 0 ? [{
      type: "create_task",
      description: `Create task to investigate ${errors.length} deploy error(s)`,
      payload: {
        title: `Fix ${errors.length} deploy error(s) — ${errors.map(e => e.meta?.githubCommitRepo).filter(Boolean).join(", ")}`,
        priority: "high",
        due_date: new Date().toISOString().slice(0, 10),
      },
    }] : [],
  };
}

// ─── Task Velocity (Level 1: Observer) ───────────────────────────
async function runTaskVelocity(deployment, supabase, userClient) {
  const lookback = deployment.config?.lookback_days || 14;
  const since = new Date(Date.now() - lookback * 86400000).toISOString();

  const [tasksRes, completedRes] = await Promise.all([
    userClient.from("batcave_tasks").select("*").gte("created_at", since),
    userClient.from("batcave_tasks").select("*").eq("completed", true).gte("updated_at", since),
  ]);

  const tasks = tasksRes.data || [];
  const completed = completedRes.data || [];
  const open = tasks.filter(t => !t.completed);
  const avgClose = completed.length > 0
    ? (completed.reduce((sum, t) => sum + Math.max(0, new Date(t.updated_at) - new Date(t.created_at)), 0) / completed.length / 86400000).toFixed(1)
    : null;

  const summary = `${lookback}-day velocity: ${completed.length} completed, ${open.length} still open.${avgClose ? ` Avg close time: ${avgClose} days.` : ""} Created ${tasks.length} total.`;

  return { summary, data: { lookback, created: tasks.length, completed: completed.length, open: open.length, avg_close_days: avgClose } };
}

// ─── Repo Pulse (Level 1: Observer) ──────────────────────────────
async function runRepoPulse(deployment, supabase) {
  const ghToken = await getSecret("github");
  if (!ghToken) return { summary: "GitHub not connected.", data: {} };

  const repos = ["batcave", "omote", "cerebro", "run-recipes"];
  const results = {};

  for (const repo of repos) {
    try {
      const [commitsResp, prsResp] = await Promise.all([
        fetch(`https://api.github.com/repos/anthonyschroeck-wq/${repo}/commits?per_page=5`, {
          headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" },
        }),
        fetch(`https://api.github.com/repos/anthonyschroeck-wq/${repo}/pulls?state=open&per_page=10`, {
          headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" },
        }),
      ]);
      const commits = commitsResp.ok ? await commitsResp.json() : [];
      const prs = prsResp.ok ? await prsResp.json() : [];
      const lastCommit = commits[0];
      const daysSince = lastCommit ? Math.floor((Date.now() - new Date(lastCommit.commit?.committer?.date).getTime()) / 86400000) : null;

      results[repo] = { commits: commits.length, open_prs: prs.length, days_since_last_commit: daysSince, last_message: lastCommit?.commit?.message?.split("\n")[0] || null };
    } catch { results[repo] = { error: "Failed to fetch" }; }
  }

  const stale = Object.entries(results).filter(([, v]) => v.days_since_last_commit > 7).map(([k]) => k);
  const summary = stale.length > 0
    ? `${stale.join(", ")} ha${stale.length > 1 ? "ve" : "s"} been quiet for 7+ days. ${Object.keys(results).length} repos scanned.`
    : `All repos active. ${Object.keys(results).length} repos scanned.`;

  return { summary, data: results };
}

// ─── AI Agent Runner (Level 2+) ──────────────────────────────────
async function runAIAgent(deployment, supabase, userClient, user, promptBuilder) {
  const apiKey = await getSecret("anthropic");
  if (!apiKey) return { summary: "Anthropic not connected.", data: {} };

  const context = await promptBuilder(deployment, supabase, userClient);

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1024,
      system: context.system,
      messages: [{ role: "user", content: context.user }],
    }),
  });

  if (!resp.ok) return { summary: "AI generation failed.", data: {} };
  const data = await resp.json();
  const content = data.content?.map(c => c.text || "").join("") || "";
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;
  const costCents = (inputTokens / 1000000 * SONNET_INPUT_COST + outputTokens / 1000000 * SONNET_OUTPUT_COST) * 100;

  await supabase.from("batcave_usage").insert({
    service: "anthropic", endpoint: `agent:${deployment.catalog_id}`,
    input_tokens: inputTokens, output_tokens: outputTokens,
    model: "claude-sonnet-4-20250514", cost_cents: Math.round(costCents * 10000) / 10000,
  });

  let parsed = {};
  try { parsed = JSON.parse(content.replace(/```json\s*|```/g, "").trim()); } catch { parsed = { raw: content }; }

  return { summary: parsed.summary || content.slice(0, 200), data: parsed, tokens: inputTokens + outputTokens, cost: costCents, approvals: parsed.proposed_actions || [] };
}

async function buildWeeklyReviewPrompt(deployment, supabase, userClient) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const [tasks, events] = await Promise.all([
    userClient.from("batcave_tasks").select("*").gte("updated_at", weekAgo),
    userClient.from("batcave_events").select("*").gte("start_date", weekAgo.slice(0, 10)),
  ]);

  return {
    system: `You are Alfred, generating a weekly review. Respond ONLY with JSON: {"summary": "2-3 sentence overview", "wins": ["..."], "misses": ["..."], "focus_areas": ["..."], "proposed_actions": []}`,
    user: `Tasks this week: ${JSON.stringify(tasks.data?.slice(0, 30))}\nEvents: ${JSON.stringify(events.data?.slice(0, 20))}`,
  };
}

async function buildPriorityPrompt(deployment, supabase, userClient) {
  const [tasks, events] = await Promise.all([
    userClient.from("batcave_tasks").select("*").eq("completed", false).order("due_date"),
    userClient.from("batcave_events").select("*").gte("end_date", new Date().toISOString().slice(0, 10)).order("start_date").limit(10),
  ]);

  return {
    system: `You are Alfred, rebalancing priorities. Respond ONLY with JSON: {"summary": "...", "recommendations": [{"task_title": "...", "current_priority": "...", "recommended_priority": "...", "reason": "..."}], "proposed_actions": []}`,
    user: `Open tasks: ${JSON.stringify(tasks.data)}\nUpcoming events: ${JSON.stringify(events.data)}\nToday: ${new Date().toISOString().slice(0, 10)}`,
  };
}

// ─── Execute Approved Actions ────────────────────────────────────
async function executeApprovedAction(approval, supabase, userClient, user) {
  switch (approval.action_type) {
    case "create_task":
      await userClient.from("batcave_tasks").insert({
        user_id: user.id, ...approval.action_payload, completed: false,
      });
      break;
    // Future: send_email, merge_pr, etc.
    default:
      break;
  }
}
