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
    pinsConfigContainerId: undefined,
    resetPinsButtonId: undefined,
    boardConfigContainerId: undefined,
    ioRoles: undefined,
    ios: undefined,

    async init({
        imageContainerId = "image-container",
        hardwareSelectId = "hardware-select",
        pinsConfigContainerId = "pins-config-container",
        resetPinsButtonId = "reset-pins-button",
        boardConfigContainerId = "board-config-container",
        onPinConfigChange,
        onError
    }) {
        this.pinsConfigContainerId = pinsConfigContainerId
        this.onPinConfigChange = onPinConfigChange
        this.onError = onError
        this.resetPinsButtonId = resetPinsButtonId
        this.boardConfigContainerId = boardConfigContainerId

        pinVisualisation.init(imageContainerId)

        const hardwareSelect = document.getElementById(hardwareSelectId)

        const resetPinsButton = document.getElementById(this.resetPinsButtonId)
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

        const configContainer = document.getElementById(this.boardConfigContainerId)
        configContainer.style.display = null
    },

    async _fetchIos() {
        const response = await fetch("/backend/ios.json")

        if(!response.ok) {
            this.onError(await response.text())
            return
        }

        return await response.json()
    },

    setIos(ios) {
        this.ios = ios
        pinConfig.renderPinsConfig(ios, this.pinsConfigContainerId)

        for (const io of ios) {
            const roleName = this.ioRoles.find(role => role.id === io.role)?.name
            const name = (roleName || "IO") + " " + io.id

            pinVisualisation.setPinLabel({
                id: io.id,
                color: rolesColors[io.role]?.color || "#333333",
                labelText: name
            })

            this._updateIoHighlight(io)
        }
    },

    getIos() {
        return this.ios
    },

    _updateIoHighlight(io) {
        pinVisualisation.setPinHighlight({
            id: io.id,
            bgColor: rolesColors[io.role]?.bgColor || "#bbbbbb",
            highlightSuffix: ""
        })

        if (io.rolesAvailable) {
            const activeGroup = io.rolesAvailable.find(role => role.role === io.role)?.group

            const activeBgColor = rolesColors[io.role]?.bgColor || "#bbbbbb"

            for (const availableRole of io.rolesAvailable) {
                pinVisualisation.setPinHighlight({
                    id: io.id,
                    bgColor: availableRole.group === activeGroup ? activeBgColor : "#bbbbbb",
                    highlightSuffix: `-${availableRole.group}`
                })
            }
        }
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