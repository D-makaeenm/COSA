# Bước 1: Build React app
FROM node:22 as build

WORKDIR /app
COPY package*.json ./ 
RUN npm install
COPY . . 
RUN npm run build

# Bước 2: Setup Nginx
FROM nginx:latest

# Copy file cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build React vào Nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
