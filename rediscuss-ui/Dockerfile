FROM node

RUN apt-get update && \
    apt-get install -y vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json ./

RUN npm install


COPY . .

CMD ["npm", "start"]