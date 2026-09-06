# PRD — Πλατφόρμα Μαθηματικών Γυμνασίου

## Original Problem Statement
Web εφαρμογή που παρουσιάζει δομημένα μαθήματα μαθηματικών (θεωρία, παράδειγμα, διαδραστικό κουίζ, λύσεις). React + FastAPI + MongoDB. Χωρίς login. Περιεχόμενο Γυμνασίου, στα Ελληνικά, μαθηματικοί τύποι με KaTeX.

## User Choices
- Seed data (47 έτοιμα μαθήματα), admin panel αργότερα
- Υπάρχον design (design-audit-50 preview) — αναπαραγωγή πιστά (gamified microlearning)
- Επίπεδο: Γυμνάσιο (Α/Β/Γ) · Γλώσσα: Ελληνικά · Μόνο κείμενο + τύποι (όχι εικόνες)

## Architecture
- **Backend** `/app/backend/server.py`: FastAPI, MongoDB (motor). Auto-seed στο startup από `seed_content.py`. Endpoints: `GET /api/grades`, `GET /api/lessons`, `GET /api/grades/{id}`, `GET /api/lessons/{id}`.
- **Frontend** React (CRA/craco, JSX), react-router. Pages: Home, Grade, Lesson, Achievements. KaTeX rendering (`components/MathText.jsx`). Gamification σε localStorage (`lib/progress.js`, key `math-gym-progress-v1`). Dark/light theme (`lib/theme.js`).
- **DB**: collections `grades`, `lessons`.

## User Personas
- Μαθητής Γυμνασίου: διαβάζει θεωρία, λύνει κουίζ, βλέπει άμεση ανατροφοδότηση & πρόοδο.
- Καθηγητής: ίδιο περιεχόμενο ως διδακτικό υλικό.

## Core Requirements (static)
- Κατάλογος τάξεων με πρόοδο, αναζήτηση & φίλτρα κατηγορίας
- Σελίδα τάξης: κεφάλαια + μαθήματα (ολοκληρωμένα/εκκρεμή)
- Σελίδα μαθήματος: Θεωρία (βήματα) + Παράδειγμα + Κουίζ πολλαπλής επιλογής με άμεση σωστό/λάθος + επεξήγηση + τελική βαθμολογία & XP
- Επιτεύγματα: XP, streak, συνολική πρόοδος, 8 badges + επαναφορά προόδου
- KaTeX για τύπους, responsive, dark mode

## Implemented (2026-06)
- ✅ 3 τάξεις / 47 μαθήματα seed (g7=21, g8=13, g9=13), 3 ερωτήσεις/μάθημα
- ✅ 4 backend endpoints + 404 handling (testing 100%)
- ✅ Home hero+stats+level bar, search/filter, grade cards
- ✅ Grade page (κεφάλαια, lesson cards, πρόοδος)
- ✅ **Σελίδα μαθήματος με 7 ενότητες (accordion + step-nav)**: 1) Σχέδιο μαθήματος, 2) Θεωρία/Επανάληψη (+παράδειγμα +σημεία προσοχής), 3) Φύλλο εργασίας Α/Β/Γ (πράσινο/πορτοκαλί/κόκκινο, πεδία απάντησης σε localStorage), 4) Διαδραστικές ασκήσεις (MCQ + άμεση ανατροφοδότηση), 5) Τεστ αξιολόγησης με χρονόμετρο 15′ + βαθμολογία/επισκόπηση, 6) Λύσεις (spoiler), 7) Ανακεφαλαίωση
- ✅ Empty states για ενότητες που θα γεμίσει ο χρήστης (1c): plan/worksheet/solutions/recap/materials
- ✅ Achievements (stats + 8 badges + reset)
- ✅ KaTeX, dark/light theme, localStorage gamification (testing 100%)

## Πώς προστίθεται περιεχόμενο (νέα πεδία ανά μάθημα στο seed_content.py / MongoDB)
- `plan`: { objectives:[], prerequisites:[], duration:"", materials:[], overview:"" }
- `attention`: [] (σημεία προσοχής στη Θεωρία)
- `worksheet`: { A:[], B:[], C:[] }
- `assessment`: { durationMinutes:15, questions:[{prompt,options,correct,explanation}] }  (αν κενό → το τεστ πέφτει σε δείγμα από τα questions)
- `solutions`: [{ title, text }]
- `recap`: { keyPoints:[], nextLessonIds:[], furtherStudy:[] }

