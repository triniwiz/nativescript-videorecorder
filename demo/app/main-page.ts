import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import * as fs from 'tns-core-modules/file-system';
let page;
let vm = new HelloWorldModel();
import { VideoRecorder, CameraPosition } from 'nativescript-videorecorder';
import { topmost } from 'tns-core-modules/ui/frame';

export function navigatingTo(args) {}

export function loaded(args: pages.NavigatedData) {
  // Get the event sender
  page = <pages.Page>args.object;
  page.bindingContext = vm;
}

const vr = new VideoRecorder({ hd: true, position: CameraPosition.NONE });
vm.set('position', CameraPosition.NONE);

export function openAdvancedCameraView(event) {
  topmost().navigate('advanced-page');
}
export function recordVideo() {
  vm.set('error', '');
  vr.record().then(data => {
    if (data && data.file) {
      vm.set('selectedVideo', data.file);
    }
  }).catch((err) => {
    vm.set('error', err.event || err.message);
  });
}

export function toggleCamera() {
  vr.options.position = vr.options.position === CameraPosition.BACK
    ? CameraPosition.FRONT
    : vr.options.position === CameraPosition.FRONT
      ? CameraPosition.NONE
      : CameraPosition.BACK;
  vm.set('position', vr.options.position);
}
