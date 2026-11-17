# ---------- Etapa 1: build ----------
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# prisma.config.ts exige DATABASE_URL aunque generate no se conecte a la BD
RUN DATABASE_URL="postgresql://postgres:pass@localhost:5433/tokadb" npx prisma generate \
    && npm run build

# ---------- Etapa 2: producción ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# El build queda en dist/src/ (por el prisma.config.ts en la raíz)
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 8000

CMD ["node", "dist/src/main.js"]
