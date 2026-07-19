ARG BASE_IMAGE=presight-base

FROM ${BASE_IMAGE}

WORKDIR /app
RUN yarn --pure-lockfile

CMD ["yarn", "--cwd", "server", "start"]
