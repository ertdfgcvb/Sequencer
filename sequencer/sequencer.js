// Sequencer - A fast(?) fullscreen image-sequence player.
// (c) 2012-17
// See README.txt or visit github (link below) for details
//
// Author:
//      Andreas Gysin
//      ertdfgcvb.com
//      @andreasgysin
//
// Project page:
//      http://ertdfgcvb.com/sequencer
//      http://github.com/ertdfgcvb/Sequencer

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
          return factory(window, document);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(window, document);
    } else {
        // Browser globals (root is window)
        root.Sequencer = factory(root, document);
  }
}(this, function (window, document) {
    'use strict';

    var instances = [];

    var hasTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

    function make(cfg){
        var s = new S(cfg);
        if (s !== false) instances.push(s);
        return s;
    }

    function S(cfg){
        // configuration defaults:
        this.config = {
            canvas           : null,
            from             : '',
            to               : '',
            step             : 1,            // increment: to load only even images use 2, etc
            scaleMode        : 'cover',      // as in CSS3, can be: auto, cover, contain
            direction        : 'x',          // mouse direction, can be x, -x, y, -y, applies only if playMode is 'drag' or 'hover'
            playMode         : 'drag',       // none, drag, hover, auto
            loop             : 'loop',       // loop, pong or none
            interval         : 0,            // interval in milliseconds between each frame, applies only if playMode is 'auto'
            autoLoad         : 'all',        // all, first, none: triggers the loading of the queue immediatly, can be disabled to be triggered in a different moment
            fitFirstImage    : false,        // resizes the canvas to the size of the first loaded image in the sequence
            showLoadedImages : false,        // don't display images while loading
            dragAmount       : 10,
            retina           : true,
        };

        for (var c in cfg) this.config[c] = cfg[c];

        if (this.config.from == '' && this.config.to == '') {
            console.error("Missing filenames.")
            return false;
        }

        // create a default canvas in case none is added:
        if (!this.config.canvas) {
            var c = document.createElement('canvas');
            document.body.appendChild(c);
            this.config.canvas = c;
            this.config.fitFirstImage = true;
        }

        this.pointer = {x:0, y:0, down:false};
        this.current = -1;
        this.images = [];
        this.directionSign = /-/.test(this.config.direction) ? -1 : 1;
        this.lastLoaded = -1;
        this.pongSign = 1;
        this.ctx = this.config.canvas.getContext('2d');

        var s = parseSequence(this.config.from, this.config.to);
        this.fileList = buildFileList(s, this.config.step);

        this.size(this.ctx.canvas.width, this.ctx.canvas.height);

        if (this.config.autoLoad == 'first') {
            new Preloader(this.images, [this.fileList.shift()], imageLoad.bind(null, this));
        } else if (this.config.autoLoad == 'all') {
            this.load();
        }
    }

    S.prototype = {
        load : function(){
            this.load = function(){
                console.log("load() can be called only once.");
            };
            new Preloader(this.images, this.fileList, imageLoad.bind(null, this), queueComplete.bind(null, this));
        },
        run : function(){

            var _move = hasTouch ? 'touchmove'  : 'mousemove';
            var _down = hasTouch ? 'touchstart' : 'mousedown';
            var _up   = hasTouch ? 'touchend'   : 'mouseup';

            if (this.config.playMode === 'hover'){
                this.ctx.canvas.addEventListener(_move, absoluteMove.bind(null, this));
            } else if (this.config.playMode === 'drag') {
                this.ctx.canvas.addEventListener(_move, relativeMove.bind(null, this));
                this.ctx.canvas.addEventListener(_down, pointerDown.bind(null, this));
                document.addEventListener(_up, pointerUp.bind(null, this));
            } else if (this.config.playMode === 'auto') {
                var self = this;
                var pt = 0;
                var loop = function(t){
                    var dt = t - pt;
                    if (dt >= self.config.interval) {
                        self.nextImage();
                        pt = Math.max(t, t - (dt - self.config.interval));
                    }
                    requestAnimationFrame(loop);
                };
                requestAnimationFrame(loop);
            }
        },

        nextImage : function(loop){
            if (!loop) loop = this.config.loop;
            if(loop === 'pong') {
                this.current += this.pongSign;
                if (this.current >= this.images.length-1) { //this.current could ev. change by other playmodes, so extra-checks are necessary
                    this.pongSign = -1;
                    this.current = this.images.length-1;
                } else if (this.current <= 0){
                    this.pongSign = 1;
                    this.current = 0;
                }
                this.drawImage(this.current);
            } else {
                this.drawImage(++this.current % this.images.length); //loop
            }
        },

        drawImage : function(id){
            if (id === undefined) id = this.current;
            if (id < 0 || id >= this.images.length) return;
            var img = this.images[id];
            var cw = this.ctx.canvas.width;
            var ch = this.ctx.canvas.height;
            var ca = cw / ch;
            var ia = img.width / img.height;
            var iw, ih;

            if (this.config.scaleMode == 'cover') {
                if (ca > ia) {
                    iw = cw;
                    ih = iw / ia;
                } else {
                    ih = ch;
                    iw = ih * ia;
                }
            } else if (this.config.scaleMode == 'contain') {
                if (ca < ia) {
                    iw = cw;
                    ih = iw / ia;
                } else {
                    ih = ch;
                    iw = ih * ia;
                }
            } else { //this.config.scaleMode == 'auto'
                iw = img.width;
                ih = img.height;
            }

            var ox = cw/2 - iw/2;
            var oy = ch/2 - ih/2;
            this.ctx.clearRect(0, 0, cw, ch);  // support for images with alpha
            this.ctx.drawImage(img, 0, 0, img.width, img.height, ~~ox, ~~oy, ~~iw, ~~ih);
        },

        size : function(w, h){
            var r = this.config.retina ? window.devicePixelRatio : 1;
            var c = this.ctx.canvas;
            c.width = w * r;
            c.height = h * r;
            c.style.width = w + 'px';
            c.style.height = h + 'px';
            //this.ctx.scale(r, r);
            this.drawImage();
        }
    };

    // -- Callback functions for the sequencer object -----------------------------------

    function imageLoad(self, e){
        if (e.id > self.lastLoaded && self.config.showLoadedImages){ // to not have a back and forward hickup… but some images will be skipped
            self.drawImage(e.id);
            self.lastLoaded = e.id;
        }

        if (typeof self.config.imageLoad === 'function' ) {
            e.sequencer = self;
            self.config.imageLoad(e);
        }

        if (typeof self.imageLoad === 'function' ) {
            e.sequencer = self;
            self.imageLoad(e);
        }

        // The canvas size is determined and set from the first image loaded:
        if (e.id === 0){
            if(self.config.fitFirstImage){
                self.size(e.img.width, e.img.height);
                self.config.fitFirstImage = false;
            }
            self.drawImage(0);
            self.current = 0; // TODO: could be better
        }
    }

    function queueComplete(self, e){
        if (typeof self.config.queueComplete === 'function' ) {
            e.sequencer = self;
            self.config.queueComplete(e);
        }

        if (typeof self.queueComplete === 'function' ) {
            self.queueComplete(e);
        }

        self.run();
        if (!self.config.showLoadedImages && self.config.playMode !== 'none') {
            self.drawImage(0);
        }
    }

    function pointerDown(self, e){
        var ox = e.offsetX || e.touches[0].pageX - e.touches[0].target.offsetLeft;
        var oy = e.offsetY || e.touches[0].pageY - e.touches[0].target.offsetTop;

        self.pointer = {
            x    : ox,
            y    : oy,
            down : true,
            currentId : self.current // TODO: this is a hack and needs a better solution...
        };
    }

    function pointerUp(self, e){
        self.pointer.down = false;
    }

    function relativeMove(self, e){
        if (!self.pointer.down) return;

        var t =  self.images.length;
        var dist = 0;

        var ox = e.offsetX || e.touches[0].pageX - e.touches[0].target.offsetLeft;
        var oy = e.offsetY || e.touches[0].pageY - e.touches[0].target.offsetTop;

        if (/x/.test(self.config.direction)) {
            dist = (ox - self.pointer.x) * self.directionSign;
        } else if (/y/.test(self.config.direction)) {
            dist = (oy - self.pointer.y) * self.directionSign;
        }
        //var id = constrain(self.pointer.currentId + Math.floor(dist / self.config.dragAmount), 0, t);
        var id = self.pointer.currentId + Math.floor(dist / self.config.dragAmount);
        if (id < 0) id = t - (-id % t);
        else if (id > t) id = id % t;

        if (id != self.current){
            self.drawImage(id);
            self.current = id;
        }
    }

    function absoluteMove(self, e){

        var t = self.images.length;
        var m, w;
        var r = self.config.retina ? window.devicePixelRatio : 1;

        var ox = e.offsetX || e.touches[0].pageX - e.touches[0].target.offsetLeft;
        var oy = e.offsetY || e.touches[0].pageY - e.touches[0].target.offsetTop;

        if (self.config.direction == 'x') {
            w = self.ctx.canvas.width / r;
            m = ox;
        } else if (self.config.direction == '-x') {
            w = self.ctx.canvas.width / r;
            m = w - ox - 1;
        } else if (self.config.direction == 'y') {
            w = self.ctx.canvas.height / r;
            m = oy;
        } else if (self.config.direction == '-y') {
            w = self.ctx.canvas.height / r;
            m = w - oy - 1;
        }
        var id = constrain(Math.floor(m / w * t), 0, t - 1);
        if (id != self.current){
            self.drawImage(id);
            self.current = id;
        }
    }

    // -- Helpers -----------------------------------------------------------------------

    // costrain
    function constrain(v, a, b){
        if (v < a) return a;
        if (v > b) return b;
        return v;
    }

    // pad left
    function padL(str, char, len) {
        while(str.length < len) str = char + str;
        return str;
    }

    // Parses sequences described like this
    // from: DSC00998.jpg
    // to:   DSC01112.jpg
    // by extracting the base name, the number, the extension, etc.
    // returns an object with the necessary fields
    // TODO: could be more efficient...

    function parseSequence(from, to){
        var l = Math.min(from.length, to.length);
        var i = Math.max(0, from.lastIndexOf('/'));
        while (from.charAt(i) == to.charAt(i) && !/[1-9]/.test(from.charAt(i)) && i < l) i++;
        var a  = from.slice(i, from.lastIndexOf('.'));      // from, may contain leading zeros
        var b  = to.slice(i, to.lastIndexOf('.'));          // to
        var ia = parseInt(a);
        var ib = parseInt(b);
        return {
            from   : ia,
            to     : ib,
            base   : from.substr(0, i),
            ext    : from.substr(from.lastIndexOf('.')),
            zeroes : (a.length == b.length) && (Math.floor(log10(ia)) < Math.floor(log10(ib))) ? a.length : 0,
            length : Math.abs(ib - ia) + 1
        };

        function log10(x) {
            return Math.log(x) / Math.LN10;
        }
    }

    // Builds a list of files from a 'sequence object' return from parseSequence()
    // NOTE: could be better... (is it even necessary?)
    function buildFileList(sequenceObj, step){
        step = step || 1;
        var q = [];
        var dir = sequenceObj.from > sequenceObj.to ? -1 : 1;
        for (var i=0; i<sequenceObj.length; i += step){
            var num = (sequenceObj.from + i * dir).toString();
            num = padL(num, '0', sequenceObj.zeroes);
            //while (num.length < sequenceObj.zeroes) num = '0' + num;
            q.push(sequenceObj.base + num + sequenceObj.ext);
        }
        return q;
    }

    // -- Preloader ---------------------------------------------------------------------

    function Preloader(arrayToPopulate, fileList, imageLoadCallback, queueCompleteCallbak){
        var current = arrayToPopulate.length - 1; // id: order in array
        var count = arrayToPopulate.length;       // count: count of image loaded... can be out of sync of id.
        var concurrentLoads = Math.min(fileList.length, 4);
        for (var i=0; i<concurrentLoads; i++) loadNext();

        function loadNext(){
            if (current >= fileList.length -1) return;
            current++;

            //console.log('Loading ' + fileList[current] + '...');
            var img = new Image();
            img.src = fileList[current];
            (function(id) {
                img.onload = function(e){
                    if (typeof imageLoadCallback === 'function') imageLoadCallback({
                        id    : id,
                        img   : img,
                        count : ++count,
                        total : fileList.length
                    });
                    if (count < fileList.length ){
                        loadNext();
                    }
                    if (count == fileList.length) {
                        if (typeof queueCompleteCallbak === 'function') queueCompleteCallbak({
                            total : fileList.length
                        });
                    }
                };
                img.onerror = function(e){
                    console.error('Error with: ' + fileList[id]);
                };
            })(current);
            arrayToPopulate.push(img);
        }
    }

    return {
        make      : make,
        instances : instances
    };
}));
