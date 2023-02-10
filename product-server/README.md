# Product application server

##  Running the server
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Using Docker
IMPORTANT: In order to communicate with external services, in `app.module.ts` the host must be provided by uncommenting the line `host: 'host.docker.internal'`.
```bash
# see running processes
# add '-a' to see all processes
$ docker ps
____________________________________________________________________________________________________

# a) build with Dockerfile
$ docker build -t product-storage-server .
____________________________________________________________________________________________________

# b) build and run with docker-compose.yml
# '--build' to rebuild
$ docker-compose up
____________________________________________________________________________________________________

# stop image
$ docker stop product-server

# remove image
$ docker rm product-server
```
