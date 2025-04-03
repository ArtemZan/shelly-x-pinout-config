(() => {
    class BoardConfigComponent extends HTMLElement {
        constructor() {
            super()

            const container = document.createElement("div")
            container.classList.add("board-config")

            const select = this.#createSelect()

            container.append(select)

            this.#imageContainer = document.createElement("pinout")
            container.append(this.#imageContainer)

            const boardConfigContainer = this.#createBoardConfigContainer()

            container.append(boardConfigContainer)

            const shadowRoot = this.attachShadow({
                mode: 'open'
            })
            shadowRoot.appendChild(container)

            const boardConfigComponent = this

            this.init({
                hardwareSelect: select,
                pinsConfigContainer: boardConfigContainer.querySelector("#pins-config-container"),
                resetPinsButton: boardConfigContainer.querySelector("#reset-pins-button"),
                boardConfigContainer: boardConfigContainer,
                onPinConfigChange: (updatedIO) => {
                    const event = new Event("pin-config-change")
                    event.updatedIO = updatedIO
                    boardConfigComponent.dispatchEvent(event)
                },
                onError(error) {
                    const event = new Event("pin-config-error")
                    event.error = error
                    boardConfigComponent.dispatchEvent(event)
                }
            })
        }

        #createBoardConfigContainer() {
            const boardConfigContainer = document.createElement("div")
            boardConfigContainer.id = "board-config-container"
            boardConfigContainer.style.display = "none"

            boardConfigContainer.innerHTML = `
                <div class="pins-config-container" id="pins-config-container">

                </div>
                <button id="reset-pins-button">Reset pins</button>
                `

            return boardConfigContainer
        }

        #createSelect() {
            const select = document.createElement("select")
            select.id = "hardware-select"
            select.classList.add("hardware-select")

            const options = this.querySelectorAll("option")
            console.log(this, [...options])

            const defaultOption = document.createElement("option")
            defaultOption.value = ""
            select.append(defaultOption)

            for (const option of options) {
                select.append(option.cloneNode(true))
            }

            return select
        }

        #imageContainer = undefined
        pinsConfigContainer = undefined
        resetPinsButton = undefined
        boardConfigContainer = undefined
        ioRoles = undefined
        ios = undefined

        async init({
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

            resetPinsButton.addEventListener("click", () => {
                this.setIos(this.ios.map(io => ({
                    ...io,
                    role: null
                })))
            })


            hardwareSelect.addEventListener("change", e => {
                this.#onHardwareSelect(e.target.value)
            })

            await this.#fetchRoles()
        }

        async #fetchRoles() {
            const response = await fetch("/backend/ioRoles.json")

            if (!response.ok) {
                this.onError(await response.text())
                return
            }

            this.ioRoles = await response.json()
        }

        async #onHardwareSelect(url) {
            // TO DO: fetch the ios from the backend
            const ios = await this._fetchIos()
            await pinVisualisation.setImageUrl(url)

            this.setIos(ios)

            this._addIosClickListener()

            this.boardConfigContainer.style.display = null
        }

        async _fetchIos() {
            const response = await fetch("/backend/ios.json")

            if (!response.ok) {
                this.onError(await response.text())
                return
            }

            return await response.json()
        }



        getIos() {
            return this.ios
        }

        _onPinClick(ioId) {
            pinConfig.highlightPinConfig(ioId)
        }

        _addIosClickListener() {
            for (const io of this.ios) {
                pinVisualisation.addPinClickListener(io.id, () => {
                    this._onPinClick(io.id)
                })
            }
        }

        _updateIO(updatedIO) {
            const updatedIOs = this.ios.map(io => io.id === updatedIO.id ? updatedIO : io)
            this.setIos(updatedIOs)
            this.onPinConfigChange(updatedIO)
        }
    }

    customElements.define('board-config', BoardConfigComponent);

})()