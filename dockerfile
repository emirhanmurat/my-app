# Base image
FROM node:18

# Çalışma dizinini oluştur
WORKDIR /my-app


COPY index.js .

# Gerekli paketleri yükle
RUN npm install express body-parser jsonwebtoken

# Uygulamayı başlat
CMD ["node", "index.js"]
