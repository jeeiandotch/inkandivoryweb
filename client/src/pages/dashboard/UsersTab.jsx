import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchUsersAdmin, toggleSuspendUser, updateUserRole } from "../../api/admin.js";

export default function UsersTab() {
  const { isOwner, user: viewer } = useAuth();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const load = (query = q) => fetchUsersAdmin(query).then(setUsers).catch((err) => setError(err.message));

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(q);
  };

  const handleSuspend = async (u) => {
    await toggleSuspendUser(u.id);
    load();
  };

  const handleRoleChange = async (u, role) => {
    await updateUserRole(u.id, role);
    load();
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Manage Readers</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users…"
            className="input-field !py-1.5 w-48 text-xs"
          />
          <button type="submit" className="btn-secondary !py-1.5 !px-3 text-xs">Search</button>
        </form>
      </div>

      {error && <p className="text-sm text-rose-dusty">{error}</p>}

      {!users ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-parchment/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Stories</th>
                <th className="px-4 py-3">Comments</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="text-ink">{u.profile?.displayName || u.username}</p>
                    <p className="text-xs text-ink/40">@{u.username}</p>
                  </td>
                  <td className="px-4 py-3">
                    {isOwner && u.role !== "OWNER" ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="rounded-lg border border-ink/15 bg-white/70 px-2 py-1 text-xs"
                      >
                        <option value="READER">Reader</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className="text-ink/60">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/60">{u._count.stories}</td>
                  <td className="px-4 py-3 text-ink/60">{u._count.comments}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${u.isSuspended ? "bg-rose-dusty/15 text-rose-dusty" : "bg-taupe/15 text-taupe-dark"}`}>
                      {u.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== "OWNER" && u.id !== viewer.id && (
                      <button onClick={() => handleSuspend(u)} className="text-xs text-taupe-dark hover:underline">
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
