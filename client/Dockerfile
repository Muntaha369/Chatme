# Use Node alpine
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose standard React port
EXPOSE 5173

# Start the dev server
CMD ["npm", "start"]