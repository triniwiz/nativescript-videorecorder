import * as frame from "ui/frame";
import * as trace from "trace";
import * as fs from "file-system";
import * as types from "utils/types";
import { Color } from "color";
import { View, layout, Property } from "ui/core/view";
export class AdvancedVideoRecorder {
    get duration(): number {
        return 0;
    }
    stop() { }
    open(options = { saveToGallery: false, hd: false, format: 'default', position: 'back', size: 0, duration: 0 }) { }
    record(cb) { }
}
export class AdvancedVideoView extends View {
    recorder: AdvancedVideoRecorder;
    public createNativeView() {
        return new android.widget.LinearLayout(this._context);
    }
    public initNativeView() {
        this.recorder = new AdvancedVideoRecorder();
    }
    get duration() {
        return this.recorder.duration;
    }
    open(options) { }
    record(cb) { }
    stop() { }
}