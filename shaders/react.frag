precision highp float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform float feed;
uniform float kill;
uniform float brushSize;
uniform vec3 mouse;

void main() {
  vec2 xy = gl_FragCoord.xy / resolution.xy;
  vec2 AB = texture2D(texture, xy).rg;

  float dm = length(gl_FragCoord.xy - mouse.xy);
  if (mouse.z > 0.0 && dm < brushSize) {
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    return;
  }

  float dx = 1.0 / resolution.x;
  float dy = 1.0 / resolution.y;

  vec2 neighbors =
    0.05 * texture2D(texture, xy + vec2(-dx, -dy)).rg +
    0.20 * texture2D(texture, xy + vec2(-dx, 0.0)).rg +
    0.05 * texture2D(texture, xy + vec2(-dx,  dy)).rg +
    0.20 * texture2D(texture, xy + vec2(0.0, -dy)).rg +
    0.20 * texture2D(texture, xy + vec2(0.0,  dy)).rg +
    0.05 * texture2D(texture, xy + vec2( dx, -dy)).rg +
    0.20 * texture2D(texture, xy + vec2( dx, 0.0)).rg +
    0.05 * texture2D(texture, xy + vec2( dx,  dy)).rg;

  vec2 lapl = neighbors - AB;

  float A = AB.r;
  float B = AB.g;
  float lA = lapl.r;
  float lB = lapl.g;

  float reaction = A * B * B;

  float dA = 1.0 * lA - reaction + feed * (1.0 - A);
  float dB = 0.5 * lB + reaction - (kill + feed) * B;

  gl_FragColor = vec4(A + dA, B + dB, 0.0, 1.0);
}
