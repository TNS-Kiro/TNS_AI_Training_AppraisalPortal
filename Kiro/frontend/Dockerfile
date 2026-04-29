# ─── Stage 1: Build Angular app ───────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built Angular output and the Express server
COPY --from=builder /app/dist ./dist
COPY server.js ./

ENV PORT=4200
ENV NODE_ENV=production

EXPOSE 4200

CMD ["node", "server.js"]
