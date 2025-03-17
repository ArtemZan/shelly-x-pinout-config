# Board pinout configuration module

## Usage

1. Add all the js files

```html
<script src="./boardConfig.js"></script>
<script src="./pinVisualisation.js"></script>
<script src="./pinConfig.js"></script>
```

2. Add the css

```html
<link rel="stylesheet" href="./boardConfig.css" />
```

3. Add the html of the module to your page

```html
<div class="board-config">
  <select id="hardware-select" class="hardware-select">
    <!-- Place your hardware options here -->

    <option value=""></option>
    <option value="/shellyx-devkit-4-relays 1.svg">
      ShellyX devkit 4 relays
    </option>
  </select>
  <div id="image-container"></div>

  <div id="board-config-container" style="display: none;">
    <div class="pins-config-container" id="pins-config-container"></div>
    <button id="reset-pins-button">Reset pins</button>
  </div>
</div>
```

4. Initialize the module

```js
boardConfig.init({
  imageContainerId: "image-container",
  hardwareSelectId: "hardware-select",
  pinsConfigContainerId: "pins-config-container",
  resetPinsButtonId: "reset-pins-button",
  boardConfigContainerId: "board-config-container",
  onPinConfigChange: (io) => {
    // To DO: send PUT request
    console.log(io);
  },
  onError(message) {
    alert(message);
  },
});
```

## API

`
boardConfig.init
`
 - Initializes the hardware dropdown
 - Fetches ios roles
 - When hardware is selected fetches ios state, loads the image and renders the configuration of the pins

`
boardConfig.getIos()
`

`
boardConfig.setIos(ios)
`