// import React, { useState } from 'react';
import SideBar from './component/SideBar';
import Chat from './component/Chat';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { useStateValue } from './StateProvider'

import './app.css'
import Login from './component/Login';

function App() {
  const [{ user }] = useStateValue()
  // const [messages, setmessages] = useState([])
  // const [user, setUser] = useState(null)

  return (
    <div className="app">
      {!user ? (
        <Login />
      ) : (
        <div className="app__body">
          <BrowserRouter >
            <SideBar />
            <Routes>
              <Route path='/' element={<Chat />} />

              <Route path='/rooms/:roomId' element={<Chat />} />
              <Route path='/home' element={<Link to='/'> <div>click me</div> </Link>} />

            </Routes>
          </BrowserRouter>
        </div>

      )}

    </div>
  );
}

export default App;
