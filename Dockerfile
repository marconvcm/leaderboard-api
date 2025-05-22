# ---- Build Stage ----
FROM node:slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build || :

# ---- Production Stage ----
FROM node:slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000
CMD ["node", "dist/server.js"]
