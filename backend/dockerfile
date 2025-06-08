# Use an official Node.js runtime as the base image
# change this vs. as needed a simo.
FROM node:18-alpine 

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# lean
RUN npm ci --only=production

COPY . .

# Define the command to run your application
# This will execute "npm run server" which is defined in your package.json
# as "node ./src/app.js"
CMD ["npm", "run", "server"]
