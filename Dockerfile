# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Set environment variables inside the container
ENV PORT=8000
ENV MONGO_URI=mongodb+srv://zk7766280:M93mkjk4qoCTzTaq@cluster0.si2pk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Start the application
CMD ["node", "server.js"]
