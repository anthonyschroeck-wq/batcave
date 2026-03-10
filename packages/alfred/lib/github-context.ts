// Alfred GitHub Context Fetcher
// When a voice command includes a project tag,
// fetch that repo's CLAUDE.md and STATE.md for context injection.

const TAG_TO_REPO: Record<string, string> = {
  batcave: "anthonyschroeck-wq/batcave",
  omote: "anthonyschroeck-wq/omote",
  cerebro: "anthonyschroeck-wq/cerebro",
  "run-recipes": "anthonyschroeck-wq/run-recipes",
};

interface RepoContext {
  repo: string;
  claudeMd: string | null;
  stateMd: string | null;
}

export function extractTag(transcript: string): string | undefined {
  // Match explicit hashtags: #omote, #batcave, etc.
  const hashMatch = transcript.match(/#(\w[\w-]*)/);
  if (hashMatch && TAG_TO_REPO[hashMatch[1].toLowerCase()]) {
    return hashMatch[1].toLowerCase();
  }

  // Match spoken project names: "omote status", "deploy cerebro"
  const lower = transcript.toLowerCase();
  for (const tag of Object.keys(TAG_TO_REPO)) {
    if (lower.includes(tag.replace("-", " ")) || lower.includes(tag)) {
      return tag;
    }
  }

  return undefined;
}

async function fetchFileContent(
  repo: string,
  path: string,
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.raw+json",
        },
      }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchRepoContext(
  tag: string,
  githubToken: string
): Promise<RepoContext | null> {
  const repo = TAG_TO_REPO[tag];
  if (!repo) return null;

  const [claudeMd, stateMd] = await Promise.all([
    fetchFileContent(repo, "CLAUDE.md", githubToken),
    fetchFileContent(repo, "STATE.md", githubToken),
  ]);

  return { repo, claudeMd, stateMd };
}

export function buildContextBlock(context: RepoContext): string {
  let block = `\n--- Project Context: ${context.repo} ---\n`;
  if (context.claudeMd) {
    block += `\n## CLAUDE.md\n${context.claudeMd}\n`;
  }
  if (context.stateMd) {
    block += `\n## STATE.md\n${context.stateMd}\n`;
  }
  return block;
}
