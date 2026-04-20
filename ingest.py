import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


DATA_PATH = "backend/data"
DB_PATH = "backend/db"

def ingest():
    docs = []

    for file in os.listdir(DATA_PATH):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DATA_PATH, file))
            docs.extend(loader.load())

    # 🔥 Tăng chunk size để giảm số lần gọi API
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1024,
        chunk_overlap=200
    )
    
    chunks = splitter.split_documents(docs)

    # ✅ Chỉ tạo embeddings 1 lần + dùng model rẻ
    embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

    db = FAISS.from_documents(chunks, embeddings)

    db.save_local(DB_PATH)

    print(f"✅ Đã tạo DB với {len(chunks)} chunks")

if __name__ == "__main__":
    ingest()
