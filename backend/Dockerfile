FROM node:24.16.0-alpine3.24
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY docs ./docs
EXPOSE 5000
CMD ["node", "src/server.js"]
