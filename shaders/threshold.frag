precision mediump float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform float threshold;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 rgb = texture2D(texture, uv);
    // float value = rgb.r - rgb.g;
    // float value = rgb.g > threshold ? 1.0 : 0.0;
    float value = smoothstep(0.5 * threshold, threshold, rgb.g);
    gl_FragColor = vec4(vec3(value), 1.0);
}
