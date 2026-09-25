FROM python:3.11-slim

# Install system libraries needed by OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgles2 \
    libgl1 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Install Python deps, then force headless opencv
RUN pip install --no-cache-dir -r requirements.txt \
    && pip uninstall -y opencv-python opencv-contrib-python \
    && pip install --no-cache-dir opencv-python-headless==4.10.0.84

COPY . .

EXPOSE 10000

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
