# Merge and compress the runner files
#
# Dependencies:
#
# 1.
# Terser:
# npm install terser -g
# in case of privilege issues:
# sudo chown -R $USER ~/.npm
# sudo chown -R $USER /usr/local/lib/node_modules
#
# 2.
# Rollup:
# npm install rollup -g

build:
	rollup -i src/sequencer.js --format es --name sequencer -o dist/sequencer.js
	terser --compress --mangle --toplevel --timings --ecma 2015 -- dist/sequencer.js > dist/sequencer.min.js
