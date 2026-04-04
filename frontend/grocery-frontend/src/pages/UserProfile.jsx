import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

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

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API.defaults.baseURL || "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function mergeStoredUser(profile) {
  try {
    const raw = localStorage.getItem("user");
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...prev,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        age: profile.age,
        gender: profile.gender,
        profileImage: profile.profileImage,
      })
    );
  } catch {
    /* ignore */
  }
}

export default function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    age: "",
    gender: "",
  });

  const loadProfile = useCallback(async () => {
    setError("");
    try {
      const res = await API.get("/api/user/profile");
      setProfile(res.data);
      mergeStoredUser(res.data);
      setForm({
        name: res.data?.name ?? "",
        phone: res.data?.phone ?? "",
        address: res.data?.address ?? "",
        age: res.data?.age != null ? String(res.data.age) : "",
        gender: res.data?.gender ?? "",
      });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Could not load profile");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const adminRaw = localStorage.getItem("admin");

    if (!token || !userRaw) {
      navigate("/userlogin", { replace: true });
      return;
    }
    if (adminRaw) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadProfile();
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, loadProfile]);

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
  };

  const cancelEdit = () => {
    if (!profile) return;
    setForm({
      name: profile.name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      age: profile.age != null ? String(profile.age) : "",
      gender: profile.gender ?? "",
    });
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!form.name.trim()) {
      showToast("Name is required");
      return;
    }
    let ageNum = null;
    if (form.age.trim()) {
      ageNum = Number(form.age);
      if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 130) {
        showToast("Enter a valid age (1–130) or leave blank");
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        ...(ageNum != null ? { age: ageNum } : {}),
        gender: form.gender.trim(),
      };
      const res = await API.put("/api/user/profile", body);
      setProfile(res.data);
      mergeStoredUser(res.data);
      setEditing(false);
      showToast("Profile updated");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Could not save profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      await API.post("/api/user/profile/upload-image", fd);
      showToast("Photo updated");
      await loadProfile();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    navigate("/userlogin", { replace: true });
  };

  const avatarSrc = resolveImageUrl(profile?.profileImage);

  return (
    <div className="min-h-screen px-4 py-10 flex items-start justify-center bg-[var(--bg0)]">
      <div className="absolute inset-0 -z-10 noise opacity-40" />

      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            ← Back to store
          </Link>
        </div>

        <div className="rounded-3xl border border-[var(--cardBorder)] bg-[var(--card)] backdrop-blur-xl shadow-[var(--shadow)] p-6 md:p-8">
          <div className="flex flex-col items-center mb-6">
            <button
              type="button"
              onClick={onPickImage}
              disabled={uploading || loading}
              className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
              aria-label="Upload profile photo"
            >
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white/70 dark:border-white/15 shadow-lg bg-gradient-to-br from-emerald-200/50 to-amber-100/40 dark:from-emerald-900/40 dark:to-slate-800/60">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-3xl font-black text-emerald-800/70 dark:text-emerald-200/80">
                    {(profile?.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <span className="absolute bottom-1 right-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 shadow">
                {uploading ? "…" : "Upload"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              className="hidden"
              onChange={onFileChange}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-white/50">JPG or PNG · max 2 MB</p>
          </div>

          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Your profile
              </h1>
              <p className="text-sm text-slate-600/90 dark:text-white/60">
                Signed in as a customer. Edit details or update your photo.
              </p>
            </div>
            {!loading && profile && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-2xl px-4 py-2 text-sm font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow shadow-emerald-600/20"
              >
                Edit
              </button>
            )}
            {editing && (
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-2xl px-4 py-2 text-sm font-extrabold border border-white/50 dark:border-white/15 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-2xl px-4 py-2 text-sm font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          {toast && (
            <div className="mb-4 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              {toast}
            </div>
          )}

          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10" />
              <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10" />
              <div className="h-4 rounded bg-slate-200/70 dark:bg-white/10 w-2/3" />
            </div>
          )}

          {!loading && error && !profile && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}

          {!loading && profile && error && (
            <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}

          {!loading && profile && (
            <dl className="space-y-4">
              {editing ? (
                <>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Name
                    </dt>
                    <dd>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Phone
                    </dt>
                    <dd>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Address
                    </dt>
                    <dd>
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y min-h-[80px]"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Age (optional)
                    </dt>
                    <dd>
                      <input
                        type="number"
                        min={1}
                        max={130}
                        value={form.age}
                        onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Gender (optional)
                    </dt>
                    <dd>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/5 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Name
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">{profile.name}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Phone
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                      {profile.phone || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Address
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words whitespace-pre-wrap">
                      {profile.address || "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Age (optional)
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                      {profile.age != null ? String(profile.age) : "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                      Gender (optional)
                    </dt>
                    <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                      {profile.gender || "—"}
                    </dd>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                  Email
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">{profile.email}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">Role</dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">{profile.role}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-white/45">
                  Account created
                </dt>
                <dd className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                  {formatDate(profile.createdAt)}
                </dd>
              </div>
            </dl>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-3 font-extrabold text-white bg-gradient-to-r from-rose-500/90 to-orange-400/85 border border-white/20 shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition"
            >
              Log out
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-2xl px-4 py-3 font-extrabold text-slate-900 dark:text-white bg-white/55 dark:bg-white/10 border border-white/60 dark:border-white/15 hover:bg-white/75 dark:hover:bg-white/15 transition text-center"
            >
              Go to cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
