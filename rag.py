from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_classic.memory import ConversationBufferMemory
import os
DB_PATH = "backend/db"
os.environ["GOOGLE_API_KEY"] = "AIzaSyBhaorbzAWeSQcTOo7ENYE4scVG1-3CXmo"
# Embedding (Google Generative AI)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Load vector DB
db = FAISS.load_local(DB_PATH, embeddings, allow_dangerous_deserialization=True)

# LLM (Google Generative AI)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# Memory
memory = ConversationBufferMemory(return_messages=True)


def ask_rag(question):
    # tìm tài liệu liên quan
    docs = db.similarity_search(question, k=3)
    context = "\n".join([doc.page_content for doc in docs])

    # lịch sử chat
    chat_history = memory.load_memory_variables({})["history"]

    prompt = f"""
Bạn là chatbot hỗ trợ học tập CNTT.

Lịch sử hội thoại:
{chat_history}

Tài liệu:
{context}

Câu hỏi: {question}
"""

    # gọi LLM (Gemini)
    answer = llm.invoke(prompt)

    answer_text = answer.content 

    memory.save_context({"input": question}, {"output": answer_text})

    # trả về answer_text cho FastAPI
    return answer_text, docs