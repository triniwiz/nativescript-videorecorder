import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import * as fs from 'tns-core-modules/file-system';
let page;
let vm = new HelloWorldModel();
import { AdvancedVideoView } from 'nativescript-videorecorder/advanced';
import { VideoRecorder } from 'nativescript-videorecorder';
import { topmost } from 'tns-core-modules/ui/frame';
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
