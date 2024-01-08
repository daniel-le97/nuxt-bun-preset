# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM node:latest as base
WORKDIR /usr/src/app
RUN npm install -g bun

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM oven/bun:canary-alpine
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/.output/ ./.output/


# run the app
USER bun
EXPOSE 3000/tcp

CMD ["sh", "-c", "bun .output/server/index.mjs"]
ENTRYPOINT [ "bun", "run", "start" ]
