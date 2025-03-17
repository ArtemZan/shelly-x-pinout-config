(() => {
    boardConfig.init({
        imageContainerId: 'image-container', 
        hardwareSelectId: 'hardware-select', 
        pinsConfigContainerId: 'pins-config-container',
        onPinConfigChange: (io) => {
            // To DO: send PUT request
            console.log(io)
        },
        onError(message) {
            alert(message)
        }
    })
})()