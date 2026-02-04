from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Dr. Chatbot API is running"}

def test_login_success():
    response = client.post("/login", json={"email": "test@example.com", "password": "password"})
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_failure():
    # Sending empty fields
    response = client.post("/login", json={"email": "", "password": ""})
    assert response.status_code == 400

def test_signup_success():
    response = client.post("/signup", json={"name": "Test User", "email": "new@example.com", "password": "password"})
    assert response.status_code == 200
    assert "token" in response.json()
    assert "user" in response.json()

def test_chat_response():
    response = client.post("/chat", json={"message": "Hello"})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "hello" in data["response"].lower()
