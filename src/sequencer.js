/**
 * Sequencer - A fast(?) fullscreen image-sequence player.
 * See README or visit github (link below) for details.
 * @copyright 2012-21
 * @version 3.0.1
 * @author Andreas Gysin
 *         https://ertdfgcvb.xyz
 *         https://github.com/ertdfgcvb/Sequencer
 */

const instances = [];

import context from "./context.js"
import {parse} from "./parser.js"

function make(cfg) {
	const s = new S(cfg)
	if (s !== false) instances.push(s)
	return s
}

class S{

	constructor(opts) {
		const defaults = {
			canvas           : null,
			list             : [],
			from             : '',
			to               : '',
			step             : 1,       // increment: to load only even images use 2, etc
			scaleMode        : 'cover', // as in CSS3, can be: auto, cover, contain
			direction        : 'x',     // mouse direction, can be x, -x, y, -y, applies only if playMode is 'drag' or 'hover'
			playMode         : 'drag',  // none, drag, hover, auto    TODO: remove auto, add loop, pong, once
			loop             : 'loop',  // loop, pong or none         TODO: remove
			interval         : 0,       // interval in milliseconds between each frame, applies only if playMode is 'auto'
			autoLoad         : 'all',   // all, first, none: triggers the loading of the queue immediatly, can be disabled to be triggered in a different moment
			fitFirstImage    : false,   // resizes the canvas to the size of the first loaded image in the sequence
			showLoadedImages : false,   // don't display images while loading
			dragAmount       : 10,
			hiDPI            : true,    // use hiDPI canvas
			smoothing        : true,    // sets the context imageSmoothingEnabled flag
		}

		this.config = {...defaults, ...opts}

		if (this.config.from == '' && this.config.to == '' && this.config.list.length == 0) {
			console.error("Missing filenames.")
			return false
		}

		// create a default canvas in case none is added:
		if (this.config.canvas === null) {
			const c = document.createElement('canvas')
			document.body.appendChild(c)
			this.config.canvas = c
			this.config.fitFirstImage = true
		}

		this.pointer = {x:0, y:0, down:false}
		this.current = -1
		this.images = []
		this.directionSign = /-/.test(this.config.direction) ? -1 : 1
		this.lastLoaded = -1
		this.pongSign = 1
		this.ctx = this.config.canvas.getContext('2d')
		// Take the provided list or build one with 'from' and 'to'
		this.list = this.config.list.length > 0 ?
					this.config.list :
					parse(this.config.from, this.config.to, this.config.step)

		this.size(this.ctx.canvas.width, this.ctx.canvas.height)

		if (this.config.autoLoad == 'first') {
			new Preloader(this.images, [this.list.shift()], imageLoad.bind(null, this))
		} else if (this.config.autoLoad == 'all') {
			this.load()
		}
	}

	load() {
		this.load = function() {
			console.log("load() can be called only once.")
		}

		new Preloader(this.images, this.list, imageLoad.bind(null, this), queueComplete.bind(null, this))
	}

	run() {
		const _move = context.hasTouch ? 'touchmove'  : 'mousemove'
		const _down = context.hasTouch ? 'touchstart' : 'mousedown'
		const _up   = context.hasTouch ? 'touchend'   : 'mouseup'

		if (this.config.playMode === 'hover') {
			this.ctx.canvas.addEventListener(_move, absoluteMove.bind(null, this))
		} else if (this.config.playMode === 'drag') {
			this.ctx.canvas.addEventListener(_move, relativeMove.bind(null, this))
			this.ctx.canvas.addEventListener(_down, pointerDown.bind(null, this))
			document.addEventListener(_up, pointerUp.bind(null, this))
		} else if (this.config.playMode === 'auto') {
			let pt = 0
			const loop = t => {
				const dt = t - pt
				if (dt >= this.config.interval) {
					this.nextImage()
					pt = Math.max(t, t - (dt - this.config.interval))
				}
				requestAnimationFrame(loop)
			}
			requestAnimationFrame(loop)
		}
	}

	nextImage(loop) {
		if (!loop) loop = this.config.loop
		if(loop === 'pong') {
			this.current += this.pongSign
			if (this.current >= this.images.length-1) { //this.current could ev. change by other playmodes, so extra-checks are necessary
				this.pongSign = -1
				this.current = this.images.length-1
			} else if (this.current <= 0) {
				this.pongSign = 1
				this.current = 0
			}
			this.drawImage(this.current)
		} else {
			this.drawImage(++this.current % this.images.length) //loop
		}
	}

	drawImage(id) {
		if (id === undefined) id = this.current
		if (id < 0 || id >= this.images.length) return
		const r = this.config.hiDPI ? window.devicePixelRatio : 1
		const cw = this.ctx.canvas.width / r
		const ch = this.ctx.canvas.height / r
		const ca = cw / ch
		const img = this.images[id]
		const ia = img.width / img.height
		let iw, ih

		if (this.config.scaleMode == 'cover') {
			if (ca > ia) {
				iw = cw
				ih = iw / ia
			} else {
				ih = ch
				iw = ih * ia
			}
		} else if (this.config.scaleMode == 'contain') {
			if (ca < ia) {
				iw = cw
				ih = iw / ia
			} else {
				ih = ch
				iw = ih * ia
			}
		} else { //this.config.scaleMode == 'auto'
			iw = img.width
			ih = img.height
		}

		const ox = (cw/2 - iw/2)
		const oy = (ch/2 - ih/2)

		this.ctx.save()
		this.ctx.scale(r, r)
		this.ctx.clearRect(0, 0, cw, ch)                       // Clear background to support images with alpha
		this.ctx.imageSmoothingEnabled = this.config.smoothing // Needs to be set before draw?
		this.ctx.drawImage(img, 0, 0, img.width, img.height, Math.floor(ox), Math.floor(oy), Math.floor(iw), Math.floor(ih))
		this.ctx.restore()
	}

