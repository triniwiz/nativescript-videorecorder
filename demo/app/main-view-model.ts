import {Observable} from 'data/observable';
import {VideoRecorder} from 'nativescript-videorecorder';

import utils = require("utils/utils")
export class HelloWorldModel extends Observable {

  constructor() {
    super();
    this.set("selectedVideo","")

}
  recorder(options) {
    var vr = new VideoRecorder();
    if (options) {
      return vr.record(options);
    } else {
      return vr.record();
    }

  }
}