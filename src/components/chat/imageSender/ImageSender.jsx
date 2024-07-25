import "./imageSender.css";

const ImageSender = ({onSendImage, isDisabled}) => {

    const handleImg = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            const newImg = {
                file: file,
                url: url
            };

            console.log(newImg);
            onSendImage(newImg);
        }
    };

    return (
        <div className="imagesender">
            <label htmlFor="file" className={isDisabled ? 'disabled' : ''}>
                <img src="./img.png" alt="Select an image"/>
            </label>
            <input
                type="file"
                id="file"
                style={{display: "none"}}
                onChange={handleImg}
                disabled={isDisabled}
            />
        </div>
    );
};

export default ImageSender;
