# Stage 1: Build the React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Server dependencies & Prisma client
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --workspace=server
COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate

# Stage 3: Final production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy server and built dependencies
COPY --from=server-builder /app/package*.json ./
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/server ./server
COPY --from=client-builder /app/client/dist ./client/dist

# Create storage volume directory
RUN mkdir -p /app/storage

EXPOSE 3000
EXPOSE 41234/udp

CMD ["node", "server/src/index.js"]
