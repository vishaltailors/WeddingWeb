import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

const tokenPattern = /^[0-9a-f]{64}$/;

/** Accepts only a well-formed bearer token; every other value is ignored. */
export function normalizeInviteToken(value) {
  return typeof value === "string" && tokenPattern.test(value)
    ? value
    : undefined;
}

export function invitationLink(origin, side, token) {
  const link = new URL("/", origin);
  link.searchParams.set("side", side);
  link.searchParams.set("invite", token);
  return link.href;
}

/**
 * Resolves the single invitation behind a bearer token. Names and messages
 * always come from the database, never from the address bar, so editing the
 * link cannot change who a guest is or what they read.
 */
export async function fetchInvitation(token, side) {
  if (!supabase || !normalizeInviteToken(token)) return null;
  const { data, error } = await supabase.rpc("resolve_invitation", {
    invitation_token: token,
    invitation_side: side,
  });
  if (error) return null;
  const resolved = Array.isArray(data) ? data[0] : data;
  return resolved ?? null;
}

const columns =
  "id, token, name, message, side, active, created_at, updated_at";

export async function getInvitationSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signInAdmin(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

/**
 * Re-checks the current password before storing a new one, so a borrowed
 * browser cannot silently rotate the credential of an unlocked session.
 */
export async function changeAdminPassword(email, currentPassword, newPassword) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (verifyError) throw verifyError;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** True when the signed-in account is on the invitation admin allowlist. */
export async function checkAdminAccess() {
  const { data, error } = await supabase.rpc("is_invitation_admin");
  if (error) throw error;
  return data === true;
}

export async function listInvitations() {
  const { data, error } = await supabase
    .from("invitations")
    .select(columns)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createInvitation(values) {
  const { data, error } = await supabase
    .from("invitations")
    .insert(values)
    .select(columns)
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvitation(id, values) {
  const { data, error } = await supabase
    .from("invitations")
    .update(values)
    .eq("id", id)
    .select(columns)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvitation(id) {
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}
