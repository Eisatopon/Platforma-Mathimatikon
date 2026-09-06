import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, LogOut, Plus, Pencil, Trash2, Sigma, ChevronLeft, BookOpen, GripVertical, GraduationCap, Layers } from "lucide-react";
import { fetchGrades, fetchAllLessons, fetchLesson, fetchBooks } from "@/lib/api";
import { adminLogin, adminVerify, adminCreate, adminUpdate, adminDelete, adminReorder, getToken, setToken, clearToken } from "@/lib/adminApi";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { GradesManager } from "@/components/admin/GradesManager";

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

function Login({ onOk }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try { const { token } = await adminLogin(pw); setToken(token); onOk(); }
    catch (e2) { setErr(e2?.response?.data?.detail || "Λάθος κωδικός"); setLoading(false); }
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
  const [authed, setAuthed] = useState(null);
  const [grades, setGrades] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [books, setBooks] = useState([]);
  const [tab, setTab] = useState("lessons"); // lessons | grades
  const [view, setView] = useState("list"); // list | editor
  const [editing, setEditing] = useState(null);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    const onUnauth = () => setAuthed(false);
    window.addEventListener("admin-unauthorized", onUnauth);
    return () => window.removeEventListener("admin-unauthorized", onUnauth);
  }, []);

  useEffect(() => {
    if (!getToken()) { setAuthed(false); return; }
    adminVerify().then(() => setAuthed(true)).catch(() => { clearToken(); setAuthed(false); });
  }, []);

  const loadList = () => {
    fetchGrades().then(setGrades).catch(() => {});
    fetchAllLessons().then(setLessons).catch(() => {});
    fetchBooks().then(setBooks).catch(() => {});
  };
  useEffect(() => { if (authed) loadList(); }, [authed]);

  const grouped = useMemo(() => grades.map((g) => ({
    grade: g,
    items: lessons.filter((l) => l.gradeId === g.id).sort((a, b) => a.order - b.order),
  })), [grades, lessons]);

  const startNew = () => { setEditing(null); setView("editor"); };
  const startEdit = async (id) => {
    setLoadingEditor(true);
    try { const full = await fetchLesson(id); setEditing(full); setView("editor"); }
    finally { setLoadingEditor(false); }
  };
  const handleSave = async (payload) => {
    if (editing) await adminUpdate(editing.id, payload); else await adminCreate(payload);
    loadList(); setView("list"); setEditing(null);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα;")) return;
    await adminDelete(id); loadList();
  };
  const logout = () => { clearToken(); setAuthed(false); };

  const onDrop = async (grade, targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const items = lessons.filter((l) => l.gradeId === grade.id).sort((a, b) => a.order - b.order);
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) { setDragId(null); return; }
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const orderedIds = reordered.map((i) => i.id);
    setLessons((prev) => prev.map((l) => (l.gradeId === grade.id ? { ...l, order: orderedIds.indexOf(l.id) + 1 } : l)));
    setDragId(null);
    try { await adminReorder(grade.id, orderedIds); } catch { loadList(); }
  };

  if (authed === null) return <div className="grid min-h-screen place-items-center text-muted-foreground">Φόρτωση…</div>;
  if (!authed) return <Login onOk={() => setAuthed(true)} />;

  const tabBtn = (id, label, Icon) => (
    <button onClick={() => { setTab(id); setView("list"); }} data-testid={`admin-tab-${id}`} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-secondary"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

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
        {view === "editor" ? (
          <>
            <button onClick={() => { setView("list"); setEditing(null); }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> Πίσω στη λίστα</button>
            {loadingEditor ? <div className="py-20 text-center text-muted-foreground">Φόρτωση…</div> : <LessonEditor initial={editing} grades={grades} books={books} onSave={handleSave} onCancel={() => { setView("list"); setEditing(null); }} />}
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">{tabBtn("lessons", "Μαθήματα", BookOpen)}{tabBtn("grades", "Τάξεις & Κεφάλαια", Layers)}</div>
              {tab === "lessons" && <button onClick={startNew} data-testid="admin-new-lesson" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.03]"><Plus className="h-4 w-4" /> Νέο μάθημα</button>}
            </div>

            {tab === "lessons" ? (
              <div className="space-y-8">
                <p className="text-sm text-muted-foreground">{lessons.length} μαθήματα · Σύρε τις κάρτες για αλλαγή σειράς μέσα σε κάθε τάξη.</p>
                {grouped.map(({ grade, items }) => (
                  <section key={grade.id}>
                    <h2 className="mb-3 text-lg font-extrabold">{grade.title} <span className="text-sm font-medium text-muted-foreground">· {items.length} μαθήματα</span></h2>
                    <div className="space-y-2">
                      {items.map((l) => (
                        <div
                          key={l.id}
                          data-testid={`admin-row-${l.id}`}
                          draggable
                          onDragStart={() => setDragId(l.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(grade, l.id)}
                          className={`flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow ${dragId === l.id ? "border-primary opacity-60" : "border-border"}`}
                        >
                          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold">{l.title}</div>
                            <div className="text-xs text-muted-foreground">{l.chapter} · {l.category} · {l.questionCount} ερωτήσεις</div>
                          </div>
                          <button onClick={() => startEdit(l.id)} data-testid={`admin-edit-${l.id}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /> Επεξεργασία</button>
                          <button onClick={() => handleDelete(l.id)} data-testid={`admin-delete-${l.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                      {items.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Καμία εγγραφή</p>}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <GradesManager grades={grades} lessons={lessons} books={books} onChanged={loadList} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
