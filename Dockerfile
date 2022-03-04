FROM node:16

WORKDIR /app
COPY package.json package*.json ./
RUN npm ci
COPY . .
EXPOSE 5500
RUN npm run build
CMD ["npm", "run", "start"]


