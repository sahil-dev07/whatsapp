// import { Button } from '@mui/material'

import React from 'react'
import './styling/login.css'
import { auth, provider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'
import { useStateValue } from '../StateProvider'
import { actionTypes } from '../reducer'

const Login = () => {
    const [{ user }, dispatch] = useStateValue() // eslint-disable-next-line
    const signin = (e) => {
        e.preventDefault()

        signInWithPopup(auth, provider)
            .then((result) => {
                // console.log(result)
                // console.log(result.user.email)

                dispatch({
                    type: actionTypes.SET_USER,
                    user: result.user
                })
            })
            .catch((err) => {
                alert(err.message)
                console.log(user)
            })

    }
    return (
        <div className="login">
            <div className="login-container">
                <img src="https://cdn.icon-icons.com/icons2/2104/PNG/512/chat_icon_129147.png" alt="img" />

                <div className="login-text">
                    <h1>Sign in to Chat Room</h1>
                </div>
                <button className='login-button' type='submit' onClick={signin} >
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

export default Login