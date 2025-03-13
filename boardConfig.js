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
            {
                id: "INPUT",
                name: "Input"
            },
            {
                id: "OUTPUT",
                name: "Output"
            },
            {
                id: "PWM",
                name: "PWM"
            }
        ]

        hardwareSelect.addEventListener("change", e => {
            this.onHardwareSelect(e.target.value)
        })
    },

    async onHardwareSelect(url) {
        // TO DO: fetch the ios from the backend
        const ios = [
            {
                "id": 1,
                "role": "INPUT"
            },
            {
                "id": 2,
                "role": null
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
                "role": null,
                "rolesAvailable": [
                    {
                        role: "INPUT",
                        group: "INPUT",
                    },
                    {
                        role: "OUTPUT",
                        group: "OUTPUT"
                    },
                    {
                        role: "PWM",
                        group: "OUTPUT"
                    }
                ] // if provided - limit roles; if missing - all roles are allowed 
            },
            {
                "id": 6,
                "role": null,
                "rolesAvailable": [
                    {
                        role: "INPUT",
                        group: "INPUT",
                    },
                    {
                        role: "OUTPUT",
                        group: "OUTPUT"
                    },
                    {
                        role: "PWM",
                        group: "OUTPUT"
                    }
                ]
            },
            {
                "id": 7,
                "role": null,
                "rolesAvailable": [
                    {
                        role: "INPUT",
                        group: "INPUT",
                    },
                    {
                        role: "OUTPUT",
                        group: "OUTPUT"
                    },
                    {
                        role: "PWM",
                        group: "OUTPUT"
                    }
                ]
            },
            {
                "id": 8,
                "role": null,
                "rolesAvailable": [
                    {
                        role: "INPUT",
                        group: "INPUT",
                    },
                    {
                        role: "OUTPUT",
                        group: "OUTPUT"
                    },
                    {
                        role: "PWM",
                        group: "OUTPUT"
                    }
                ]
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
            const roleName = this.ioRoles.find(role => role.id === io.role)?.name
            const name = (roleName || "IO") + " " + io.id

            pinVisualisation.setPinLabel({
                id: io.id,
                color: rolesColors[io.role]?.color || "#333333",
                labelText: name
            })

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

        const options = io.rolesAvailable?.map(availableRole => this.ioRoles.find(role => role.id === availableRole.role)) || this.ioRoles

        const optionsElements = options.map(option => {
            const element = document.createElement("option")
            element.value = option.id
            element.innerText = option.name
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
            const newRoleValue = e.target.checked ? options[0]?.id : null
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