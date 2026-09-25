# Etapa 1: Build de Vite
FROM node:20-slim AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_MOCK_AUTH

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_MOCK_AUTH=$VITE_MOCK_AUTH

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Nginx para servir la aplicación SPA
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
