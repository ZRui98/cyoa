# CYOA - choose your own adventure app

Svelte + Fastify to play CYOA stories

Infrastructure:
  - Cloudflare R2 for storage
  - Cloudflare CDN fronting R2
  - AWS Lambdas + API Gateway for backend
  - GCP Firebase Auth for authentication (federated only at this point)
  - Oracle Linux hosted postgres for db