[![npm](https://img.shields.io/npm/v/nativescript-videorecorder.svg)](https://www.npmjs.com/package/nativescript-videorecorder)
[![npm](https://img.shields.io/npm/dt/nativescript-videorecorder.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-videorecorder)
# NativeScript VideoRecorder

## Install
`tns plugin add nativescript-videorecorder`

### Usage

### Android
```js
var vr = require("nativescript-videorecorder");
var videorecorder = new vr.VideoRecorder();
var options = {
    saveToGallery:true, //default false | optional
    duration:30, //(seconds) default no limit | optional
    format:'mp4', //allows videos to be played on android devices | optional | recommended for cross platform apps
    size:10, //(MB) default none | optional #android
    hd:true, //default  false low res | optional
    explanation:"Why do i need this permission" //optional on api 23 #android
}

videorecorder.record(options)
.then((data)=>{
    console.log(data.file)
})
.catch((err)=>{
    console.log(err)
})
```


```js
var vr = require("nativescript-videorecorder");
var videorecorder = new vr.VideoRecorder();
var options = {
    saveToGallery:true, //default false | optional
    duration:30, //(seconds) default no limit | optional
    size:10, //(MB) default none | optional,
    format:'mp4', //allows videos to be played on android devices | optional | recommended for cross platform apps
    hd:true, //default  false low res | optional
}
videorecorder.record(options)
.then((data)=>{
    console.log(data.file)
})
.catch((err)=>{
    console.log(err)
})
```

##### AdvancedVideoView

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd" xmlns:recorder="nativescript-videorecorder/advanced">
<recorder:AdvancedVideoView quality="highest" cameraPosition="front" id="camera"/>

```

```ts
const advancedView = page.getViewById("camera");
advancedView.startRecording();
```

## Api

| Method                  | Default  | Type    | Description                                           |
| ----------------------- | -------- | ------- | ----------------------------------------------------- |
| start()                 |          | void    | Starts the camera preview                             |
| stop()                  |          | void    | Stop the camera preview                               |
| startRecording()        |          | void    | Start recording camera preview.                       |
| stopRecording()         |          | void    | Stop recording camera preview.                        |
| toggleCamera()          |          | void    | Toggles between front or the back camera.             |
| duration                |          | int     | Get the current recording video duration.             |
| cameraPosition          | BACK     | void    | Gets or Sets camera position                          |
| quality                 | MAX_480P | void    | Gets or sets Video Quality                            |
