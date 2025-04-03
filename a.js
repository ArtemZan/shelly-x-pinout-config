

<board-config id="bc"></board-config>

---

bc = document.getElementById('bc');

// "IO1: CCT light 1 - Cool"
// "IO8: CCT 1 Warm"

bc.setIo([
    {id: "1", "label": "IO1", "roleAssigned": "CCT Light 1 - Cool", color: "red"},
    {id: "8", "label": "IO8", "roleAssigned": "CCT Light 1 - Warm", color: "green"},
    {id: "4", "label": "IO4", "roleAssigned": "CCT Light 2 - Cool", color: "blue"},
    {id: "7", "label": "IO7", "roleAssigned": "CCT Light 2 - Warm", color: "red"},
    {id: "11", "label": "IO11"}, // color: default, roleAssigned: null
])

bc.setImageUrl("http://...")
bc.setSVG()

//bc.resetIos()

bc.getIo() -> [{"id": "1", "role": "CCT light 1 - Cool"}, {"id": "1", "role": null}, ...]

bc.addEventListener('io-change' | 'error' | 'io-click')