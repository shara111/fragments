# Stage 1: Build
FROM node:18.13.0 AS build

LABEL maintainer="Sukhman Hara shara1@myseneca.ca"
LABEL description="Fragments node.js microservice"

# Set environment variables to reduce npm output
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy package.json and package-lock.json files into /app
COPY package*.json ./

# Install dependencies (use npm ci if you have a package-lock.json)
RUN npm install

# Copy the rest of the application code to the container
COPY ./src ./src

# Copy .htpasswd file if needed for tests
COPY ./tests/.htpasswd ./tests/.htpasswd

# Uncomment if a build step is required
# RUN npm run build

# Stage 2: Production
FROM node:18.13.0 AS production

# Set working directory for production
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app .

# Set environment variable for the port
ENV PORT=8080

# Expose the port the app runs on
EXPOSE 8080

# Run the container by default with environment variables
CMD ["npm", "start"]
