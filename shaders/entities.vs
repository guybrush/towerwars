attribute vec3 a_position;
varying vec2 v_texCoord;

void main() {
  float texId = a_position.z/7.0;
  v_texCoord.y = floor(texId);
  v_texCoord.x = fract(texId)*8.0;
  gl_Position = vec4(a_position.xy, 1, 1);
  gl_PointSize = 32.0;
}
