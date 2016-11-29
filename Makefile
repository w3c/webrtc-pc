all: webrtc.diff.html

clean::
	- rm -f *.svg *.png *.pdf  webrtc.diff.html webrtc.txt webrtc.orig.txt

webrtc.txt: webrtc.html
	html2text.py webrtc.html | fold -bs -w 80 > webrtc.txt

webrtc.orig.txt: webrtc.orig.html
	html2text.py webrtc.orig.html | fold -bs -w 80 > webrtc.orig.txt

webrtc.diff.html: webrtc.orig.txt webrtc.txt
	htmlwdiff webrtc.orig.txt webrtc.txt > webrtc.diff.html

tidy-test:
	$(TIDY) -config $(TIDYCONF) -o tidy.html -f tidy.err webrtc.html
	html2text.py tidy.html | fold -bs -w 80 > tidy.txt
	htmlwdiff webrtc.txt tidy.txt > tidy.diff.html
	grep -v "not approved by W3C" < tidy.err

include webrtc-respec-ci/Makefile

# Import the respec CI Makefile
webrtc-respec-ci/Makefile:
	git clone --depth 5 https://github.com/w3c/webrtc-respec-ci $(dir $@)

update::
	git -C webrtc-respec-ci pull
