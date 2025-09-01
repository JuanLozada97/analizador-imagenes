# frontend/Dockerfile (preview mode)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE=http://localhost:4000
ENV VITE_API_BASE=${VITE_API_BASE}

COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]
