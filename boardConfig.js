var boardConfig = {
    pinsConfigContainerId: undefined,
    ioRoles: undefined,

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

    onHardwareSelect(url) {
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
        ]

        pinVisualisation.setImageUrl(url)

        this.setIos(ios)
    },

    setIos(ios) {
        this.ios = ios
        this.renderPinsConfig(ios)
    },

    renderPinsConfig(ios) {
        const configContainer = document.getElementById(this.pinsConfigContainerId)

        configContainer.innerText = ""

        configContainer.append(...ios.map(this.renderPinConfig.bind(this)))
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

        activationCheckbox.addEventListener("change", e => {
            const newRoleValue = e.target.checked ? options[0] : null
            rolesSelect.value = newRoleValue
            rolesSelect.disabled = !newRoleValue

            this.onPinConfigChange({
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