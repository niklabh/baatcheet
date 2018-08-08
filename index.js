const Vue = require('vue')
const QRCode = require('qrcode')
const Peer = require('simple-peer')
const Instascan = require('instascan')

const app = new Vue({
  el: '#app',
  data: {
    message: '!',
    connected: false,
    signalling: false,
    scanning: false,
    messages: [{user: 'system', message: 'end to end secure'}]
  },
  methods: {
    send: function () {
      const p = new Peer({ initiator: true, trickle: false })
      this.connect(p)
    },
    receive: function () {
      const self = this
      const p = new Peer({ initiator: false, trickle: false })
      self.connect(p)

      self.scanning = true

      self.scanner = new Instascan.Scanner({ video: document.getElementById('preview'), scanPeriod: 5 })

      self.scanner.addListener('scan', function (content, image) {
        console.log(content)

        p.signal(JSON.parse(content))

        self.scanning = false
      })

      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 1) {
          self.scanner.start(cameras[1])
        } else if (cameras.length > 0) {
          self.scanner.start(cameras[0])
        } else {
          console.error('No cameras found.')
        }
      }).catch(function (e) {
        console.error(e)
      })
    },
    connect: function (p) {
      this.p = p
      p.on('error', function (err) { console.log('error', err) })

      p.on('signal', (data) => {
        console.log('SIGNAL', JSON.stringify(data))
        this.signalling = true
        this.scanning = false

        const canvas = document.getElementById('canvas')
        QRCode.toCanvas(canvas, JSON.stringify(data), (error) => {
          if (error) console.error(error)
          console.log('success!')
        })
      })

      p.on('connect', () => {
        console.log('CONNECT')
        this.connected = true
        this.messages.push({user: 'me', message: 'connected'})
        p.send('connected')
      })

      p.on('data', (data) => {
        this.messages.push({user: 'friend', message: data})
      })
    },
    sendMessage: function () {
      const message = document.querySelector('#message').value

      this.p.send(message)
      this.messages.push({user: 'me', message: message})
    }
  }
})
