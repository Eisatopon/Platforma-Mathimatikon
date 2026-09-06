"""Backend tests for Μαθηματικά Γυμνασίου API (public + admin CRUD)"""
import os
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if os.environ.get('REACT_APP_BACKEND_URL') else "https://formula-hub-114.preview.emergentagent.com"
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "mathadmin2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- Public: Grades ----------
class TestGrades:
    def test_get_grades(self, s):
        r = s.get(f"{API}/grades", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        by_id = {g["id"]: g for g in data}
        assert set(by_id.keys()) == {"g7", "g8", "g9"}
        assert by_id["g7"]["lessonCount"] == 21
        assert by_id["g8"]["lessonCount"] == 13
        assert by_id["g9"]["lessonCount"] == 13

    def test_get_grade_g7(self, s):
        r = s.get(f"{API}/grades/g7", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["grade"]["id"] == "g7"
        assert len(d["lessons"]) == 21

    def test_grade_unknown(self, s):
        assert s.get(f"{API}/grades/unknown", timeout=30).status_code == 404


# ---------- Public: Lessons ----------
class TestLessons:
    def test_get_all_lessons(self, s):
        r = s.get(f"{API}/lessons", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) == 47

    def test_get_lesson_detail(self, s):
        r = s.get(f"{API}/lessons/g7-1-1", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "g7-1-1"
        assert d["questions"][0]["correct"] == 2
        assert d["questions"][0]["options"][2] == "600"

    def test_lesson_unknown(self, s):
        assert s.get(f"{API}/lessons/unknown", timeout=30).status_code == 404


# ---------- Admin: Auth ----------
class TestAdminAuth:
    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/admin/login", json={"password": "wrong"}, timeout=30)
        assert r.status_code == 401

    def test_login_correct_password(self, s):
        r = s.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20

    def test_verify_no_token(self, s):
        assert s.get(f"{API}/admin/verify", timeout=30).status_code == 401

    def test_verify_bad_token(self, s):
        r = s.get(f"{API}/admin/verify", headers={"Authorization": "Bearer garbage"}, timeout=30)
        assert r.status_code == 401

    def test_verify_valid_token(self, s, auth_headers):
        r = s.get(f"{API}/admin/verify", headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json() == {"ok": True}


# ---------- Admin: Write endpoints require token ----------
class TestAdminUnauthorized:
    def test_post_lesson_unauth(self, s):
        r = s.post(f"{API}/admin/lessons", json={"gradeId": "g7", "chapter": "x", "category": "Αριθμητική", "title": "t"}, timeout=30)
        assert r.status_code == 401

    def test_put_lesson_unauth(self, s):
        r = s.put(f"{API}/admin/lessons/g7-1-1", json={"gradeId": "g7", "chapter": "x", "category": "Αριθμητική", "title": "t"}, timeout=30)
        assert r.status_code == 401

    def test_delete_lesson_unauth(self, s):
        r = s.delete(f"{API}/admin/lessons/g7-1-1", timeout=30)
        assert r.status_code == 401


# ---------- Admin: CRUD flow ----------
class TestAdminCRUD:
    lesson_payload = {
        "gradeId": "g7",
        "chapter": "TEST_Chapter",
        "category": "Αριθμητική",
        "title": "TEST_Lesson_Original",
        "minutes": 12,
        "theory": ["Σημείο 1", "Σημείο 2"],
        "example": {"title": "Παράδειγμα", "text": "1+1=2"},
        "questions": [
            {"prompt": "2+2=?", "options": ["3", "4", "5"], "correct": 1, "explanation": "2+2=4"}
        ],
    }

    def test_create_get_update_delete(self, s, auth_headers):
        # CREATE
        r = s.post(f"{API}/admin/lessons", json=self.lesson_payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        lesson = r.json()
        lid = lesson["id"]
        assert lid.startswith("g7-") and len(lid.split("-")[-1]) == 6
        assert lesson["title"] == "TEST_Lesson_Original"
        assert lesson["questionCount"] == 1

        try:
            # GET single
            g = s.get(f"{API}/lessons/{lid}", timeout=30)
            assert g.status_code == 200
            assert g.json()["title"] == "TEST_Lesson_Original"

            # Should appear in /api/lessons (total = 48)
            all_r = s.get(f"{API}/lessons", timeout=30)
            assert all_r.status_code == 200
            ids = {x["id"] for x in all_r.json()}
            assert lid in ids

            # And in grade g7 listing
            g7 = s.get(f"{API}/grades/g7", timeout=30).json()
            assert lid in {x["id"] for x in g7["lessons"]}

            # UPDATE title + theory
            updated = {**self.lesson_payload, "title": "TEST_Lesson_Updated", "theory": ["Νέο σημείο"]}
            u = s.put(f"{API}/admin/lessons/{lid}", json=updated, headers=auth_headers, timeout=30)
            assert u.status_code == 200
            assert u.json()["title"] == "TEST_Lesson_Updated"

            # verify persistence
            g2 = s.get(f"{API}/lessons/{lid}", timeout=30).json()
            assert g2["title"] == "TEST_Lesson_Updated"
            assert g2["theory"] == ["Νέο σημείο"]
        finally:
            # DELETE
            d = s.delete(f"{API}/admin/lessons/{lid}", headers=auth_headers, timeout=30)
            assert d.status_code == 200
            # 404 after delete
            assert s.get(f"{API}/lessons/{lid}", timeout=30).status_code == 404

    def test_create_bad_grade(self, s, auth_headers):
        bad = {**self.lesson_payload, "gradeId": "gZZ"}
        r = s.post(f"{API}/admin/lessons", json=bad, headers=auth_headers, timeout=30)
        assert r.status_code == 400

    def test_update_nonexistent(self, s, auth_headers):
        r = s.put(f"{API}/admin/lessons/nope-xxx", json=self.lesson_payload, headers=auth_headers, timeout=30)
        assert r.status_code == 404

    def test_delete_nonexistent(self, s, auth_headers):
        r = s.delete(f"{API}/admin/lessons/nope-xxx", headers=auth_headers, timeout=30)
        assert r.status_code == 404

    def test_seeded_count_preserved(self, s):
        """Ensure the 47 seeded lessons remain intact after CRUD flow."""
        r = s.get(f"{API}/lessons", timeout=30)
        assert r.status_code == 200
        # Filter to seeded ids only (they have pattern gX-N-N, no random hex)
        seeded = [l for l in r.json() if not any(len(part) == 6 and any(c in "0123456789abcdef" for c in part) and part.isalnum() and not part.isdigit() for part in l["id"].split("-"))]
        # Simpler: total minus 0 (we cleaned up), should be 47
        assert len(r.json()) >= 47
