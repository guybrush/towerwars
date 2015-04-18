module.exports = Entities

var createShader = require('gl-shader')
// var createTexture = require('gl-texture2d')

// TODO: glslify

var vs =
['attribute vec3 a_position;'
,'varying vec2 v_texCoord;'
,'uniform vec2 u_viewportOffset;'
,'uniform float u_viewportScale;'
,'void main() {'
,'  float texId = a_position.z/8.0;' // 128/24 = 5.33
,'  v_texCoord.y = floor(texId);'
,'  v_texCoord.x = fract(texId)*8.0;' // 128/16 = 8
,'  gl_Position = vec4(a_position.xy, 1, 1);'
,'  gl_PointSize = 32.0 / u_viewportScale;'
,'}'
].join('\n')

var fs =
['#ifdef GL_ES'
,'precision highp float;'
,'#endif'
,'varying vec2 v_texCoord;'
,'uniform sampler2D u_texture;'
,'void main() {'
// ,'  vec2 texDiv = vec2(16.0/128.0, 25.0/128.0);'
// ,'  vec2 texOff = vec2(v_texCoord.x*texDiv.x, v_texCoord.y*texDiv.y);'
// ,'  gl_FragColor = texture2D(u_texture, texOff+(gl_PointCoord*texDiv));'
,'  vec2 texDiv = vec2(32.0/128.0, 32.0/128.0);'
,'  vec2 texOff = vec2(v_texCoord.x*texDiv.x, v_texCoord.y*texDiv.y);'
,'  gl_FragColor = texture2D(u_texture, texOff+(gl_PointCoord*texDiv));'
,'}'
].join('\n')

function Entity() {
  this.states = {run_left: 0}
}

function Entities(opts) {
  this.client = opts.client
  this.renderer = this.client.renderer
  this.gl = this.renderer.gl
  this.numEntities = opts.numEntities || 100
  this.positionArray = new Float32Array(this.numEntities  * 3)
  var j = 0
  for (var i=0;i<this.numEntities;i++) {
    this.positionArray[j++] = Math.round((Math.random()*2-1)*100)/100
    this.positionArray[j++] = Math.round((Math.random()*2-1)*100)/100
    this.positionArray[j++] = 6
  }
  this.positionBuffer = this.gl.createBuffer()
  this.texture = this.renderer.createTexture(this.gl, 'assets/entity_dante.png')
  // this.shader = this.renderer.createShader(this.gl, vs, fs)
  // this.shader.a_position = this.gl.getAttribLocation(this.shader, 'a_position')
  // this.shader.u_texture = this.gl.getUniformLocation(this.shader, 'u_texture')
  this.shader = createShader(this.gl, vs, fs)

  this.viewWidth = 0
  this.viewHeight = 0
  this.viewOffsetX = 0
  this.viewOffsetY = 0
  this.viewScale = 0.1
}

var E = Entities.prototype

E.setView = function(width, height, offX, offY, scale) {
  if (width) this.viewWidth = width
  if (height) this.viewHeight = height
  if (offX || offX==0) this.viewOffsetX = offX
  if (offY || offY==0) this.viewOffsetY = offY
  if (scale) this.viewScale = scale
}

var _steps = 0
var _idx = [ 0 ,1 ,2 ,3 ,4 ,5 ,6
           , 8 ,9 ,10,11,12,13,14
           , 16,17,18,19,20,21,22 ]
var _idxLen = _idx.length
var _u = 0
E.render = function() {
  if (!((_steps++)%5)) {
    _u = (_u+1)%_idxLen
    for (var i=2;i<this.positionArray.length;i+=3) {
      this.positionArray[i] = _idx[_u]
    }
  }
  var gl = this.gl
  var itemSize = 3
  var numItems = this.positionArray.length/3
  // gl.useProgram(this.shader)
  this.shader.bind()
  gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
  // gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.STATIC_DRAW)
  gl.bufferData(gl.ARRAY_BUFFER, this.positionArray, gl.DYNAMIC_DRAW)
  this.shader.attributes.a_position.pointer()
  this.shader.uniforms.u_viewportOffset = this.renderer.viewport.offset
  this.shader.uniforms.u_viewportScale = this.renderer.viewport.scale
  //gl.enableVertexAttribArray(this.shader.a_position)
  //gl.vertexAttribPointer(this.shader.a_position, itemSize, gl.FLOAT, false, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1i(this.shader.u_texture,0)
  gl.bindTexture(gl.TEXTURE_2D, this.texture)
  gl.drawArrays(gl.POINTS, 0, numItems)
}
