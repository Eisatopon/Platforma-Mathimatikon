"""Export the public curriculum as frontend data.

The Python seed remains the single source of truth. Run this script whenever
seed_content.py changes so the public platform can render without waiting for
the free API service to wake up.
"""

import json
from pathlib import Path

from seed_content import all_books, all_docs


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "frontend" / "src" / "data" / "content.json"


def lesson_detail(lesson):
    result = dict(lesson)
    result.setdefault("bookId", "")
    result["questionCount"] = len(result.get("questions", []))
    result.setdefault("figures", [])
    result.setdefault("plan", {})
    result.setdefault("attention", [])
    result.setdefault("worksheet", {"A": [], "B": [], "C": []})
    result.setdefault("assessment", {"durationMinutes": 15, "questions": []})
    result.setdefault("solutions", [])
    result.setdefault("recap", {"keyPoints": [], "nextLessonIds": [], "furtherStudy": []})
    return result


def lesson_summary(lesson):
    return {
        "id": lesson["id"],
        "gradeId": lesson["gradeId"],
        "bookId": lesson.get("bookId", ""),
        "chapter": lesson["chapter"],
        "category": lesson["category"],
        "title": lesson["title"],
        "minutes": lesson["minutes"],
        "order": lesson["order"],
        "questionCount": len(lesson.get("questions", [])),
    }


def main():
    grades, lessons = all_docs()
    books = all_books()
    summaries = [lesson_summary(lesson) for lesson in lessons]
    grade_counts = {
        grade["id"]: sum(1 for lesson in lessons if lesson["gradeId"] == grade["id"])
        for grade in grades
    }

    payload = {
        "grades": [{**grade, "lessonCount": grade_counts[grade["id"]]} for grade in grades],
        "books": books,
        "lessons": summaries,
        "lessonDetails": {lesson["id"]: lesson_detail(lesson) for lesson in lessons},
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Exported {len(grades)} grades, {len(books)} books and {len(lessons)} lessons to {OUTPUT}")


if __name__ == "__main__":
    main()
