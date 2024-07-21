import { db } from '../../../../lib/firebase';
import './addUser.css'
import { useState } from 'react';
import useUserStore from '../../../../lib/userStore'
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, getDoc } from 'firebase/firestore';

const AddUser = () => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            }

        } catch (error) {
            console.log(error);
        }
    }

    const handleAdd = async () => {
        const chatsRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        try {
            const userChatsDoc = await getDoc(doc(userChatsRef, user.id));
            const currentUserChatsDoc = await getDoc(doc(userChatsRef, currentUser.id));

            if (userChatsDoc.exists() && currentUserChatsDoc.exists()) {
                const userChats = userChatsDoc.data().chats || [];
                const currentUserChats = currentUserChatsDoc.data().chats || [];

                const chatExists = userChats.some(chat => chat.receiverId === currentUser.id) ||
                    currentUserChats.some(chat => chat.receiverId === user.id);

                if (chatExists) {
                    console.log("Chat already exists. Skipping creation.");
                    return;
                }
            }

            const newChatsRef = doc(chatsRef);

            await setDoc(newChatsRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatsRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatsRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            });

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button>Search</button>
            </form>
            {user && <div className="user">
                <div className="detail">
                    <img src={user.user_profile || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>
            </div>}
        </div>
    )
}

export default AddUser;