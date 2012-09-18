
all: diff.html

clean:
	- rm -f *.svg *.png *.pdf 

webrtc.txt: webrtc.html
	html2text.py  webrtc.html | fold -bs -w 80 > webrtc.txt

orig.txt: orig.html
	html2text.py orig.html | fold -bs -w 80 > orig.txt

diff.html: orig.txt webrtc.txt
	htmlwdiff orig.txt webrtc.txt > diff.html

