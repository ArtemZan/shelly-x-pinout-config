(() => {
    const pinout = document.getElementById("pinout")

    console.log(pinout)

    pinout.setImageUrl("/backend/shellyx-devkit-4-relays 1.svg")

    fetch("/backend/ios.json").then(resp => resp.json()).then(pinout.setIos)
})()