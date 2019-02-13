#!/bin/bash

# copy files
cp src/*.html ./dist/
cp src/*.css ./dist/
rsync --progress -u ./images/* ./dist/images/
rsync --progress -u ./clips/* ./dist/clips/
rsync --progress -u ./font/* ./dist/font/

# bust caches
sed -i "s/output\.mp3/output.mp3\?v=$(shasum ./dist/clips/output.mp3 | cut -c 1-10)/" ./dist/main.js
sed -i "s/v_ident\.mp3/v_ident.mp3\?v=$(shasum ./dist/clips/v_ident.mp3 | cut -c 1-10)/" ./dist/main.js
sed -i "s/h_ident\.mp3/h_ident.mp3\?v=$(shasum ./dist/clips/h_ident.mp3 | cut -c 1-10)/" ./dist/main.js
sed -i "s/%CSS_HASH%/$(shasum ./dist/main.css | cut -c 1-10)/" ./dist/index.html
sed -i "s/%JS_HASH%/$(shasum ./dist/main.js | cut -c 1-10)/" ./dist/index.html
sed -i "s/%FONT_HASH%/$(shasum ./dist/fontello.css | cut -c 1-10)/" ./dist/index.html
