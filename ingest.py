import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS


DATA_PATH = "backend/data"
DB_PATH = "backend/db"
os.environ["GOOGLE_API_KEY"] = "AIzaSyCm5A_TunyKBrmMZ9dYs0Y7p7A5mel7Ztc"
def ingest():
    docs = []

    for file in os.listdir(DATA_PATH):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(DATA_PATH, file))
            docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(docs)

 # Sửa dòng này:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    db = FAISS.from_documents(chunks, embeddings)

    db.save_local(DB_PATH)

    print("✅ Đã tạo DB")

if __name__ == "__main__":
    ingest()