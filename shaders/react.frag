precision mediump float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform float feed;
uniform float kill;
uniform float brushSize;
uniform vec3 mouse;

void main() {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec2 uv = texture2D(texture, p).rg;

  float dm = length(gl_FragCoord.xy - mouse.xy);
  if (mouse.z > 0.0 && dm < brushSize) {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    return;
  }

  float dx = 1.0 / resolution.x;
  float dy = 1.0 / resolution.y;

  vec2 neighbors =
    0.05 * texture2D(texture, p + vec2(-dx, -dy)).rg +
    0.20 * texture2D(texture, p + vec2(-dx, 0.0)).rg +
    0.05 * texture2D(texture, p + vec2(-dx,  dy)).rg +
    0.20 * texture2D(texture, p + vec2(0.0, -dy)).rg +
    0.20 * texture2D(texture, p + vec2(0.0,  dy)).rg +
    0.05 * texture2D(texture, p + vec2( dx, -dy)).rg +
    0.20 * texture2D(texture, p + vec2( dx, 0.0)).rg +
    0.05 * texture2D(texture, p + vec2( dx,  dy)).rg;

  vec2 lapl = neighbors - uv;

  float u = uv.r;
  float v = uv.g;
  float lu = lapl.r;
  float lb = lapl.g;

  float reaction = u * v * v;

  float du = 1.0 * lu - reaction + feed * (1.0 - u);
  float dv = 0.5 * lb + reaction - (kill + feed) * v;

  gl_FragColor = vec4(u + du, v + dv, 0.0, 1.0);
}
