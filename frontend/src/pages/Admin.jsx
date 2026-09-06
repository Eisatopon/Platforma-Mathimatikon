import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, LogOut, Plus, Pencil, Trash2, Sigma, ChevronLeft, BookOpen } from "lucide-react";
import { fetchGrades, fetchAllLessons, fetchLesson } from "@/lib/api";
import { adminLogin, adminVerify, adminCreate, adminUpdate, adminDelete, getToken, setToken, clearToken } from "@/lib/adminApi";
import { LessonEditor } from "@/components/admin/LessonEditor";

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function Login({ onOk }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const { token } = await adminLogin(pw);
      setToken(token);
      onOk();
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Λάθος κωδικός");
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-primary/30"><Lock className="h-7 w-7" /></div>
        <h1 className="mt-4 text-center text-2xl font-extrabold">Διαχείριση</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Εισαγωγή κωδικού διαχειριστή</p>
        <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Κωδικός" className={`${inp} mt-5`} data-testid="admin-password" />
        {err && <p data-testid="admin-login-error" className="mt-2 text-sm font-semibold text-rose-600">{err}</p>}
        <button type="submit" disabled={loading} data-testid="admin-login-btn" className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50">{loading ? "Σύνδεση…" : "Σύνδεση"}</button>
        <Link to="/" className="mt-4 block text-center text-xs font-semibold text-muted-foreground hover:text-foreground">← Πίσω στην εφαρμογή</Link>
      </form>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(null); // null checking, true, false
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [view, setView] = useState("list"); // list | editor
  const [editing, setEditing] = useState(null); // lesson detail or null (new)
  const [loadingEditor, setLoadingEditor] = useState(false);

  useEffect(() => {
    if (!getToken()) { setAuthed(false); return; }
    adminVerify().then(() => setAuthed(true)).catch(() => { clearToken(); setAuthed(false); });
  }, []);

  const loadList = () => {
    fetchGrades().then(setGrades).catch(() => {});
    fetchAllLessons().then(setLessons).catch(() => {});
  };
  useEffect(() => { if (authed) loadList(); }, [authed]);

  const grouped = useMemo(() => {
    return grades.map((g) => ({ grade: g, items: lessons.filter((l) => l.gradeId === g.id) }));
  }, [grades, lessons]);

  const gradeTitle = (id) => grades.find((g) => g.id === id)?.title || "";

  const startNew = () => { setEditing(null); setView("editor"); };
  const startEdit = async (id) => {
    setLoadingEditor(true);
    try {
      const full = await fetchLesson(id);
      setEditing(full);
      setView("editor");
    } finally { setLoadingEditor(false); }
  };

  const handleSave = async (payload) => {
    if (editing) await adminUpdate(editing.id, payload);
    else await adminCreate(payload);
    loadList();
    setView("list");
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα;")) return;
    await adminDelete(id);
    loadList();
  };

  const logout = () => { clearToken(); setAuthed(false); };

  if (authed === null) return <div className="grid min-h-screen place-items-center text-muted-foreground">Φόρτωση…</div>;
  if (!authed) return <Login onOk={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><Sigma className="h-5 w-5" strokeWidth={2.5} /></div>
            <div><div className="text-[15px] font-extrabold">Διαχείριση Μαθημάτων</div><div className="text-[11px] text-muted-foreground">Admin panel</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold hover:bg-secondary">Εφαρμογή</Link>
            <button onClick={logout} data-testid="admin-logout" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><LogOut className="h-4 w-4" /> Έξοδος</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {view === "list" ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Μαθήματα</h1>
                <p className="mt-1 text-muted-foreground">{lessons.length} μαθήματα σε {grades.length} τάξεις</p>
              </div>
              <button onClick={startNew} data-testid="admin-new-lesson" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.03]"><Plus className="h-4 w-4" /> Νέο μάθημα</button>
            </div>

            <div className="mt-6 space-y-8">
              {grouped.map(({ grade, items }) => (
                <section key={grade.id}>
                  <h2 className="mb-3 text-lg font-extrabold">{grade.title} <span className="text-sm font-medium text-muted-foreground">· {items.length} μαθήματα</span></h2>
                  <div className="space-y-2">
                    {items.map((l) => (
                      <div key={l.id} data-testid={`admin-row-${l.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold">{l.title}</div>
                          <div className="text-xs text-muted-foreground">{l.chapter} · {l.category} · {l.questionCount} ερωτήσεις</div>
                        </div>
                        <button onClick={() => startEdit(l.id)} data-testid={`admin-edit-${l.id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /> Επεξεργασία</button>
                        <button onClick={() => handleDelete(l.id)} data-testid={`admin-delete-${l.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setView("list"); setEditing(null); }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Πίσω στη λίστα</button>
            {loadingEditor ? <div className="py-20 text-center text-muted-foreground">Φόρτωση…</div> : <LessonEditor initial={editing} grades={grades} onSave={handleSave} onCancel={() => { setView("list"); setEditing(null); }} />}
          </>
        )}
      </main>
    </div>
  );
}
