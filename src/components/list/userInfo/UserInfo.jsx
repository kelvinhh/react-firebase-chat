import "./userInfo.css"
import useUserStore from "../../../lib/userStore";
import {useState} from "react";

const UserInfo = () => {
    const {currentUser} = useUserStore();
    const [ showInfo, setShowInfo ] = useState(false);
    const [ edit, setEdit ] = useState(false);

    const handleMore = () => {
        if (showInfo) {
            setShowInfo(false);
        } else {
            setShowInfo(true);
        }
        return;
    };

    const handleEdit = () => {
        if (edit) {
            setEdit(false);
        } else {
            setEdit(true);
        }
        return;
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
                {showInfo && (<div>Info</div>)}
                {edit && (<div>Edit</div>)}
            </div>
        </div>
    )
}

export default UserInfo;