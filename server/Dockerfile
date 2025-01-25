FROM node:18 AS build-env
COPY . /workdir
WORKDIR /workdir

RUN npm ci
RUN npm run build:prod

FROM node:18-slim
COPY --from=build-env /workdir/dist /build/dist
COPY ./db /build/db
COPY ./tsconfig.json /build/tsconfig.json
COPY ./package.json /build/package.json
COPY ./package-lock.json /build/package-lock.json
RUN cd build && npm ci --omit=dev
WORKDIR /build
CMD ["npm", "start"]
