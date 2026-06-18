import React, { useContext, useEffect, useState } from 'react'  // FIX 1: added useState import
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import upload  from '../../lib/upload'          // FIX 2: missing upload import
import { toast } from 'react-toastify'             // FIX 3: missing toast import

const ChatBox = () => {

  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext); // FIX 4: added chatVisible, setChatVisible

  const [input, setInput] = useState("");           // FIX 5: useSate -> useState

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })
        const userIDs = [chatUser.rId, userData.id]; // FIX 6: chatUser.rid -> chatUser.rId (match Firestore field)
        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef); // FIX 7: userChatsRef -> userChatRef (consistent naming)

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {             // FIX 7: userChatsRef -> userChatRef
              chatsData: userChatData.chatsData
            })
          }
        })
      }
    } catch (error) {
      toast.error(error.message)
    }
    setInput("");
  }

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]); // FIX 8: e.traget -> e.target (typo)

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date()
          })
        })
        const userIDs = [chatUser.rId, userData.id];   // FIX 6: chatUser.rid -> chatUser.rId
        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef); // FIX 7: userChatsRef -> userChatRef

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = "image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {              // FIX 7: userChatsRef -> userChatRef
              chatsData: userChatData.chatsData
            })
          }
        })
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // FIX 9: convertTimestamp must accept timestamp as a parameter
  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    // FIX 10: hour === 12 is PM too; fix AM logic (was subtracting 12 from AM hours)
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0'); // pad single-digit minutes
    return hour >= 12
      ? `${displayHour}:${displayMinute} PM`
      : `${displayHour}:${displayMinute} AM`;
  }

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse())
      })
      return () => { unSub(); }
    }
  }, [messagesId])

  return chatUser ? (
    // FIX 11: single quotes can't interpolate; changed to backtick template literals
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        {/* FIX 12: chatUser.useData.name -> chatUser.userData.name (typo)
            FIX 13: ternary syntax was broken — moved JSX outside the string */}
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000
            ? <img className='dot' src={assets.green_dot} alt="" />
            : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          // FIX 14: unclosed string in className — was: "s-img : "r-img"
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {/* FIX 15: ternary was missing the else branch and JSX structure was wrong */}
            {msg["image"]
              ? <img className="msg-img" src={msg.image} alt="" />
              : <p className="msg">{msg.text}</p>
            }
            <div>
              {/* FIX 16: extra closing brace }} -> } */}
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="send a message here..." />
        <input onChange={sendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    // FIX 11: single quotes -> backticks for template literal
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>chat anytime, anywhere</p>
    </div>
  )
}

export default ChatBox