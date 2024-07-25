import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import {useEffect} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "./lib/firebase";
import useUserStore from "./lib/userStore";
import useChatStore from "./lib/chatStore";
import {Analytics} from "@vercel/analytics/react"

const App = () => {
    const {currentUser, isLoading, fetchUserInfo} = useUserStore();
    const {chatId} = useChatStore();

    useEffect(() => {
        const unSub = onAuthStateChanged(auth, (user) => {
            fetchUserInfo(user?.uid);
        });

        return () => {
            unSub();
        }
    }, [ fetchUserInfo ]);

    if (isLoading) {
        return (
            <div className="loading">Loading...</div>
        )
    }

    return (
        <div className="container">
            {
                currentUser ? (
                        <>
                            <List/>
                            {chatId && <Chat/>}
                            <Detail/>
                        </>
                    ) :
                    (<Login/>)
            }
            <Notification/>
            <Analytics/>
        </div>
    )
}

export default App;
