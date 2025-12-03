from app import app


def test_health_endpoint_ok():
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
