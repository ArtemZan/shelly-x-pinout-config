const rolesColors = {
    "INPUT": {
        bgColor: "#ccaa00",
        color: "black"
    },
    "OUTPUT": {
        bgColor: "#ff8800",
        color: "black"
    },
    "PWM": {
        bgColor: "#00ff00",
        color: "black"
    }
}

const boardConfig = {
    pinsConfigContainer: undefined,
    resetPinsButton: undefined,
    boardConfigContainer: undefined,
    ioRoles: undefined,
    ios: undefined,

    async init({
        imageContainer,
        hardwareSelect,
        pinsConfigContainer,
        resetPinsButton,
        boardConfigContainer,
        onPinConfigChange,
        onError
    }) {
        this.pinsConfigContainer = pinsConfigContainer
        this.onPinConfigChange = onPinConfigChange
        this.onError = onError
        this.resetPinsButton = resetPinsButton
        this.boardConfigContainer = boardConfigContainer

        pinVisualisation.init(imageContainer)

        resetPinsButton.addEventListener("click", () => {
            this.setIos(this.ios.map(io => ({
                ...io,
                role: null
            })))
        })

        
        hardwareSelect.addEventListener("change", e => {
            this._onHardwareSelect(e.target.value)
        })

        await this._fetchRoles()
    },

    async _fetchRoles() {
        const response = await fetch("/backend/ioRoles.json")

        if(!response.ok) {
            this.onError(await response.text())
            return
        }

        this.ioRoles = await response.json()
    },

    async _onHardwareSelect(url) {
        // TO DO: fetch the ios from the backend
        const ios = await this._fetchIos()
        await pinVisualisation.setImageUrl(url)
        
        this.setIos(ios)

        this._addIosClickListener()

        this.boardConfigContainer.style.display = null
    },

    async _fetchIos() {
        const response = await fetch("/backend/ios.json")

        if(!response.ok) {
            this.onError(await response.text())
            return
        }

        return await response.json()
    },

    

    getIos() {
        return this.ios
    },

    _onPinClick(ioId) {
        pinConfig.highlightPinConfig(ioId)
    },

    _addIosClickListener() {
        for(const io of this.ios) {
            pinVisualisation.addPinClickListener(io.id, () => {
                this._onPinClick(io.id)
            })
        }
    },

    _updateIO(updatedIO) {
        const updatedIOs = this.ios.map(io => io.id === updatedIO.id ? updatedIO : io)
        this.setIos(updatedIOs)
        this.onPinConfigChange(updatedIO)
    }
}