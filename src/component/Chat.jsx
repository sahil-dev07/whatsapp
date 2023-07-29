import React, { useState, useEffect } from 'react'
import { Avatar, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import SendIcon from '@mui/icons-material/Send';
import './styling/chat.css'
import EmojiPicker from 'emoji-picker-react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, doc, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useStateValue } from '../StateProvider';


const Chat = () => {
    const [{ user }] = useStateValue()
    const [seed, setSeed] = useState('')
    const [input, setInput] = useState('')
    const { roomId } = useParams()
    const [roomName, setRoomName] = useState('')
    const [messages, setMessages] = useState([])

    const [showEmoji, setShowEmoji] = useState(false)

    const toggleEmojiPicker = () => {
        setShowEmoji((prevShowEmoji) => !prevShowEmoji);
    };


    const onEmojiClick = (e) => {
        setInput(prev => prev + e.emoji)
        setShowEmoji(prev => !prev)
    }

    const formatTimestamp = (timestamp) => {
        if (timestamp?.seconds) {
            const dateObj = new Date(timestamp.seconds * 1000); // Convert to milliseconds
            const dateString = dateObj.toLocaleString(); // Convert to a human-readable string
            return dateString;
        }
        return ''; // Return an empty string if timestamp or seconds are undefined
    };
    // for last seen
    const getLastMessageTimestamp = () => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            return formatTimestamp(lastMessage.timestamp);
        }
        return null; // Return null if there are no messages
    };

    useEffect(() => {
        if (roomId) {
            const docRef = doc(db, 'rooms', roomId)
            onSnapshot(docRef, (snapshot) => {
                setRoomName(snapshot.data().name)
            })

            // const mess = collection(db, 'rooms', roomId, 'messages')
            // onSnapshot(mess, (snapshot) => {
            //     snapshot.docs.forEach((doc) => {
            //         console.log(doc.data())
            //     })
            // })

            const messagesRef = collection(db, 'rooms', roomId, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            // const unsubscribe = onSnapshot(q, (snapshot) => {
            //     const messagesData = [];
            //     snapshot.forEach((doc) => {
            //         messagesData.push({
            //             name: doc.data().name,
            // message: doc.data().message,
            // timestamp: doc.data().timestamp
            //         });
            //         // console.log(doc.data().message)
            //     });
            //     setMessages(messagesData);
            //     console.log(messagesData)
            // });

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesData = snapshot.docs.map((doc) => ({
                    name: doc.data().name,
                    message: doc.data().message,
                    timestamp: doc.data().timestamp,
                    email: doc.data().email
                }));

                setMessages(messagesData);
                // console.log(messages);
            });

            return () => unsubscribe();
        }

    }, [roomId])


    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000))
    }, [roomId])


    const sendMessage = async (e) => {
        e.preventDefault()

        try {
            // Get the current server timestamp using serverTimestamp()
            const timestamp = serverTimestamp();






            // Add the newMessage object to Firestore in the messages subcollection of the room with roomId
            await addDoc(
                collection(db, 'rooms', roomId, 'messages'),
                {
                    name: user.displayName,
                    message: input,
                    timestamp: timestamp,
                    email: user.email
                }
            );


            // Clear the form after successful submission
            setInput('')
        } catch (error) {
            console.error('Error adding message:', error);
        }

        setInput('')

    }
    return (

        <div className="chat">
            <div className="chat-header">
                <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />

                <div className="chat-header-info">
                    <h3>{roomName}</h3>
                    <p>{`last seen ${getLastMessageTimestamp()}`}</p>
                </div>

                <div className="chat-header-right">
                    <IconButton >
                        <SearchIcon />
                    </IconButton>
                    <IconButton >
                        <AttachFileIcon />
                    </IconButton>
                    <IconButton >
                        <MoreVertIcon />
                    </IconButton>

                </div>
            </div>

            <div className="chat-body">

                {messages.map((message, ind) => {

                    return (<p className={`chat-message ${message.email === user.email && "chat-receive"}`} key={ind}>
                        <span className='chat-name'>{message.name}</span>
                        {message.message}
                        <span className='chat-timestap'>
                            {/* {new Date(message.timestamp?.toDate()).toUTCString()} */}

                            {formatTimestamp(message.timestamp)}
                        </span>
                    </p>
                    )
                })}



                {showEmoji && <EmojiPicker
                    emojiStyle='facebook'
                    width='300px'
                    onEmojiClick={onEmojiClick} />}
                {/* <EmojiPicker /> */}
            </div>

            <div className="chat-footer">
                <InsertEmoticonIcon onClick={toggleEmojiPicker} />
                <form >
                    <input type="text" placeholder='Type a message' name='input' value={input} onChange={(e) => { setInput(e.target.value) }} />
                    {/* <SendIcon className='send' onClick={sendMessage} type='submit' /> */}
                    <button onClick={sendMessage} type='submit'> <SendIcon /> </button>
                </form>
                {/* <MicIcon /> */}
            </div>
        </div>
    )
}

export default Chat