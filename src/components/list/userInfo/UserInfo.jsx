import "./userInfo.css";
import useUserStore from "../../../lib/userStore";
import {useState} from "react";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../../../lib/firebase.js";

const UserInfo = () => {
    const {currentUser} = useUserStore();
    const [ showInfo, setShowInfo ] = useState(false);
    const [ edit, setEdit ] = useState(false);
    const [ info, setInfo ] = useState(currentUser.info || "");
    const [ status, setStatus ] = useState(currentUser.status || "");

    const handleMore = () => {
        setShowInfo(prev => !prev);
    };

    const handleEdit = async () => {
        if (edit) {
            // Save the new info and status to Firestore
            const currentUserRef = doc(db, "users", currentUser.id);
            await updateDoc(currentUserRef, {
                info: info,
                status: status,
            });
            console.log(info, status);

            setEdit(false);
        } else {
            setEdit(true);
        }
    };

    return (
        <div className="userInfo">
            <div className="user">
                <img src={currentUser.user_profile || "./avatar.png"} alt=""/>
                <h2>{currentUser.username}</h2>
            </div>
            <div className="wrapper">
                <div className="icons">
                    <button onClick={handleMore}>
                        <img src="./more.png" alt=""/>
                    </button>
                    <button onClick={handleEdit}>
                        <img src="./edit.png" alt=""/>
                    </button>
                </div>
                {showInfo && <div>Info: {info}</div>}
                {edit && (
                    <div className="info">
                        <input
                            type="text"
                            value={info}
                            onChange={(e) => setInfo(e.target.value)}
                            placeholder="Info"
                        />
                        <input
                            type="text"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="Status"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
