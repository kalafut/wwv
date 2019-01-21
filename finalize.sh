#!/bin/bash

# copy files
rsync --progress -u ./images/* ./dist/images/
rsync --progress -u ./clips/* ./dist/clips/

pandoc --metadata pagetitle="." --template src/about_template.html src/about.md -o dist/about.html

# bust caches
sed -i "s/%CSS_HASH%/$(shasum ./dist/main.css | cut -c 1-10)/" ./dist/index.html
sed -i "s/%CSS_HASH%/$(shasum ./dist/main.css | cut -c 1-10)/" ./dist/about.html
sed -i "s/%JS_HASH%/$(shasum ./dist/main.js | cut -c 1-10)/" ./dist/index.html


