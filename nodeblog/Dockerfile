FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --no-audit

COPY . .

EXPOSE 3000
USER node
CMD ["node", "server.js"]
