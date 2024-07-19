import useChatStore from "../../lib/chatStore";
import useUserStore from "../../lib/userStore";
import { auth, db } from "../../lib/firebase";
import "./detail.css"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { chatId, user, isCurrentBlocked, isReceiverBlocked, changeChat, changeBlock } = useChatStore();
  const { currentUser } = useUserStore()

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.user_profile || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Hello world! Who are you?</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Char Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photo</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="./avatar.png" alt="" />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>{isCurrentBlocked ? "You are blocked" : isReceiverBlocked ? "User blocked" : "Blocked User"}</button>
        <button className="logout" onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail;