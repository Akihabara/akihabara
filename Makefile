##########################################
#   Akihabara Game Engine
#   http://akihabara.github.com
##########################################

NAME = Akihabara

# Google Closure Compiler Options
GCC_OPTION = --jscomp_off=internetExplorerChecks

# Some things must be fixed to use this flag on GCC
#--compilation_level ADVANCED_OPTIMIZATIONS

# Directories
SRCDIR = src
DOCDIR = doc

# Akihabara Files
FILES = $(SRCDIR)/akihabara.js \
	$(SRCDIR)/audio.js \
	$(SRCDIR)/debug.js \
	$(SRCDIR)/gamecycle.js \
	$(SRCDIR)/gbox.js \
	$(SRCDIR)/help.js \
	$(SRCDIR)/input.js \
	$(SRCDIR)/iphofretboard.js \
	$(SRCDIR)/iphopad.js \
	$(SRCDIR)/platformer.js \
	$(SRCDIR)/shmup.js \
	$(SRCDIR)/tools.js \
	$(SRCDIR)/topview.js \
	$(SRCDIR)/toys.js \
	$(SRCDIR)/trigo.js

prepare:
	git submodule init
	git submodule update

release: unify
	closure $(GCC_OPTION) --js=$(NAME).js --js_output_file=$(NAME).min.js

unify: clean
	cat $(FILES) >> $(NAME).js

clean:
	rm -rf Akihabara.*
	rm -rf $(DOCDIR)/*.html $(DOCDIR)/styles

doc: prepare clean
	mkdir -p $(DOCDIR)
	dependencies/jsdoc/jsdoc src
	mv out/*.html out/styles $(DOCDIR)
	rm -rf out

check:
	find src -name "*.js" -exec jshint {} \;
