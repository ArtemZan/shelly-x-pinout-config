(() => {

    // Will come from backend
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

    // BoardImage.init('#hardware-select', '#image-container')
    window.pinVisualisation.init(null, null, 'image-container', 'hardware-select', 'pins-table', document.body)
})()