	size(w, h) {
		const r = this.config.hiDPI ? window.devicePixelRatio : 1
		const c = this.ctx.canvas
		c.width = w * r
		c.height = h * r
		c.style.width = w + 'px'
		c.style.height = h + 'px'
		this.drawImage()
	}
}

// -- Callback functions for the sequencer object -----------------------------------

function imageLoad(self, e) {
	if (e.id > self.lastLoaded && self.config.showLoadedImages) { // to not have a back and forward hickup… but some images will be skipped
		self.drawImage(e.id)
		self.lastLoaded = e.id
	}

	if (typeof self.config.imageLoad === 'function' ) {
		e.sequencer = self
		self.config.imageLoad(e)
	}

	if (typeof self.imageLoad === 'function' ) {
		e.sequencer = self
		self.imageLoad(e)
	}

	// The canvas size is determined and set from the first image loaded:
	if (e.id === 0) {
		if(self.config.fitFirstImage) {
			self.size(e.img.width, e.img.height)
			self.config.fitFirstImage = false
		}
		self.drawImage(0)
		self.current = 0 // TODO: could be better
	}
}

function queueComplete(self, e) {
	if (typeof self.config.queueComplete === 'function' ) {
		e.sequencer = self
		self.config.queueComplete(e)
	}

	if (typeof self.queueComplete === 'function' ) {
		self.queueComplete(e)
	}

	self.run()
	if (!self.config.showLoadedImages && self.config.playMode !== 'none') {
		self.drawImage(0)
	}
}

function pointerDown(self, e) {
	let ox, oy
	if (e.touches) {
		ox = e.touches[0].pageX - e.touches[0].target.offsetLeft
		oy = e.touches[0].pageY - e.touches[0].target.offsetTop
	} else {
		ox = e.offsetX
		oy = e.offsetY
	}

	self.pointer = {
		x    : ox,
		y    : oy,
		down : true,
		currentId : self.current // TODO: this is a hack and needs a better solution...
	}
}

function pointerUp(self, e) {
	self.pointer.down = false
}

function relativeMove(self, e) {
	if (!self.pointer.down) return

	const t = self.images.length

	let ox, oy
	if (e.touches) {
		ox = e.touches[0].pageX - e.touches[0].target.offsetLeft
		oy = e.touches[0].pageY - e.touches[0].target.offsetTop
	} else {
		ox = e.offsetX
		oy = e.offsetY
	}

	let dist = 0
	if (/x/.test(self.config.direction)) {
		dist = (ox - self.pointer.x) * self.directionSign
	} else if (/y/.test(self.config.direction)) {
		dist = (oy - self.pointer.y) * self.directionSign
	}

	let id = self.pointer.currentId + Math.floor(dist / self.config.dragAmount)
	if (id < 0) id = t - (-id % t)
	else if (id > t) id = id % t

	if (id != self.current) {
		self.drawImage(id)
		self.current = id
	}

	// remove bounce on mobile
	e.preventDefault()
}

function constrain(v, a, b){
	if (v < a) return a
	if (v > b) return b
	return v
}

function absoluteMove(self, e) {

	const t = self.images.length
	const r = self.config.hiDPI ? window.devicePixelRatio : 1

	let ox, oy
	if (e.touches) {
		ox = e.touches[0].pageX - e.touches[0].target.offsetLeft
		oy = e.touches[0].pageY - e.touches[0].target.offsetTop
	} else {
		ox = e.offsetX
		oy = e.offsetY
	}

	let m, w
	if (self.config.direction == 'x') {
		w = self.ctx.canvas.width / r
		m = ox
	} else if (self.config.direction == '-x') {
		w = self.ctx.canvas.width / r
		m = w - ox - 1
	} else if (self.config.direction == 'y') {
		w = self.ctx.canvas.height / r
		m = oy
	} else if (self.config.direction == '-y') {
		w = self.ctx.canvas.height / r
		m = w - oy - 1
	}

	const id = constrain(Math.floor(m / w * t), 0, t - 1)
	if (id != self.current) {
		self.drawImage(id)
		self.current = id
	}

	// remove bounce on mobile
	e.preventDefault()
}

// TODO: break out in own module
function Preloader(arrayToPopulate, fileList, imageLoadCallback, queueCompleteCallbak) {
	const concurrentLoads = Math.min(fileList.length, 4)
	let current = arrayToPopulate.length - 1 // id: order in array
	let count = arrayToPopulate.length       // count: count of image loaded... can be out of sync of id.
	for (let i=0; i<concurrentLoads; i++) loadNext()

	function loadNext() {
		if (current >= fileList.length -1) return
		current++

		//console.log('Loading ' + fileList[current] + '...')
		const img = new Image()
		img.src = fileList[current]
		;(function(id) {    // TODO: fix
			img.onload = e => {
				if (typeof imageLoadCallback === 'function') imageLoadCallback({
					id    : id,
					img   : img,
					count : ++count,
					total : fileList.length
				})
				if (count < fileList.length ) {
					loadNext()
				}
				if (count == fileList.length) {
					if (typeof queueCompleteCallbak === 'function') queueCompleteCallbak({
						total : fileList.length
					})
				}
			}
			img.onerror = e => {
				console.error('Error with: ' + fileList[id])
			}
		})(current)
		arrayToPopulate.push(img)
	}
}

export default {
	make,
	instances
}
