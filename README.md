#NativeScript VideoRecorder

##Install
`tns plugin add nativescript-videorecorder`

#

###Useage

```js
var vr = require("nativescript-videorecorder");
var videorecorder = new vr.VideoRecorder();
var options = {
    saveFile:true, //default false | optional
    duration:30, //(seconds) default no limit | optional
    size:10, //(MB) default none | optional
    hd:true, //default  false low res | optional
    explaination:"Why do i need this permission" //optional on api 23
}
videorecorder.record(options)
.then((data)=>{
    console.log(data.file)
})
.catch((err)=>
{console.log(err)})
```