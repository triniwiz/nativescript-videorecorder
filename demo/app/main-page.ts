import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import * as fs from 'tns-core-modules/file-system';
let page;
let vm = new HelloWorldModel();
import { VideoRecorder } from 'nativescript-videorecorder';
import { topmost } from 'tns-core-modules/ui/frame';

export function navigatingTo(args) {}

export function loaded(args: pages.NavigatedData) {
  // Get the event sender
  page = <pages.Page>args.object;
  page.bindingContext = vm;
}

export function openAdvancedCameraView(event) {
  topmost().navigate('advanced-page');
}
export function recordVideo() {
  const vr = new VideoRecorder();
  vr.record({ hd: true }).then(data => {
    if (data && data.file) {
      vm.set('selectedVideo', data.file);
    }
  });
}

export function toggleCamera() {}
