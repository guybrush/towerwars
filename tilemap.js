module.exports = TileMap

var createShader = require('gl-shader')
// var createTexture = require('gl-texture2d')

var vs =
['attribute vec2 position;'
,'attribute vec2 texture;'

,'varying vec2 pixelCoord;'
,'varying vec2 texCoord;'

,'uniform float scale;'
,'uniform vec2 viewOffset;'
,'uniform vec2 viewportSize;'
,'uniform vec2 inverseTileTextureSize;'
,'uniform float inverseTileSize;'

,'void main(void) {'
// ,'   pixelCoord = (texture * viewportSize) + viewOffset;',
,'  pixelCoord = (texture * viewportSize * scale) + viewOffset;',
,'  texCoord = pixelCoord * inverseTileTextureSize * inverseTileSize;'
,'  gl_Position = vec4(position, 0.0, 1.0);',
,'}'].join('\n')

var fs =
['#ifdef GL_ES'
,'precision highp float;'
,'#endif'

,'varying vec2 pixelCoord;'
,'varying vec2 texCoord;'

,'uniform sampler2D tiles;'
,'uniform sampler2D sprites;'

,'uniform vec2 inverseTileTextureSize;'
,'uniform vec2 inverseSpriteTextureSize;'
,'uniform float tileSize;'
,'uniform int repeatTiles;'

,'void main(void) {'
// ,'  if(repeatTiles == 0 && (texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0)) { discard; }'
// ,'  if(repeatTiles == 0 && (texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0)) { discard; }'
,'  vec4 tile = texture2D(tiles, texCoord);'
// ,'  if(tile.x == 1.0 && tile.y == 1.0) { discard; }'
,'  vec2 spriteOffset = floor(tile.xy * 256.0) * tileSize;'
,'  vec2 spriteCoord = mod(pixelCoord, tileSize);'
,'  gl_FragColor = texture2D(sprites, (spriteCoord+spriteOffset) * inverseSpriteTextureSize);'
,'}'].join('\n')

function TileMapLayer() {}

function TileMap(opts) {
  var self = this
  this.client = opts.client
  this.renderer = this.client.renderer
  this.gl = this.renderer.gl

  this.shader = createShader(this.gl, vs, fs)
  this.shader.bind()
  var sheet = 'assets/sheet.png'
  var map = 'assets/map.png'

  this.tileSheet = this.renderer.createTexture(this.gl, sheet, function(err, tex){
    self.shader.bind()
    self.shader.uniforms.inverseSpriteTextureSize = [ 1/self.tileSheet.image.width, 1/self.tileSheet.image.height ]
    onLoad()
  })
  this.tileMap = this.renderer.createTexture(this.gl, map, function(err, tex){
    self.shader.bind()
    self.shader.uniforms.inverseTileTextureSize = [ 1/self.tileMap.image.width, 1/self.tileMap.image.height ]
    onLoad()
  })
  this.quadVertBuffer = this.gl.createBuffer()
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertBuffer)
  var quadVerts = [
            //x  y  u  v
            -1, -1, 0, 1,
             1, -1, 1, 1,
             1,  1, 1, 0,

            -1, -1, 0, 1,
             1,  1, 1, 0,
            -1,  1, 0, 0
        ]
  this.quadVerts = new Float32Array(quadVerts)
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.quadVerts, this.gl.STATIC_DRAW)

  this.shader.uniforms.tileSize = 64.0
  this.shader.uniforms.inverseTileSize = 1/64.0
  this.shader.uniforms.inverseTileTextureSize = [ 1/this.tileMap.image.width, 1/this.tileMap.image.height ]
  this.shader.uniforms.inverseSpriteTextureSize = [ 1/this.tileMap.image.width, 1/this.tileMap.image.height ]
  this.shader.uniforms.viewOffset = this.renderer.viewport.offset
  this.shader.uniforms.viewportSize = this.renderer.viewport.size
  this.shader.uniforms.repeatTiles = 0
  this.shader.uniforms.scale = this.renderer.viewport.scale
  this._ready = false
  this._toLoad = 2
  function onLoad() {
    self._toLoad--
    if (!self._toLoad) self._ready = true
  }
}

var T = TileMap.prototype

T.render = function() {
  if (!this._ready) return
  var gl = this.gl
  var shader = this.shader
  this.shader.bind()

  gl.bindBuffer(gl.ARRAY_BUFFER,this.quadVertBuffer)

  this.shader.attributes.position.pointer(gl.FLOAT, false, 16, 0)
  this.shader.attributes.texture.pointer(gl.FLOAT, false, 16, 8)

  this.shader.uniforms.viewOffset = this.renderer.viewport.offset
  this.shader.uniforms.viewportSize = this.renderer.viewport.size
  this.shader.uniforms.scale = this.renderer.viewport.scale

  gl.activeTexture(gl.TEXTURE0)
  this.shader.uniforms.sprites = 0
  gl.bindTexture(gl.TEXTURE_2D, this.tileSheet)

  gl.activeTexture(gl.TEXTURE1)
  this.shader.uniforms.tiles = 1
  gl.bindTexture(gl.TEXTURE_2D, this.tileMap)

  gl.drawArrays(gl.TRIANGLES,0,6)
}
