FROM node:20-slim AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install && npm install -g pm2

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["pm2-runtime", "start", "server.js", "nginx"]
