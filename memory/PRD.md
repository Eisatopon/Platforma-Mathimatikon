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
- ✅ Lesson page + διαδραστικό κουίζ e2e (feedback, score, XP, next lesson)
- ✅ Achievements (stats + 8 badges + reset)
- ✅ KaTeX, dark/light theme, localStorage gamification (testing 100%)

## Backlog / Remaining
- P1: Admin panel για προσθήκη/επεξεργασία μαθημάτων (χωρίς κώδικα)
- P1: Φύλλο εργασίας με επίπεδα Α/Β/Γ (πράσινο/πορτοκαλί/κόκκινο) & πεδίο απάντησης
- P2: Timer στα τεστ αξιολόγησης
- P2: Εικόνες/διαγράμματα στα μαθήματα
- P2: Προαιρετικό login για ιστορικό/πρόοδο ανά χρήστη (cloud)
- P2: Migrate FastAPI on_event → lifespan

## Next Tasks
- Admin panel (κρυφό URL) για CRUD μαθημάτων
- Φύλλα εργασίας με ασκήσεις επιπέδων Α/Β/Γ
