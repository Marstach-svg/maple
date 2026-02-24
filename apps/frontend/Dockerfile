# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

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
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "run", "dev:frontend"]

# ---- Builder ----
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY tsconfig.json ./
COPY apps/frontend/ ./apps/frontend/
COPY packages/ ./packages/
RUN npm run build --workspace=apps/frontend

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/packages/ ./packages/
RUN npm ci --omit=dev

COPY --from=builder /app/apps/frontend/.next/ ./apps/frontend/.next/
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD ["npm", "run", "start:frontend"]
