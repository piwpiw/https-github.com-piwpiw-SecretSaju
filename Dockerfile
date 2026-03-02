FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-optional

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Render routes requests to a dynamic PORT; do not hardcode 3000.
# Keep EXPOSE aligned with Render default external port.
EXPOSE 10000

CMD ["node", "server.js"]

