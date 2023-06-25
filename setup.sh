#! /usr/bin/env sh

podman-compose up -d

cd server
npm i
cd ../client
npm i
cd ..