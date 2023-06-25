#!/usr/bin/env bash

openssl req \
             -newkey rsa:2048 -nodes -keyout ssl/domain.key \
             -x509 -days 365 -out ssl/domain.crt -subj '/CN=localtest.me' \
      -addext 'subjectAltName=DNS:localtest.me,DNS:*.localtest.me'