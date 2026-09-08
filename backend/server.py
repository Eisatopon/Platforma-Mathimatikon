from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import secrets
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import jwt
import httpx
from pydantic import BaseModel

from seed_content import all_docs, all_books

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
JWT_ALG = "HS256"

app = FastAPI(title="Μαθηματικά Γυμνασίου API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------- Models ----------------
class Question(BaseModel):
    prompt: str
    options: List[str]
    correct: int
    explanation: str


class Example(BaseModel):
    title: str
    text: str


class Figure(BaseModel):
    title: str = ""
    url: str
    caption: str = ""


class Plan(BaseModel):
    objectives: List[str] = []
    prerequisites: List[str] = []
    duration: str = ""
    materials: List[str] = []
    overview: str = ""


class Worksheet(BaseModel):
    A: List[str] = []
    B: List[str] = []
    C: List[str] = []


class Assessment(BaseModel):
    durationMinutes: int = 15
    questions: List[Question] = []


class Solution(BaseModel):
    title: str
    text: str


class Recap(BaseModel):
    keyPoints: List[str] = []
    nextLessonIds: List[str] = []
    furtherStudy: List[str] = []


class LessonSummary(BaseModel):
    id: str
    gradeId: str
    bookId: str = ""
    chapter: str
    category: str
    title: str
    minutes: int
    order: int
    questionCount: int


class LessonDetail(LessonSummary):
    theory: List[str]
    example: Example
    figures: List[Figure] = []
    questions: List[Question]
    plan: Plan = Plan()
    attention: List[str] = []
    worksheet: Worksheet = Worksheet()
    assessment: Assessment = Assessment()
    solutions: List[Solution] = []
    recap: Recap = Recap()


class Grade(BaseModel):
    id: str
    title: str
    subtitle: str
    color: str
    order: int
    lessonCount: int


class Book(BaseModel):
    id: str
    gradeId: str
    title: str
    publisher: str = ""
    coverUrl: str = ""
    url: str = ""
    order: int


class BookUpsert(BaseModel):
    gradeId: str
    title: str
    publisher: str = ""
    coverUrl: str = ""
    url: str = ""
    order: Optional[int] = None


# ---------------- Seeding ----------------
async def seed_database():
    grades, lessons = all_docs()
    for g in grades:
        await db.grades.update_one({"id": g["id"]}, {"$setOnInsert": g}, upsert=True)
    for l in lessons:
        # Lessons are fully overwritten on every startup so that seed_content.py stays the
        # single source of truth — no manual DB cleanup needed between deploys. Any lesson
        # content edited directly via the Admin panel (rather than in seed_content.py) will
        # be reset to match seed_content.py on the next deploy.
        await db.lessons.update_one({"id": l["id"]}, {"$set": l}, upsert=True)
    for b in all_books():
        await db.books.update_one({"id": b["id"]}, {"$set": b}, upsert=True)
    current_lesson_ids = [l["id"] for l in lessons]
    del_result = await db.lessons.delete_many({"id": {"$nin": current_lesson_ids}})
    if del_result.deleted_count:
        logger.info(f"Removed {del_result.deleted_count} orphaned lesson(s) no longer in seed_content.py")
    logger.info(f"Seeded {len(grades)} grades, {len(lessons)} lessons (overwrite), {len(all_books())} books")


@app.on_event("startup")
async def startup():
    await seed_database()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Μαθηματικά Γυμνασίου API"}


@api_router.get("/grades", response_model=List[Grade])
async def get_grades():
    grades = await db.grades.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    result = []
    for g in grades:
        count = await db.lessons.count_documents({"gradeId": g["id"]})
        result.append(Grade(**g, lessonCount=count))
    return result


@api_router.get("/lessons", response_model=List[LessonSummary])
async def get_all_lessons():
    lessons = await db.lessons.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return [
        LessonSummary(
            id=l["id"], gradeId=l["gradeId"], bookId=l.get("bookId", ""), chapter=l["chapter"], category=l["category"],
            title=l["title"], minutes=l["minutes"], order=l["order"],
            questionCount=len(l.get("questions", [])),
        )
        for l in lessons
    ]


@api_router.get("/books", response_model=List[Book])
async def get_all_books():
    books = await db.books.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return [Book(**b) for b in books]


@api_router.get("/grades/{grade_id}")
async def get_grade(grade_id: str):
    grade = await db.grades.find_one({"id": grade_id}, {"_id": 0})
    if not grade:
        raise HTTPException(status_code=404, detail="Η τάξη δεν βρέθηκε")
    lessons = await db.lessons.find({"gradeId": grade_id}, {"_id": 0}).sort("order", 1).to_list(500)
    summaries = [
        LessonSummary(
            id=l["id"], gradeId=l["gradeId"], bookId=l.get("bookId", ""), chapter=l["chapter"], category=l["category"],
            title=l["title"], minutes=l["minutes"], order=l["order"],
            questionCount=len(l.get("questions", [])),
        )
        for l in lessons
    ]
    books = await db.books.find({"gradeId": grade_id}, {"_id": 0}).sort("order", 1).to_list(100)
    grade_out = Grade(**grade, lessonCount=len(summaries))
    return {"grade": grade_out, "books": [Book(**b) for b in books], "lessons": summaries}


@api_router.get("/lessons/{lesson_id}", response_model=LessonDetail)
async def get_lesson(lesson_id: str):
    l = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not l:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε")
    return LessonDetail(
        id=l["id"], gradeId=l["gradeId"], bookId=l.get("bookId", ""), chapter=l["chapter"], category=l["category"],
        title=l["title"], minutes=l["minutes"], order=l["order"],
        questionCount=len(l.get("questions", [])),
        theory=l["theory"], example=Example(**l["example"]),
        figures=[Figure(**f) for f in l.get("figures", [])],
        questions=[Question(**q) for q in l["questions"]],
        plan=Plan(**l.get("plan", {})),
        attention=l.get("attention", []),
        worksheet=Worksheet(**l.get("worksheet", {})),
        assessment=Assessment(**l.get("assessment", {})),
        solutions=[Solution(**s) for s in l.get("solutions", [])],
        recap=Recap(**l.get("recap", {})),
    )


# ---------------- Admin auth & CRUD ----------------
class AdminLogin(BaseModel):
    password: str


class LessonUpsert(BaseModel):
    gradeId: str
    bookId: str = ""
    chapter: str
    category: str
    title: str
    minutes: int = 10
    order: Optional[int] = None
    theory: List[str] = []
    example: Example = Example(title="Παράδειγμα", text="")
    figures: List[Figure] = []
    questions: List[Question] = []
    plan: Plan = Plan()
    attention: List[str] = []
    worksheet: Worksheet = Worksheet()
    assessment: Assessment = Assessment()
    solutions: List[Solution] = []
    recap: Recap = Recap()


def create_admin_token() -> str:
    payload = {"role": "admin", "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Απαιτείται σύνδεση διαχειριστή")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Μη έγκυρο token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Η συνεδρία έληξε, συνδέσου ξανά")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Μη έγκυρο token")
    return True


