# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Mapbox token to Next.js at build and runtime
ARG MAPBOX_ACCESS_TOKEN_BUILD
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=$MAPBOX_ACCESS_TOKEN_BUILD

# Build the Next.js application
# This command might vary slightly depending on your exact setup/needs
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]