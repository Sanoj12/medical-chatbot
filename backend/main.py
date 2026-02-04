from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Groq Setup
try:
    from groq import Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY:
        print(f"DEBUG: Found GROQ_API_KEY (starts with {GROQ_API_KEY[:8]}...)")
        groq_client = Groq(api_key=GROQ_API_KEY)
    else:
        print("DEBUG: No GROQ_API_KEY found in environment variables.")
        groq_client = None
except ImportError:
    print("DEBUG: 'groq' library not installed or failed to import.")
    groq_client = None

app = FastAPI()

# CORS configuration
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Dr. Chatbot API is running"}

@app.post("/signup")
def signup(request: SignupRequest):
    # Mock signup logic
    if request.email and request.password and request.name:
        return {"token": "mock_token_signup_123", "message": "Signup successful", "user": {"name": request.name, "email": request.email}}
    raise HTTPException(status_code=400, detail="Invalid signup data")

@app.post("/login")
def login(request: LoginRequest):
    # Mock login logic
    if request.email and request.password:
        return {"token": "mock_token_123", "message": "Login successful"}
    raise HTTPException(status_code=400, detail="Invalid credentials")

@app.post("/chat")
def chat(request: ChatRequest):
    user_message = request.message.lower()
    
    # LLM Logic (Groq)
    if groq_client:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are Dr. Chatbot, a warm and friendly AI health assistant. \n\nIMPORTANT: You must structure your response using these exact Markdown sections:\n\n### 🩺 Overview\n(A simple, reassuring explanation)\n\n### 💊 What to do\n(Bullet points of simple advice)\n\n### ⚠️ When to see a doctor\n(Clear warning signs)\n\nKeep language simple (avoid jargon). Be concise."
                    },
                    {
                        "role": "user",
                        "content": request.message,
                    }
                ],
                model="llama-3.3-70b-versatile"
            )
            response = chat_completion.choices[0].message.content
            return {"response": response, "user_message": request.message}
        except Exception as e:
            print(f"Groq API Error: {e}")
            # Fallback will happen below
            pass

    # Simple rule-based/mock AI logic (Fallback)
    if "hello" in user_message or "hi" in user_message:
        response = "Hello! I am Dr. Chatbot. How can I assist you with your health today?"
    elif "fever" in user_message:
        response = "It sounds like you have a fever. Stay hydrated and rest. If it persists, consult a doctor."
    elif "headache" in user_message:
        response = "For a headache, try drinking water and resting in a quiet, dark room."
    else:
        response = "I'm not sure about that. Please consult a real doctor for specific medical advice."
        
    return {"response": response, "user_message": request.message}
