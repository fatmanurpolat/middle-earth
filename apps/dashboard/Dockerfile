# syntax=docker/dockerfile:1
# Build context = repo ROOT (the app imports @middleearth/shared + @middleearth/i18n).

# ---- Build the static site ----
FROM node:20-alpine AS builder
WORKDIR /repo
ENV CI=1

# VITE_* vars must be present at BUILD time — Vite bakes them into the bundle.
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_LANDING_URL=http://localhost:5173
ENV VITE_LANDING_URL=${VITE_LANDING_URL}

COPY package.json package-lock.json* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/dashboard ./apps/dashboard
RUN npm install --no-audit --no-fund
RUN npm run build -w @middleearth/dashboard

# ---- Serve with nginx ----
FROM nginx:1.27-alpine AS runner
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/dashboard/dist /usr/share/nginx/html
EXPOSE 80
