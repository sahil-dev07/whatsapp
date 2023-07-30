import { Avatar } from '@mui/material'
import React, { useEffect, useState } from 'react'
import './styling/sidebarChat.css'
import { collectionRef, db } from '../firebase'
import { addDoc, collection, orderBy, query, onSnapshot } from 'firebase/firestore'
import { Link } from 'react-router-dom'

const SidebarChat = ({ addNewChat, id, name }) => {
    const [seed, setSeed] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000))
    }, [])

    useEffect(() => {
        if (id) {
            const messageRef = collection(db, 'rooms', id, 'messages')

            const q = query(messageRef, orderBy('timestamp', 'desc'))

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map((doc) => {
                    return doc.data().message
                });

                setMessages(messagesData);
                // console.log(messages);
            });

            return () => unsubscribe();
        }
    }, [id])

    const createChat = () => {
        const roomName = prompt("Enter the name for the chat")

        if (roomName) {
            // need to do database work
            addDoc(collectionRef, {
                name: roomName
            })
        }
    }

    return !addNewChat ? (
        // <Link to='/home' >

        <Link to={`/rooms/${id}`}>
            <div className='sidebarChat' >
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
                <div className="sidebarChat-info">
                    <h2>{name}</h2>
                    <p>{messages[0]}</p>
                </div>
            </div>
        </Link>
        // <div className='sidebarChat' >
        //     <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
        //     <div className="sidebarChat-info">
        //         <h2>{name}</h2>
        //         <p>last message</p>
        //     </div>
        // </div>
    ) : (
        <div onClick={createChat} className='sidebarChat'>
            <h2>Add new Room</h2 >
        </div >
    )
}

export default SidebarChat