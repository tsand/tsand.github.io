FROM node:20 as node


WORKDIR /app
COPY package.json .
RUN npm install

COPY scripts ./scripts
RUN ./node_modules/.bin/esbuild ./scripts/src/script.js ./scripts/src/textToHTML.js --bundle --splitting --format=esm --outdir=./scripts/dist
# --minify --sourcemap --target=esm
# FROM jekyll/minimal
# COPY --from=node /app/out.js /srv/jekyll/_site/out.js
# RUN jekyll serve --incremental --force_polling

FROM scratch
COPY --from=node /app/scripts/dist .
