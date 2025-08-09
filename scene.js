/* Original code: https://github.com/wwwtyro/space-2d */

import { Nebula } from "./nebula.js";
import { Star } from "./star.js";
import { PointStars } from "./points-stars.js";
import { pingPong } from "./ping-poing.js";

export const vertexShaderSrc = `
#version 300 es 

precision highp float;
 
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;

out vec2 vUV; 
 
void main() {
    vUV = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

export const fragmentShaderSrc = `
#version 300 es

precision highp float;

uniform sampler2D source;
 
in vec2 vUV;
out vec4 fragColor;

void main() { 
    fragColor = texture(source, vUV);
}  
`;

export class Scene {
  static vertexShaderSrc = vertexShaderSrc;
  static fragmentShaderSrc = fragmentShaderSrc;

  constructor({ pico, loader }) {
    this.pico = pico;
    this.createVertexArrays();
    this.createFramebuffers();

    this.drawCall = this.pico.createDrawCall(
      loader.program,
      this.quadVertexArray
    );

    this.pointStars = new PointStars({
      pico,
      scene: this,
      loader,
    });
    this.nebula = new Nebula({ pico, scene: this, loader });
    this.star = new Star({ pico, scene: this, loader });
  }

  createVertexArrays() {
    const positions = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      2,
      new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
    );

    const uvs = this.pico.createVertexBuffer(
      PicoGL.FLOAT,
      2,
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1])
    );

    this.quadVertexArray = this.pico
      .createVertexArray()
      .vertexAttributeBuffer(0, positions)
      .vertexAttributeBuffer(1, uvs);
  }

  createFramebuffers() {
    this.pingFramebuffer = this.pico
      .createFramebuffer()
      .colorTarget(
        0,
        this.pico.createTexture2D(null, this.pico.width, this.pico.height)
      );

    this.pongFramebuffer = this.pico
      .createFramebuffer()
      .colorTarget(
        0,
        this.pico.createTexture2D(null, this.pico.width, this.pico.height)
      );
  }

  draw() {
    this.pico.clear();
    this.pico.drawFramebuffer(this.pingFramebuffer);
    this.pointStars.draw();

    const nebulaOut = pingPong({
      initialFramebuffer: this.pingFramebuffer,
      alphaFramebuffer: this.pingFramebuffer,
      betaFramebuffer: this.pongFramebuffer,
      count: Math.round(Math.random() * 4 + 1),
      func: (sourceFramebuffer, destinationFramebuffer) => {
        this.pico.drawFramebuffer(destinationFramebuffer);
        this.pico.viewport(0, 0, this.pico.width, this.pico.height);

        this.nebula.draw({
          source: sourceFramebuffer.colorAttachments[0],
          offset: [Math.random() * 100, Math.random() * 100],
          scale: (Math.random() * 2 + 1) / this.pico.width,
          color: [Math.random(), Math.random(), Math.random()],
          density: Math.random() * 0.2,
          falloff: Math.random() * 2.0 + 3.0,
        });
      },
    });

    const starOut = pingPong({
      initialFramebuffer: nebulaOut,
      alphaFramebuffer: this.pingFramebuffer,
      betaFramebuffer: this.pongFramebuffer,
      count: Math.round(Math.random() * 8 + 1),
      func: (sourceFramebuffer, destinationFramebuffer) => {
        this.pico.drawFramebuffer(destinationFramebuffer);
        this.pico.viewport(0, 0, this.pico.width, this.pico.height);

        this.star.draw({
          source: sourceFramebuffer.colorAttachments[0],
          center: [Math.random(), Math.random()],
          coreRadius: Math.random() * 0.0,
          coreColor: [1, 1, 1],
          haloColor: [Math.random(), Math.random(), Math.random()],
          haloFalloff: Math.random() * 1024 + 32,
          resolution: [this.pico.width, this.pico.height],
          scale: this.pico.width,
        });
      },
    });

    const sunOut =
      starOut === this.pongFramebuffer
        ? this.pingFramebuffer
        : this.pongFramebuffer;
    this.pico.drawFramebuffer(sunOut);
    this.star.draw({
      source: starOut.colorAttachments[0],
      center: [Math.random(), Math.random()],
      coreRadius: Math.random() * 0.025 + 0.025,
      coreColor: [1, 1, 1],
      haloColor: [Math.random(), Math.random(), Math.random()],
      haloFalloff: Math.random() * 32 + 32,
      resolution: [this.pico.width, this.pico.height],
      scale: this.pico.width,
    });

    this.pico.defaultDrawFramebuffer();
    this.drawCall.texture("source", sunOut.colorAttachments[0]).draw();
  }
}
