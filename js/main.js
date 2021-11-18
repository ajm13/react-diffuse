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

window.gpuHack = document.createElement('canvas')
window.gpuHackCtx = gpuHack.getContext('webgl', {
  powerPreference: 'high-performance'
})

let settings = {
  feed: 37,
  kill: 60,
  brushSize: 1,
  threshold: 0.3,
  timeMultiplier: 0,
  renderSteps: 10,
  renderer: 'threshold'
}

const gui = new dat.GUI({ load: presets })
gui.remember(settings)
gui.add(settings, 'feed', 0, 100).name('feed rate')
gui.add(settings, 'kill', 0, 100).name('kill rate')
gui.add(settings, 'brushSize', 1, 100).name('brush size')
gui.add(settings, 'renderSteps', 1, 100).name('render steps')
gui.add(settings, 'renderer', ['threshold', 'psychedelic'])
gui.add(settings, 'threshold', 0.01, 1)
gui.add(settings, 'timeMultiplier', 0, 50).name('time multiplier')
gui.add({ clear }, 'clear')
gui.add({ seedCircle }, 'seedCircle').name('seed circle')
gui.add({ seedCenter }, 'seedCenter').name('seed center')
gui.add({ save }, 'save')

const scene = new Scene(document.body.clientWidth, document.body.clientHeight)

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

function iterate(config) {
  const input = lastOutput
  const output = input === bufferA ? bufferB : bufferA
  lastOutput = output

  scene.draw({
    inputs: { texture: input },
    output: output,
    ...config
  })
}

function seedCenter() {
  const seeds = [0.5, 0.5]
  iterate({
    program: shaders.seed,
    uniforms: { seeds, num: 1 }
  })
}

function seedCircle() {
  const seeds = []
  const num = 10
  for (let i = 0; i < num; i++) {
    const a = (i * 2 * Math.PI) / num
    const x = 0.5 + 0.25 * Math.cos(a)
    const y = 0.5 + 0.25 * Math.sin(a) * (w / h)
    seeds.push(x, y)
  }

  iterate({
    program: shaders.seed,
    uniforms: { seeds, num }
  })
}

function render() {
  const feed = settings.feed / 1000
  const kill = settings.kill / 1000

  for (let i = 0; i < settings.renderSteps; i++) {
    iterate({
      program: shaders.react,
      uniforms: { ...settings, feed, kill, mouse }
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
seedCircle()
render()
