# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copia solo lo necesario para cache de dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copia el código
COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "src/index.js"]
