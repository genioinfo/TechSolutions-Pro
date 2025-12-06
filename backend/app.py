import os
import logging
from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS # pyright: ignore[reportMissingModuleSource]
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configurar logging para rastrear errores y actividad
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar la aplicación Flask
app = Flask(__name__)

# Configuración de seguridad
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['JSON_SORT_KEYS'] = False  # Mantener el orden de las claves JSON

# Habilitar CORS con configuración segura
# Permite que el frontend (localhost:8080) se comunique con el backend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ==================== RUTAS DE LA API ====================

@app.route('/')
def home():
    """Endpoint raíz para verificar que el servidor está activo."""
    logger.info("Acceso al endpoint raíz")
    return jsonify({
        "status": "success",
        "message": "Backend de TechSolutions está funcionando correctamente",
        "version": "1.0.0"
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de salud para monitoreo."""
    return jsonify({
        "status": "healthy",
        "service": "TechSolutions Backend"
    }), 200

@app.route('/api/message', methods=['GET'])
def get_message():
    """
    Devuelve un mensaje de bienvenida.
    Este es un ejemplo simple de endpoint.
    """
    logger.info("Solicitud recibida en /api/message")
    return jsonify({
        "status": "success",
        "message": "¡Hola desde el Backend con Docker y Flask!",
        "data": {
            "timestamp": "2025-11-18",
            "backend": "Flask + Python",
            "container": "Docker"
        }
    }), 200

@app.route('/api/users', methods=['GET'])
def get_users():
    """
    Devuelve una lista de usuarios de ejemplo.
    En producción, esto consultaría la base de datos.
    """
    logger.info("Solicitud de lista de usuarios")
    users = [
        {"id": 1, "name": "Juan Pérez", "email": "juan@example.com", "role": "admin"},
        {"id": 2, "name": "María García", "email": "maria@example.com", "role": "user"},
        {"id": 3, "name": "Carlos López", "email": "carlos@example.com", "role": "user"}
    ]
    return jsonify({
        "status": "success",
        "count": len(users),
        "users": users
    }), 200

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    Obtiene un usuario específico por ID.
    Ejemplo de ruta con parámetros.
    """
    logger.info(f"Solicitud de usuario con ID: {user_id}")
    
    # Simulación de búsqueda en base de datos
    users = {
        1: {"id": 1, "name": "Juan Pérez", "email": "juan@example.com"},
        2: {"id": 2, "name": "María García", "email": "maria@example.com"},
        3: {"id": 3, "name": "Carlos López", "email": "carlos@example.com"}
    }
    
    user = users.get(user_id)
    
    if user:
        return jsonify({
            "status": "success",
            "user": user
        }), 200
    else:
        return jsonify({
            "status": "error",
            "message": f"Usuario con ID {user_id} no encontrado"
        }), 404

@app.route('/api/users', methods=['POST'])
def create_user():
    """
    Crea un nuevo usuario.
    Ejemplo de endpoint POST con validación de datos.
    """
    try:
        data = request.get_json()
        
        # Validación de campos requeridos
        if not data:
            return jsonify({
                "status": "error",
                "message": "No se enviaron datos"
            }), 400
        
        required_fields = ['name', 'email']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "status": "error",
                "message": f"Campos requeridos faltantes: {', '.join(missing_fields)}"
            }), 400
        
        # Simulación de creación en base de datos
        new_user = {
            "id": 4,  # En producción, esto sería generado por la BD
            "name": data.get('name'),
            "email": data.get('email'),
            "role": data.get('role', 'user')
        }
        
        logger.info(f"Usuario creado: {new_user['email']}")
        
        return jsonify({
            "status": "success",
            "message": "Usuario creado exitosamente",
            "user": new_user
        }), 201
        
    except Exception as e:
        logger.error(f"Error al crear usuario: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Error interno del servidor"
        }), 500

# ==================== MANEJO DE ERRORES ====================

@app.errorhandler(404)
def not_found(error):
    """Manejo personalizado de errores 404."""
    return jsonify({
        "status": "error",
        "message": "Endpoint no encontrado",
        "code": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Manejo personalizado de errores 500."""
    logger.error(f"Error interno: {str(error)}")
    return jsonify({
        "status": "error",
        "message": "Error interno del servidor",
        "code": 500
    }), 500

@app.errorhandler(405)
def method_not_allowed(error):
    """Manejo personalizado de errores 405."""
    return jsonify({
        "status": "error",
        "message": "Método HTTP no permitido para este endpoint",
        "code": 405
    }), 405

# ==================== INICIO DE LA APLICACIÓN ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False') == 'True'
    
    logger.info(f"Iniciando servidor Flask en puerto {port}")
    logger.info(f"Modo debug: {debug}")
    
    # host='0.0.0.0' permite que el contenedor sea accesible desde fuera
    app.run(host='0.0.0.0', port=port, debug=debug)