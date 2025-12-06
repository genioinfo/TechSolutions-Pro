from backend.app import app

client = app.test_client()

def test_get_user_not_found():
    resp = client.get("/api/users/999")
    assert resp.status_code == 404
    data = resp.get_json()
    assert data["status"] == "error"

def test_create_user_missing_fields():
    # Falta el email
    resp = client.post("/api/users", json={"name": "Sin Email"})
    assert resp.status_code == 400
    data = resp.get_json()
    assert "Campos requeridos faltantes" in data["message"]

def test_create_user_ok():
    resp = client.post("/api/users", json={"name": "Nuevo", "email": "nuevo@example.com"})
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["status"] == "success"
    assert data["user"]["email"] == "nuevo@example.com"

def test_404_handler():
    resp = client.get("/ruta-que-no-existe")
    assert resp.status_code == 404
    data = resp.get_json()
    assert data["code"] == 404

def test_method_not_allowed():
    resp = client.post("/api/message")  # si solo acepta GET
    assert resp.status_code == 405
    data = resp.get_json()
    assert data["code"] == 405
