import "./chatList.css"
import AddUser from "./addUser/AddUser";
import { doc, getDoc, onSnapshot, updateDoc, collection, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useEffect, useState } from "react";
import useUserStore from "../../../lib/userStore";
import useChatStore from "../../../lib/chatStore";

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);
    const [chats, setChats] = useState([]);
    const [input, setInput] = useState("");
    const {currentUser} = useUserStore();
    const {changeChat} = useChatStore();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const items = res.data().chats;

            const promises = items.map(async (item) => {
                const userDocRef = doc(db, "users", item.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return {...item, user};
            });

            const chatData = await Promise.all(promises);

            setChats(chatData.sort((a, b) => b.updateAt - a.updateAt));
        });

        return () => {
            unSub();
        }
    }, [currentUser.id]);

    const handleSelect = async (chat) => {

        const userChats = chats.map((item => {
            const {user, ...rest} = item;
            return rest;
        }))

        const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {

            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);

        } catch (error) {
            console.log(error);
        }

    };

    const handleDelete = async (chat) => {
        try {
            // Delete document from 'chats' collection
            const chatRef = doc(db, "chats", chat.chatId);
            await deleteDoc(chatRef);

            // Delete field for each user in 'userchats'
            const userChatsRef = collection(db, "userchats");
            const userChatsDoc = await getDoc(doc(userChatsRef, chat.user.id));
            const currentUserChatsDoc = await getDoc(doc(userChatsRef, currentUser.id));

            if (userChatsDoc.exists() && currentUserChatsDoc.exists()) {
                const userChats = userChatsDoc.data().chats || [];
                const currentUserChats = currentUserChatsDoc.data().chats || [];

                // Find and remove the chat for the user
                let i = userChats.findIndex((item) => item.receiverId === currentUser.id);
                if (i !== -1) {
                    userChats.splice(i, 1);
                    await updateDoc(doc(userChatsRef, chat.user.id), {
                        chats: userChats,
                    });
                }

                // Find and remove the chat for the current user
                let j = currentUserChats.findIndex((item) => item.receiverId === chat.user.id);
                if (j !== -1) {
                    currentUserChats.splice(j, 1);
                    await updateDoc(doc(userChatsRef, currentUser.id), {
                        chats: currentUserChats,
                    });
                }
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const filterChats = chats.filter((chat) => chat.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                    <img src="/search.png" alt=""/>
                    <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}/>
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className="add"
                     onClick={() => setAddMode((prev) => !prev)}/>
            </div>
            {filterChats.map((chat) => (
                <div className="item" key={chat.chatId} onClick={() => handleSelect(chat)}
                     style={{backgroundColor: chat?.isSeen ? "transparent" : "#5183fe"}}>
                    <img src={chat.user.user_profile || "./avatar.png"} alt=""/>
                    <div className="texts">
                        <span>{chat.user.username}</span>
                        <p>{chat.lastMessage}</p>
                    </div>
                    {addMode && <button onClick={() => handleDelete(chat)}>delete</button>}
                </div>
            ))}
            {addMode && <AddUser/>}
        </div>
    )
}

export default ChatList;