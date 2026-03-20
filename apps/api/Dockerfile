FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY . .

EXPOSE 4000

CMD ["node", "--loader", "tsx", "src/index.ts"]
