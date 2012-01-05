-------------------------------------------------------------------------------
Sequencer - A fast(?) fullscreen image-sequence player.

There are actually 4 different versions of this library plus a benchmark test:
1.	BG
	Displays the images as the body background. The images can be stretched with
	the CSS "auto", "cover" and "contain" modes.
	I didn't find a way to pass an image object to the CSS background so this 
	version relies heavily on the browser's cache.
2.	DIV
	Displays the images as a stack of divs hiding and showing the corresponding 
	layer. This version relies a bit on the browser cache, but once loaded 
	the images are stored as a div background.
3.	CANVAS
	Displays the images on a canvas object the size of the browser window. 
	The images are preloaded and then stretched and cropped on the canvas.
4.	CANVAS2
	Displays the images on a canvas object the size of the first loaded image. 
	The canvas is then stretched and positioned correctly via css.	
B.	BENCHMARK
	Image sequencer benchmark
	Press 'b' to run the test. Press 'b' again to stop it.
	Not sure if this is reliable: it looks as though some browsers skip frames 
	to keep up with the interval event.

-------------------------------------------------------------------------------
How to use:
	
	To init the sequencer with a an imageset of files 
	from "pics/pig/DSC04701.JPG" to "pics/pig/DSC04775.JPG":
	
	var config = {from:4701, to: 4775, folder:"pics/pig", baseName:"DSC0", ext:"JPG"};
	Sequencer.init(config); 
	Check the source code for a description of all the options.
	
	To change playMode:
	Sequencer.setplayMode("mouse");
	Sequencer.setplayMode("loop");	
	Sequencer.setplayMode("pong");
	then call
	Sequencer.play();
	otherwise it is possible to call frame advancement manually with
	Sequencer.nextImage();	


-------------------------------------------------------------------------------
Author: 
	Andreas Gysin
	@andreasgysin
	
Project page:
	http://ertdfgcvb.com/p2/sm
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
