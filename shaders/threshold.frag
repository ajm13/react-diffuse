precision mediump float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform float threshold;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float B = texture2D(texture, uv).g;
    float value = smoothstep(0.5 * threshold, threshold, B);
    gl_FragColor = vec4(vec3(value), 1.0);
}
