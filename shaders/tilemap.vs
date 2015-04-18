attribute vec2 a_position;
uniform mat3 u_view;
varying vec3 v_worldCoord;

void main() {
  v_worldCoord = u_view * vec3(a_position, 1.0);
  gl_Position = vec4(a_position, 0.0, 1.0);
}