const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet', 'https://baatcheet.herokuapp.com')

let username
const peers = {}
const messages = {}

const connect = (peerId, initiator) => {
  if (peers[peerId]) {
    return peers[peerId]
  }

  const peer = new Peer({ initiator, wrtc })

  peer.on('signal', (signal) => {
    console.log(`signalling ${peerId}`, Object.assign(signal, {peerId: username}))
    hub.broadcast(peerId, Object.assign(signal, {peerId: username}))
  })

  peer.on('error', console.error)

  peer.on('connect', () => {
    console.log(`connected with ${peerId}`)
  })

  peer.on('data', (data) => {
    console.log(`message from ${peerId}`, data.toString())
    if (!Array.isArray(messages[peerId])) {
      messages[peerId] = []
    }

    messages[peerId].push({timestamp: Date.now(), message: data})
  })

  peers[peerId] = peer

  return peer
}

const send = (peerId, message) => {
  if (!peers[peerId] || !peers[peerId].connected) {
    throw new Error(`${peerId} not connected`)
  }

  peers[peerId].send(message)
}

const login = (user) => {
  username = user
  hub.subscribe(username)
    .on('data', (signal) => {
      console.log(`received signal`, signal)

      const peerId = signal.peerId
      const peer = connect(peerId, false)

      peer.signal(signal)
    })
}

if (typeof window === 'object') {
  window.connect = connect
  window.send = send
  window.login = login
  window.peers = peers
}
