ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS container_dependencies
ARG ALPINE_APK_ARGS
# --build-arg ALPINE_APK_ARGS=--no-check-certificate
RUN apk ${ALPINE_APK_ARGS} add jq


FROM container_dependencies AS get_dependencies

COPY package.json /tmp
RUN jq '{ dependencies, devDependencies }' < /tmp/package.json > /tmp/deps.json


FROM get_dependencies AS install_dependencies

WORKDIR /app

COPY yarn.lock .
COPY --from=get_dependencies /tmp/deps.json ./package.json


FROM install_dependencies

WORKDIR /app

RUN yarn install --immutable

COPY . .
