# syntax=docker/dockerfile:1
# Build context = repo ROOT (the app imports @middleearth/shared + @middleearth/i18n).

# ---- Build the static site ----
FROM node:20-alpine AS builder
WORKDIR /repo
ENV CI=1

# VITE_* vars must be present at BUILD time — Vite bakes them into the bundle.
ARG VITE_DASHBOARD_URL=http://localhost:5174
ENV VITE_DASHBOARD_URL=${VITE_DASHBOARD_URL}

COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/landing ./apps/landing
RUN npm install --no-audit --no-fund
RUN npm run build -w @middleearth/landing

# ---- Serve with nginx ----
FROM nginx:1.27-alpine AS runner
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/landing/dist /usr/share/nginx/html
EXPOSE 80
