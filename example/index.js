(() => {
    const board = document.getElementById("board")

    board.addEventListener("pin-config-change", e => {
        console.log("pin-config-change: ", e.updatedIO)
    })

    board.addEventListener("pin-config-error", e => {
        console.log("pin-config-error: ", e.error)
    })
})()