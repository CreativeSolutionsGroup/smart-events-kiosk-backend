FROM node:16.13.1 AS builder
WORKDIR /build
COPY ./src ./src
COPY ./pnpm-lock.yaml .
COPY ./package.json .
COPY ./LICENSE .
COPY ./tsconfig.json .
COPY ./.swcrc .
RUN npm i
RUN npm run build:internal

FROM node:16.13.1 AS runtime
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /build/build ./
COPY --from=builder /build/package.json .
COPY --from=builder /build/LICENSE .
COPY --from=builder /build/pnpm-lock.yaml .
RUN npm i
CMD node main.js