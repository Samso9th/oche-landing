# oche.io: the landing page, a static build served by nginx.
# VITE_APP_URL is where "Open Oche" and "Sign in" point (the dashboard).
FROM node:26-alpine AS build
WORKDIR /app
ARG VITE_APP_URL=https://ship.oche.io
ENV VITE_APP_URL=$VITE_APP_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx vite build

FROM nginx:1.29-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# 127.0.0.1, not localhost: nginx listens on IPv4 only and localhost can resolve to ::1.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
