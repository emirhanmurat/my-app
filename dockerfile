# Base image
FROM node:18

# Çalışma dizinini oluştur
WORKDIR /app

# package.json varsa önce onu kopyala
COPY package*.json ./

# Gerekli paketleri yükle
RUN npm install express body-parser jsonwebtoken

# Uygulama dosyasını kopyala
COPY . .

# Uygulamayı başlat
CMD ["node", "index.js"]
