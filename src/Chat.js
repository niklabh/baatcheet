import React, { Component } from 'react'
import Gravatar from 'react-gravatar'
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'react-bootstrap'
import uid from 'uid'
import EmojiPicker from 'emoji-picker-react'
import Video from './Video'
import config from './config'

import './Chat.css'

const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet', 'https://baatcheet.herokuapp.com')
const USERS = 'users'
const peers = {}

// chat class
class Chat extends Component {
  constructor (args) {
    super(args)

    this.state = {
      loggedIn: false,
      userName: '',
      fullName: '',
      email: '',
      users: {},
      messages: {},
      message: '',
      active: '',
      showConverstaion: false,
      emojiOpen: false,
      videoCalling: false
    }

    this.alert = this.alert.bind(this)
    this.login = this.login.bind(this)
    this.connect = this.connect.bind(this)
    this.send = this.send.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderLogin = this.renderLogin.bind(this)
    this.makeActive = this.makeActive.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.hideConversation = this.hideConversation.bind(this)
    this.addEmoji = this.addEmoji.bind(this)
    this.openEmoji = this.openEmoji.bind(this)
    this.closeEmoji = this.closeEmoji.bind(this)
    this.makeVideoCall = this.makeVideoCall.bind(this)
  }

  alert (message) {
    console.error(message)
  }

  login (event) {
    event.preventDefault()

    const { userName, fullName, email } = this.state

    if (!userName) {
      this.alert('username required')
      return
    }

    if (!fullName) {
      this.alert('fullName required')
      return
    }

    if (!email) {
      this.alert('email required')
      return
    }

    hub.subscribe(userName)
      .on('data', (signal) => {
        console.log('received signal', signal)

        const peerId = signal.peerId
        const peer = this.connect(peerId, false)

        peer.signal(signal)
      })

    setInterval(() => hub.broadcast(USERS, {userName, fullName, email}), 5000)

    hub.subscribe(USERS)
      .on('data', (data) => {
        if (data.userName === userName) {
          return
        }

        data.online = true

        setTimeout(() => {
          data.online = false
        }, 10000)

        this.setState({
          users: Object.assign(this.state.users, {[data.userName]: data})
        })
      })

    this.setState({loggedIn: true})
  }

  connect (peerId, initiator) {
    const { userName, messages } = this.state

    if (peers[peerId]) {
      return peers[peerId]
    }

    const peer = new Peer({ initiator, wrtc, config })

    peer.on('signal', (signal) => {
      console.log(`signalling ${peerId}`, Object.assign(signal, {peerId: userName}))
      hub.broadcast(peerId, Object.assign(signal, {peerId: userName}))
    })

    peer.on('error', console.error)

    peer.on('connect', () => {
      console.log(`connected with ${peerId}`)
      if (initiator) {
        this.setState({
          message: `Connected with ${userName}`
        })
        this.send()
      }
    })

    peer.on('data', (data) => {
      console.log(`message from ${peerId}`, data.toString())
      if (!Array.isArray(messages[peerId])) {
        this.setState({messages: Object.assign(messages, {[peerId]: []})})
      }

      const newMessages = [
        ...(messages[peerId] || []),
        {timestamp: Date.now(), message: data.toString().trim(), by: peerId, id: uid(10)}
      ]

      this.setState({
        messages: Object.assign(messages, {[peerId]: newMessages}),
        active: this.state.active || peerId
      })
    })

    peers[peerId] = peer

    return peer
  }

  send () {
    const { userName, messages, message } = this.state
    const peerId = this.state.active

    if (!peerId) {
      this.setState({message: ''})
      return
    }

    if (!message) {
      return
    }

    if (!peers[peerId] || !peers[peerId].connected) {
      this.alert(`${peerId} not connected`)
      return
    }

    peers[peerId].send(message)

    const newMessages = [
      ...(messages[peerId] || []),
      {timestamp: Date.now(), message: message.trim(), by: userName, id: uid(10)}
    ]

    this.setState({
      messages: Object.assign(messages, {[peerId]: newMessages}),
      message: '',
      emojiOpen: false
    })
  }

  handleChange (event) {
    this.setState({[event.target.id]: event.target.value})
  }

  connectUser (user) {
    this.connect(user, true)
    this.setState({
      active: user,
      showConverstaion: true
    })
  }

  makeActive (user) {
    this.setState({active: user})
  }

  handleEnter (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.send()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    this.scrollToBottom()
  }

  scrollToBottom () {
    const {conversation} = this.refs
    if (conversation) {
      conversation.scrollTop = conversation.scrollHeight - conversation.clientHeight
    }
  }

  hideConversation () {
    this.setState({
      showConverstaion: false
    })
  }

  addEmoji (emoji) {
    this.setState({
      message: this.state.message + String.fromCodePoint(`0x${emoji}`)
    })
  }

  openEmoji () {
    this.setState({
      emojiOpen: true
    })
  }

  closeEmoji () {
    this.setState({
      emojiOpen: false
    })
  }

  makeVideoCall () {
    this.setState({
      videoCalling: true
    })
  }

  renderLogin () {
    return (
      <div className='container app Signup'>
        <div className='row app-one'>
          <h1 id='header'>BaatCheet</h1>
          <form onSubmit={this.login} className='resigration'>
            <FormGroup controlId='userName' bsSize='large'>
              <ControlLabel>User Name</ControlLabel>
              <FormControl
                autoFocus
                type='text'
                value={this.state.userName}
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup controlId='fullName' bsSize='large'>
              <ControlLabel>Full Name</ControlLabel>
              <FormControl
                value={this.state.fullName}
                onChange={this.handleChange}
                type='text'
              />
            </FormGroup>
            <FormGroup controlId='email' bsSize='large'>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                value={this.state.email}
                onChange={this.handleChange}
                type='email'
              />
            </FormGroup>
            <Button
              block
              className='btn btn-success btn-lg btn-block'
              type='submit'
            >
              Start Chatting
            </Button>
          </form>
        </div>
      </div>
    )
  }

