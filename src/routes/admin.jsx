import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Link2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  checkAdminAccess,
  createInvitation,
  deleteInvitation,
  getInvitationSession,
  invitationLink,
  listInvitations,
  signInAdmin,
  signOutAdmin,
  supabase,
  supabaseConfigured,
  updateInvitation,
} from "../supabase";

export const Route = createFileRoute("/admin")({ component: Admin });

const blankDraft = { name: "", message: "", side: "groom" };

function useAdminDocumentTitle() {
  useEffect(() => {
    document.title = "Invitation admin";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow";
    document.head.append(robots);
    return () => robots.remove();
  }, []);
}

function SignIn({ onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInAdmin(email.trim(), password);
      onSignedIn();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-panel admin-signin" onSubmit={submit}>
      <h1>Invitation admin</h1>
      <p className="admin-hint">
        Sign in with the account that manages personalised invitations.
      </p>
      <label>
        <span>Email</span>
        <input
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      <button className="admin-primary" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <a className="admin-link" href="/">
        Back to the invitation
      </a>
    </form>
  );
}

function InvitationRow({ invitation, onChanged, onDeleted, onNotice }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: invitation.name,
    message: invitation.message,
    side: invitation.side,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const link = invitationLink(
    window.location.origin,
    invitation.side,
    invitation.token,
  );

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function save(event) {
    event.preventDefault();
    run(async () => {
      const updated = await updateInvitation(invitation.id, {
        name: draft.name.trim(),
        message: draft.message,
        side: draft.side,
      });
      onChanged(updated);
      setEditing(false);
      onNotice(`Saved changes for ${updated.name}`);
    });
  }

  function toggleActive() {
    run(async () => {
      const updated = await updateInvitation(invitation.id, {
        active: !invitation.active,
      });
      onChanged(updated);
      onNotice(
        updated.active
          ? `Invitation active for ${updated.name}`
          : `Invitation paused for ${updated.name}`,
      );
    });
  }

  function remove() {
    if (!window.confirm(`Delete the invitation for ${invitation.name}?`)) return;
    run(async () => {
      await deleteInvitation(invitation.id);
      onDeleted(invitation.id);
      onNotice(`Deleted the invitation for ${invitation.name}`);
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      onNotice(`Link copied for ${invitation.name}`);
    } catch {
      onNotice("Copy the link from the field below.");
    }
  }

  return (
    <li className="admin-row" data-active={invitation.active}>
      <div className="admin-row-head">
        <div>
          <h2>{invitation.name}</h2>
          <p className="admin-meta">
            <span className="admin-badge" data-side={invitation.side}>
              {invitation.side}
            </span>
            <span className="admin-badge" data-active={invitation.active}>
              {invitation.active ? "active" : "paused"}
            </span>
          </p>
        </div>
        <div className="admin-row-actions">
          <button type="button" onClick={copy} title="Copy invitation link">
            <Copy size={15} /> Copy link
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft({
                name: invitation.name,
                message: invitation.message,
                side: invitation.side,
              });
              setEditing(!editing);
            }}
          >
            {editing ? <X size={15} /> : <Pencil size={15} />}
            {editing ? "Cancel" : "Edit"}
          </button>
          <button type="button" onClick={toggleActive} disabled={busy}>
            {invitation.active ? <EyeOff size={15} /> : <Eye size={15} />}
            {invitation.active ? "Pause" : "Activate"}
          </button>
          <button
            type="button"
            className="admin-danger"
            onClick={remove}
            disabled={busy}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {invitation.message && !editing && (
        <p className="admin-message">{invitation.message}</p>
      )}

      {editing ? (
        <form className="admin-edit" onSubmit={save}>
          <label>
            <span>Guest name</span>
            <input
              required
              maxLength={120}
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
            />
          </label>
          <label>
            <span>Invitation version</span>
            <select
              value={draft.side}
              onChange={(event) =>
                setDraft({ ...draft, side: event.target.value })
              }
            >
              <option value="groom">Groom — Vishal weds Krishi</option>
              <option value="bride">Bride — Krishi weds Vishal</option>
            </select>
          </label>
          <label className="admin-wide">
            <span>Personal message (optional)</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={draft.message}
              onChange={(event) =>
                setDraft({ ...draft, message: event.target.value })
              }
            />
          </label>
          <div className="admin-form-actions">
            <button className="admin-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
          {error && <p className="admin-error admin-wide">{error}</p>}
        </form>
      ) : (
        error && <p className="admin-error">{error}</p>
      )}

      <label className="admin-link-field">
        <span>
          <Link2 size={13} /> Guest link
        </span>
        <input readOnly value={link} onFocus={(event) => event.target.select()} />
      </label>
    </li>
  );
}

