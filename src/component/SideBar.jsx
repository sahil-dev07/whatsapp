import React, { useEffect, useState } from 'react'
import './styling/sidebar.css'
import SidebarChat from './SidebarChat';

import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Avatar, IconButton } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'

import { collectionRef } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { useStateValue } from '../StateProvider'

const SideBar = () => {
    const [{ user }] = useStateValue()
    const [rooms, setRooms] = useState([])
    useEffect(() => {

        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
            setRooms(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    data: doc.data(),
                }))
            )
        })

        return () => {
            unsubscribe()
        }

    }, [])
    return (
        <div className='sidebar'>

            <div className="sidebar-header">
                <Avatar src={user.photoURL} />
                <div className="sidebar-header-right">

                    <IconButton >
                        <DonutLargeIcon />
                    </IconButton>
                    <IconButton >
                        <ChatIcon />
                    </IconButton>
                    <IconButton >
                        <MoreVertIcon />
                    </IconButton>

                </div>
            </div>
            <div className="sidebar-search">
                <div className="sidebar-search-container">
                    <SearchOutlinedIcon />
                    <input type="text" placeholder='search or start a new chat' />
                </div>
            </div>

            <div className="sidebar-chats">
                <SidebarChat addNewChat />
                {
                    rooms.map((room) => {
                        return (
                            <SidebarChat key={room.id} id={room.id} name={room.data.name} />
                        )
                    })
                }
            </div>
        </div>
    )
}

export default SideBar