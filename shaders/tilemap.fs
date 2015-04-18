#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_mapSize;
uniform vec2 u_sheetSize;
uniform vec2 u_tileSize;
uniform sampler2D u_tileMap;
uniform sampler2D u_tileSheet;
varying vec3 v_worldCoord;

void main() {
  vec2 uv = v_worldCoord.xy / v_worldCoord.z;
  vec2 mapCoord = floor(uv);
  vec2 tileOffset = fract(uv);
  vec2 tileId = floor(255.0 * texture2D(tileMap, mapCoord / u_mapSize).ra);
  vec2 sheetCoord = (tileId + tileOffset) * (u_tileSize / u_sheetSize);
  gl_FragColor = texture2D(tileSheet, sheetCoord);
}