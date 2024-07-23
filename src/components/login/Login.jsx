import "./login.css"
import {useState} from "react";
import {toast} from "react-toastify";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth, db} from "../../lib/firebase";
import {upload} from "../../lib/upload";
import {doc, setDoc} from "firebase/firestore";

const Login = () => {
    const [ avatar, setAvatar ] = useState({
        file: null,
        url: ""
    });
    const [ loading, setLoading ] = useState(false);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);

        const {email, password} = Object.fromEntries(formData);

        try {

            await signInWithEmailAndPassword(auth, email, password);

            toast.success("Logged in successfully");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

        const {username, email, password} = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            let imgUrl = "";
            if (avatar.file) {
                imgUrl = await upload(avatar.file, "images");
            }

            await setDoc(doc(db, "users", res.user.uid), {
                username: username,
                email: email,
                user_profile: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("User created successfully");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="text" placeholder="Password" name="password"/>
                    <button disabled={loading}>{loading ? "loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt=""/>
                        Upload an image
                    </label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar}/>
                    <input type="text" placeholder="Username" name="username"/>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="text" placeholder="Password" name="password"/>
                    <button disabled={loading}>{loading ? "loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login;