FROM node:20 AS base

WORKDIR /app

# -------------------------
# deps
# -------------------------
FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci

# -------------------------
# builder
# -------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Build do projeto
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# -------------------------
# runner
# -------------------------
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

# usuário não-root
RUN addgroup --system app && adduser --system --ingroup app app

# Copia artefatos
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/prisma ./prisma

USER app

EXPOSE 8000

CMD ["node", "dist/server.js"]