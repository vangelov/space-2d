function createTextureData(width, height, density, brightness) {
  const count = Math.round(width * height * density);
  const data = new Uint8Array(width * height * 3);

  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * width * height);
    const c = Math.round(255 * Math.log(1 - Math.random()) * -brightness);
    data[r * 3 + 0] = c;
    data[r * 3 + 1] = c;
    data[r * 3 + 2] = c;
  }

  return data;
}

export class PointStars {
  constructor({ pico, scene, loader }) {
    this.pico = pico;

    this.createTextures();

    this.drawCall = this.pico
      .createDrawCall(loader.program, scene.quadVertexArray)
      .texture("source", this.texture);
  }

  createTextures() {
    this.texture = this.pico.createTexture2D(
      createTextureData(this.pico.width, this.pico.height, 0.1, 0.9),
      this.pico.width,
      this.pico.height,
      {
        internalFormat: PicoGL.RGB8,
        minFilter: PicoGL.NEAREST,
        magFilter: PicoGL.NEAREST,
        wrapS: PicoGL.CLAMP_TO_EDGE,
        wrapT: PicoGL.CLAMP_TO_EDGE,
        generateMipmaps: false,
      }
    );
  }

  draw() {
    this.drawCall.draw();
  }
}
