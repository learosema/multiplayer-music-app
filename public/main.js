const d = document
oncontextmenu = () => false
const $ = d.querySelector.bind(d)
const $$ = (query,con) => Array.prototype.slice.call((con||d).querySelectorAll(query))

const AC = new AudioContext()
const masterVolume = AC.createGain()
masterVolume.gain.value = 1.0

const spectrum = AC.createAnalyser()
spectrum.fftSize = 1024
const specbuffer = new Uint8Array(spectrum.frequencyBinCount)
masterVolume.connect(spectrum)
spectrum.connect(AC.destination)

class FirebaseDisco {

  constructor() {
    this.drumPad = $('drumpad')
    this.initDrumPad()
    this.initPiano()
    this.initWhoop()
    this.initDisco()
  }

  playSound(buffer) {
    const source = AC.createBufferSource(), g = AC.createGain();
    source.buffer = buffer;
    source.start(0);
    g.gain.value = 0.5;
    source.connect(g);
    g.connect(spectrum);
  }

  playTone() {
    const notes = "C C# D D# E F F# G G# A A# B".split(" ")

  }

  initDrumPad() {
    const drums = $$('drum', this.drumPad)
    let progress = drums.length
    this.drumsounds = drums.map(drum => {
      const sound = {
        src: 'wav/' + drum.getAttribute('sound'),
        buffer: null
      }
      const request = new XMLHttpRequest()
      request.open('GET', sound.src, true)
      request.responseType = 'arraybuffer'
      request.onload = () => {
        AC.decodeAudioData(request.response, (buffer) => {
          sound.buffer = buffer
          progress -= 1
          drum.addEventListener('click', (e) => {
            this.playSound(sound.buffer)
            drum.classList.add("active")
            setTimeout(() => drum.classList.remove("active"), 50)
          })
        })
      }
      request.send()
    })

  }

  initPiano() {

  }

  initWhoop() {

  }

  initDisco() {
    this.canvas = $('disco canvas')
    let W = this.canvas.width = $('disco canvas').clientWidth
    let H = this.canvas.height = $('disco canvas').clientHeight
    this.canvasContext = this.canvas.getContext("2d")
    this.canvasLoop = (t) => {
      const c = this.canvasContext
      c.fillStyle = "rgba(0,0,0,.1)"
      c.fillRect(0, 0, W, H)
      spectrum.getByteTimeDomainData(specbuffer)
      const dx = W / specbuffer.length
      c.beginPath()
      c.lineWidth = 8
      c.globalCompositeOperation = "lighter"
      c.strokeStyle = `hsl(${((t/1e2)|0)%360},100%,50%)`
      c.moveTo(0, specbuffer[0]/128.0*H/2)
      for (let i = 1; i < specbuffer.length; i++) {
        c.lineTo(i*dx, specbuffer[i]/128.0*H/2)
      }	
      c.stroke()
      c.globalCompositeOperation = "source-over"
      requestAnimationFrame(this.canvasLoop)     
    }
    this.canvasLoop()
  }

}

const app = new FirebaseDisco()