# Gunakan image dasar Python
FROM python:3.9-slim

# Setel direktori kerja di dalam container
WORKDIR /app

# Salin file aplikasi Flask ke dalam container
COPY . .

# Install dependensi
RUN pip install -r requirements.txt

# Expose port 8080 (default untuk Google Cloud Run)
EXPOSE 8080

# Perintah untuk menjalankan aplikasi
CMD ["python", "app.py"]
