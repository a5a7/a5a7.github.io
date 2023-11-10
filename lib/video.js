class Camera {
    constructor() {
        this.constraints = {video: true};
        this.video = document.createElement("video");
    }

    initialize(){
        navigator.mediaDevices.getUserMedia(this.constraints).then((mediaStream) => {
            this.video.srcObject = mediaStream;
            this.video.onloadedmetadata = () => { this.video.play(); };
        }).catch((err) => {
            console.log(`${err.name}: ${err.message}`);
        });
        document.body.appendChild(this.video);
    }
}