"""Backend tests for Μαθηματικά Γυμνασίου API"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://formula-hub-114.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


# ---------- Grades ----------
class TestGrades:
    def test_get_grades(self, s):
        r = s.get(f"{API}/grades", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 3
        by_id = {g["id"]: g for g in data}
        assert set(by_id.keys()) == {"g7", "g8", "g9"}
        assert by_id["g7"]["lessonCount"] == 21
        assert by_id["g8"]["lessonCount"] == 13
        assert by_id["g9"]["lessonCount"] == 13

    def test_get_grade_g7(self, s):
        r = s.get(f"{API}/grades/g7", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "grade" in data and "lessons" in data
        assert data["grade"]["id"] == "g7"
        assert len(data["lessons"]) == 21
        orders = [l["order"] for l in data["lessons"]]
        assert orders == sorted(orders)

    def test_grade_unknown(self, s):
        r = s.get(f"{API}/grades/unknown", timeout=30)
        assert r.status_code == 404


# ---------- Lessons ----------
class TestLessons:
    def test_get_all_lessons(self, s):
        r = s.get(f"{API}/lessons", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 47
        for l in data:
            assert "id" in l and "questionCount" in l

    def test_get_lesson_detail(self, s):
        r = s.get(f"{API}/lessons/g7-1-1", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == "g7-1-1"
        assert isinstance(d["theory"], list) and len(d["theory"]) > 0
        assert "title" in d["example"] and "text" in d["example"]
        assert len(d["questions"]) > 0
        q = d["questions"][0]
        assert set(["prompt", "options", "correct", "explanation"]).issubset(q.keys())
        # g7-1-1 Q1 correct index == 2 (answer 600)
        assert q["correct"] == 2
        assert q["options"][2] == "600"

    def test_lesson_unknown(self, s):
        r = s.get(f"{API}/lessons/unknown", timeout=30)
        assert r.status_code == 404
