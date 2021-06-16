FROM node:lts-alpine3.13

WORKDIR /home/node/app

COPY ./ .

CMD [ "/usr/local/bin/npm", "start" ]
