import "./audioRecorder.css";
import {useRef, useState} from "react";

const AudioRecorder = ({onSendAudio, isDisabled}) => {
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const _stream = useRef(null);

    const [ isRecording, setIsRecording ] = useState(false);

    const handleClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            audioChunksRef.current = []; // Reset the chunks before starting a new recording
            setIsRecording(true);

            if (navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
                    _stream.current = stream;

                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunksRef.current.push(event.data);
                        }
                    };
                    mediaRecorderRef.current.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, {type: 'audio/wav'});
                        audioChunksRef.current = [];
                        onSendAudio(audioBlob);
                        _stream.current.getTracks().forEach((track) => {
                            if (track.readyState === 'live' && track.kind === 'audio') {
                                track.stop();
                            }
                        });
                    };

                    mediaRecorderRef.current.start();
                } catch (err) {
                    console.error(`The following gUM error occurred: ${err}`);
                    setIsRecording(false);
                }
            } else {
                console.log("getUserMedia not supported on your browser!");
            }
        }
    };

    return (
        <div className="audiorecorder">
            <button onClick={handleClick} disabled={isDisabled}>
                <img src="./mic.png" alt="Mic"/>
            </button>
        </div>
    );
};

export default AudioRecorder;
