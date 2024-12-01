# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY ./tools/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./tools .

# Expose the backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]

