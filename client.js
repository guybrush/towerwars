// browserify-entry

var EE = require('events').EventEmitter
var Gui = require('dat-gui')
var Stats = require('stats')

var Renderer = require('./renderer')
var Entities = require('./entities')
var TileMap = require('./tilemap')
var Game = require('./game')

requestAnimationFrame(function(){
  // TODO: lame, but want to have it at the top :P
  // dont know which module.<blabla> to query (parent?)
  var el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.left = 0
  el.style.top = 0
  el.style.width = '100%'
  el.style.height = '100%'
  document.body.appendChild(el)
  var client = window.client = new Client({el:el})
})

function Client(opts) {
  opts = opts || {}
  var self = this
  self.el = opts.el || document.createElement('div')
  self.el.id = 'towerwarz-wrapper'
  self.renderer = new Renderer({client:this})
  self.tilemap = new TileMap({client:this})
  self.entities = new Entities({client:this})
  self.game = new Game({client:this})
  self.mouse = {lastX:0,lastY:0,isDownLeft:false,isDownRight:false}
  
  self.el.appendChild(this.renderer.el)
  self.renderer.el.style.position = 'absolute'
  self.renderer.el.style.left = 0
  self.renderer.el.style.top = 0
  self.renderer.el.style.width = '100%'
  self.renderer.el.style.height = '100%'
  self.renderer.resize()
  self.renderer.animate()
  window .addEventListener('resize',         function(e){self.onResize()})
  self.el.addEventListener('contextmenu',    function(e){e.preventDefault()})
  self.el.addEventListener('mousedown',      function(e){self.onMouseDown (e)})
  self.el.addEventListener('mouseup',        function(e){self.onMouseUp   (e)})
  self.el.addEventListener('mousemove',      function(e){self.onMouseMove (e)})
  self.el.addEventListener('mousewheel',     function(e){self.onMouseWheel(e)})
  self.el.addEventListener('DOMMouseScroll', function(e){self.onMouseWheel(e)})
  self.el.addEventListener('touchstart',     function(e){self.onTouchStart(e)})
  self.el.addEventListener('touchend',       function(e){self.onTouchEnd  (e)})
  self.el.addEventListener('touchmove',      function(e){self.onTouchMove (e)})
}

var proto = Client.prototype

proto.onResize = function() {
  this.renderer.resize()
}

proto.onMouseDown = function(e) {
  if (e.button == 0) this.mouse.isDownLeft = true
  else if (e.button == 1) this.mouse.isDownMiddle = true
  else if (e.button == 2) this.mouse.isDownRight = true
  this.mouse.lastX = e.pageX
  this.mouse.lastY = e.pageY
  e.preventDefault()
}

proto.onMouseUp = function(e) {
  if (e.button == 0) this.mouse.isDownLeft = false
  else if (e.button == 1) this.mouse.isDownMiddle = false
  else if (e.button == 2) this.mouse.isDownRight = false
}

proto.onMouseMove = function(e) {
  if (!this.mouse.isDownLeft && !this.mouse.isDownMiddle && !this.mouse.isDownRight) return
  this.renderer.pan(e.pageX-this.mouse.lastX, e.pageY-this.mouse.lastY)
  this.mouse.lastX = e.pageX
  this.mouse.lastY = e.pageY   
}

proto.onMouseWheel = function(e) {                    
  var d = e.wheelDelta || -e.detail
  this.renderer.scale(d,e.pageX,e.pageY)
  return
  var s = this.viewport.scale
  var z = Math.round((Math.pow(s*.05,2)+(s/10))*100)/100 + .001
  if (d<0 && this.viewport.scale <= 100) {
    this.viewport.scale += z
    this.viewport.offset[0] -= e.pageX*z
    this.viewport.offset[1] -= e.pageY*z
  }                                    
  else if (d>0 && this.viewport.scale > 0.1) {
    this.viewport.scale -= z
    this.viewport.offset[0] += e.pageX*z
    this.viewport.offset[1] += e.pageY*z
  }
  
  //console.log(this.viewport.scale)
  this.viewport.scale = parseFloat(this.viewport.scale.toFixed(2))
  // console.log(this.viewport.scale)
}

proto.onTouchStart = function() {}

proto.onTouchEnd = function() {}

proto.onTouchMove = function() {}

proto.zoom = function() {}

proto.setOnAnimate = function(fn) {this.onAnimate = fn}

proto.pause = function() {}

proto.animate = function() {
  var self = this
  self.onAnimate()
  self.tilemap.render()
  self.entities.render()
  requestAnimationFrame(function(){self.animate()})
}