@api_router.post("/admin/login")
async def admin_login(body: AdminLogin):
    if not secrets.compare_digest(body.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Λάθος κωδικός")
    return {"token": create_admin_token()}


@api_router.get("/admin/verify")
async def admin_verify(_: bool = Depends(require_admin)):
    return {"ok": True}


@api_router.post("/admin/lessons", response_model=LessonDetail)
async def admin_create_lesson(body: LessonUpsert, _: bool = Depends(require_admin)):
    grade = await db.grades.find_one({"id": body.gradeId})
    if not grade:
        raise HTTPException(status_code=400, detail="Άγνωστη τάξη")
    doc = body.model_dump()
    lesson_id = f"{body.gradeId}-{uuid.uuid4().hex[:6]}"
    doc["id"] = lesson_id
    if doc.get("order") is None:
        last = await db.lessons.find({"gradeId": body.gradeId}).sort("order", -1).to_list(1)
        doc["order"] = (last[0]["order"] + 1) if last else 1
    await db.lessons.insert_one(doc)
    return await get_lesson(lesson_id)


@api_router.put("/admin/lessons/{lesson_id}", response_model=LessonDetail)
async def admin_update_lesson(lesson_id: str, body: LessonUpsert, _: bool = Depends(require_admin)):
    existing = await db.lessons.find_one({"id": lesson_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε")
    doc = body.model_dump()
    doc["id"] = lesson_id
    if doc.get("order") is None:
        doc["order"] = existing.get("order", 1)
    await db.lessons.update_one({"id": lesson_id}, {"$set": doc})
    return await get_lesson(lesson_id)


@api_router.delete("/admin/lessons/{lesson_id}")
async def admin_delete_lesson(lesson_id: str, _: bool = Depends(require_admin)):
    res = await db.lessons.delete_one({"id": lesson_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε")
    return {"ok": True}


class GradeUpsert(BaseModel):
    title: str
    subtitle: str = ""
    color: str = "emerald"
    order: Optional[int] = None


class ReorderBody(BaseModel):
    gradeId: str
    orderedIds: List[str]


class ChapterRename(BaseModel):
    gradeId: str
    old: str
    new: str


@api_router.post("/admin/grades", response_model=Grade)
async def admin_create_grade(body: GradeUpsert, _: bool = Depends(require_admin)):
    gid = f"g{uuid.uuid4().hex[:6]}"
    order = body.order
    if order is None:
        last = await db.grades.find().sort("order", -1).to_list(1)
        order = (last[0]["order"] + 1) if last else 1
    doc = {"id": gid, "title": body.title, "subtitle": body.subtitle, "color": body.color, "order": order}
    await db.grades.insert_one(dict(doc))
    return Grade(**doc, lessonCount=0)


@api_router.put("/admin/grades/{grade_id}", response_model=Grade)
async def admin_update_grade(grade_id: str, body: GradeUpsert, _: bool = Depends(require_admin)):
    existing = await db.grades.find_one({"id": grade_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Η τάξη δεν βρέθηκε")
    upd = {"title": body.title, "subtitle": body.subtitle, "color": body.color,
           "order": body.order if body.order is not None else existing.get("order", 1)}
    await db.grades.update_one({"id": grade_id}, {"$set": upd})
    count = await db.lessons.count_documents({"gradeId": grade_id})
    return Grade(id=grade_id, lessonCount=count, **upd)


@api_router.delete("/admin/grades/{grade_id}")
async def admin_delete_grade(grade_id: str, _: bool = Depends(require_admin)):
    count = await db.lessons.count_documents({"gradeId": grade_id})
    if count > 0:
        raise HTTPException(status_code=400, detail=f"Η τάξη έχει {count} μαθήματα. Διάγραψέ τα πρώτα.")
    res = await db.grades.delete_one({"id": grade_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Η τάξη δεν βρέθηκε")
    return {"ok": True}


@api_router.post("/admin/chapters/rename")
async def admin_rename_chapter(body: ChapterRename, _: bool = Depends(require_admin)):
    res = await db.lessons.update_many({"gradeId": body.gradeId, "chapter": body.old}, {"$set": {"chapter": body.new}})
    return {"ok": True, "updated": res.modified_count}


@api_router.post("/admin/lessons/reorder")
async def admin_reorder_lessons(body: ReorderBody, _: bool = Depends(require_admin)):
    for i, lid in enumerate(body.orderedIds):
        await db.lessons.update_one({"id": lid, "gradeId": body.gradeId}, {"$set": {"order": i + 1}})
    return {"ok": True}


@api_router.post("/admin/books", response_model=Book)
async def admin_create_book(body: BookUpsert, _: bool = Depends(require_admin)):
    grade = await db.grades.find_one({"id": body.gradeId})
    if not grade:
        raise HTTPException(status_code=400, detail="Άγνωστη τάξη")
    bid = f"b{uuid.uuid4().hex[:6]}"
    order = body.order
    if order is None:
        last = await db.books.find({"gradeId": body.gradeId}).sort("order", -1).to_list(1)
        order = (last[0]["order"] + 1) if last else 1
    doc = {"id": bid, "gradeId": body.gradeId, "title": body.title, "publisher": body.publisher, "coverUrl": body.coverUrl, "url": body.url, "order": order}
    await db.books.insert_one(dict(doc))
    return Book(**doc)


@api_router.put("/admin/books/{book_id}", response_model=Book)
async def admin_update_book(book_id: str, body: BookUpsert, _: bool = Depends(require_admin)):
    existing = await db.books.find_one({"id": book_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Το βιβλίο δεν βρέθηκε")
    upd = {"gradeId": body.gradeId, "title": body.title, "publisher": body.publisher, "coverUrl": body.coverUrl, "url": body.url,
           "order": body.order if body.order is not None else existing.get("order", 1)}
    await db.books.update_one({"id": book_id}, {"$set": upd})
    return Book(id=book_id, **upd)


@api_router.delete("/admin/books/{book_id}")
async def admin_delete_book(book_id: str, _: bool = Depends(require_admin)):
    res = await db.books.delete_one({"id": book_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Το βιβλίο δεν βρέθηκε")
    await db.lessons.update_many({"bookId": book_id}, {"$set": {"bookId": ""}})
    return {"ok": True}


class ImportUrl(BaseModel):
    url: str


def _parse_portify(html: str, base: str = "https://www.portify.gr"):
    import re

    def meta(prop):
        m = re.search(r'<meta[^>]+property=["\']' + re.escape(prop) + r'["\'][^>]*content=["\']([^"\']+)', html)
        if not m:
            m = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*property=["\']' + re.escape(prop), html)
        return m.group(1) if m else ""

    title = ""
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    if h1:
        title = re.sub(r"<[^>]+>", "", h1.group(1)).strip()
    og_title = meta("og:title")
    publisher = ""
    if "—" in og_title:
        publisher = og_title.split("—", 1)[1].split("·")[0].strip()
    if not title and og_title:
        title = og_title.split("—")[0].strip()

    cover = ""
    mp = re.search(r'<img[^>]+src=["\']([^"\']*previews/[^"\']+)["\']', html)
    if mp:
        cover = mp.group(1)
    if not cover:
        mt = re.search(r'(https://ebooksdl\.cti\.gr/[^"\']+thumb500[^"\']*)', html)
        if mt:
            cover = mt.group(1)
    if not cover:
        cover = meta("og:image")
    if cover.startswith("/"):
        cover = base + cover
    return {"title": title, "publisher": publisher, "coverUrl": cover}


@api_router.post("/admin/books/import")
async def admin_import_book(body: ImportUrl, _: bool = Depends(require_admin)):
    if "portify.gr" not in body.url:
        raise HTTPException(status_code=400, detail="Δώσε έγκυρο σύνδεσμο Portify")
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}) as c:
            r = await c.get(body.url)
            r.raise_for_status()
    except Exception:
        raise HTTPException(status_code=502, detail="Αποτυχία ανάκτησης της σελίδας Portify")
    data = _parse_portify(r.text)
    data["url"] = body.url
    if not data["title"]:
        raise HTTPException(status_code=422, detail="Δεν βρέθηκε τίτλος βιβλίου στη σελίδα")
    return data


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
