FROM node:12.16.1-alpine3.9

RUN apk add bash
RUN npm install pm2 -g

#Dependencies
COPY ./src /app
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm install


ENTRYPOINT ["pm2-runtime", "start", "index.js", "--name", "dracul-fortes-agent"]


