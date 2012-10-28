


SRC  := $(wildcard *.wsd)

SVG  := $(patsubst %.wsd,%.svg,$(SRC))
PNG  := $(patsubst %.wsd,%.png,$(SRC)) 


all: $(SVG) 
	cp $(SVG) ../images/.

clean:
	- rm -f *.svg *.png *.pdf 

%.svg: %.wsd
	node ladder.js $^ $@

%.png: %.svg
	java -jar batik-rasterizer.jar $^ -d $@ -bg 255.255.255.255

