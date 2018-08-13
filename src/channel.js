const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet', 'https://baatcheet.herokuapp.com')

let username
const USERS = 'users'
const users = {}
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

    messages[peerId].push({timestamp: Date.now(), message: data, by: peerId})
  })

  peers[peerId] = peer

  return peer
}

const send = (peerId, message) => {
  if (!peers[peerId] || !peers[peerId].connected) {
    throw new Error(`${peerId} not connected`)
  }

  peers[peerId].send(message)
  messages[peerId].push({timestamp: Date.now(), message: message, by: username})
}

const login = (user, fullname, email) => {
  username = user
  hub.subscribe(username)
    .on('data', (signal) => {
      console.log(`received signal`, signal)

      const peerId = signal.peerId
      const peer = connect(peerId, false)

      peer.signal(signal)
    })

  setInterval(() => hub.broadcast(USERS, {user, fullname, email}), 5000)

  hub.subscribe(USERS)
    .on('data', (data) => {
      if (data.user === username) {
        return
      }
      users[data.user] = data
    })
}

const loggedIn = () => username

exports.login = login
exports.connect = connect
exports.send = send
exports.peers = peers
exports.messages = messages
exports.users = users
exports.loggedIn = loggedIn

if (typeof window === 'object') {
  window.login = login
  window.connect = connect
  window.send = send
  window.peers = peers
  window.messages = messages
  window.users = users
  window.loggedIn = loggedIn
}
