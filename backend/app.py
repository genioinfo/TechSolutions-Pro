from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/message')
def get_message():
    # Este es un endpoint de ejemplo
    return jsonify(message="Hola desde el Backend con Docker!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
