const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet', 'https://baatcheet.herokuapp.com')

let username
const peers = {}
const messages = {}

const connectPeer = (peer, peerId) => {
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
}

const connect = (peerId) => {
  if (peers[peerId] && peers[peerId].connected) {
    return
  }
  const peer = new Peer({ initiator: true, wrtc })

  peer.on('signal', (signal) => {
    if (!signal.type) {
      return
    }
    console.log(`connecting signal`, Object.assign(signal, {peerId: username}))
    hub.broadcast(peerId, Object.assign(signal, {peerId: username}))
  })

  connectPeer(peer, peerId)
  peers[peerId] = peer
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
      console.log(`got signal`, signal)
      if (!peers[signal.peerId] || peers[signal.peerId].destroyed) {
        const peer = new Peer({ wrtc })

        peer.on('signal', (outSignal) => {
          if (outSignal.type === 'answer') {
            console.log(`signalling`, Object.assign(outSignal, {peerId: username}))
            hub.broadcast(signal.peerId, Object.assign(outSignal, {peerId: username}))
          }
        })

        connectPeer(peer, signal.peerId)
        peers[signal.peerId] = peer
      }

      peers[signal.peerId].signal(signal)
    })
}

if (typeof window === 'object') {
  window.connect = connect
  window.send = send
  window.login = login
  window.peers = peers
}
