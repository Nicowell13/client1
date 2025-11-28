# Gunakan image node versi LTS
FROM node:18

# Set workdir
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port (default Next.js: 3000)
EXPOSE 3000

# Start aplikasi
CMD ["npm", "start"]