function Admin() {
  useAdminDocumentTitle();
  const [status, setStatus] = useState(
    supabaseConfigured ? "loading" : "unconfigured",
  );
  const [invitations, setInvitations] = useState([]);
  const [draft, setDraft] = useState(blankDraft);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setInvitations(await listInvitations());
  }, []);

  const bootstrap = useCallback(async () => {
    const session = await getInvitationSession();
    if (!session) {
      setStatus("signed-out");
      return;
    }
    try {
      const allowed = await checkAdminAccess();
      if (!allowed) {
        setStatus("denied");
        return;
      }
      await refresh();
      setStatus("ready");
    } catch (failure) {
      setError(failure.message);
      setStatus("signed-out");
    }
  }, [refresh]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    bootstrap();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setStatus("signed-out");
    });
    return () => data.subscription.unsubscribe();
  }, [bootstrap]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function applyChange(updated) {
    setInvitations((current) =>
      current.map((row) => (row.id === updated.id ? updated : row)),
    );
  }

  function removeRow(id) {
    setInvitations((current) => current.filter((row) => row.id !== id));
  }

  async function add(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await createInvitation({
        name: draft.name.trim(),
        message: draft.message,
        side: draft.side,
      });
      setInvitations((current) => [created, ...current]);
      setDraft(blankDraft);
      setNotice(`Invitation ready for ${created.name}`);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await signOutAdmin();
    setInvitations([]);
    setStatus("signed-out");
  }

  if (status === "unconfigured") {
    return (
      <main className="admin-page">
        <div className="admin-panel">
          <h1>Invitation admin</h1>
          <p className="admin-hint">
            Set <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to connect this page to your
            Supabase project, then rebuild.
          </p>
          <a className="admin-link" href="/">
            Back to the invitation
          </a>
        </div>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="admin-page">
        <div className="admin-panel">
          <p className="admin-hint">Checking access…</p>
        </div>
      </main>
    );
  }

  if (status === "signed-out") {
    return (
      <main className="admin-page">
        <SignIn onSignedIn={bootstrap} />
        {error && <p className="admin-error">{error}</p>}
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="admin-page">
        <div className="admin-panel">
          <h1>No admin access</h1>
          <p className="admin-hint">
            This account is not on the invitation admin allowlist. Add its email
            to <code>private.invitation_admins</code> in Supabase, then sign in
            again.
          </p>
          <button className="admin-primary" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Personalised invitations</h1>
          <p className="admin-hint">
            Each guest link shows only its own name and message. Guests see the
            latest wording the next time they refresh.
          </p>
        </div>
        <div className="admin-header-actions">
          <a className="admin-link" href="/">
            View invitation
          </a>
          <button type="button" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <form className="admin-panel admin-create" onSubmit={add}>
        <h2>New invitation</h2>
        <label>
          <span>Guest name</span>
          <input
            required
            maxLength={120}
            placeholder="e.g. Ramesh & Family"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
        </label>
        <label>
          <span>Invitation version</span>
          <select
            value={draft.side}
            onChange={(event) => setDraft({ ...draft, side: event.target.value })}
          >
            <option value="groom">Groom — Vishal weds Krishi</option>
            <option value="bride">Bride — Krishi weds Vishal</option>
          </select>
        </label>
        <label className="admin-wide">
          <span>Personal message (optional)</span>
          <textarea
            rows={3}
            maxLength={2000}
            placeholder="A line just for this guest."
            value={draft.message}
            onChange={(event) =>
              setDraft({ ...draft, message: event.target.value })
            }
          />
        </label>
        <div className="admin-form-actions">
          <button className="admin-primary" type="submit" disabled={busy}>
            <Plus size={15} /> {busy ? "Creating…" : "Create invitation"}
          </button>
        </div>
        {error && <p className="admin-error admin-wide">{error}</p>}
      </form>

      <p className="admin-notice" role="status">
        {notice && (
          <>
            <Check size={14} /> {notice}
          </>
        )}
      </p>

      {invitations.length === 0 ? (
        <p className="admin-empty">
          No invitations yet. Create one to get a personal link.
        </p>
      ) : (
        <ul className="admin-list">
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              onChanged={applyChange}
              onDeleted={removeRow}
              onNotice={setNotice}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
