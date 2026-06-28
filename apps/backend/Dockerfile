# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /repo
ENV CI=1

# ---- Dependencies + build ----
# The backend imports @middleearth/shared which ships TypeScript source, so the
# whole monorepo workspace must be present for the single install + bundle.
FROM base AS builder
COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend
RUN npm install --no-audit --no-fund
WORKDIR /repo/apps/backend
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /repo/apps/backend
# tsup bundles workspace deps; remaining runtime deps (fastify, pg, ...) are needed.
COPY --from=builder /repo/apps/backend/package.json ./package.json
COPY --from=builder /repo/node_modules /repo/node_modules
COPY --from=builder /repo/apps/backend/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
