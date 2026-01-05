ARG APP_DIR=/opt/meltstudio/task-runner

FROM public.ecr.aws/lambda/nodejs:20 AS base

RUN npm install -g yarn

FROM base AS pruner

ARG APP_DIR
WORKDIR $APP_DIR

RUN yarn global add turbo@1.13.4
COPY . .
RUN turbo prune --scope=@meltstudio/task-runner --docker

FROM base AS builder

ARG APP_DIR
WORKDIR $APP_DIR

COPY --from=pruner ${APP_DIR}/out/json/ .
COPY --from=pruner ${APP_DIR}/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,target=/root/.yarn \
    YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile
COPY --from=pruner ${APP_DIR}/out/full/ .

COPY turbo.json turbo.json
RUN yarn build --filter=@meltstudio/task-runner...

FROM base AS runner

ARG APP_DIR
WORKDIR $LAMBDA_TASK_ROOT
COPY --from=builder $APP_DIR $LAMBDA_TASK_ROOT
ENV NODE_ENV=production

CMD ["apps/task-runner/dist/index.handler"]
