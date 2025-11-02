FROM node:20-alpine AS build
WORKDIR /app
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf  