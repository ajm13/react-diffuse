precision mediump float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform vec2 seeds[10];
uniform int num;

void main() {
  vec2 xy = gl_FragCoord.xy / resolution.xy;
  vec2 AB = texture2D(texture, xy).rg;

  for (int i = 0; i < 10; i++) {
    if (i >= num) break;
    vec2 seed = seeds[i].xy * resolution.xy;
    float dm = length(gl_FragCoord.xy - seed.xy);
    if (dm < 2.0) {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      return;
    }
  }

  gl_FragColor = vec4(AB.r, AB.g, 0.0, 1.0);
}
