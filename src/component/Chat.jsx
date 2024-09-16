import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar } from "@mui/material"
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"
import SendIcon from "@mui/icons-material/Send"
import EditIcon from "@mui/icons-material/Edit"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import "./styling/chat.css"
import EmojiPicker from "emoji-picker-react"
import { useParams, useNavigate } from "react-router-dom"
import { auth, db, storage } from "../firebase"
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useStateValue } from "../StateProvider"
import { signOut } from "firebase/auth"
import { actionTypes } from "../reducer"
import AvatarModal from './AvatarModal'

const Chat = () => {
  const [{ user }, dispatch] = useStateValue()
  const navigate = useNavigate()
  const [seed, setSeed] = useState("")
  const [input, setInput] = useState("")
  const { roomId } = useParams()
  const [roomName, setRoomName] = useState("")
  const [messages, setMessages] = useState([])
  const [avatarUrl, setAvatarUrl] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [showNoImageSnackbar, setShowNoImageSnackbar] = useState(false);

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      dispatch({
        type: actionTypes.SET_USER,
        user: null,
      })
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }, [dispatch])

  const toggleEmojiPicker = useCallback(() => {
    setShowEmoji((prevShowEmoji) => !prevShowEmoji)
  }, [])

  const onEmojiClick = useCallback((e) => {
    setInput((prev) => prev + e.emoji)
    setShowEmoji(false)
  }, [])

  const formatTimestamp = useCallback((timestamp) => {
    if (timestamp?.seconds) {
      const dateObj = new Date(timestamp.seconds * 1000)
      return dateObj.toLocaleString()
    }
    return ""
  }, [])

  const lastMessageTimestamp = useMemo(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      return formatTimestamp(lastMessage.timestamp)
    }
    return null
  }, [messages, formatTimestamp])

  useEffect(() => {
    if (roomId) {
      const docRef = doc(db, "rooms", roomId)
      const unsubscribeRoom = onSnapshot(docRef, (snapshot) => {
        setRoomName(snapshot.data()?.name || "")
        setAvatarUrl(snapshot.data()?.avatarUrl || "")
      }, (error) => {
        console.error("Error fetching room data:", error);
      })

      const messagesRef = collection(db, "rooms", roomId, "messages")
      const q = query(messagesRef, orderBy("timestamp", "asc"))

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))

        setMessages(messagesData)
      }, (error) => {
        console.error("Error fetching messages:", error);
      })

      return () => {
        unsubscribeRoom()
        unsubscribeMessages()
      }
    }
  }, [roomId])

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000))
  }, [roomId])

  const sendMessage = useCallback(async (e) => {
    e.preventDefault()

    if (input.trim()) {
      try {
        await addDoc(collection(db, "rooms", roomId, "messages"), {
          name: user.displayName,
          message: input,
          timestamp: serverTimestamp(),
          email: user.email,
          userAvatar: user.photoURL,
        })

        setInput("")
      } catch (error) {
        console.error("Error adding message:", error)
      }
    }
  }, [input, roomId, user.displayName, user.email, user.photoURL])

  const handleAvatarClick = useCallback(() => {
    if (avatarUrl) {
      setShowAvatarModal(true)
    } else {
      setShowNoImageSnackbar(true)
    }
  }, [avatarUrl])

  const handleEditAvatar = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const storageRef = ref(storage, `room_avatars/${roomId}`)
          await uploadBytes(storageRef, file)
          const downloadURL = await getDownloadURL(storageRef)
          await updateDoc(doc(db, 'rooms', roomId), {
            avatarUrl: downloadURL
          })
          setAvatarUrl(downloadURL)
          console.log("Avatar uploaded successfully")
        } catch (error) {
          console.error("Error uploading avatar:", error)
        }
      }
    }
    input.click()
  }, [roomId])

  const handleLogout = useCallback(() => {
    setOpenLogoutDialog(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    await logout();
    setOpenLogoutDialog(false);
  }, [logout]);

  const handleBackClick = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className="chat">
      <div className="chat-header">
        <IconButton onClick={handleBackClick} className="back-button mobile-only">
          <ArrowBackIcon />
        </IconButton>
        <div className="chat-header-avatar">
          {avatarUrl ? (
            <Avatar
              src={avatarUrl}
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <AccountCircleIcon 
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer', fontSize: 50, color: '#DDD' }}
            />
          )}
          <IconButton className="edit-avatar-button" onClick={handleEditAvatar}>
            <EditIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="chat-header-info">
          <h3>{roomName}</h3>
          <p>{`last seen ${lastMessageTimestamp || 'N/A'}`}</p>
        </div>

        <div className="chat-header-right">
          <IconButton onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </div>
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

      <div className="chat-body">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.email === user.email ? "chat-receive" : ""
            }`}
          >
            {message.userAvatar ? (
              <Avatar 
                src={message.userAvatar} 
                className="chat-user-avatar"
              />
            ) : (
              <AccountCircleIcon 
                className="chat-user-avatar"
                style={{ fontSize: 43.75, color: '#DDD' }}
              />
            )}
            <div className="chat-message-content">
              <span className="chat-name">{message.name}</span>
              <p>{message.message}</p>
              <span className="chat-timestamp">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-footer">
        <InsertEmoticonIcon onClick={toggleEmojiPicker} />
        <form>
          <input
            type="text"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage} type="submit">
            <SendIcon />
          </button>
        </form>
        {showEmoji && (
          <EmojiPicker
            width="300px"
            onEmojiClick={onEmojiClick}
          />
        )}
      </div>

      {showAvatarModal && (
        <AvatarModal
          avatarUrl={avatarUrl || `https://avatars.dicebear.com/api/human/${seed}.svg`}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  )
}

export default React.memo(Chat)
