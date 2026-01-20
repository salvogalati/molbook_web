FROM python:3.13-slim

# Imposta la working directory
WORKDIR /app

# Installa librerie di sistema richieste da RDKit
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libxrender1 \
    libxext6 \
    libsm6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copia e installa le dipendenze Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copia il resto del backend
COPY . .

# Esponi la porta di Django
EXPOSE 8000

# Comando di avvio
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
