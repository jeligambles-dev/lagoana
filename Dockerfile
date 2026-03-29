FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN node node_modules/next/dist/bin/next build

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Push schema and start
CMD ["sh", "-c", "echo \"DB URL set: $(echo $DATABASE_URL | head -c 30)...\" && npx prisma db push --url \"$DATABASE_URL\" && node node_modules/next/dist/bin/next start"]
