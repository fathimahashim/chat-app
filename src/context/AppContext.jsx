import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                navigate('/profile');
                return;
            }

            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            await updateDoc(userRef, {
                lastSeen: Date.now()
            });

            setInterval(async () => {
                if (auth.currentUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000);

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        // guard against undefined userData or userData.id
        if (userData && userData.id) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                // guard against missing chats document
                if (!res.exists()) {
                    setChatData([]);
                    return;
                }

                const chatItems = res.data().chatsData;

                // guard against empty or undefined chatsData
                if (!chatItems || chatItems.length === 0) {
                    setChatData([]);
                    return;
                }

                const tempData = [];
                for (const item of chatItems) {
                    try {
                        const userRef = doc(db, 'users', item.rId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            tempData.push({ ...item, userData });
                        }
                    } catch (err) {
                        console.error("Error loading chat user:", err);
                    }
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            })
            return () => {
                unSub();
            }
        }
    }, [userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVisible, setChatVisible
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;