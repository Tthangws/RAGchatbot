from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
import os
from rag import ask_rag
from ingest import ingest

# THÊM DÒNG NÀY ĐỂ IMPORT CORS
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# THÊM NGUYÊN ĐOẠN NÀY ĐỂ MỞ CỬA CHO FRONTEND KẾT NỐI VÀO
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép bất kỳ trang web nào (kể cả file html local) gọi tới
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các lệnh GET, POST...
    allow_headers=["*"],
)
class Query(BaseModel):
    question: str

@app.post("/chat")
def chat(q: Query):
    answer, docs = ask_rag(q.question)
    return {
        "answer": answer,
        "sources": [doc.metadata for doc in docs]
    }

@app.post("/upload")
def upload(file: UploadFile = File(...)):
    file_path = f"backend/data/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Rebuild DB
    ingest()

    return {"message": "Upload và cập nhật dữ liệu thành công"}