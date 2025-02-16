# CYOA - choose your own adventure app

Svelte + Fastify to play CYOA stories

Infrastructure:
  - Cloudflare R2 for blob storage
  - Cloudflare Pages hosted Svelte UI
  - NodeJS Backend
  - SQLITE DB for metadata


### Running locally

Prereqs: `podman-compose or docker-compose, node >= v18.18.2`
1. Generate self signed ssl certificates using ssl script
2. Run the docker-compose file to get local S3, postgres, and nginx set up
3. Add self signed SSL certificate to browser (to avoid https errors w/ google auth)
4. Run server by running `(cd server && num run dev)`
5. Run client by running `(cd client && npm run dev)`
6. View https://localtest.me:8080

### Testing k8s resources

Prereqs: `minikube, kubectl`
1. Build the docker image on minikube `(cd server && minikube image build -t cyoa-server .)`
2. Run server by running `(cd kubernetes && GAUTH_CLIENT="" GAUTH_SECRET="" kubectl apply -f app.yml)`
3. Port forward the port using `kubectl port-forward -n cyoa svc/cyoa 8080:8080`

*Note:* If you want to test the k8s resource e2e, you can