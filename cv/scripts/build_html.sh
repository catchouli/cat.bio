echo "Writing to out/cv.html"
mkdir -p out
pandoc cv.md -f markdown -t html -o out/cv.html

echo "Writing to out/index.html"
cat scripts/html/head.html out/cv.html scripts/html/foot.html > out/index.html
