const QRCode = require('qrcode')
const Peer = require('simple-peer')
const p = new Peer({ initiator: location.hash === '#1', trickle: false })

p.on('error', function (err) { console.log('error', err) })

p.on('signal', function (data) {
  console.log('SIGNAL', JSON.stringify(data))
  document.querySelector('#outgoing').textContent = JSON.stringify(data)

  const canvas = document.getElementById('canvas')
  QRCode.toCanvas(canvas, JSON.stringify(data), function (error) {
    if (error) console.error(error)
    console.log('success!')
  })
})

document.querySelector('form#signal').addEventListener('submit', function (ev) {
  ev.preventDefault()
  p.signal(JSON.parse(document.querySelector('#incoming').value))
})

p.on('connect', function () {
  console.log('CONNECT')
  p.send('whatever' + Math.random())

  document.querySelector('form#message').addEventListener('submit', function (ev) {
    ev.preventDefault()
    p.send(document.querySelector('#outMsg').value)
  })
})

p.on('data', function (data) {
  document.querySelector('#inMsg').innerHTML += `<li>${data}</li>`
  console.log('data: ' + data)
})
