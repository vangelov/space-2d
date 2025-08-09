import { Scene } from "./scene.js";
import { Nebula } from "./nebula.js";
import { Star } from "./star.js";

export class Loader {
  constructor(pico) {
    this.pico = pico;
  }

  async load() {
    const [program, nebulaProgram, starProgram] =
      await this.pico.createPrograms(
        [Scene.vertexShaderSrc, Scene.fragmentShaderSrc],
        [Scene.vertexShaderSrc, Nebula.fragmentShaderSrc],
        [Scene.vertexShaderSrc, Star.fragmentShaderSrc]
      );

    this.program = program;
    this.nebulaProgram = nebulaProgram;
    this.starProgram = starProgram;
  }
}
