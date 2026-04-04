import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminRaw = localStorage.getItem("admin");
    if (!token || !adminRaw) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/admin/profile");
        if (!cancelled) setProfile(res.data);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || "Could not load admin profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wide text-slate-600/80 dark:text-white/55">
          Admin
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-600/90 dark:text-white/60">
          Store operator account details and session.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--cardBorder)] bg-[var(--card)] backdrop-blur-xl shadow-[var(--shadow)] p-6 md:p-8">
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10" />
            <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10" />
            <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10 w-2/3" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-800 dark:text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <div className="grid gap-6 md:grid-cols-2">
            <dl className="space-y-4">
              {[
                ["Name", profile.name],
                ["Email", profile.email],
                ["Role", profile.role],
                ["Last login", formatDate(profile.lastLogin)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                    {k}
                  </dt>
                  <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45 mb-2">
                Permissions
              </div>
              <ul className="space-y-2">
                {(profile.permissions || []).length === 0 && (
                  <li className="text-sm font-semibold text-slate-700/80 dark:text-white/70">—</li>
                )}
                {(profile.permissions || []).map((p) => (
                  <li
                    key={p}
                    className="rounded-2xl px-3 py-2 text-sm font-extrabold bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 font-extrabold text-white bg-gradient-to-r from-rose-500/90 to-orange-400/85 border border-white/20 shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 font-extrabold text-slate-900 dark:text-white bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/55 dark:hover:bg-white/10 transition"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
