
all: webrtc.diff.html getusermedia.diff.html MediaRecorder.diff.html 
all: webrtc.diff.html getusermedia.diff.html 

clean:
	- rm -f *.svg *.png *.pdf  webrtc.diff.html webrtc.txt webrtc.orig.txt  getusermedia.diff.html getusermedia.txt getusermedia.orig.txt  MediaRecorder.diff.html MediaRecorder.txt MediaRecorder.orig.txt

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


MediaRecorder.txt: MediaRecorder.html
	html2text.py MediaRecorder.html | fold -bs -w 80 > MediaRecorder.txt

MediaRecorder.orig.txt: MediaRecorder.orig.html
	html2text.py MediaRecorder.orig.html | fold -bs -w 80 > MediaRecorder.orig.txt

MediaRecorder.diff.html: MediaRecorder.orig.txt MediaRecorder.txt
	htmlwdiff MediaRecorder.orig.txt MediaRecorder.txt > MediaRecorder.diff.html
