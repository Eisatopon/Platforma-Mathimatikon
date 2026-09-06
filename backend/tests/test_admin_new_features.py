"""Tests for new admin endpoints: grades CRUD, chapter rename, lesson reorder."""
import os
import pytest
import requests

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "mathadmin2026"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def auth_headers(s):
    r = s.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---------------- Grades CRUD ----------------
class TestAdminGradesCRUD:
    def test_create_grade_unauth(self, s):
        r = s.post(f"{API}/admin/grades", json={"title": "TEST_X"}, timeout=30)
        assert r.status_code == 401

    def test_update_grade_unauth(self, s):
        r = s.put(f"{API}/admin/grades/g7", json={"title": "TEST_X"}, timeout=30)
        assert r.status_code == 401

    def test_delete_grade_unauth(self, s):
        r = s.delete(f"{API}/admin/grades/g7", timeout=30)
        assert r.status_code == 401

    def test_full_grade_crud(self, s, auth_headers):
        # CREATE
        r = s.post(f"{API}/admin/grades",
                   json={"title": "TEST_Grade", "subtitle": "sub", "color": "sky"},
                   headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        grade = r.json()
        gid = grade["id"]
        assert gid.startswith("g") and len(gid) == 7  # g + 6 hex
        assert grade["title"] == "TEST_Grade"
        assert grade["lessonCount"] == 0

        try:
            # Verify it appears in /api/grades
            all_g = s.get(f"{API}/grades", timeout=30).json()
            assert gid in {g["id"] for g in all_g}

            # UPDATE
            u = s.put(f"{API}/admin/grades/{gid}",
                      json={"title": "TEST_Grade_Upd", "subtitle": "s2", "color": "rose"},
                      headers=auth_headers, timeout=30)
            assert u.status_code == 200
            assert u.json()["title"] == "TEST_Grade_Upd"
            assert u.json()["color"] == "rose"

            # verify persist
            got = s.get(f"{API}/grades/{gid}", timeout=30).json()
            assert got["grade"]["title"] == "TEST_Grade_Upd"
        finally:
            # DELETE (empty grade)
            d = s.delete(f"{API}/admin/grades/{gid}", headers=auth_headers, timeout=30)
            assert d.status_code == 200
            assert s.get(f"{API}/grades/{gid}", timeout=30).status_code == 404

    def test_delete_grade_with_lessons_fails(self, s, auth_headers):
        r = s.delete(f"{API}/admin/grades/g7", headers=auth_headers, timeout=30)
        assert r.status_code == 400

    def test_update_unknown_grade(self, s, auth_headers):
        r = s.put(f"{API}/admin/grades/gNONE", json={"title": "x"}, headers=auth_headers, timeout=30)
        assert r.status_code == 404

    def test_delete_unknown_grade(self, s, auth_headers):
        # unknown empty → returns 404 after count check
        r = s.delete(f"{API}/admin/grades/gNOPE99", headers=auth_headers, timeout=30)
        assert r.status_code == 404


# ---------------- Chapter rename ----------------
class TestChapterRename:
    def test_rename_chapter_unauth(self, s):
        r = s.post(f"{API}/admin/chapters/rename",
                   json={"gradeId": "g7", "old": "x", "new": "y"}, timeout=30)
        assert r.status_code == 401

    def test_rename_chapter_and_restore(self, s, auth_headers):
        # find first chapter of g7
        g7 = s.get(f"{API}/grades/g7", timeout=30).json()
        original = g7["lessons"][0]["chapter"]
        temp = f"TEST_{original}"

        # rename original → temp
        r = s.post(f"{API}/admin/chapters/rename",
                   json={"gradeId": "g7", "old": original, "new": temp},
                   headers=auth_headers, timeout=30)
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True
        assert body["updated"] >= 1
        original_count = body["updated"]

        # verify persistence
        g7b = s.get(f"{API}/grades/g7", timeout=30).json()
        renamed = [l for l in g7b["lessons"] if l["chapter"] == temp]
        assert len(renamed) == original_count

        # restore
        r2 = s.post(f"{API}/admin/chapters/rename",
                    json={"gradeId": "g7", "old": temp, "new": original},
                    headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["updated"] == original_count

    def test_rename_no_match(self, s, auth_headers):
        r = s.post(f"{API}/admin/chapters/rename",
                   json={"gradeId": "g7", "old": "___nope___", "new": "y"},
                   headers=auth_headers, timeout=30)
        assert r.status_code == 200
        assert r.json()["updated"] == 0


# ---------------- Lessons reorder ----------------
class TestLessonsReorder:
    def test_reorder_unauth(self, s):
        r = s.post(f"{API}/admin/lessons/reorder",
                   json={"gradeId": "g7", "orderedIds": []}, timeout=30)
        assert r.status_code == 401

    def test_reorder_persist_and_restore(self, s, auth_headers):
        # capture original order in g7
        g7 = s.get(f"{API}/grades/g7", timeout=30).json()
        original_ids = [l["id"] for l in sorted(g7["lessons"], key=lambda x: x["order"])]
        assert len(original_ids) == 21

        # reversed order
        reversed_ids = list(reversed(original_ids))
        r = s.post(f"{API}/admin/lessons/reorder",
                   json={"gradeId": "g7", "orderedIds": reversed_ids},
                   headers=auth_headers, timeout=30)
        assert r.status_code == 200

        # verify new order
        g7b = s.get(f"{API}/grades/g7", timeout=30).json()
        new_ids = [l["id"] for l in sorted(g7b["lessons"], key=lambda x: x["order"])]
        assert new_ids == reversed_ids
        # verify order values are 1..N
        orders = sorted([l["order"] for l in g7b["lessons"]])
        assert orders == list(range(1, len(orders) + 1))

        # RESTORE original
        r2 = s.post(f"{API}/admin/lessons/reorder",
                    json={"gradeId": "g7", "orderedIds": original_ids},
                    headers=auth_headers, timeout=30)
        assert r2.status_code == 200
        g7c = s.get(f"{API}/grades/g7", timeout=30).json()
        restored = [l["id"] for l in sorted(g7c["lessons"], key=lambda x: x["order"])]
        assert restored == original_ids
