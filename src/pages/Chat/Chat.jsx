import React, { useContext, useEffect, useState } from 'react'  // FIX 1: added useContext, useEffect, useState imports
import './Chat.css'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData])

  return (
    <div className="chat">
      {
        loading
        ? <p className='loading'>Loading....</p>
        : <div className="chat-container">
            <LeftSidebar />
            <ChatBox />
            <RightSidebar />
          </div>
      }   {/* FIX 2: closing } for the ternary was missing — caused the parse error */}
    </div>
  )
}

export default Chat