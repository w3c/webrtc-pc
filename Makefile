
all: webrtc.diff.html getusermedia.diff.html

clean:
	- rm -f *.svg *.png *.pdf  webrtc.diff.html webrtc.txt webrtc.orig.txt  getusermedia.diff.html getusermedia.txt getusermedia.orig.txt

webrtc.txt: webrtc.html
	html2text.py webrtc.html | fold -bs -w 80 > webrtc.txt

webrtc.orig.txt: webrtc.orig.html
	html2text.py webrtc.orig.html | fold -bs -w 80 > webrtc.orig.txt

webrtc.diff.html: webrtc.orig.txt webrtc.txt
	htmlwdiff webrtc.orig.txt webrtc.txt > webrtc.diff.html

getusermedia.txt: getusermedia.html
	html2text.py getusermedia.html | fold -bs -w 80 > getusermedia.txt

getusermedia.orig.txt: getusermedia.orig.html
	html2text.py getusermedia.orig.html | fold -bs -w 80 > getusermedia.orig.txt

getusermedia.diff.html: getusermedia.orig.txt getusermedia.txt
	htmlwdiff getusermedia.orig.txt getusermedia.txt > getusermedia.diff.html

