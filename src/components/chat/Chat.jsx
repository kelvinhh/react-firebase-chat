import { useState, useRef, useEffect } from "react";
import "./chat.css"
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import useChatStore from "../../lib/chatStore";
import useUserStore from "../../lib/userStore";
import { uploadImg, uploadAudio } from "../../lib/upload";
import AudioRecorder from "./audioRecorder/AudioRecorder";

const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });

    const {chatId, user, isCurrentBlocked, isReceiverBlocked} = useChatStore();
    const {currentUser} = useUserStore();

    const endRef = useRef(null);
    const isDisabled = (isCurrentBlocked || isReceiverBlocked);

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
            setChat(res.data());
        });

        return () => {
            unSub();
        };
    }, [chatId]);

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji);
    }

    const handleImg = (e) => {
        console.log(e);
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleSend = async () => {
        if (text === "") return;

        let imgUrl = "";

        try {

            if (img.file) {
                imgUrl = await uploadImg(img.file);
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && {img: imgUrl}),
                })
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnap = await getDoc(userChatsRef);

                if (userChatsSnap.exists()) {
                    const userChatsData = userChatsSnap.data();

                    const chatIndex = userChatsData.chats.findIndex((chat) => chat.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                    userChatsData.chats[chatIndex].updateAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });

        } catch (error) {
            console.log(error);
        }

        setImg({
            file: null,
            url: "",
        })

        setText("");
    }

    const messageTime = (msgCreatedAt) => {
        return Date.now() - msgCreatedAt < 60000 ? "Just now" : new Date(msgCreatedAt).toLocaleTimeString();
    };

    const handleSendAudio = async (audioBlob) => {

        const audioUrl = await uploadAudio(audioBlob);
        console.log(audioUrl);

        await updateDoc(doc(db, "chats", chatId), {
            messages: arrayUnion({
                senderId: currentUser.id,
                text,
                createdAt: new Date(),
                audioUrl: audioUrl,
            })
        });
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.user_profile || "./avatar.png"} alt=""/>
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Sit down</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt=""/>
                    <img src="./video.png" alt=""/>
                    <img src="./info.png" alt=""/>
                </div>
            </div>
            <div className="center">
                {chat?.messages.map(message => (
                    <div className={message.senderId === currentUser.id ? "message own" : "message"}
                         key={message?.createdAt}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt=""/>}
                            {message.text && <p>{message.text}</p>}
                            {/*{(!message.img && !message.text) && <p>Drop</p>}*/}
                            {message.audioUrl && (
                                <audio controls src={message.audioUrl}>
                                    Your browser does not support the audio element.
                                </audio>)}
                            <span>{messageTime(message.createdAt.toDate().getTime())}</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="button">
                <div className="icons">
                    <label htmlFor="file" className={isDisabled ? 'disabled' : ''}>
                        <img src="./img.png" alt=""/>
                    </label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleImg}
                           disabled={isCurrentBlocked || isReceiverBlocked}/>
                    <img src="./camera.png" alt=""/>
                    {/*<img src="./mic.png" alt=""/>*/}
                    <AudioRecorder onSendAudio={handleSendAudio} disabled={isDisabled}/>
                </div>
                <input type="text" placeholder="Type something..." onChange={e => setText(e.target.value)} value={text}
                       disabled={isDisabled}/>
                {!isDisabled &&
                    <div className="emoji">
                        <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)}/>
                        <div className="picker">
                            <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
                        </div>
                    </div>
                }
                <button className="sendButton" onClick={handleSend}
                        disabled={isDisabled}>Send
                </button>
            </div>
        </div>
    )
}

export default Chat;