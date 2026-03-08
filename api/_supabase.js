import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS, for API proxies to read secrets
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Read a secret by service ID (service role, bypasses RLS)
export async function getSecret(serviceId) {
  const client = getServiceClient();
  if (!client) return null;
  const { data, error } = await client
    .from("batcave_secrets")
    .select("api_key")
    .eq("service_id", serviceId)
    .single();
  if (error || !data) return null;
  return data.api_key;
}

// User client from JWT — respects RLS
export function getUserClient(jwt) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}
