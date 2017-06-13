import { Observable } from 'data/observable';
import { VideoRecorder } from './recorder/src/ios/videorecorder';

import utils = require("utils/utils")
export class HelloWorldModel extends Observable {
  selectedVideo: string = ""
  constructor() {
    super();
  }
  recorder(options) {
    var vr = new VideoRecorder();
    if (options) {
      return vr.record(options)
    } else {
      return vr.record();
    }

  }
}