# Estágio 1: build da aplicação (compila o React/Vite)
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variáveis do Vite: precisam existir NO MOMENTO DO BUILD, ficam embutidas no JS final
ARG VITE_API_BASE_URL
ARG VITE_ML_URL_AUTH
ARG VITE_BASE_URL_IMAGES
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ML_URL_AUTH=$VITE_ML_URL_AUTH
ENV VITE_BASE_URL_IMAGES=$VITE_BASE_URL_IMAGES

RUN npm run build

# Estágio 2: servir os arquivos estáticos com Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80