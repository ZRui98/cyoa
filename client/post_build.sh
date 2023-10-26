#! /usr/bin/env sh
for file in build/*.html; do
    mv -- "$file" "${file%%.html}"
done
mv "build/index" "build/index.html"