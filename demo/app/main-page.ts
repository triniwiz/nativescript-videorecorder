import * as observable from 'data/observable';
import * as pages from 'ui/page';
import { HelloWorldModel } from './main-view-model';
import fs = require("file-system");
let page;
let vm = new HelloWorldModel();
import { AdvancedVideoRecorder } from "./recorder/src/ios/videorecorder";
let recorder;
let interval;
// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: pages.NavigatedData) {
    // Get the event sender
    page = <pages.Page>args.object;
    page.bindingContext = vm;
    recorder = page.getViewById('recorderView');
    vm.set('duration', recorder.duration);
    openPreview();
}

export function openPreview() {
    recorder.open({ hd: true }).then(
        () => {
            console.log('success');
        }, err => {
            console.log(err)
        }
    )
}

export function recordVideo() {
    recorder.record((err, data) => {
        if (err) {
            console.dir(err)
        } else {
            console.log(data.status)
            if (data.status === 'started') {
                interval = setInterval(() => {
                    vm.set('duration', recorder.duration);
                }, 1000);
            } else if (data.status === 'completed') {
                console.dir(data.file)
                if (data && data.file) {
                    console.dir(data.file)
                    page.bindingContext.set("selectedVideo", data.file);
                }
            }
        }
    });

    // page.bindingContext.recorder({ saveToGallery: true, hd: true })
    //     .then((data) => {
    //         page.bindingContext.set("selectedVideo", data.file);
    //     })
    //     .catch((err) => {
    //         console.dir(err)
    //     })
}

export function stopRecording() {
    const recorder = page.getViewById('recorderView');
    recorder.stop();
    clearInterval(interval);
}

