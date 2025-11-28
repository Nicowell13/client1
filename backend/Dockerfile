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

# Expose port (pastikan sama dengan .env, default 4000)
EXPOSE 4000

# Start aplikasi
CMD ["npm", "start"]
