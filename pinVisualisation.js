// Init
// Set hardware picture
// Render ios

var pinVisualisation = {
    MAX_PINS: "{{ configurator.MAX_GPIO_PINS }}",
    colorInput: 'red',
    colorOutput: 'blue',
    colorInvalid: 'grey',
    container: undefined,
    pinsListTable: undefined,
    idPinsListSvg: undefined,
    pinsListSvg: undefined,
    idImage: undefined,
    image: undefined,
    imageUrl: undefined,

    init(idImage, container) {
        this.container = (typeof container === 'string' ? document.querySelector('#' + container) : container) || document;
        this.idImage = idImage;
        this.image = this.container.querySelector('#' + this.idImage);
    },

    setImageUrl(url) {
        this.imageUrl = url

        this.updateImage()
    },

    setPin(id, color, strokeOpacity, functionDescr) {
        let path = this.image?.querySelector(`path#pin-${id}`);
        if (path) {
            path.setAttribute("stroke", color);
            path.setAttribute("stroke-opacity", strokeOpacity);
        } // if the image does not exist - already logged as error

        let elPinColor = this.pinsListTable?.querySelector(`#pin-${id}-color`);
        let elPinFunction = this.pinsListTable?.querySelector(`#pin-${id}-function`);
        if (elPinColor && elPinFunction) {
            elPinColor.style.backgroundColor = color;
            elPinColor.style.opacity = strokeOpacity;
            elPinFunction.innerHTML = functionDescr ?? '&mdash;';
        } // if the table does not exist - already logged as error
    },
    clearPins() {
        for (let i = 0; i < this.MAX_PINS; i++) {
            this.setPin(i, this.colorInvalid, 0, undefined);
        }
    },
    visualizePinsFromInputs(event) {
        const currentInput = event?.currentTarget;
        let ni = parseInt(this.inputNumberOfInputs?.value) || 0;
        let no = parseInt(this.inputNumberOfOutputs?.value) || 0;

        if (ni + no > this.MAX_PINS) {
            if (currentInput === this.inputNumberOfInputs) {
                ni = this.MAX_PINS - no;
                this.inputNumberOfInputs.value = ni;
            } else if (currentInput === this.inputNumberOfOutputs) {
                no = this.MAX_PINS - ni;
                this.inputNumberOfOutputs.value = no;
            }
        }

        this.clearPins();
        if (ni > 0) {
            for (let i = 0; i < Math.min(ni, this.MAX_PINS); i++) {
                this.setPin(i, this.colorInput, 1, '{% trans "Input" %}');
            }
        }
        if (no > 0) {
            for (let i = this.MAX_PINS - 1; i >= Math.max(0, this.MAX_PINS - no); i--) {
                this.setPin(i, this.colorOutput, 1, '{% trans "Output" %}');
            }
        }
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

                this.image.innerHTML = imageContent;
                // remove the width & height, as they mess up the layout
                let svg = this.image.querySelector('svg');
                svg?.removeAttribute('width');
                svg?.removeAttribute('height');
                this.visualizePinsFromInputs();

                return {}
            } else {
                imageContent = await response.blob();
                imageContent = await this.blobToDataUrl(imageContent);
                this.image.innerHTML = `<img src="${imageContent}" />`;
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
