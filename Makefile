JS_COMPILER ?= ./node_modules/uglify-js/bin/uglifyjs
FILES = \
	src/next.js \
	src/subsequent.js \

all: \
	subsequent.js \
	subsequent.min.js

subsequent.js: ${FILES}
	@rm -f $@
	@echo ";(function(root){" > $@.tmp
	@echo "'use strict'" >> $@.tmp
	@cat $(filter %.js,$^) >> $@.tmp
	@echo "}(Function('return this')()))" >> $@.tmp
	@$(JS_COMPILER) $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

subsequent.min.js: subsequent.js
	@rm -f $@
	@$(JS_COMPILER) $< -c -m -o $@ \
		--source-map $@.map \
		&& du -h $< $@

deps:
	mkdir -p node_modules
	npm install

clean:
	rm -f subsequent*.js*
