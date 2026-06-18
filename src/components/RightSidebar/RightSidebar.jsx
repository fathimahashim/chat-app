import React, { useContext, useEffect, useState } from 'react'  // FIX 1: added useState import
import './RightSidebar.css'
import { AppContext } from '../../context/AppContext'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'


const RightSidebar = () => {

  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);  // FIX 1: useState now imported, works correctly


  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image)
      }
    })
    setMsgImages(tempVar);
  }, [messages])


  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {/* FIX 2: green dot and name were in wrong order — dot was inside h3 before name */}
          {Date.now() - chatUser.userData.lastSeen <= 70000
            ? <img src={assets.green_dot} className='dot' alt="" />
            : null}
          {' '}{chatUser.userData.name}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img onClick={() => window.open(url)} key={index} src={url} alt='' />
          ))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      {/* FIX 3: Onclick -> onClick (JSX is case-sensitive) */}
      <button onClick={() => logout()}>Logout</button>
    </div>   // FIX 4: <div/> -> </div> (closing tag was wrong, would crash)
  )
}

export default RightSidebar