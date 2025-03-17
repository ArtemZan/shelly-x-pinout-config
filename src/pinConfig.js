const pinConfig = {
    renderPinsConfig(ios, pinsConfigContainerId) {
        const configContainer = document.getElementById(pinsConfigContainerId)

        configContainer.innerText = ""

        configContainer.append(...ios.map(this._renderPinConfig.bind(this)))
    },
    _createPinRoleSelect(io, rolesOptions) {
        const rolesSelect = document.createElement("select")

        const optionsElements = rolesOptions.map(option => {
            const element = document.createElement("option")
            element.value = option.id
            element.innerText = option.name
            return element
        })
        rolesSelect.append(...optionsElements)
        rolesSelect.value = io.role
        rolesSelect.disabled = !io.role

        rolesSelect.addEventListener("change", e => {
            boardConfig._updateIO({
                ...io,
                role: e.target.value
            })
        })

        return rolesSelect
    },
    _createPinActivationCheckbox(io, rolesSelectElement, rolesOptions) {
        const activationCheckbox = document.createElement("input")
        activationCheckbox.type = "checkbox"
        activationCheckbox.checked = !!io.role

        activationCheckbox.addEventListener("change", e => {
            const newRoleValue = e.target.checked ? rolesOptions[0]?.id : null
            rolesSelectElement.value = newRoleValue
            rolesSelectElement.disabled = !newRoleValue

            boardConfig._updateIO({
                ...io,
                role: newRoleValue
            })
        })

        return activationCheckbox
    },
    _renderPinConfig(io) {
        const ioContainer = document.createElement("div")
        ioContainer.classList.add("io-config")
        ioContainer.id = "io-config-" + io.id

        const rolesOptions = io.rolesAvailable?.map(availableRole => boardConfig.ioRoles.find(role => role.id === availableRole.role)) || boardConfig.ioRoles

        const name = "pin " + io.id

        const rolesSelect = this._createPinRoleSelect(io, rolesOptions)

        const activationCheckbox = this._createPinActivationCheckbox(io, rolesSelect, rolesOptions)

        const highlight = document.createElement("div")
        highlight.classList.add("config-highlight")

        ioContainer.append(
            activationCheckbox,
            name,
            rolesSelect,
            highlight
        )

        return ioContainer
    },
    highlightPinConfig(ioId) {
        const pinConfig = document.getElementById(`io-config-${ioId}`)
        const highlight = pinConfig.querySelector('.config-highlight')
        highlight.classList.add("active")
        setTimeout(() => {
            highlight.classList.remove("active")
        }, 500)
    }
}