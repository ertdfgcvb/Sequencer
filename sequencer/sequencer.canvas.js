/**
Sequencer - A fast(?) fullscreen image-sequence player.
(c) 2012
See README.txt or visit github (link below) for details

Author: 
Andreas Gysin
ertdfgcvb.com
@andreasgysin
    
Project page:
http://ertdfgcvb.com/sequencer
http://github.com/ertdfgcvb/Sequencer  
*/

var Sequencer = (function(){	
	var current = -1;
	var imgList = [];
	var progress;
	var playInterval;
	var playDir = 1;

	// configuration defaults
	var config = {
		folder 				: "",			// folder containing the image sequence
		baseName			: "",			// a basename of the files, for example "DSC00"
		from 				: 1,			// first image of the sequence, will be combined with the basename
		to 					: 10,			// last image of the sequence
		ext 				: "jpg",		// file extention, case sensitive
		step 				: 1,			// increment: to load only even images use 2, etc
		bgColor				: "#FFFFFF",	// page background color
		scaleMode 			: "cover", 		// as in CSS3, can be: auto, cover, contain
		mouseDirection		: "x", 			// mouse direction, can be x, -x, y, -y, applies only if playMode == "mouse"
		playMode			: "mouse",		// can be: mouse, loop, pong or none (in this case a nextImage() call has to be made somewhere
		playInterval		: 20,			// interval in milliseconds beteen each frame, applies only if playMode != "mouse"	
		progressDiam		: "110",		// progress diameter
		progressFontFamily	: "Helvetica, Arial, sans-serif",
		progressFontSize	: "0.7em",
		progressBgColor		: "#000000",
		progressFgColor		: "#FFFFFF",
		progressMode		: "circle",		// can be: circle, bar, none
		progressHeight		: "5px",		// if progressMode == "bar"
		progressShowImages	: true,			// display images while loaded		
	}
		
	function init(customConfig){
		// config override
		for(prop in customConfig){ 
        	config[prop] = customConfig[prop];
        }
		window.onload = function(){
        	configureBody();
        	buildProgress(config.progressMode);	
			for (var i=0; i<10; i++) loadNext();
		}
		window.addEventListener( 'resize', onWindowResize, false );
	}
	
	function setPlayMode(mode){
		stop();
		config.playMode = mode;
	}
	
	function play(){
		stop();
		if (config.playMode == "mouse"){
			document.addEventListener('mousemove', onMouseMove, false);
			document.ontouchmove = function(e){
				onMouseMove(e.touches[0]);
				return false;
			}
		} else if (config.playMode == "loop" || config.playMode == "pong") {
			playInterval = setInterval(nextImage, config.playInterval);
		}
	}	

	function stop(){
		document.removeEventListener('mousemove', onMouseMove);
		if (playInterval) {
			clearInterval(playInterval);
			playInterval == null;
		}
	}
			
	function nextImage(mode){
		if (!mode) mode = config.playMode;
		if(mode == "pong") {
			current += playDir;
			if (current >= imgList.length-1) { //current could ev. change by other playmodes, so extra-checks are necessary
				playDir = -1;
				current = imgList.length-1;
			} else if (current <= 0){
				playDir = 1;
				current = 0;
			}
			showImage(current);
		} else {
			showImage(++current % imgList.length); //loop
		}
	}

	
	function onMouseMove(e){
		var t = imgList.length;
		var m, w;
		if (config.mouseDirection == "x") {
			w = window.innerWidth;
			m = e.pageX;
		} else if (config.mouseDirection == "-x") {
			w = window.innerWidth;
			m = w - e.pageX - 1;
		} else if (config.mouseDirection == "y") {
			w = window.innerHeight;
			m = e.pageY;
		} else if (config.mouseDirection == "-y") {
			w = window.innerHeight;
			m = w - e.pageY - 1;
		}

		var id = Math.min(t, Math.max(0, Math.floor(m / w * t)));
		if (id != current){
			showImage(id);
			current = id;
		}
	}

	function buildProgress(mode){
		if (mode == "circle"){
			progress = document.createElement('div');
			progress.id = "progress";
			progress.style.width = config.progressDiam + "px";
	    	progress.style.height = config.progressDiam + "px";
	    	progress.style.lineHeight = config.progressDiam + "px";
	    	progress.style.textAlign = "center";
	    	progress.style.color = config.progressFgColor;
	    	progress.style.backgroundColor = config.progressBgColor;
	    	progress.style.borderRadius = config.progressDiam / 2 + "px";
	    	progress.style.position = "fixed";
	    	progress.style.left = "50%";
	    	progress.style.top = "50%";
	    	progress.style.marginTop = - config.progressDiam / 2 + "px";
	    	progress.style.marginLeft = - config.progressDiam / 2 + "px";
	    	progress.style.fontFamily = config.progressFontFamily;
	    	progress.style.fontSize = config.progressFontSize;
	    	progress.style.zIndex = 1000;
	    	progress.update = function(num){
	    		var t = Math.floor((config.to - config.from + 1) / config.step);
				progress.innerHTML = (num + 1) + "/" + t;
	    	}
			document.body.appendChild(progress);
		} else if (mode == "bar") {
			progress = document.createElement('div');
			progress.id = "progress";
			progress.style.width = "0%";
	    	progress.style.height = config.progressHeight + "px";
	    	progress.style.backgroundColor = config.progressBgColor;
	    	progress.style.position = "fixed";
	    	progress.style.left = "0";
			progress.style.height = config.progressHeight;
	    	progress.style.bottom = "0";
	    	progress.style.zIndex = 1000;
	    	progress.update = function(num){
	    		var p = Math.round(num / (config.to - config.from) * 100);
				progress.style.width = p + "%";
	    	}
			document.body.appendChild(progress);
		}
	}
	
	//
	function onWindowResize(){
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;	
		showImage(current);	
	}
	
	function configureBody(){
		canvas = document.createElement('canvas');
		canvas.height = window.innerHeight;
		canvas.width = window.innerWidth;
		context = canvas.getContext('2d');
		document.body.appendChild(canvas);
				
		document.body.style.margin ="0";
		document.body.style.padding ="0";
		document.body.style.height = "100%";
		document.body.style.overflow = "hidden"; //canvas is a few pixels taller than innerHeight… (?)			
		document.body.style.backgroundColor = config.bgColor;
	}
	
	function loadNext(){
		current++;
		var num = config.from + current * config.step;
		if (num <= config.to) {		 
			var img = new Image();
			img.listId = current;
			img.src = config.folder + "/" + config.baseName + num + "." + config.ext;
			img.onload = function(){
				imgList[this.listId] = this;				
				if (config.progressShowImages) showImage(current);
				if (progress) progress.update(current);
				loadNext(); 	
			}		
		} else if (num == config.to + 1){ //last call...
			current = imgList.length - 1;
			if (progress) {
				document.body.removeChild(progress);
				progress = null;
			}
			setPlayMode(config.playMode);
			play();
		}	
	}
	
	function showImage(id){
		if (id >= 0 && id < imgList.length){
			var img = imgList[id];
			var ca = canvas.width / canvas.height;
			var ia = img.width / img.height;
			var iw, ih;
			
			if (config.scaleMode == "cover") {
			    if (ca > ia) {
			    	iw = canvas.width;
			    	ih = iw / ia;
			    } else {
			    	ih = canvas.height;
			    	iw = ih * ia;
			    }
			} else if (config.scaleMode == "contain") {
			    if (ca < ia) {
			    	iw = canvas.width;
			    	ih = iw / ia;
			    } else {
			    	ih = canvas.height;
			    	iw = ih * ia;
			    }
			} else if (config.scaleMode == "auto") {
			   	iw = img.width;
			   	ih = img.height;
			}
				
			var ox = canvas.width/2 - iw/2;
			var oy = canvas.height/2 - ih/2;			
			context.drawImage(img, 0, 0, img.width, img.height, Math.round(ox), Math.round(oy), Math.round(iw), Math.round(ih));
		}
	}
	
	return {init : init, nextImage : nextImage, setPlayMode : setPlayMode, play : play, stop : stop};
})();