## Κάρτες βιβλίων Portify ανά τάξη — «Υπό κατασκευή» (2026-06)
- Κάθε σελίδα τάξης (Grade.jsx) δείχνει ενότητα «Βιβλία (Πολλαπλό βιβλίο)» με badge «Υπό κατασκευή» **πάνω** από τα μαθήματα (τα μαθήματα εμφανίζονται πάντα από κάτω· καταργήθηκε η παλιά αδρανής λογική εσωτερικού book-selector).
- Οι κάρτες βιβλίων είναι **εξωτερικοί σύνδεσμοι** προς Portify (άνοιγμα σε νέα καρτέλα, target=_blank), με εξώφυλλο + τίτλο + εκδότη.
- Νέο πεδίο `url` στο μοντέλο Book/BookUpsert (backend) — ο σύνδεσμος Portify της κάρτας. Το `POST /api/admin/books/import` επιστρέφει και το `url`.
- Seed: 9 βιβλία (3 ανά τάξη — Πατάκη/Πουκαμισάς/Λυσάρι) στο `seed_content.py` (`BOOKS`/`all_books()`), idempotent upsert στο startup (persist σε fresh DB, π.χ. deploy). Διακριτό εξώφυλλο ανά εκδότη (Πουκαμισάς/Λυσάρι από Portify previews· Πατάκη Α΄/Β΄ = cropped front cover αποθηκευμένο τοπικά στο `frontend/public/covers/`). Εμφάνιση με `object-contain`.
- Admin («Τάξεις & Κεφάλαια»): πεδίο link/`url` στη γραμμή κάθε βιβλίου + πλήρης διαχείριση.

## Αρχιτεκτονική Πολλαπλού Βιβλίου (σε αναμονή — 2026-06)
Προστέθηκε επίπεδο **Βιβλίο** ανάμεσα σε Τάξη και Μάθημα, backward-compatible:
- Data model: collection `books` { id, gradeId, title, publisher, coverUrl, order }· κάθε μάθημα έχει προαιρετικό `bookId` (default "").
- API: `GET /api/books`, `GET /api/grades/{id}` επιστρέφει και `books[]`· admin CRUD `POST/PUT/DELETE /api/admin/books` (η διαγραφή βιβλίου καθαρίζει το bookId των μαθημάτων του).
- Student UX: η σελίδα τάξης δείχνει «Διάλεξε βιβλίο» (κάρτες με εξώφυλλο/thumbnail) ΜΟΝΟ όταν υπάρχουν βιβλία· διαφορετικά συμπεριφέρεται όπως πριν (μαθήματα απευθείας). Επιλογή βιβλίου → κεφάλαια/μαθήματα του βιβλίου (φίλτρο bookId) + «Όλα τα βιβλία».
- Admin: διαχείριση βιβλίων ανά τάξη (tab «Τάξεις & Κεφάλαια») + επιλογή Βιβλίου στον editor μαθήματος.
- Κατάσταση: 0 βιβλία seeded → dormant. Έτοιμο για τα 4 βιβλία/τάξη του νέου «πολλαπλού βιβλίου». (Επαληθεύτηκε χειροκίνητα: create/assign/selector/cover thumbnail/cleanup.)

## Εισαγωγή από Portify (2026-06)
- Backend: `POST /api/admin/books/import { url }` (admin) → κατεβάζει τη σελίδα Portify (httpx) και εξάγει τίτλο (h1/og:title), εκδότη (από og:title) και εξώφυλλο (preview/thumb500). 400 για μη-Portify url, 401 χωρίς token.
- Admin UI: στο tab «Τάξεις & Κεφάλαια», κάθε τάξη έχει πεδίο συνδέσμου Portify + κουμπί «Εισαγωγή από Portify» που προσυμπληρώνει τα πεδία νέου βιβλίου (τίτλος/εκδότης/εξώφυλλο)· ο χρήστης ελέγχει και πατά «+ Βιβλίο».

## Backlog / Remaining
- ✅ (DONE) Admin panel με απλό κωδικό (JWT) — πλήρες CRUD μαθημάτων 7 ενοτήτων στο `/admin`
- ✅ (DONE) Αυτόματη αποσύνδεση σε 401 (axios interceptor → επιστροφή σε login)
- ✅ (DONE) Ζωντανή προεπισκόπηση KaTeX στον editor (θεωρία + ερωτήσεις/επιλογές)
- ✅ (DONE) Drag-αναδιάταξη μαθημάτων ανά τάξη (POST /api/admin/lessons/reorder)
- ✅ (DONE) Διαχείριση Τάξεων & Κεφαλαίων (CRUD τάξεων + μετονομασία κεφαλαίου, 6 χρώματα)
- P1: Admin panel για προσθήκη/επεξεργασία μαθημάτων (χωρίς κώδικα)
- P1: Φύλλο εργασίας με επίπεδα Α/Β/Γ (πράσινο/πορτοκαλί/κόκκινο) & πεδίο απάντησης
- P2: Timer στα τεστ αξιολόγησης
- P2: Εικόνες/διαγράμματα στα μαθήματα
- P2: Προαιρετικό login για ιστορικό/πρόοδο ανά χρήστη (cloud)
- P2: Migrate FastAPI on_event → lifespan

## Next Tasks
- Admin panel (κρυφό URL) για CRUD μαθημάτων
- Φύλλα εργασίας με ασκήσεις επιπέδων Α/Β/Γ
