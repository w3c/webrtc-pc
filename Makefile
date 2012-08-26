


SRC  := $(wildcard *.wsd)

SVG  := $(patsubst %.wsd,%.svg,$(SRC))
PNG  := $(patsubst %.wsd,%.png,$(SRC)) 


all: diff.html $(SVG) 

clean:
	- rm -f *.svg *.png *.pdf 


webrtc.txt: webrtc.html
	html2text.py  webrtc.html | fold -bs -w 80 > webrtc.txt

orig.txt: orig.html
	html2text.py orig.html | fold -bs -w 80 > orig.txt

diff.html: orig.txt webrtc.txt
	htmlwdiff orig.txt webrtc.txt > diff.html


%.svg: %.wsd
	node ladder.js $^ $@

%.png: %.svg
	java -jar batik-rasterizer.jar $^ -d $@ -bg 255.255.255.255

