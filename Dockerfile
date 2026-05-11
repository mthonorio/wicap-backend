FROM node:20-alpine AS base

WORKDIR /app

# -------------------------
# deps
# -------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# -------------------------
# builder
# -------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build do Fastify
RUN npm run build

# Remove dependências de desenvolvimento para o runtime
RUN npm prune --omit=dev

# -------------------------
# runner
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# segurança
RUN addgroup -S app && adduser -S app -G app

# Copiar apenas artefatos necessários para execução
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/prisma ./prisma

USER app

EXPOSE 3000
CMD ["node", "dist/server.js"]