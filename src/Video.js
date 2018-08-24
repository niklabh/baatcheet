import React, { Component } from 'react'
import PropTypes from 'prop-types'
import config from './config'

import './Video.css'

const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet_video', 'https://baatcheet.herokuapp.com')
let connection

// chat class
class Video extends Component {
  constructor (args) {
    super(args)

    this.state = {
      subscribed: false,
      modal: false
    }

    this.connect = this.connect.bind(this)
    this.makeVideoCall = this.makeVideoCall.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    const { user, peerId, videoCalling } = nextProps

    if (!videoCalling || !peerId || !user) {
      return
    }

    this.setState({modal: true})

    if (this.state.subscribed) {
      return
    }

    hub.subscribe(user)
      .on('data', (signal) => {
        console.log('received signal', signal)

        navigator.getUserMedia({ video: true, audio: true }, (stream) => {
          const peerId = signal.peerId
          const peer = this.connect(peerId, false, stream)

          peer.signal(signal)

          this.setState({subscribed: true})
        }, (error) => {
          console.error(error)
        })
      })
  }

  connect (peerId, initiator, stream) {
    const { user } = this.props

    if (connection) {
      return connection
    }

    const peer = new Peer({ initiator, wrtc, config, stream })

    peer.on('signal', (signal) => {
      console.log(`signalling ${peerId}`, Object.assign(signal, {peerId: user}))
      hub.broadcast(peerId, Object.assign(signal, {peerId: user}))
    })

    peer.on('error', console.error)

    peer.on('connect', () => {
      console.log(`connected with ${peerId}`)
      if (initiator) {
        peer.send(`Connected with ${user}`)
      }
    })

    peer.on('data', (data) => {
      console.log(`message from ${peerId}`, data.toString())
    })

    peer.on('stream', function (stream) {
      // got remote video stream, now let's show it in a video tag
      const video = document.querySelector('#incoming')
      video.src = window.URL.createObjectURL(stream)
      video.play()
    })

    connection = peer

    return peer
  }

  makeVideoCall () {
    navigator.getUserMedia({ video: true, audio: true }, (stream) => {
      this.connect(this.props.peerId, true, stream)
    }, (error) => {
      console.error(error)
    })
  }

  render () {
    return (
      <div id='myModal' className='modal' style={this.state.modal ? {display: 'block'} : {}} >
        <div className='modal-content'>
          <div className='videoCall'>
            <video id='incoming'>Your browser does not support the video tag.</video>
            <button onClick={this.makeVideoCall}>Call</button>
          </div>
        </div>
      </div>
    )
  }
}

Video.propTypes = {
  videoCalling: PropTypes.bool,
  user: PropTypes.string,
  peerId: PropTypes.string
}

export default Video
