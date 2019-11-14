import * as twgl from 'twgl.js'

export default class Scene {
  constructor(width, height) {
    const canvas = document.getElementById('canvas')
    this.gl = twgl.getWebGLContext(canvas)

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
    })

    this.fbi = twgl.createFramebufferInfo(this.gl)

    this.width = width
    this.height = height
    this.gl.canvas.width = width
    this.gl.canvas.height = height
    this.gl.viewport(0, 0, width, height)
  }

  createBuffer(width, height) {
    width = width || this.width
    height = height || this.height

    const attachments = [
      {
        format: this.gl.RGB,
        type: this.gl.FLOAT,
        min: this.gl.LINEAR,
        mag: this.gl.LINEAR,
        wrap: this.gl.REPEAT
      }
    ]

    const fbi = twgl.createFramebufferInfo(this.gl, attachments, width, height)
    fbi.width = width
    fbi.height = height
    return fbi
  }

  createProgramInfo(vs, fs) {
    return twgl.createProgramInfo(this.gl, [vs, fs])
  }

  draw(spec) {
    let resolution = [this.width, this.height]
    if (spec.output) {
      resolution = [spec.output.width, spec.output.height]
    }

    const uniforms = { resolution }
    if (spec.uniforms) {
      Object.assign(uniforms, spec.uniforms)
    }

    if (spec.inputs) {
      Object.keys(spec.inputs).map(key => {
        uniforms[key] = spec.inputs[key].attachments[0]
      })
    }

    this.gl.useProgram(spec.program.program)
    twgl.setUniforms(spec.program, uniforms)

    if (spec.output) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, spec.output.framebuffer)
    } else {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    }

    twgl.setBuffersAndAttributes(this.gl, spec.program, this.bufferInfo)
    twgl.drawBufferInfo(this.gl, this.bufferInfo)
  }
}
