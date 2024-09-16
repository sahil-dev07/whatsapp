import React, { useState, useEffect } from 'react'
import { Avatar, Snackbar } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import './styling/sidebarChat.css'
import { collectionRef, db } from '../firebase'
import { addDoc, collection, orderBy, query, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import AvatarModal from './AvatarModal';

const SidebarChat = ({ addNewChat, id, name, avatarUrl }) => {
    const [seed, setSeed] = useState('')
    const [messages, setMessages] = useState([])
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [showNoImageSnackbar, setShowNoImageSnackbar] = useState(false)

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000))
    }, [])

    useEffect(() => {
        if (id) {
            const messageRef = collection(db, 'rooms', id, 'messages')
            const q = query(messageRef, orderBy('timestamp', 'desc'))
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map((doc) => doc.data().message)
                setMessages(messagesData)
            })
            return () => unsubscribe()
        }
    }, [id])

    const createChat = async () => {
        const roomName = prompt("Enter the name for the chat")
        if (roomName) {
            try {
                await addDoc(collectionRef, {
                    name: roomName,
                    avatarUrl: null
                })
            } catch (error) {
                console.error("Error creating room: ", error)
            }
        }
    }

    const handleAvatarClick = (e) => {
        e.preventDefault()
        if (avatarUrl) {
            setShowAvatarModal(true)
        } else {
            setShowNoImageSnackbar(true)
        }
    }

    return !addNewChat ? (
        <div className='sidebarChat'>
            <Link to={`/rooms/${id}`}>
                {avatarUrl ? (
                    <Avatar 
                        src={avatarUrl}
                        onClick={handleAvatarClick}
                        style={{ cursor: 'pointer' }}
                    />
                ) : (
                    <AccountCircleIcon 
                        onClick={handleAvatarClick}
                        style={{ cursor: 'pointer', fontSize: 56.25, color: '#DDD' }}
                    />
                )}
                <div className="sidebarChat-info">
                    <h2>{name}</h2>
                    <p>{messages[0]}</p>
                </div>
            </Link>
            {showAvatarModal && (
                <AvatarModal
                    avatarUrl={avatarUrl || `https://avatars.dicebear.com/api/human/${seed}.svg`}
                    onClose={() => setShowAvatarModal(false)}
                />
            )}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={showNoImageSnackbar}
                autoHideDuration={2000}
                onClose={() => setShowNoImageSnackbar(false)}
                message="No image found"
            />
        </div>
    ) : (
        <div onClick={createChat} className='sidebarChat'>
            <h2>Add new Room</h2>
        </div>
    )
}

export default SidebarChat