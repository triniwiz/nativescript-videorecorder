import * as pages from '@nativescript/core/ui/page';
import { HelloWorldModel } from './main-view-model';
import { Frame } from '@nativescript/core/ui/frame';

let page;
let vm = new HelloWorldModel();
let recorder;
let interval;

export function navigatingTo(args) {
    console.log('navigatingTo');
}

export function loaded(args: pages.NavigatedData) {
    page = <pages.Page>args.object;
    page.bindingContext = vm;
    recorder = page.getViewById('recorderView');
    vm.set('duration', recorder && recorder.duration ? recorder.duration : 0);
    recorder.on('started', args => {
        interval = setInterval(() => {
            vm.set('duration', recorder.duration);
        }, 1000);
    });
    recorder.on('finished', args => {
        clearInterval(interval);
        page.bindingContext.set('selectedVideo', args.object.get('file'));
        console.log('thumbnails: ', recorder.thumbnails);
    });
}

export function recordVideo() {
    recorder.startRecording();
}

export function stopRecording() {
    const recorder = page.getViewById('recorderView');
    recorder.stopRecording();
}

export function toggleCamera() {
    const recorder = page.getViewById('recorderView');
    recorder.toggleCamera();
}

export function goToVideoRecorder(event) {
    Frame.topmost().goBack();
}
