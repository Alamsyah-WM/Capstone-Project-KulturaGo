from flask import Flask, request, jsonify
import tensorflow as tf
import os
import requests
from dotenv import load_dotenv
from google.cloud import bigquery
from google.oauth2 import service_account  # Menambahkan impor yang hilang

# Memuat variabel dari .env
load_dotenv()

app = Flask(__name__)

# Path sementara untuk menyimpan model
MODEL_URL = os.getenv("MODEL_URL")  # URL GCS Public
MODEL_PATH = "temp_model.h5"

# Inisialisasi model global
model = None

# Inisialisasi client BigQuery dengan kredensial
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
print(f"Using credentials file at: {credentials_path}")
credentials = service_account.Credentials.from_service_account_file(credentials_path)

# Inisialisasi BigQuery client
bq_client = bigquery.Client(credentials=credentials, project=credentials.project_id)

def load_model():
    """Fungsi untuk memuat model dari GCS atau lokal."""
    global model
    try:
        # Download model jika belum ada di lokal
        if not os.path.exists(MODEL_PATH):
            response = requests.get(MODEL_URL)
            if response.status_code == 200:
                with open(MODEL_PATH, "wb") as f:
                    f.write(response.content)
            else:
                raise Exception(f"Failed to download model: {response.status_code}")

        # Load model ke dalam memori
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise e

def get_place_from_bigquery(predicted_class_index):
    """Query BigQuery untuk mendapatkan nama tempat berdasarkan indeks kelas."""
    query = f"""
        SELECT name
        FROM `kulturago-capstone.kulturago_data.cultural_place`
        WHERE no = {predicted_class_index}
        LIMIT 1
    """
    query_job = bq_client.query(query)  # Menjalankan query BigQuery
    result = query_job.result()  # Mendapatkan hasil query

    # Mengambil nama tempat dari hasil query
    for row in result:
        return row.name  # Mengembalikan nama tempat
    return None  # Jika tidak ada hasil

@app.route('/load-model', methods=['POST'])
def load_model_endpoint():
    """Endpoint untuk memuat model."""
    try:
        load_model()
        return jsonify({"message": "Model loaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Endpoint untuk melakukan prediksi."""
    global model
    if model is None:
        return jsonify({"error": "Model not loaded"}), 400

    try:
        # Mengambil data dari request body
        data = request.get_json()
        input_text = data.get("text")

        if not input_text:
            return jsonify({"error": "No input data provided"}), 400

        # Tokenisasi input
        tokenizer = tf.keras.preprocessing.text.Tokenizer()
        tokenizer.fit_on_texts([input_text])
        input_seq = tokenizer.texts_to_sequences([input_text])
        input_seq = tf.keras.preprocessing.sequence.pad_sequences(input_seq, padding='post')

        # Melakukan prediksi
        predictions = model.predict(input_seq)

        # Mengambil kelas dengan probabilitas tertinggi
        predicted_class_index = predictions.argmax()  # Indeks dengan probabilitas tertinggi

        # Mengambil nama tempat dari BigQuery
        place_name = get_place_from_bigquery(predicted_class_index)

        if not place_name:
            return jsonify({"error": "No place found for the predicted class"}), 400

        return jsonify({
            "predicted_class": predicted_class_index,
            "predicted_place": place_name,
            "probability": predictions[0][predicted_class_index]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
