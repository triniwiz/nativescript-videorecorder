import { Observable } from '@nativescript/core/data/observable';
import { VideoRecorder } from 'nativescript-videorecorder';

export class HelloWorldModel extends Observable {
    selectedVideo: string = '';

    constructor() {
        super();
    }

    recorder(options) {
        const vr = new VideoRecorder(options);
        return vr.record();
    }
}
