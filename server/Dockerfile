# Use Node alpine (lightweight)
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 3002

# Start backend
CMD ["npm", "start"]