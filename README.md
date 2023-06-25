# CYOA - choose your own adventure app

Svelte + Fastify to play CYOA stories

Infrastructure:
  - Cloudflare R2 for storage
  - Cloudflare CDN fronting R2
  - AWS Lambdas + API Gateway for backend
  - GCP Firebase Auth for authentication (federated only at this point)
  - Oracle Linux hosted postgres for db


### Running locally
Prereqs: `podman-compose or docker-compose, node >= v18.12.0`
1. Run the docker-compose file to get local S3, postgres, and nginx set up
2. Generate self signed ssl certificates using ssl script
3. Add self signed SSL certificate to browser (to avoid https errors)
4. Run server by running `cd server; num run dev`
5. Run client by running `cd client; npm run dev`
6. View https://localtest.me:8080