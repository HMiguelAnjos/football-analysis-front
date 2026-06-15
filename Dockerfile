# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /opt/runtime/default.conf.template
COPY docker/40-generate-env.sh /docker-entrypoint.d/40-generate-env.sh
RUN chmod +x /docker-entrypoint.d/40-generate-env.sh

# Suppress nginx [notice] logs (start worker process, nginx version, etc).
# nginx envia notices pra stderr → Railway classifica como @level:"error",
# poluindo o painel com falsos positivos. Subir threshold pra `warn`
# silencia notices mas mantém warnings/errors reais visíveis.
RUN sed -i 's|error_log .*|error_log /var/log/nginx/error.log warn;|' /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
