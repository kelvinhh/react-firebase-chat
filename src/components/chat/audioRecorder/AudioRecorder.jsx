import "./audioRecorder.css"
import { useEffect, useRef, useState } from "react";

const AudioRecorder = ({ onSendAudio }) => {
        const audioContextRef = useRef(null);
        const sourceRef = useRef(null);
        const mediaRecorderRef = useRef(null);
        const audioChunksRef = useRef([]);

        const [isRecording, setIsRecording] = useState(false);

        useEffect(() => {
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia(
                        // constraints: audio and video for this app
                        {
                            audio: true,
                            video: false,
                        },
                    )
                    .then((stream) => {
                        const options = {
                            mediaStream: stream,
                        };

                        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                        sourceRef.curent = new MediaStreamAudioSourceNode(audioContextRef.current, options);

                        mediaRecorderRef.current = new MediaRecorder(stream);
                        mediaRecorderRef.current.ondataavailable = (event) => {
                            if (event.data.size > 0) {
                                audioChunksRef.current.push(event.data);
                            }
                        };
                        mediaRecorderRef.current.onstop = () => {
                            const audioBlob = new Blob(audioChunksRef.current, {type: 'audio/wav'});
                            const url = URL.createObjectURL(audioBlob);
                            audioChunksRef.current = [];
                            onSendAudio(url);
                        };
                    })
                    .catch((err) => {
                        console.error(`The following gUM error occurred: ${err}`);
                    });
            } else {
                console.log("new getUserMedia not supported on your browser!");
            }

        }, [onSendAudio]);

        const handleClick = () => {
            setIsRecording(!isRecording);
            console.log(isRecording);
            try {
                if (isRecording) {
                    mediaRecorderRef.current.stop();
                } else {
                    audioChunksRef.current = []; // Reset the chunks before starting a new recording
                    mediaRecorderRef.current.start();
                }
            } catch (error) {
                console.log(error);
            }
        };

        return (
            <div className="audiorecorder">
                <button onClick={handleClick}>
                    <img src="./mic.png" alt=""/>
                </button>
            </div>
        );
    }
;

export default AudioRecorder;