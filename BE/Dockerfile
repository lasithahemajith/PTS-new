# ------------ Backend Dockerfile ------------
FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

RUN npm install --production

# Copy source code
COPY . .

# ✅ Explicitly copy the .env file into the image
COPY .env .env

# ✅ Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
