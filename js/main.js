import * as dat from 'dat.gui'

import presets from './presets.json'
import Scene from './scene'

import basicVert from '../shaders/basic.vert'
import clearFrag from '../shaders/clear.frag'
import reactFrag from '../shaders/react.frag'
import thresholdFrag from '../shaders/threshold.frag'

// hot-reload fix
const dg = document.querySelector('.dg.main')
if (dg) location.reload()

let settings = {
  feed: 0.037,
  kill: 0.06,
  brushSize: 1
}

const gui = new dat.GUI({ load: presets })
gui.remember(settings)
gui.add(settings, 'feed')
gui.add(settings, 'kill')
gui.add(settings, 'brushSize', 1, 100)
gui.add({ clear }, 'clear')

const previousPower = function(x) {
  return Math.pow(2, Math.floor(Math.log2(x)))
}

const scene = new Scene(
  previousPower(document.body.clientWidth),
  previousPower(document.body.clientHeight)
)

const clearProg = scene.createProgramInfo(basicVert, clearFrag)
const thresholdProg = scene.createProgramInfo(basicVert, thresholdFrag)
const reactProg = scene.createProgramInfo(basicVert, reactFrag)

const scale = 1
const [w, h] = [scene.width / scale, scene.height / scale]
const bufferA = scene.createBuffer(w, h)
const bufferB = scene.createBuffer(w, h)

let mouse = [w / 2, h / 2, 1]

const mouseevent = e => {
  mouse[0] = e.offsetX / scale
  mouse[1] = (e.target.height - e.offsetY) / scale
  mouse[2] = e.buttons
}

scene.gl.canvas.addEventListener('mousemove', mouseevent)
scene.gl.canvas.addEventListener('mousedown', mouseevent)
scene.gl.canvas.addEventListener('mouseup', mouseevent)

function clear() {
  scene.draw({
    program: clearProg,
    output: bufferA
  })
}

function render() {
  const steps = 8
  let lastOutput = bufferA

  for (let i = 0; i < steps; i++) {
    const input = lastOutput
    const output = lastOutput === bufferA ? bufferB : bufferA
    lastOutput = output

    scene.draw({
      program: reactProg,
      uniforms: {
        ...settings,
        mouse
      },
      inputs: {
        texture: input
      },
      output: output
    })
  }

  scene.draw({
    program: thresholdProg,
    uniforms: {
      threshold: 0.3
    },
    inputs: {
      texture: lastOutput
    }
  })

  requestAnimationFrame(render)
}

clear()
render()
mouse[2] = 0
