import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Chat from './Chat'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<Chat />, document.getElementById('root'))
registerServiceWorker()
