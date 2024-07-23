import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "./firebase";

export const upload = async (file, folder_name) => {
    const date = new Date();
    const storageRef = ref(storage, `${folder_name}/${date + file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                reject("Something went wrong" + error.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};
