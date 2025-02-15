kubectl create secret generic cyoa-secret \
    --from-literal=cors_domain=https://localtest.me:5173,https://localtest.me:8080 \
    --from-literal=gauth_client=$GAUTH_CLIENT \
    --from-literal=gauth_token=$GAUTH_TOKEN \
    --from-literal=s3_endpoint=localhost:9000 \
    --from-literal=session_key=admin \
    --from-literal=secret_access_key=password \
    --from-literal=sqid_alphabet=abcABC1492qtwioZG \
    --from-literal=storage_url=localhost:9000

kubectl apply -f app.yaml service.yaml