import os
import json
import asyncio
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv

# Load .env from parent (project root)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ── Config ──────────────────────────────────────────────
GROQ_API_KEY    = os.getenv("GROQ_API_KEY", "")
SUPABASE_URL    = os.getenv("VITE_SUPABASE_URL","")
SUPABASE_KEY    = os.getenv("VITE_SUPABASE_ANON_KEY", "")

# ── Clients ─────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
supabase    = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None

# ── App ─────────────────────────────────────────────────
app = FastAPI(title="Unai Chatbox API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Vite dev + Electron
    allow_credentials=False,      # Must be False when origin is "*" to prevent browser CORS blocks
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────
class ChatRequest(BaseModel):
    prompt: str
    sessionId: str | None = None

class ChatResponse(BaseModel):
    content: str
    sources: list = []

class ContextResponse(BaseModel):
    context: str
    sources: list = []

# ── Health check ────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "groq": bool(groq_client),
        "supabase": bool(supabase)
    }

# ── POST /api/chat/context (retrieve RAG context) ────────
@app.post("/api/chat/context", response_model=ContextResponse)
def get_chat_context(req: ChatRequest):
    try:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        result = subprocess.run(
            ['node', 'scripts/query_rag.mjs', req.prompt],
            capture_output=True,
            text=True,
            cwd=project_root
        )
        
        stdout = result.stdout or ""
        start_idx = stdout.find('{"context":')
        end_idx = stdout.rfind('}')
        if start_idx != -1 and end_idx != -1:
            json_str = stdout[start_idx:end_idx+1]
            data = json.loads(json_str)
            return ContextResponse(
                context=data.get('context', ''),
                sources=data.get('sources', [])
            )
        else:
            return ContextResponse(context='', sources=[])
    except Exception as e:
        print(f"Error getting RAG context: {e}")
        return ContextResponse(context='', sources=[])

# ── POST /api/chat  (standard response with RAG lookup) ──
@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not groq_client:
        raise HTTPException(503, "GROQ_API_KEY not configured in .env")

    try:
        # 1. Fetch context and sources using local query_rag.mjs script
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        result = subprocess.run(
            ['node', 'scripts/query_rag.mjs', req.prompt],
            capture_output=True,
            text=True,
            cwd=project_root
        )
        
        context = ""
        sources = []
        stdout = result.stdout or ""
        start_idx = stdout.find('{"context":')
        end_idx = stdout.rfind('}')
        if start_idx != -1 and end_idx != -1:
            json_str = stdout[start_idx:end_idx+1]
            data = json.loads(json_str)
            context = data.get('context', '')
            sources = data.get('sources', [])

        # 2. Build context-enriched prompt
        if context:
            rag_prompt = (
                f"You are a helpful AI assistant for UNAI TECH. Answer the user's question. Prioritize using the facts from the provided context below to answer. If the context does not contain the answer or is not relevant, use your own general knowledge to provide a helpful and accurate answer.\n\n"
                f"---\nCONTEXT FROM KNOWLEDGE BASE:\n{context}\n---\n\n"
                f"USER QUESTION: {req.prompt}\n\nANSWER:"
            )
        else:
            rag_prompt = req.prompt

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant for UNAI TECH."
                },
                {"role": "user", "content": rag_prompt}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        answer = completion.choices[0].message.content
        return ChatResponse(content=answer, sources=sources)

    except Exception as e:
        raise HTTPException(500, str(e))



# ── POST /api/chat/stream  (streaming SSE response) ─────
@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    if not groq_client:
        raise HTTPException(503, "GROQ_API_KEY not configured in .env")

    async def generate():
        try:
            stream = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful AI assistant for UNAI TECH. "
                            "Answer questions clearly and concisely based on "
                            "the context provided."
                        )
                    },
                    {"role": "user", "content": req.prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )

            for chunk in stream:
                token = chunk.choices[0].delta.content or ""
                if token:
                    yield f"data: {json.dumps({'token': token})}\n\n"
                    await asyncio.sleep(0)   # yield control to event loop

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


# ── DELETE /api/sessions/:id  (session cleanup stub) ────
@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    return {"deleted": session_id}
