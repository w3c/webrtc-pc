ifneq (,$(shell which tidy5))
TIDY ?= tidy5
else
TIDY ?= tidy
endif

all: webrtc.diff.html 

clean:
	- rm -f *.svg *.png *.pdf  webrtc.diff.html webrtc.txt webrtc.orig.txt  

webrtc.txt: webrtc.html
	html2text.py webrtc.html | fold -bs -w 80 > webrtc.txt

webrtc.orig.txt: webrtc.orig.html
	html2text.py webrtc.orig.html | fold -bs -w 80 > webrtc.orig.txt

webrtc.diff.html: webrtc.orig.txt webrtc.txt
	htmlwdiff webrtc.orig.txt webrtc.txt > webrtc.diff.html

tidy:
	-$(TIDY) -config config.tidy -m -q webrtc.html

check:
	-$(TIDY) -config config.tidy -q webrtc.html | diff -q webrtc.html -

tidy-test:
	$(TIDY) -config config.tidy -o tidy.html -f tidy.err webrtc.html
	html2text.py tidy.html | fold -bs -w 80 > tidy.txt
	htmlwdiff webrtc.txt tidy.txt > tidy.diff.html
	grep -v "not approved by W3C" < tidy.err

