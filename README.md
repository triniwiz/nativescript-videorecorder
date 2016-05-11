[![npm](https://img.shields.io/npm/v/nativescript-videorecorder.svg)](https://www.npmjs.com/package/nativescript-videorecorder)
[![npm](https://img.shields.io/npm/dt/nativescript-videorecorder.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-videorecorder)
#NativeScript VideoRecorder

##Install
`tns plugin add nativescript-videorecorder`

#

###Usage

###Android
```js
var vr = require("nativescript-videorecorder");
var videorecorder = new vr.VideoRecorder();
var options = {
    saveToGallery:true, //default false | optional
    duration:30, //(seconds) default no limit | optional
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
