let BoardImage = {
    init(
        selHardwareSelect,
        selImageContainer,        
    ) {
        this.elHardwareSelect = document.querySelector(selHardwareSelect) || undefined;
        this.elImageContainer = document.querySelector(selImageContainer) || undefined;
        this.image = this.elImageContainer.querySelector("img")
        this.initEvents();
    },

    initEvents() {
        this.elHardwareSelect.addEventListener('change', this.handleSelectorChange.bind(this));
    },

    async handleSelectorChange(event) {
        let url = this.elHardwareSelect?.value;
        await this.loadImage(url)
    },

    async loadImage (url) {
        let errorMessage = undefined;
        let imageContent = undefined;
        let imageContentType = 'image/png'; // default image type
        let error = undefined;
        if (url) {
            try {
                let response = await fetch(url);
                if (response?.status?.toString() === "200") {
                    // Notes:
                    // 1. response headers must be iterated - cannot be accessed directly
                    // 2. format of header entry:  {value: ['content-type', 'image/png'], done: false}
                    for (let he of response.headers.entries()) {
                        if (he[0] === 'content-type') {
                            imageContentType = he[1];
                            break;
                        }
                    }

                    if (imageContentType === "image/svg+xml") {
                        imageContent = await response.text();
                        if (!!imageContent && imageContent.toString().indexOf('<svg') > -1) {
                            this.image.innerHTML = imageContent;
                            // remove the width & height, as they mess up the layout
                            let svg = this.image.querySelector('svg');
                            svg?.removeAttribute('width');
                            svg?.removeAttribute('height');
                            this.visualizePinsFromInputs();
                        } else {
                            errorMessage = 'Image is not a valid SVG graphic.';
                            imageContent = undefined;
                        }
                    } else {
                        imageContent = await response.blob();
                        imageContent = await this.blobToDataUrl(imageContent);
                        this.image.innerHTML = `<img src="${imageContent}" />`;
                    }
                } else {
                    errorMessage = '{% trans "Cannot load module image. Please try again later." %}';
                }
            } catch (e) {
                errorMessage = '{% trans "Cannot load module image (2). Please try again later." %}';
                error = e;
            }
        } else {
            errorMessage = '{% trans "No image specifed for that hardware form factor" %}';
        }
        if (errorMessage) {
            ShellyX.showToast("Cannot load module/devkit image for interactive visualization.", '', 5000);
            console.error(errorMessage);
        }
        if (error) {
            console.error(error);
        }
    },

    async blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result)
        reader.onerror = err => reject(err)
        reader.readAsDataURL(blob)
      })
    }
}
