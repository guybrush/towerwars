#ifdef GL_ES
precision highp float;
#endif

varying vec2 v_texCoord;
uniform sampler2D u_texture;

void main() {
  vec2 texDiv = vec2(16.0/128.0, 25.0/128.0);
  vec2 texOff = vec2(v_texCoord.x*texDiv.x, v_texCoord.y*texDiv.y);
  gl_FragColor = texture2D(u_texture, texOff+(gl_PointCoord*texDiv));
}
