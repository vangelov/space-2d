/* Original code: https://github.com/wwwtyro/space-2d */

function randomUnitVector2() {
  const r = Math.random() * 2.0 * Math.PI;
  return [Math.cos(r), Math.sin(r)];
}

export function createTextureData(size) {
  const l = size * size * 2;
  const array = new Uint8Array(l);
  for (let i = 0; i < l; i++) {
    const r = randomUnitVector2();
    array[i * 2 + 0] = Math.round(0.5 * (1.0 + r[0]) * 255);
    array[i * 2 + 1] = Math.round(0.5 * (1.0 + r[1]) * 255);
  }

  return array;
}

const fragmentShaderSrc = `
#version 300 es 


precision highp float;

uniform sampler2D tNoise;
uniform sampler2D source;
uniform vec3 color;
uniform vec2 offset;
uniform float scale, density, falloff, tNoiseSize;

in vec2 vUV;

out vec4 fragColor;

float smootherstep(float a, float b, float r) {
    r = clamp(r, 0.0, 1.0);
    r = r * r * r * (r * (6.0 * r - 15.0) + 10.0);
    return mix(a, b, r);
}

float perlin_2d(vec2 p) {
    vec2 p0 = floor(p);
    vec2 p1 = p0 + vec2(1, 0); 
    vec2 p2 = p0 + vec2(1, 1);
    vec2 p3 = p0 + vec2(0, 1);
    vec2 d0 = texture(tNoise, p0/tNoiseSize).rg;
    vec2 d1 = texture(tNoise, p1/tNoiseSize).rg;
    vec2 d2 = texture(tNoise, p2/tNoiseSize).rg;
    vec2 d3 = texture(tNoise, p3/tNoiseSize).rg; 
    d0 = 2.0 * d0 - 1.0;
    d1 = 2.0 * d1 - 1.0;
    d2 = 2.0 * d2 - 1.0;
    d3 = 2.0 * d3 - 1.0;
    vec2 p0p = p - p0;
    vec2 p1p = p - p1;
    vec2 p2p = p - p2;
    vec2 p3p = p - p3;
    float dp0 = dot(d0, p0p);
    float dp1 = dot(d1, p1p);
    float dp2 = dot(d2, p2p); 
    float dp3 = dot(d3, p3p);
    float fx = p.x - p0.x;
    float fy = p.y - p0.y;
    float m01 = smootherstep(dp0, dp1, fx);
    float m32 = smootherstep(dp3, dp2, fx);
    float m01m32 = smootherstep(m01, m32, fy);
    return m01m32;
}

float normalnoise(vec2 p) {
    return perlin_2d(p) * 0.5 + 0.5;
}

float noise(vec2 p) {
    p += offset;
    const int steps = 5;
    float scale = pow(2.0, float(steps));
    float displace = 0.0;
    for (int i = 0; i < steps; i++) {
        displace = normalnoise(p * scale + displace);
        scale *= 0.5;
    }
    return normalnoise(p + displace);
}
 
void main() { 
  vec4 p = texture(source, vUV); 
  float n = noise(gl_FragCoord.xy * scale * 1.0);
  n = pow(n + density, falloff);
  fragColor = vec4(mix(p.rgb, color, n), 1);
}

`;

const size = 256;

export class Nebula {
  static fragmentShaderSrc = fragmentShaderSrc;

  constructor({ pico, scene, loader }) {
    this.pico = pico;
    this.createTextures();

    this.drawCall = this.pico
      .createDrawCall(loader.nebulaProgram, scene.quadVertexArray)
      .texture("tNoise", this.texture)
      .uniform("tNoiseSize", size);
  }

  createTextures() {
    this.texture = this.pico.createTexture2D(
      createTextureData(size),
      size,
      size,
      {
        internalFormat: PicoGL.RG8,
        minFilter: PicoGL.NEAREST,
        magFilter: PicoGL.NEAREST,
        wrapS: PicoGL.REPEAT,
        wrapT: PicoGL.REPEAT,
        generateMipmaps: false,
      }
    );
  }

  draw({ offset, scale, color, density, falloff, source }) {
    this.drawCall
      .uniform("offset", offset)
      .uniform("scale", scale)
      .uniform("color", color)
      .uniform("density", density)
      .uniform("falloff", falloff)
      .texture("source", source)
      .draw();
  }
}
