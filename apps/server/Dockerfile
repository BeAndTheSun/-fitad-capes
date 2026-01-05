ARG APP_DIR="/app"

FROM node:20-alpine AS base

FROM base as builder

ARG APP_DIR
WORKDIR ${APP_DIR}
RUN apk add --no-cache libc6-compat
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@meltstudio/server --docker

FROM base AS installer

ARG APP_DIR
WORKDIR ${APP_DIR}
RUN apk add --no-cache libc6-compat
COPY --from=builder ${APP_DIR}/out/json/ .
COPY --from=builder ${APP_DIR}/out/yarn.lock ./yarn.lock
RUN yarn --frozen-lockfile
COPY --from=builder ${APP_DIR}/out/full/ .

COPY turbo.json turbo.json
# uncomment and setup to be able to reuse turbo cache when building
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM
# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN
# CI=true avoids running type checking and eslint when building nextjs
ENV CI true
RUN yarn turbo run build --filter=@meltstudio/server...

FROM base AS runner

ARG APP_DIR
WORKDIR ${APP_DIR}
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs
COPY --from=installer ${APP_DIR} .
EXPOSE 4000
ENV PORT 4000

CMD ["node", "apps/server/dist/index.js"]
