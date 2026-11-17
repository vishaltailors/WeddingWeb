const tokenPattern = /^[0-9a-f]{64}$/;

/** Accepts only a well-formed bearer token; every other value is ignored. */
export function normalizeInviteToken(value) {
  return typeof value === "string" && tokenPattern.test(value)
    ? value
    : undefined;
}
