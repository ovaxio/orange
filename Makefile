
build: components index.js sliderloop.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

compile:
	coffee -c -o ./ src/index.coffee
	stylus -o ./ src/orange.styl

.PHONY: clean
