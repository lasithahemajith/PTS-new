# ------------ Backend Dockerfile ------------
FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

RUN npm install --production

# Copy source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads/logpapers

EXPOSE 5000

CMD ["npm", "start"]
