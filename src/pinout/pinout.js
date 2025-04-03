// Set hardware picture
// Render ios

const pinVisualisation = {
    imageUrl: undefined,

    init(imageContainer) {
        this.imageContainer = imageContainer;
    },

    async setImageUrl(url) {
        this.imageUrl = url

        await this.updateImage()
    },

    addPinClickListener(ioId, callback) {
        const pin = this.imageContainer.querySelector(`#io-${ioId}`)

        pin.addEventListener("click", e => {
            callback(e)
        })
    },

    // Returns if matched
    setPinHighlight({ id, bgColor, strokeOpacity, highlightSuffix }) {
        const highlight = this.imageContainer.querySelector(`#io-${id}-highlight${highlightSuffix || ""}`);

        // console.log("setPinHighlight: ", `#io-${id}-highlight${highlightSuffix || ""}`, highlight)

        if(!highlight) {
            return false
        }
        
        highlight.querySelectorAll("path").forEach(path => {
            path.setAttribute("fill", bgColor);
            // path.setAttribute("fill-opacity", strokeOpacity);
        })

        return true
    },

    setPinLabel({ id, color, labelText }) {
        const label = this.imageContainer.querySelector(`#io-${id}-label`);
        
        if (label) {
            const labelHolder = label.querySelector("tspan")

            labelHolder.innerHTML = labelText
            label.setAttribute("fill", color);
        } // if the image does not exist - already logged as error
    },
    async tryUpdateImage(url) {
        try {
            const response = await fetch(url);

            if (response?.status?.toString() !== "200") {
                return {
                    errorMessage: '{% trans "Cannot load module image. Please try again later." %}'
                }
            }

            let imageContentType = 'image/png'; // default image type

            // Notes:
            // 1. response headers must be iterated - cannot be accessed directly
            // 2. format of header entry:  {value: ['content-type', 'image/png'], done: false}
            for (let he of response.headers.entries()) {
                if (he[0] === 'content-type') {
                    imageContentType = he[1];
                    break;
                }
            }

            let imageContent = undefined;

            if (imageContentType === "image/svg+xml") {
                imageContent = await response.text();
                if (!imageContent || imageContent.toString().indexOf('<svg') === -1) {
                    return {
                        errorMessage: 'Image is not a valid SVG graphic.'
                    }
                }

                this.imageContainer.innerHTML = imageContent;
                // remove the width & height, as they mess up the layout
                let svg = this.imageContainer.querySelector(`svg`);
                svg?.removeAttribute('width');
                svg?.removeAttribute('height');

                return {}
            } else {
                imageContent = await response.blob();
                imageContent = await this.blobToDataUrl(imageContent);
                this.imageContainer.innerHTML = `<img src="${imageContent}" />`;
            }
        } catch (e) {
            return {
                errorMessage: '{% trans "Cannot load module image (2). Please try again later." %}',
                error: e
            }
        }
    },

    async updateImage() {
        const url = this.imageUrl;

        let errorMessage = undefined;
        let error = undefined;

        if (url) {
            const result = await this.tryUpdateImage(url)
            errorMessage = result.errorMessage
            error = result.error
        } else {
            errorMessage = '{% trans "No image specifed for that hardware form factor" %}';
        }

        if (errorMessage) {
            boardConfig.onError("Cannot load module/devkit image for interactive visualization.")
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
