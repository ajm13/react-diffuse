precision mediump float;

uniform vec2 resolution;
uniform sampler2D texture;

uniform float time;
uniform float timeMultiplier;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 rgb = texture2D(texture, uv);
    float A = rgb.r;
    float B = rgb.g;

    vec3 col;
    float h = B * 15.0 - 1.0;
    h += mod(timeMultiplier * time, 6.0);
    float x = 1.0 - abs(mod(h, 2.0) - 1.0);
    h = floor(mod(h, 6.0));

         if (h == 0.0) col = vec3(1.0, x, 0.0);
    else if (h == 1.0) col = vec3(x, 1.0, 0.0);
    else if (h == 2.0) col = vec3(0.0, 1.0, x);
    else if (h == 3.0) col = vec3(0.0, x, 1.0);
    else if (h == 4.0) col = vec3(x, 0.0, 1.0);
    else if (h == 5.0) col = vec3(1.0, 0.0, x);

    col *= min(B * 20.0, 1.0);
    col += vec3((1.0 - A) * pow(1.0 - B, 5.0));

    gl_FragColor = vec4(col, 1.0);
}