  render () {
    if (!this.state.loggedIn) {
      return this.renderLogin()
    }

    return (
      <div className='container app chatApp'>
        <Video videoCalling={this.state.videoCalling} user={this.state.userName} peerId={this.state.active} />
        <div className='row app-one'>

          <div className='col-sm-4 side' style={window.innerWidth < 768 && this.state.showConverstaion ? {display: 'none'} : {}}>
            <div className='side-one'>

              <div className='row heading'>
                <div className='col-sm-3 col-xs-3 heading-avatar'>
                  <div className='heading-avatar-icon'>
                    <Gravatar email={this.state.email} />
                  </div>
                </div>
                <div className='col-sm-1 col-xs-1 heading-dot pull-right'>
                  <i className='fa fa-ellipsis-v fa-2x  pull-right' aria-hidden='true' />
                </div>
                <div className='col-sm-2 col-xs-2 heading-compose pull-right'>
                  <i className='fa fa-comments fa-2x  pull-right' aria-hidden='true' />
                </div>
              </div>

              <div className='row searchBox'>
                <div className='col-sm-12 searchBox-inner'>
                  <div className='form-group has-feedback'>
                    <input id='searchText' type='text' className='form-control' name='searchText' placeholder='Search' />
                    <span className='glyphicon glyphicon-search form-control-feedback' />
                  </div>
                </div>
              </div>

              <div className='row sideBar'>
                {Object.keys(this.state.users).map((user) => (
                  <div key={user} className='row sideBar-body' onClick={() => this.connectUser(user)}>
                    <div className='col-sm-3 col-xs-3 sideBar-avatar'>
                      <div className='avatar-icon'>
                        <Gravatar email={this.state.users[user].email} />
                      </div>
                    </div>
                    <div className='col-sm-9 col-xs-9 sideBar-main'>
                      <div className='row'>
                        <div className='col-sm-8 col-xs-8 sideBar-name'>
                          <span className='name-meta'>{this.state.users[user].fullName} ({this.state.users[user].userName})</span>
                        </div>
                        <div className='col-sm-4 col-xs-4 pull-right sideBar-time'>
                          <span className='time-meta pull-right dot' style={{backgroundColor: this.state.users[user].online ? '#008000' : '#ff0000'}} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          <div className='col-sm-8 conversation'>

            <div className='row heading'>
              <div className='col-sm-1 col-xs-1 heading-dot' style={window.innerWidth < 768 ? {} : {display: 'none'}} onClick={this.hideConversation}>
                <i className='fa fa-arrow-left fa-2x' aria-hidden='true' />
              </div>
              <div className='col-sm-2 col-md-2 col-xs-2 heading-avatar'>
                <div className='heading-avatar-icon'>
                  {this.state.users[this.state.active]
                    ? <Gravatar email={this.state.users[this.state.active].email} />
                    : null
                  }
                </div>
              </div>
              <div className='col-sm-4 col-xs-4 heading-name'>
                <a className='heading-name-meta'>
                  {this.state.users[this.state.active]
                    ? this.state.users[this.state.active].fullName
                    : ''
                  }
                </a>
                <span className='heading-online'>Online</span>
              </div>
              <div className='col-sm-1 col-xs-1 heading-dot pull-right'>
                <i className='fa fa-ellipsis-v fa-2x pull-right' aria-hidden='true' />
              </div>
              {this.state.users[this.state.active] ? (
                <div className='col-sm-1 col-xs-1 heading-dot pull-right' onClick={this.makeVideoCall}>
                  <i className='fa fa-video-camera fa-2x pull-right' aria-hidden='true' />
                </div>
              ) : null}
              {this.state.emojiOpen ? <EmojiPicker onEmojiClick={this.addEmoji} onKeyPress={this.handleEnter} /> : null}
            </div>

            <div className='row message' id='conversation' ref={'conversation'}>
              {this.state.messages[this.state.active] ? this.state.messages[this.state.active].map((message) => (
                <div className='row message-body' key={message.id}>
                  <div className={`col-sm-12 message-main-${message.by === this.state.userName ? 'sender' : 'receiver'}`}>
                    <div className={message.by === this.state.userName ? 'sender' : 'receiver'}>
                      <div className='message-text'>
                        {message.message}
                      </div>
                      {(message.by === this.state.userName) && (
                        <span className='message-time pull-right'>✓</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : null }
            </div>

            <div className='row reply'>
              {this.state.emojiOpen ? (
                <div className='col-sm-1 col-xs-1 reply-emojis' onClick={this.closeEmoji}>
                  <i className='fa fa-arrow-down fa-2x' />
                </div>
              ) : (
                <div className='col-sm-1 col-xs-1 reply-emojis' onClick={this.openEmoji}>
                  <i className='fa fa-smile-o fa-2x' />
                </div>
              )}
              <div className='col-sm-9 col-xs-9 reply-main'>
                <textarea className='form-control' rows='1' id='message' value={this.state.message} onChange={this.handleChange} onKeyPress={this.handleEnter} />
              </div>
              <div className='col-sm-1 col-xs-1 reply-recording'>
                <i className='fa fa-microphone fa-2x' aria-hidden='true' />
              </div>
              <div onClick={this.send} className='col-sm-1 col-xs-1 reply-send'>
                <i className='fa fa-send fa-2x' aria-hidden='true' />
              </div>
            </div>

          </div>

        </div>

      </div>
    )
  }
}

export default Chat
