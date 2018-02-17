import { Observable } from 'tns-core-modules/data/observable';
import { VideoRecorder } from 'nativescript-videorecorder';
import * as utils from 'tns-core-modules/utils/utils';
export class HelloWorldModel extends Observable {
  selectedVideo: string = '';
  constructor() {
    super();
  }
  recorder(options) {
    const vr = new VideoRecorder();
    if (options) {
      return vr.record(options);
    } else {
      return vr.record();
    }
  }
}
