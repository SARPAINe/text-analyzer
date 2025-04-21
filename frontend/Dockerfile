# Step 1: Build the app
FROM node:latest as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve the app with a lightweight web server
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5000
EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
