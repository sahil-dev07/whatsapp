import React, { useEffect, useState, useCallback, useMemo } from 'react'
import './styling/sidebar.css'
import SidebarChat from './SidebarChat';
import { Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { collectionRef } from '../firebase';
import { onSnapshot } from 'firebase/firestore';
import { useStateValue } from '../StateProvider'
import { auth } from '../firebase';
import { signOut } from "firebase/auth"
import { actionTypes } from "../reducer"
import AvatarModal from './AvatarModal';

const SideBar = () => {
    const [{ user }, dispatch] = useStateValue()
    const [rooms, setRooms] = useState([])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showNoImageSnackbar, setShowNoImageSnackbar] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
            setRooms(snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
            })))
        }, (error) => console.error("Error fetching rooms:", error))

        return () => unsubscribe()
    }, [])

    const handleLogout = useCallback(() => setOpenLogoutDialog(true), []);

    const confirmLogout = useCallback(async () => {
        try {
            await signOut(auth)
            dispatch({ type: actionTypes.SET_USER, user: null })
        } catch (error) {
            console.error("Error during logout:", error)
        }
        setOpenLogoutDialog(false);
    }, [dispatch]);

    const handleSearchChange = useCallback((e) => setSearchKeyword(e.target.value), []);

    const handleAvatarClick = useCallback((e) => {
        e.preventDefault();
        user.photoURL ? setShowAvatarModal(true) : setShowNoImageSnackbar(true);
    }, [user.photoURL]);

    const filteredRooms = useMemo(() => 
        rooms.filter((room) =>
            room.data.name.toLowerCase().includes(searchKeyword.toLowerCase())
        ),
    [rooms, searchKeyword]);

    return (
        <div className='sidebar'>
            <div className="sidebar-header">
                <div className="sidebar-header-user-data" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                    {user.photoURL ? (
                        <Avatar src={user.photoURL} alt={user.displayName} />
                    ) : (
                        <AccountCircleIcon style={{ fontSize: 40, color: '#DDD' }} />
                    )}
                    <h2>{user.displayName}</h2>
                </div>
                <div className="sidebar-header-right">
                    <IconButton onClick={handleLogout} className="logout-button">
                        <ExitToAppIcon />
                    </IconButton>
                </div>
            </div>
            <div className="sidebar-search">
                <div className="sidebar-search-container">
                    <SearchOutlinedIcon />
                    <input 
                        type="text" 
                        placeholder='Search or start new chat' 
                        value={searchKeyword} 
                        onChange={handleSearchChange} 
                    />
                </div>
            </div>

            <div className="sidebar-chats">
                <SidebarChat addNewChat />
                {filteredRooms.map((room) => (
                    <SidebarChat 
                        key={room.id} 
                        id={room.id} 
                        name={room.data.name} 
                        avatarUrl={room.data.avatarUrl}
                    />
                ))}
            </div>
            <Dialog
                open={openLogoutDialog}
                onClose={() => setOpenLogoutDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmLogout} color="primary" autoFocus>
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
            {showAvatarModal && (
                <AvatarModal
                    avatarUrl={user.photoURL}
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
    )
}

export default React.memo(SideBar)