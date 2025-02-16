FROM node:18 AS build-env
COPY . /workdir
WORKDIR /workdir

RUN npm ci
RUN npm run build:prod

FROM node:18-slim
COPY --from=build-env /workdir/dist /build/dist
COPY --from=build-env /workdir/node_modules /build/node_modules
COPY db /build/db
COPY .config /build/.config
COPY package.json /build/package.json
COPY package-lock.json /build/package-lock.json
RUN cd /build && npm ci --omit=dev
WORKDIR /build
CMD npm run kysely migrate:latest && npm start