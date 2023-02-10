FROM node:10.16.3
WORKDIR /product-server
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main"]