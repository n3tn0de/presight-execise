ARG NGINX_VERSION=alpine-slim
ARG BASE_IMAGE=presight-base

FROM ${BASE_IMAGE} AS client

WORKDIR /app
RUN yarn check --verify-tree
RUN yarn --pure-lockfile
RUN yarn --cwd client build


FROM nginx:${NGINX_VERSION}
ARG NGINX_HTML_PATH=/usr/share/nginx/html

COPY --from=client /app/client/dist ${NGINX_HTML_PATH}

CMD ["nginx", "-g", "daemon off;"]
