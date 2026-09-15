FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=development
ENV HOST=0.0.0.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.js ./
COPY server ./server
COPY --from=build /app/dist ./dist

USER node

CMD ["node", "server.js"]