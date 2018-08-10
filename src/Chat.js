import React, { Component } from 'react'
import Gravatar from 'react-gravatar'
import './Chat.css'

class Chat extends Component {
  state = {
    username: 'nikhil',
    user: {
      name: 'Nikhil Ranjan',
      email: 'niklabh811@gmail.com'
    },
    peers: {
      nikhil: {name: 'Nikhil Ranjan', email: 'niklabh811@gmail.com'},
      raj: {name: 'Raj Kukreja'}
    },
    active: 'nikhil',
    messages: [
      {by: 'nikhil', message: 'Hyy, Its Awesome..!'},
      {by: 'raj', message: 'Ayyyyas dasdasday..!'},
      {by: 'raj', message: 'Ayyasdyyy..!'},
      {by: 'raj', message: 'Ayyyyyasdadadasd..!'},
      {by: 'raj', message: 'Ayya sdasdyyy..!'},
      {by: 'raj', message: 'Ayya sdasdyyy..!'},
      {by: 'raj', message: 'Ayya sdasdasdyyy..!'},
      {by: 'raj', message: 'Ayya sdasdaasdyyy..!'},
      {by: 'nikhil', message: 'Hyy, Its Awesome..!'},
      {by: 'nikhil', message: 'Hyy, Its Awesome..!'}
    ],
    newUser: false
  }

  send = () => {
    console.log(this)
  }

  showNewUser = () => {
    this.setState({newUser: true})
  }

  hideNewUser = () => {
    this.setState({newUser: false})
  }

  render () {
    return (
      <div className='container app'>
        <div className='row app-one'>

          <div className='col-sm-4 side'>
            <div className='side-one'>

              <div className='row heading'>
                <div className='col-sm-3 col-xs-3 heading-avatar'>
                  <div className='heading-avatar-icon'>
                    <Gravatar email={this.state.user.email} />
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
                {Object.keys(this.state.peers).map((user) => (
                  <div className='row sideBar-body'>
                    <div className='col-sm-3 col-xs-3 sideBar-avatar'>
                      <div className='avatar-icon'>
                        <Gravatar email={this.state.peers[user].email} />
                      </div>
                    </div>
                    <div className='col-sm-9 col-xs-9 sideBar-main'>
                      <div className='row'>
                        <div className='col-sm-8 col-xs-8 sideBar-name'>
                          <span className='name-meta'>{this.state.peers[user].name}</span>
                        </div>
                        <div className='col-sm-4 col-xs-4 pull-right sideBar-time'>
                          <span className='time-meta pull-right'>18:18</span>
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
                {Object.keys(this.state.peers).map((user) => (
                  <div className='row sideBar-body'>
                    <div className='col-sm-3 col-xs-3 sideBar-avatar'>
                      <div className='avatar-icon'>
                        <Gravatar email={this.state.peers[user].email} />
                      </div>
                    </div>
                    <div className='col-sm-9 col-xs-9 sideBar-main'>
                      <div className='row'>
                        <div className='col-sm-8 col-xs-8 sideBar-name'>
                          <span className='name-meta'>{this.state.peers[user].name}</span>
                        </div>
                        <div className='col-sm-4 col-xs-4 pull-right sideBar-time'>
                          <span className='time-meta pull-right'>18:18</span>
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
                  <Gravatar email={this.state.peers[this.state.active].email} />
                </div>
              </div>
              <div className='col-sm-8 col-xs-7 heading-name'>
                <a className='heading-name-meta'>{this.state.peers[this.state.active].name}</a>
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

              {this.state.messages.map((message) => (
                <div className='row message-body'>
                  <div className={`col-sm-12 message-main-${message.by === this.state.username ? 'sender' : 'receiver'}`}>
                    <div className={message.by === this.state.username ? 'sender' : 'receiver'}>
                      <div className='message-text'>
                        {message.message}
                      </div>
                      <span className='message-time pull-right'>
                        Sun</span>
                    </div>
                  </div>
                </div>
              ))}
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
