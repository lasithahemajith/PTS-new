# ========================
# 🔹 FRONTEND BUILD STAGE
# ========================
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Vite project (output goes to /app/dist)
RUN npm run build

# ========================
# 🔹 NGINX SERVE STAGE
# ========================
FROM nginx:alpine

# Remove default nginx index file
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
