class Upload {
    static uploadPicture = async (e, img, loadImage = null) => {                    
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {                    
                img.onerror = function() {
                    alert('Error loading image');
                };
            
                if (loadImage)
                    loadImage(event.target.result)
                else
                    img.src = event.target.result;
            };
            
            reader.onerror = function() {
                alert('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    }

    static uploadVideo = async (e, loadVideo) => {                    
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        
        loadVideo(url);
    }
}