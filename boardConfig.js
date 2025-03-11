const rolesColors = {
    "input": "#ffff00",
    "output": "#ff8800",
    "PWM": "#00ff00"
}

var boardConfig = {
    pinsConfigContainerId: undefined,
    ioRoles: undefined,
    ios: undefined,

    init({
        imageContainerId,
        hardwareSelectId,
        container,
        pinsConfigContainerId,
        onPinConfigChange
    }) {
        this.pinsConfigContainerId = pinsConfigContainerId
        this.onPinConfigChange = onPinConfigChange

        pinVisualisation.init(imageContainerId, container)

        const hardwareSelect = document.getElementById(hardwareSelectId)

        this.ioRoles = [
            "input",
            "output",
            "PWM"
        ]

        hardwareSelect.addEventListener("change", e => {
            this.onHardwareSelect(e.target.value)
        })
    },

    async onHardwareSelect(url) {
        // TO DO: fetch the ios from the backend
        const ios = [
            {
                "id": 0,
                "role": "input" // enum: input / switch / cct cool / cct hot / ...
            },
            {
                "id": 1,
                "role": null
            },
            {
                "id": 2,
                "role": null,
                "rolesAvailable": ["input", "output"] // if provided - limit roles; if missing - all roles are allowed 
            },
            {
                "id": 3,
                "role": null
            },
            {
                "id": 4,
                "role": null
            },
            {
                "id": 5,
                "role": null
            },
            {
                "id": 6,
                "role": null
            },
            {
                "id": 7,
                "role": null
            },
        ]

        await pinVisualisation.setImageUrl(url)
        pinVisualisation.clearPins()

        this.setIos(ios)
    },

    setIos(ios) {
        this.ios = ios
        this.renderPinsConfig(ios)

        for (const io of ios) {
            pinVisualisation.setPin(io.id, rolesColors[io.role], 1, "pin " + io.id)
        }
    },

    renderPinsConfig(ios) {
        const configContainer = document.getElementById(this.pinsConfigContainerId)

        configContainer.innerText = ""

        configContainer.append(...ios.map(this.renderPinConfig.bind(this)))
    },

    updateIO(updatedIO) {
        const updatedIOs = this.ios.map(io => io.id === updatedIO.id ? updatedIO : io)
        this.setIos(updatedIOs)
        this.onPinConfigChange(updatedIO)
    },
    renderPinConfig(io) {
        const ioContainer = document.createElement("div")
        ioContainer.classList.add("io-config")

        const activationCheckbox = document.createElement("input")
        activationCheckbox.type = "checkbox"
        activationCheckbox.checked = !!io.role

        const name = "pin " + io.id

        const rolesSelect = document.createElement("select")

        const options = io.rolesAvailable || this.ioRoles
        const optionsElements = options.map(option => {
            const element = document.createElement("option")
            element.value = option
            element.innerText = option
            return element
        })
        rolesSelect.append(...optionsElements)
        rolesSelect.value = io.role
        rolesSelect.disabled = !io.role

        rolesSelect.addEventListener("change", e => {
            this.updateIO({
                ...io,
                role: e.target.value
            })
        })


        activationCheckbox.addEventListener("change", e => {
            const newRoleValue = e.target.checked ? options[0] : null
            rolesSelect.value = newRoleValue
            rolesSelect.disabled = !newRoleValue

            this.updateIO({
                ...io,
                role: newRoleValue
            })
        })

        ioContainer.append(
            activationCheckbox,
            name,
            rolesSelect
        )

        return ioContainer
    }
}