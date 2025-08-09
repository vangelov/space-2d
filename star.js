/* Original code: https://github.com/wwwtyro/space-2d */

const fragmentShaderSrc = `
#version 300 es 

precision highp float; 

uniform sampler2D source;
uniform vec3 coreColor, haloColor;
uniform vec2 center, resolution;
uniform float coreRadius, haloFalloff, scale;

in vec2 vUV;

out vec4 fragColor;
 
void main() {
  vec4 s = texture(source, vUV);
  float d = length(gl_FragCoord.xy - center * resolution) / scale;
  if (d <= coreRadius) {
    fragColor = vec4(coreColor, 1);
    return;
  }
  float e = 1.0 - exp(-(d - coreRadius) * haloFalloff);
  vec3 rgb = mix(coreColor, haloColor, e);
  rgb = mix(rgb, vec3(0,0,0), e);
  fragColor = vec4(rgb + s.rgb, 1);
}
`;

export class Star {
  static fragmentShaderSrc = fragmentShaderSrc;

  constructor({ pico, loader, scene }) {
    this.pico = pico;

    this.drawCall = this.pico.createDrawCall(
      loader.starProgram,
      scene.quadVertexArray
    );
  }

  draw({
    source,
    center,
    coreRadius,
    coreColor,
    haloColor,
    haloFalloff,
    resolution,
    scale,
  }) {
    this.drawCall
      .texture("source", source)
      .uniform("center", center)
      .uniform("coreRadius", coreRadius)
      .uniform("coreColor", coreColor)
      .uniform("haloColor", haloColor)
      .uniform("haloFalloff", haloFalloff)
      .uniform("resolution", resolution)
      .uniform("scale", scale)
      .draw();
  }
}
