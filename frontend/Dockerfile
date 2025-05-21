
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install all dependencies (including devDependencies for 'npm run dev')
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port Next.js runs on (default 3000 for dev)
EXPOSE 3000

# Default command to run the Next.js development server
CMD ["npm", "run", "dev"]
