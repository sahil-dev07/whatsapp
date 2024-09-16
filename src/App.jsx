// import React, { useState } from 'react';
import SideBar from "./component/SideBar"
import Chat from "./component/Chat"
import { BrowserRouter, Route, Routes, Link } from "react-router-dom"
import { useStateValue } from "./StateProvider"

import "./app.css"
import Login from "./component/Login"
import { useEffect } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import { actionTypes } from "./reducer"

function App() {
  const [{ user }, dispatch] = useStateValue()
  // const [messages, setmessages] = useState([])
  // const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("useeffect user : ", user)
        dispatch({
          type: actionTypes.SET_USER,
          user: user,
        })
      } else {
        // setUser(null)
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  return (
    <div className="app">
      {!user ? (
        <Login />
      ) : (
        <div className="app__body">
          <BrowserRouter>
            <SideBar />
            <Routes>
              <Route path="/" element={<Chat />} />

              <Route path="/rooms/:roomId" element={<Chat />} />
              <Route
                path="/home"
                element={
                  <Link to="/">
                    {" "}
                    <div>click me</div>{" "}
                  </Link>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </div>
  )
}

export default App
