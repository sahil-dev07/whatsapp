import React, { useEffect, useState } from 'react'
import './styling/sidebar.css'
import SidebarChat from './SidebarChat';
// import {IconButton}  from '@mui/material'
// import DonutLargeIcon from '@mui/icons-material/DonutLarge';
// import ChatIcon from '@mui/icons-material/Chat';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Avatar } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'

import { collectionRef } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { useStateValue } from '../StateProvider'

const SideBar = () => {
    const [{ user }] = useStateValue()
    const [rooms, setRooms] = useState([])
    const [searchKeyword, setSearchKeyword] = useState('')
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
                <div className="sidebar-header-user-data">
                    <Avatar src={user.photoURL} />
                    <h2>{user.displayName}</h2>
                </div>
                {/* <div className="sidebar-header-right">

                    <IconButton >
                        <DonutLargeIcon />
                    </IconButton>
                    <IconButton >
                        <ChatIcon />
                    </IconButton>
                    <IconButton >
                        <MoreVertIcon />
                    </IconButton>

                </div> */}
            </div>
            <div className="sidebar-search">
                <div className="sidebar-search-container">
                    <SearchOutlinedIcon />
                    <input type="text" placeholder='search a chat' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                </div>
            </div>

            {/* <div className="sidebar-chats">
                <SidebarChat addNewChat />
                {
                    rooms.map((room) => {
                        return (
                            <SidebarChat key={room.id} id={room.id} name={room.data.name} />
                        )
                    })
                }
            </div> */}

            <div className="sidebar-chats">
                <SidebarChat addNewChat />
                {rooms
                    .filter((room) =>
                        room.data.name.toLowerCase().includes(searchKeyword.toLowerCase())
                    )
                    .map((room) => (
                        <SidebarChat key={room.id} id={room.id} name={room.data.name} />
                    ))}
            </div>
        </div>
    )
}

export default SideBar