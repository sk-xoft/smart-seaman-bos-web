#base image
FROM node:14.21.2

WORKDIR /app
COPY package.json .

RUN apt-get update

RUN mkdir -p /apps/web_admin/logs/
ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 10000
CMD [ "npm", "run", "serve" ]