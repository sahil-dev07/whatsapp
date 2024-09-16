import React, { useState, useEffect } from 'react';
import SideBar from "./component/SideBar"
import Chat from "./component/Chat"
import { BrowserRouter, Route, Routes, useParams, useNavigate } from "react-router-dom"
import { useStateValue } from "./StateProvider"
import "./app.css"
import Login from "./component/Login"
import { auth } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import { actionTypes } from "./reducer"

function App() {
  const [{ user }, dispatch] = useStateValue()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch({
          type: actionTypes.SET_USER,
          user: user,
        })
      } else {
        dispatch({
          type: actionTypes.SET_USER,
          user: null,
        })
      }
    })
    return () => unsubscribe()
  }, [dispatch])

  const MobileWrapper = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const handleBackToRooms = () => {
      navigate('/');
    };

    return (
      <>
        {(!roomId || !isMobile) && <SideBar />}
        {(roomId || !isMobile) && (
          <Chat onBackClick={isMobile ? handleBackToRooms : undefined} />
        )}
      </>
    );
  };

  return (
    <div className="app">
      {!user ? (
        <Login />
      ) : (
        <div className="app__body">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MobileWrapper />} />
              <Route path="/rooms/:roomId" element={<MobileWrapper />} />
            </Routes>
          </BrowserRouter>
        </div>
      )}
    </div>
  )
}

export default App
