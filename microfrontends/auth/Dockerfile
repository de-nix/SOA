# Use node:14 as the base image
FROM node:14

# Set the working directory to /app
WORKDIR /auth

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Run npm install to install all dependencies
RUN npm install

# Copy all other files to the container
COPY . .

# Set the environment to production
ENV NODE_ENV=production

# Build the app using the build script
RUN npm run build:dev

# Run the app on port 5001
EXPOSE 5001

# Start the app using the start script
CMD ["npm", "start"]
