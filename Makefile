
all: webrtc.diff.html 

clean:
	- rm -f *.svg *.png *.pdf  webrtc.diff.html webrtc.txt webrtc.orig.txt  

webrtc.txt: webrtc.html
	html2text.py webrtc.html | fold -bs -w 80 > webrtc.txt

webrtc.orig.txt: webrtc.orig.html
	html2text.py webrtc.orig.html | fold -bs -w 80 > webrtc.orig.txt

webrtc.diff.html: webrtc.orig.txt webrtc.txt
	htmlwdiff webrtc.orig.txt webrtc.txt > webrtc.diff.html

tidy-test:
	tidy -config config.tidy < webrtc.html -o tidy.html -f tidy.err
	grep -v "not approved by W3C" < tidy.err