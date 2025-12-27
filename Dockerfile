# 1. Use Node.js 18
FROM node:18

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package files from schoolapplication-backend folder
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the backend code
COPY . .

# 6. Expose the port used in server.js
EXPOSE 3000

# 7. Start command
CMD [ "node", "server.js" ]