from flask import Flask, request, jsonify
import tensorflow as tf
import os
import requests
from google.cloud import bigquery
import uuid
from dotenv import load_dotenv
import numpy as np

load_dotenv()
app = Flask(__name__)
MODEL_URL = os.getenv("MODEL_URL")  
MODEL_PATH = "temp_model.h5"
model = None
bigquery_client = bigquery.Client.from_service_account_json(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

place_mapping = {
    0: "Ijo Temple Wooden Mosque",
    1: "Bundaran UGM",
    2: "Jurang Tembelan Kanigoro",
    3: "Grand Puri Waterpark",
    4: "Museum Perjuangan",
    5: "Bukit Teletubbies",
    6: "Embung Tambakboyo",
    7: "Candi Sari",
    8: "Pantai Goa Cemara",
    9: "Taman Wisata Kaliurang",
    10: "Mangrove Jembatan Api-Api (MJAA)",
    11: "Goa Seplawan",
    12: "Puncak Kebun Buah Mangunan",
    13: "The Palace of Yogyakarta (Keraton Yogyakarta)",
    14: "Pantai Ngetun",
    15: "Monumen Yogya Kembali",
    16: "Camera House Borobudur",
    17: "Gunung Api Purba Nglanggeran",
    18: "The World Landmarks - Merapi Park Yogyakarta",
    19: "Taman Pelangi Jogja",
    20: "Museum Factory Dan Kedai Chocolate Monggo",
    21: "Balong Waterpark",
    22: "Taman Lampion (Taman Pelangi)",
    23: "Agro Tourism Bhumi Merapi",
    24: "Tirtonirmolo Water Park Galuh",
    25: "The Lost World Castle",
    26: "Kawasan Ekowisata Gunung Api Purba Nglanggeran",
    27: "Selopamioro Adventure Park",
    28: "Affandi Museum",
    29: "Kids Fun Galleria Mall",
    30: "Watu Goyang",
    31: "XT Square",
    32: "Galaxy Waterpark",
    33: "CitraGrand Mutiara Waterpark Yogyakarta",
    34: "Desa Wisata Pulesari",
    35: "Candi Borobudur",
    36: "Candi Prambanan",
    37: "Pantai Parangkusumo",
    38: "Central Museum of the Air Force Dirgantara Mandala",
    39: "Hutan Pinus Mangunan Dlingo",
    40: "Bukit Panguk Kediwung",
    41: "Bukit Lintang Sewu",
    42: "Gunung Ireng Srumbung",
    43: "Wana Tirta Mangrove Forests",
    44: "Candi ASU Klaten",
    45: "Blue Lagoon Jogja",
    46: "Air Terjun Kedung Pedut",
    47: "Fort Vredeburg Museum",
    48: "Museum Benteng Vredeburg",
    49: "Candi Plaosan",
}

def load_model():
    """Fungsi untuk memuat model dari GCS atau lokal."""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            response = requests.get(MODEL_URL)
            if response.status_code == 200:
                with open(MODEL_PATH, "wb") as f:
                    f.write(response.content)
            else:
                raise Exception(f"Failed to download model: {response.status_code}")

        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise e

def predict_recommendation(keyword):
    """Prediksi nama tempat berdasarkan keyword menggunakan model."""
    # Tokenisasi input
    tokenizer = tf.keras.preprocessing.text.Tokenizer()
    tokenizer.fit_on_texts([keyword])
    input_seq = tokenizer.texts_to_sequences([keyword])
    input_seq = tf.keras.preprocessing.sequence.pad_sequences(input_seq, padding='post')

    # Melakukan prediksi
    predictions = model.predict(input_seq)
    
    # Ambil 5 tempat dengan probabilitas tertinggi (indeks)
    top_indices = np.argsort(predictions[0])[-5:][::-1]  
    
    # Menerjemahkan indeks ke nama tempat menggunakan mapping
    predicted_places = [place_mapping.get(index, "Tempat tidak ditemukan") for index in top_indices]
    
    return predicted_places

@app.route('/api/predict', methods=['POST'])
def post_predict_handler():
    global model
    if model is None:
        return jsonify({"error": "Model not loaded"}), 400

    try:
        # Mengambil data dari request body
        data = request.get_json()
        keyword = data.get("keyword")

        if not keyword or not isinstance(keyword, str):
            return jsonify({
                "status": "fail",
                "message": "Keyword harus berupa string dan tidak boleh kosong."
            }), 400

        # Prediksi 5 tempat berdasarkan keyword
        predicted_places = predict_recommendation(keyword)

        query = f"""
        SELECT 
            `no`, nama, image_link, trans_desc
        FROM 
            kulturago-capstone.kulturago_data.cultural_place
        WHERE 
            nama IN UNNEST(@places)
        """
        query_params = [bigquery.ArrayQueryParameter("places", "STRING", predicted_places)]
        job_config = bigquery.QueryJobConfig(
            query_parameters=query_params
        )

        query_job = bigquery_client.query(query, job_config=job_config)
        rows = query_job.result()

        if not rows:
            return jsonify({
                "status": "fail",
                "message": f"Tidak ada data untuk tempat '{', '.join(predicted_places)}'"
            }), 404


        recommendations = [{
            "place_name": row.nama,
            "description": row.trans_desc,
            "image_link": row.image_link
        } for row in rows]

        id = str(uuid.uuid4())
        created_at = str(uuid.uuid1()) 

        response_data = {
            "id": id,
            "keyword": keyword,
            "predictedPlaces": predicted_places,
            "recommendations": recommendations,
            "createdAt": created_at
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "status": "fail",
            "message": f"Terjadi kesalahan: {str(e)}"
        }), 500


if __name__ == '__main__':
    load_model()  
    app.run(debug=True)
