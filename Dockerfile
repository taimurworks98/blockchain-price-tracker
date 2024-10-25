# Use Node.js official image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the app's port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start:dev"]
