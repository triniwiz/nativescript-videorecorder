import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { topmost } from 'tns-core-modules/ui/frame';
import { AdvancedVideoView } from 'nativescript-videorecorder/advanced';
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
    AdvancedVideoView.requestPermissions();
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
    topmost().goBack();
}
