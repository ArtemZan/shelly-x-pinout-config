(() => {
    boardConfig.init({
        imageContainerId: 'image-container', 
        hardwareSelectId: 'hardware-select', 
        container: document.body,
        pinsConfigContainerId: 'pins-config-container',
        onPinConfigChange: (io) => {
            console.log(io)
        }
    })
})()