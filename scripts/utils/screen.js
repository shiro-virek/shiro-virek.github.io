class Screen {
    static adaptImageToScreen = (img, canvas) => {
        let newImgHeight = 0;
        let newImgWidth = 0;
        let newOriginX = 0;
        let newOriginY = 0;

        if (canvas.width > canvas.height) {
            newImgHeight = canvas.height;
            newImgWidth = newImgHeight * img.width / img.height;
            newOriginY = 0;
            newOriginX = (canvas.width / 2) - (newImgWidth / 2);
        } else {
            newImgWidth = canvas.width;
            newImgHeight = newImgWidth * img.height / img.width;
            newOriginX = 0;
            newOriginY = (canvas.height / 2) - (newImgHeight / 2);
        }

        return { newImgHeight, newImgWidth, newOriginX, newOriginY}
    }    
}