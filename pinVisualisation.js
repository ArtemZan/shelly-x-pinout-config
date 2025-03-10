window.pinVisualisation = {
    MAX_PINS: "{{ configurator.MAX_GPIO_PINS }}",
    colorInput: 'red',
    colorOutput: 'blue',
    colorInvalid: 'grey',
    container: undefined,
    idPinsTable: undefined,
    pinsListTable: undefined,
    idPinsListSvg: undefined,
    pinsListSvg: undefined,
    idNumberOfInputs: undefined,
    inputNumberOfInputs: undefined,
    idNumberOfOutputs: undefined,
    inputNumberOfOutputs: undefined,
    idImage: undefined,
    image: undefined,
    idImageSelector: undefined,
    imageSelector: undefined,

    init(idInputNumberInputs, idInputNumberOutputs, idImage, idImageSelector, idTable, container) {
        this.container = (typeof container === 'string' ? document.querySelector('#' + container) : container) || document;
        this.idNumberOfInputs = idInputNumberInputs;
        this.idNumberOfOutputs = idInputNumberOutputs;
        this.idImage = idImage;
        this.idImageSelector = idImageSelector;
        this.idPinsTable = idTable;

        this.initElementsAndEvents();
    },
    initElementsAndEvents(imageSelectorValue = undefined) { // split to allow re-attaching event handlers after replacing HTML with the server response
        this.image = this.container.querySelector('#' + this.idImage);
        this.imageSelector = this.container.querySelector('#' + this.idImageSelector);
        this.inputNumberOfInputs = this.container.querySelector('#' + this.idNumberOfInputs);
        this.inputNumberOfOutputs = this.container.querySelector('#' + this.idNumberOfOutputs);
        this.pinsListTable = this.container.querySelector('#' + this.idPinsTable);

        if (!this.pinsListTable) {
            console.error(`Invalid pin table - element id="#${this.idPinsTable}" is missing`);
            return;
        }

        this.inputNumberOfInputs?.addEventListener('change', this.visualizePinsFromInputs.bind(this));
        this.inputNumberOfOutputs?.addEventListener('change', this.visualizePinsFromInputs.bind(this));
        if (this.imageSelector) {
            this.imageSelector.addEventListener('change', this.updateImageFromSelect.bind(this));
            if (imageSelectorValue) {
                this.imageSelector.value = imageSelectorValue;
            }
            this.imageSelector.dispatchEvent(new Event('change'));
        }
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
        for (let i=0; i < this.MAX_PINS; i++) {
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
            for (let i = this.MAX_PINS-1; i >= Math.max(0, this.MAX_PINS - no); i--) {
                this.setPin(i, this.colorOutput, 1, '{% trans "Output" %}');
            }
        }
    },
    async updateImageFromSelect(event) {
        let errorMessage = undefined;
        let imageContent = undefined;
        let imageContentType = 'image/png'; // default image type
        let url = this.imageSelector?.value;
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
