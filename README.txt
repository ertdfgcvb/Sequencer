-------------------------------------------------------------------------------
Sequencer - A fast(?) fullscreen image-sequence player.

To keep the library light and simple there are actually 5 different versions 
of it plus a benchmark test. They were built to test display-speed and will eventually
be dropped in future versions in favor of a single one.

1.	sequencer.bg.js
	Displays the images as the body background. The images are stretched with
	the CSS "auto", "cover" and "contain" modes.
	I didn't find a way to pass an image object to the CSS background so this 
	version relies heavily on the browser's cache.
2.	sequencer.div.js
	Displays the images as a stack of divs hiding and showing the corresponding 
	layer. This version relies a bit on the browser cache, but once loaded 
	the images are stored as a div background.
3.	sequencer.canvas.js
	Displays the images on a canvas object the size of the browser window. 
	The images are preloaded and then stretched and cropped on the canvas.
4.	sequencer.canvas2.js
	Displays the images on a canvas object the size of the first loaded image. 
	The canvas is then stretched and positioned correctly via css.	
5.	sequencer.canvas.async.js
	Loads the sequence asynchronously. 
	It's a messy work in progress right now, but loading times are 4-5 times faster.
	This will eventually become the final version.
B.	sequencer.benchmark.js
	Image sequencer benchmark
	Not sure if this is reliable: it looks as though some browsers skip frames 
	to keep up with the interval event.

-------------------------------------------------------------------------------
How to use:
	To init the sequencer with a an imageset of files 
	from "pics/pig/DSC04701.JPG" to "pics/pig/DSC04775.JPG":
	
	var config = {from:4701, to:4775, folder:"pics/pig", baseName:"DSC0", ext:"JPG"};
	Sequencer.init(config); 
	Check the source code for a description of all the options and the default values.
	
	To change playMode:
	Sequencer.setplayMode("mouse");
	Sequencer.setplayMode("loop");	
	Sequencer.setplayMode("pong");
	then call
	Sequencer.play();
	otherwise it is possible to call frame advancement manually with
	Sequencer.nextImage();	

-------------------------------------------------------------------------------
Benchmark:
	Just include the sequencer.benchmark.js file to test your sequence.

-------------------------------------------------------------------------------
Author: 
	Andreas Gysin
	@andreasgysin
	
Project page:
	http://ertdfgcvb.com/sequencer
	http://github.com/ertdfgcvb/Sequencer	
	
-------------------------------------------------------------------------------
Copyright (c) 2011-2012 Andreas Gysin

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published 
by the Free Software Foundation, either version 3 of the License, 
or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty 
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.
If not, see <http://www.gnu.org/licenses/>.
