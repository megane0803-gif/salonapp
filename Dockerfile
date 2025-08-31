FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

RUN npm run build || true

EXPOSE 3000
CMD ["npm", "start"]
