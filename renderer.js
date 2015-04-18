module.exports = Renderer

var EE = require('events').EventEmitter
var inherits = require('inherits')
var Entities = require('./entities')
var TileMap = require('./tilemap')

// var ndarray = require('ndarray')
// var tileMap = require('isabella-texture-pack')
// var createTexture = require('gl-texture2d')
// var createTileMap = require('gl-basic-tile-map')
// var glm = require('gl-matrix')
// var mat3 = glm.mat3

function Renderer(opts) {
  if (!(this instanceof Renderer)) return new Renderer()
  EE.call(this)
  var self = this
  self.client = opts.client
  self.onAnimate = function(){}
  self.el = opts.el || document.createElement('canvas')
  self.gl = self.el.getContext('webgl') || self.el.getContext('experimental-webgl')
  self.viewport = {size:[0,0],offset:[94,142],scale:0.81}
  // self.entities = new Entities({renderer:self})
  // self.tilemap = new TileMap({renderer:self})
  self.mouse = {lastX:0,lastY:0,isDownLeft:false,isDownRight:false}
  self._texturesToLoad = 0
}
inherits(Renderer,EE)

var proto = Renderer.prototype

proto.resize = function(immediate) {
  var w = this.el.clientWidth
  var h = this.el.clientHeight
  w = w%2 ? w-1 : w // prevent rounding-precision-errors
  h = h%2 ? h-1 : h
  this.el.width = w
  this.el.height = h
  this.gl.viewport(0, 0, w, h)
  // this.entities.setView(w,h)
  this.viewport.size[0] = w
  this.viewport.size[1] = h
}

proto.scale = function(d,x,y) {
  var s = this.viewport.scale
  var z = Math.round((Math.pow(s*.05,2)+(s/10))*100)/100 + .001
  if (d<0 && this.viewport.scale <= 100) {
    this.viewport.scale += z
    this.viewport.offset[0] -= x*z
    this.viewport.offset[1] -= y*z
  }
  else if (d>0 && this.viewport.scale > 0.1) {
    this.viewport.scale -= z
    this.viewport.offset[0] += x*z
    this.viewport.offset[1] += y*z
  }

  //console.log(this.viewport.scale)
  this.viewport.scale = parseFloat(this.viewport.scale.toFixed(2))
  // console.log(this.viewport.scale)
}

proto.pan = function(x, y) {
  this.viewport.offset[0] -= x * this.viewport.scale
  this.viewport.offset[1] -= y * this.viewport.scale
}

proto.setOnAnimate = function(fn) {this.onAnimate = fn}

proto.pause = function() {}

proto.animate = function() {
  var self = this
  // TODO: this is not pretty
  if (self._texturesToLoad>0)
    return requestAnimationFrame(function(){self.animate()})
  self.onAnimate()
  self.client.tilemap.render()
  self.client.entities.render()
  requestAnimationFrame(function(){self.animate()})
}

//------------------ utils

proto.createShader = function(gl, vs, fs, attributes, uniforms) {
  var prog = gl.createProgram()
  var svs = gl.createShader(gl.VERTEX_SHADER)
  var sfs = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(svs, vs)
  gl.compileShader(svs)
  gl.shaderSource(sfs, fs)
  gl.compileShader(sfs)
  gl.attachShader(prog, svs)
  gl.attachShader(prog, sfs)
  gl.linkProgram(prog)
  return prog
}

proto.createTexture = function(gl, url, cb) {
  var self = this
  var img = new Image()
  var tex = gl.createTexture()
  self._texturesToLoad++
  tex.image = img
  img.src = url
  img.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      console.log('tex not power of 2',img.src,img.width,img.height)
    }
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    console.log('loaded',img.src)
    self._texturesToLoad--
    cb && cb(null, tex)
  }
  return tex
}

function isPowerOf2(v) { return (v & (v-1)) == 0 }

