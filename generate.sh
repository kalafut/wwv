#!/bin/bash

set -e

rm -rf tmp
mkdir tmp

echo "Generating tone files"
cd wwv_tones
go run main.go

echo "Moving to work directory"
mv *.wav ../tmp

cd ../tmp
cp ../voice_clips/* .

rm h_ident.mp3
rm v_ident.mp3
rm h_ident_better.mp3
rm v_ident_better.mp3

echo "Building sprite"
audiosprite -f howler2 -e mp3 -b 64 -s 5.02 -u clips *.wav *.mp3
cd ..

echo "Moving files to clips"
rm -rf clips
mkdir clips
mv tmp/output.mp3 clips
cp voice_clips/*_ident* clips

echo "Generating sprite layout file"
cat > src/sprite_layout.js <<EOF
/* eslint-disable */
export default
EOF

cat >> src/sprite_layout.js tmp/output.json

