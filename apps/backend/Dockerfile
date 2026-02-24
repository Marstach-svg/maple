# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
# openssl required by Prisma query engine on Alpine (OpenSSL 3)
RUN apk add --no-cache openssl

# ---- Dependencies ----
FROM base AS deps
# Copy workspace package manifests first for layer caching
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

# ---- Development ----
FROM deps AS dev
# Copy prisma schema to generate client into node_modules
COPY prisma ./prisma/
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev:backend"]

# ---- Builder ----
FROM deps AS builder
COPY tsconfig.json ./
COPY apps/backend/ ./apps/backend/
COPY packages/ ./packages/
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npm run build --workspace=apps/backend

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/prisma/ ./prisma/
RUN npm ci --omit=dev

COPY --from=builder /app/apps/backend/dist/ ./apps/backend/dist/
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "apps/backend/dist/workers.js"]
