import * as dat from 'dat.gui'
import { saveAs } from 'file-saver'

import presets from './presets.json'
import Scene from './scene'

import basicVert from '../shaders/basic.vert'
import clearFrag from '../shaders/clear.frag'
import seedFrag from '../shaders/seed.frag'
import reactFrag from '../shaders/react.frag'
import psychedelicFrag from '../shaders/psychedelic.frag'
import thresholdFrag from '../shaders/threshold.frag'

// hot-reload fix
const dg = document.querySelector('.dg.main')
if (dg) location.reload()

let settings = {
  feed: 0.037,
  kill: 0.06,
  brushSize: 1,
  threshold: 0.3,
  timeMultiplier: 0,
  renderSteps: 10,
  renderer: 'threshold'
}

const gui = new dat.GUI({ load: presets })
gui.remember(settings)
gui.add(settings, 'feed')
gui.add(settings, 'kill')
gui.add(settings, 'brushSize', 1, 100)
gui.add(settings, 'renderSteps', 1, 30)
gui.add(settings, 'renderer', ['threshold', 'psychedelic'])
gui.add(settings, 'threshold', 0.01, 1)
gui.add(settings, 'timeMultiplier', 0, 50)
gui.add({ clear }, 'clear')
gui.add({ seed }, 'seed')
gui.add({ save }, 'save')

const previousPower = function(x) {
  return Math.pow(2, Math.floor(Math.log2(x)))
}

const scene = new Scene(
  previousPower(document.body.clientWidth),
  previousPower(document.body.clientHeight)
)

const shaders = {
  clear: scene.createProgramInfo(basicVert, clearFrag),
  seed: scene.createProgramInfo(basicVert, seedFrag),
  react: scene.createProgramInfo(basicVert, reactFrag)
}

const renderers = {
  threshold: scene.createProgramInfo(basicVert, thresholdFrag),
  psychedelic: scene.createProgramInfo(basicVert, psychedelicFrag)
}

const scale = 1
const [w, h] = [scene.width / scale, scene.height / scale]
const bufferA = scene.createBuffer(w, h)
const bufferB = scene.createBuffer(w, h)
let lastOutput = bufferA

let mouse = [w / 2, h / 2, 0]
let start = Date.now()

const mouseevent = e => {
  mouse[0] = e.offsetX / scale
  mouse[1] = (e.target.height - e.offsetY) / scale
  mouse[2] = e.buttons
}

scene.gl.canvas.addEventListener('mousemove', mouseevent)
scene.gl.canvas.addEventListener('mousedown', mouseevent)
scene.gl.canvas.addEventListener('mouseup', mouseevent)

function save() {
  scene.gl.canvas.toBlob(blob => {
    const id = Array(5)
      .fill()
      .map(() => Math.floor(36 * Math.random()).toString(36))
      .join('')
    saveAs(blob, `rd-${id}.png`)
  })
}

function clear() {
  scene.draw({
    program: shaders.clear,
    output: lastOutput
  })
}

function seed() {
  const seeds = []
  for (let i = 0; i < 10; i++) {
    const a = (i * 2 * Math.PI) / 10
    seeds.push(0.5 + 0.25 * Math.cos(a), 0.5 + 0.25 * Math.sin(a))
  }

  const input = lastOutput
  const output = input === bufferA ? bufferB : bufferA
  lastOutput = output

  scene.draw({
    program: shaders.seed,
    uniforms: { seeds },
    inputs: { texture: input },
    output: output
  })
}

function render() {
  for (let i = 0; i < settings.renderSteps; i++) {
    const input = lastOutput
    const output = input === bufferA ? bufferB : bufferA
    lastOutput = output

    scene.draw({
      program: shaders.react,
      uniforms: { ...settings, mouse },
      inputs: { texture: input },
      output: output
    })
  }

  const time = (Date.now() - start) / 1000
  scene.draw({
    program: renderers[settings.renderer],
    uniforms: { ...settings, time },
    inputs: { texture: lastOutput }
  })

  requestAnimationFrame(render)
}

clear()
seed()
render()
