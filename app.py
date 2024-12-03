from flask import Flask, request, jsonify
import tensorflow as tf
from google.cloud import storage
import os

app = Flask(__name__)

# Ganti dengan nama bucket dan path model di Google Cloud Storage
BUCKET_NAME = 'kulturago-descplace/capstone_model.h5'
MODEL_PATH = 'capstone_model.h5'  # Path model di Google Cloud Storage

# Initialize TensorFlow model variable
model = None

def load_model():
    """Memuat model dari Google Cloud Storage"""
    global model
    if model is None:
        # Menggunakan Google Cloud Storage untuk mengambil model
        client = storage.Client()
        bucket = client.get_bucket(BUCKET_NAME)
        blob = bucket.blob(MODEL_PATH)
        model_path = "/tmp/model.h5"
        blob.download_to_filename(model_path)
        model = tf.keras.models.load_model(model_path)
    return model

@app.route('/predict', methods=['POST'])
def predict():
    """API untuk menerima input dan melakukan prediksi"""
    try:
        # Ambil input dari request
        data = request.get_json()
        input_data = data['input']

        # Pastikan model dimuat
        model = load_model()

        # Lakukan prediksi
        input_tensor = tf.convert_to_tensor([input_data], dtype=tf.float32)
        prediction = model.predict(input_tensor).tolist()

        # Kembalikan hasil prediksi
        return jsonify({'prediction': prediction})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Jalankan server Flask
    app.run(host='0.0.0.0', port=5000)
