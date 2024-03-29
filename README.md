# CYOA - choose your own adventure app

Svelte + Fastify to play CYOA stories

Infrastructure:
  - Cloudflare R2 for storage
  - Cloudflare Pages hosted Svelte UI
  - NodeJS + PM2 backend
  - SQLITE DB


### Running locally
Prereqs: `podman-compose or docker-compose, node >= v18.18.2`
1. Run the docker-compose file to get local S3, postgres, and nginx set up
2. Generate self signed ssl certificates using ssl script
3. Add self signed SSL certificate to browser (to avoid https errors w/ google auth)
4. Run server by running `cd server; num run dev`
5. Run client by running `cd client; npm run dev`
6. View https://localtest.me:8080