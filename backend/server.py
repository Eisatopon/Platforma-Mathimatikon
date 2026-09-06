from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel

from seed_content import all_docs

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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


class LessonSummary(BaseModel):
    id: str
    gradeId: str
    chapter: str
    category: str
    title: str
    minutes: int
    order: int
    questionCount: int


class LessonDetail(LessonSummary):
    theory: List[str]
    example: Example
    questions: List[Question]


class Grade(BaseModel):
    id: str
    title: str
    subtitle: str
    color: str
    order: int
    lessonCount: int


# ---------------- Seeding ----------------
async def seed_database():
    grades, lessons = all_docs()
    for g in grades:
        await db.grades.update_one({"id": g["id"]}, {"$set": g}, upsert=True)
    for l in lessons:
        await db.lessons.update_one({"id": l["id"]}, {"$set": l}, upsert=True)
    logger.info(f"Seeded {len(grades)} grades and {len(lessons)} lessons")


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
            id=l["id"], gradeId=l["gradeId"], chapter=l["chapter"], category=l["category"],
            title=l["title"], minutes=l["minutes"], order=l["order"],
            questionCount=len(l.get("questions", [])),
        )
        for l in lessons
    ]


@api_router.get("/grades/{grade_id}")
async def get_grade(grade_id: str):
    grade = await db.grades.find_one({"id": grade_id}, {"_id": 0})
    if not grade:
        raise HTTPException(status_code=404, detail="Η τάξη δεν βρέθηκε")
    lessons = await db.lessons.find({"gradeId": grade_id}, {"_id": 0}).sort("order", 1).to_list(500)
    summaries = [
        LessonSummary(
            id=l["id"], gradeId=l["gradeId"], chapter=l["chapter"], category=l["category"],
            title=l["title"], minutes=l["minutes"], order=l["order"],
            questionCount=len(l.get("questions", [])),
        )
        for l in lessons
    ]
    grade_out = Grade(**grade, lessonCount=len(summaries))
    return {"grade": grade_out, "lessons": summaries}


@api_router.get("/lessons/{lesson_id}", response_model=LessonDetail)
async def get_lesson(lesson_id: str):
    l = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not l:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε")
    return LessonDetail(
        id=l["id"], gradeId=l["gradeId"], chapter=l["chapter"], category=l["category"],
        title=l["title"], minutes=l["minutes"], order=l["order"],
        questionCount=len(l.get("questions", [])),
        theory=l["theory"], example=Example(**l["example"]),
        questions=[Question(**q) for q in l["questions"]],
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
