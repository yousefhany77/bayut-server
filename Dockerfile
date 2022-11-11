FROM node:16-alpine as development

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 4000
CMD   ["npm", "run","dev"]


FROM node:16-alpine as production

WORKDIR /app
COPY . .
RUN npm install --only=production
RUN npm run build
EXPOSE 4000
ENTRYPOINT ["npm", "start"]

