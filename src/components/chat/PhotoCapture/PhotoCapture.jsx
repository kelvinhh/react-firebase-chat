import "./photoCapture.css";
import {useRef, useState} from "react";

const PhotoCapture = ({onSendPhoto, isDisabled}) => {
    const videoRef = useRef(null);
    const _stream = useRef(null);
    const [ isCapturing, setIsCapturing ] = useState(false);

    const handleClick = async () => {
        if (isCapturing) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext("2d");
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                onSendPhoto(blob);
            }, "image/jpeg");
            setIsCapturing(false);
            _stream.current.getTracks().forEach((track) => track.stop());
        } else {
            setIsCapturing(true);
            if (navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({video: true});
                    _stream.current = stream;
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                } catch (err) {
                    console.error(`The following gUM error occurred: ${err}`);
                    setIsCapturing(false);
                }
            } else {
                console.log("getUserMedia not supported on your browser!");
            }
        }
    };

    return (
        <div className="photocapture">
            <button onClick={handleClick} disabled={isDisabled}>
                <img src="./camera.png" alt="Camera"/>
            </button>
            {isCapturing && <video ref={videoRef} style={{display: 'none'}}/>}
        </div>
    );
};

export default PhotoCapture;
