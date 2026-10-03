FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install --no-save json-server@1.0.0-beta.15

COPY backend ./backend
COPY deploy/start-db.sh ./deploy/start-db.sh

ENV NODE_ENV=production
