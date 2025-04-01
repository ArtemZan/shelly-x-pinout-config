(() => {
    class BoardConfigComponent extends HTMLElement {
        constructor() {
            console.log("HI")
            super()

            const container = document.createElement("div")
            container.classList.add("board-config")

            const select = this.#createSelect()

            container.append(select)

            const imageContainer = document.createElement("div")
            imageContainer.classList.add("image-container")
            container.append(imageContainer)

            const boardConfigContainer = this.#createBoardConfigContainer()

            container.append(boardConfigContainer)

            const shadowRoot = this.attachShadow({
                mode: 'open'
            })
            shadowRoot.appendChild(container)

            const boardConfigComponent = this

            boardConfig.init({
                imageContainer: imageContainer,
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
    }

    customElements.define('board-config', BoardConfigComponent);

})()