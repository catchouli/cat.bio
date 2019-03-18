echo "Writing to out/cv.docx"
mkdir -p out
pandoc cv.md -f markdown -t docx -o out/cv.docx #--reference-doc=scripts/docx/reference.docx -o out/cv.docx

#rm -r temp
#mkdir -p temp
#pushd temp
#unzip ../out/cv.docx
#unzip ../scripts/docx/reference3.docx
#popd
#cp -R scripts/docx/fonts temp/word/
#cp scripts/docx/fontTable.xml.rels temp/word/
#zip -ur out/cv.docx temp
#rm -r temp
