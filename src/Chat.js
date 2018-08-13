import React, { Component } from 'react'
import Gravatar from 'react-gravatar'
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Button
} from 'react-bootstrap'
import './Chat.css'

const Peer = require('simple-peer')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const hub = signalhub('baatcheet', 'https://baatcheet.herokuapp.com')
const USERS = 'users'
const peers = {}

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
      active: '',
      newUser: false
    }

    this.alert = this.alert.bind(this)
    this.login = this.login.bind(this)
    this.connect = this.connect.bind(this)
    this.send = this.send.bind(this)
    this.showNewUser = this.showNewUser.bind(this)
    this.hideNewUser = this.hideNewUser.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.renderLogin = this.renderLogin.bind(this)
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

        const {peerId} = signal.peerId
        const peer = this.connect(peerId, false)

        peer.signal(signal)
      })

    setInterval(() => hub.broadcast(USERS, {userName, fullName, email}), 5000)

    hub.subscribe(USERS)
      .on('data', (data) => {
        if (data.user === userName) {
          return
        }
        this.setState({users: Object.assign(this.state.users, {[data.user]: data})})
      })

    this.setState({loggedIn: true})
  }

  connect (peerId, initiator) {
    const { userName, messages } = this.state

    if (peers[peerId]) {
      return peers[peerId]
    }

    const peer = new Peer({ initiator, wrtc })

    peer.on('signal', (signal) => {
      console.log(`signalling ${peerId}`, Object.assign(signal, {peerId: userName}))
      hub.broadcast(peerId, Object.assign(signal, {peerId: userName}))
    })

    peer.on('error', console.error)

    peer.on('connect', () => {
      console.log(`connected with ${peerId}`)
    })

    peer.on('data', (data) => {
      console.log(`message from ${peerId}`, data.toString())
      if (!Array.isArray(messages[peerId])) {
        this.setState({messages: Object.assign(messages, {[peerId]: []})})
      }

      this.setState({messages: Object.assign(messages, {[peerId]: [...messages[peerId], {timestamp: Date.now(), message: data, by: peerId}]})})
    })

    peers[peerId] = peer

    return peer
  }

  send () {
    const { userName, messages } = this.state
    const peerId = this.state.active
    const comment = document.getElementById('comment')
    const message = comment ? comment.value : ''

    if (!message) {
      return
    }

    if (!peers[peerId] || !peers[peerId].connected) {
      this.alert(`${peerId} not connected`)
    }

    peers[peerId].send(message)

    this.setState({messages: Object.assign(messages, {[peerId]: [...messages[peerId], {timestamp: Date.now(), message: message, by: userName}]})})
  }

  showNewUser () {
    this.setState({newUser: true})
  }

  hideNewUser () {
    this.setState({newUser: false})
  }

  handleChange (event) {
    this.setState({[event.target.id]: event.target.value})
  }

  connectUser (user) {
    const { userName, messages } = this.state

    this.connect(user, true)
    this.hideNewUser()
    this.setState({active: user})
    this.setState({messages: Object.assign(messages, {[user]: [...messages[user], {timestamp: Date.now(), message: 'Chat End to End Secure', by: userName}]})})
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
        <div className='row app-one'>

          <div className='col-sm-4 side'>
            <div className='side-one'>

              <div className='row heading'>
                <div className='col-sm-3 col-xs-3 heading-avatar'>
                  <div className='heading-avatar-icon'>
                    <Gravatar email={this.state.email} />
                  </div>
                </div>
                <div className='col-sm-1 col-xs-1  heading-dot  pull-right'>
                  <i className='fa fa-ellipsis-v fa-2x  pull-right' aria-hidden='true' />
                </div>
                <div className='col-sm-2 col-xs-2 heading-compose  pull-right' onClick={this.showNewUser}>
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
                {Object.keys(this.state.messages).map((user) => (
                  <div className='row sideBar-body'>
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
                          <span className='time-meta pull-right'>✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            <div className='side-two' style={{left: this.state.newUser ? 0 : '-100%'}}>

              <div className='row newMessage-heading'>
                <div className='row newMessage-main'>
                  <div className='col-sm-2 col-xs-2 newMessage-back' onClick={this.hideNewUser}>
                    <i className='fa fa-arrow-left' aria-hidden='true' />
                  </div>
                  <div className='col-sm-10 col-xs-10 newMessage-title'>
                    New Chat
                  </div>
                </div>
              </div>

              <div className='row composeBox'>
                <div className='col-sm-12 composeBox-inner'>
                  <div className='form-group has-feedback'>
                    <input id='composeText' type='text' className='form-control' name='searchText' placeholder='Search People' />
                    <span className='glyphicon glyphicon-search form-control-feedback' />
                  </div>
                </div>
              </div>

              <div className='row compose-sideBar'>
                {Object.keys(this.state.users).map((user) => (
                  <div className='row sideBar-body' onClick={() => this.connectUser(user)}>
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
                          <span className='time-meta pull-right'>✓</span>
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
              <div className='col-sm-2 col-md-1 col-xs-3 heading-avatar'>
                <div className='heading-avatar-icon'>
                  {this.state.users[this.state.active]
                    ? <Gravatar email={this.state.users[this.state.active].email} />
                    : null
                  }
                </div>
              </div>
              <div className='col-sm-8 col-xs-7 heading-name'>
                <a className='heading-name-meta'>
                  {this.state.users[this.state.active]
                    ? this.state.users[this.state.active].fullName
                    : ''
                  }
                </a>
                <span className='heading-online'>Online</span>
              </div>
              <div className='col-sm-1 col-xs-1  heading-dot pull-right'>
                <i className='fa fa-ellipsis-v fa-2x  pull-right' aria-hidden='true' />
              </div>
            </div>

            <div className='row message' id='conversation'>

              <div className='row message-previous'>
                <div className='col-sm-12 previous'>
                  <a id='ankitjain28' name='20'>
                    Show Previous Message!
                  </a>
                </div>
              </div>

              {this.state.messages[this.state.active] ? Object.keys(this.state.messages[this.state.active]).map((message) => (
                <div className='row message-body'>
                  <div className={`col-sm-12 message-main-${message.by === this.state.username ? 'sender' : 'receiver'}`}>
                    <div className={message.by === this.state.userName ? 'sender' : 'receiver'}>
                      <div className='message-text'>
                        {message.message}
                      </div>
                      <span className='message-time pull-right'>Sun</span>
                    </div>
                  </div>
                </div>
              )) : null }
            </div>

            <div className='row reply'>
              <div className='col-sm-1 col-xs-1 reply-emojis'>
                <i className='fa fa-smile-o fa-2x' />
              </div>
              <div className='col-sm-9 col-xs-9 reply-main'>
                <textarea className='form-control' rows='1' id='comment' />
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
