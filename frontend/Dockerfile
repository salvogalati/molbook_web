# Usa Node come base
FROM node:20-alpine

# Setta working directory
WORKDIR /app

# Copia package.json e installa dipendenze
COPY package*.json ./
RUN npm install

# Copia tutto il frontend
COPY . .

# Espone porta Vite
EXPOSE 5173

# Comando per avviare frontend
CMD ["npm", "run", "dev", "--", "--host"]
