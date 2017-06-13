import * as frame from "ui/frame";
import * as trace from "trace";
import * as fs from "file-system";
import * as types from "utils/types";
import { Color } from "color";
import { View, layout, Property } from "ui/core/view";
export class AdvancedVideoRecorder {
    _output: AVCaptureMovieFileOutput;
    _file: NSURL;
    private session: AVCaptureSession;
    get duration(): number {
        if (this._output && this._output.recordedDuration) {
            return Math.floor(Math.round(CMTimeGetSeconds(this._output.recordedDuration)));
        } else {
            return 0;
        }
    }
    stop() {
        this.session.stopRunning();
    }
    open(options = { saveToGallery: false, hd: false, format: 'default', position: 'back', size: 0, duration: 0 }): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.session = new AVCaptureSession();
                let devices = AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo);
                let device: AVCaptureDevice;
                options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
                options.hd = Boolean(options.hd) ? true : false;
                if (options && !options.format) {
                    options.format = 'default';
                }
                options.position = options && types.isString(options.position) ? options.position : "back";
                let pos = options.position === "front" ? AVCaptureDevicePosition.Front : AVCaptureDevicePosition.Back;
                for (let i = 0; i < devices.count; i++) {
                    if (devices[i].position === pos) {
                        device = devices[i];
                        break;
                    }
                }

                let input: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(device, null);


                let audioDevice = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeAudio);
                let audioInput: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(audioDevice, null);

                this._output = new AVCaptureMovieFileOutput();
                let format = options && options.format === 'default' ? '.mov' : '.' + options.format;
                let fileName = `videoCapture_${+new Date()}${format}`;
                let path = fs.path.join(fs.knownFolders.documents().path, fileName);
                this._file = NSURL.fileURLWithPath(path);

                if (!input) {
                    reject("Error trying to open camera.");
                }

                if (!audioInput) {
                    reject("Error trying to open mic.");
                }

                this._output.maxRecordedDuration = types.isNumber(options.duration) && options.duration > 0 ? CMTimeMakeWithSeconds(options.duration, 1) : kCMTimePositiveInfinity;

                if (options.size > 0) {
                    this._output.maxRecordedFileSize = (options.size * 1024 * 1024);
                }


                this.session.beginConfiguration();
                this.session.sessionPreset = options.hd ? AVCaptureSessionPresetHigh : AVCaptureSessionPresetLow;

                this.session.addInput(input);

                this.session.addInput(audioInput);

                this.session.addOutput(this._output);

                this.session.commitConfiguration();

                let preview = AVCaptureVideoPreviewLayer.alloc().initWithSession(this.session);
                dispatch_async(dispatch_get_current_queue(), () => {
                    preview.videoGravity = AVLayerVideoGravityResizeAspectFill;
                });
                if (!this.session.running) {
                    this.session.startRunning();
                }
                resolve(preview);
            } catch (ex) {
                reject(ex);
            }
        });
    }
    record(cb) {
        let delegate = AVCaptureFileOutputRecordingDelegateImpl.initWithOwnerCallback(new WeakRef(this), cb);
        this._output.startRecordingToOutputFileURLRecordingDelegate(this._file, delegate);
    }
}
class AVCaptureFileOutputRecordingDelegateImpl extends NSObject implements AVCaptureFileOutputRecordingDelegate {
    private _callback;
    private _owner: WeakRef<AdvancedVideoRecorder>;
    private _interval;
    public static initWithOwnerCallback(owner: WeakRef<AdvancedVideoRecorder>, callback: any): AVCaptureFileOutputRecordingDelegateImpl {
        let delegate = new AVCaptureFileOutputRecordingDelegateImpl();
        delegate._callback = callback;
        delegate._owner = owner;
        return delegate;
    }
    captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(captureOutput: AVCaptureFileOutput, outputFileURL: NSURL, connections: NSArray<any>, error: NSError): void {
        if (!error) {
            this._callback(null, { status: 'completed', file: outputFileURL.absoluteString });
        } else {
            this._callback(error.localizedDescription);
        }
    }
    captureOutputDidStartRecordingToOutputFileAtURLFromConnections(captureOutput: AVCaptureFileOutput, fileURL: NSURL, connections: NSArray<any>): void {
        this._callback(null, { status: 'started' });
    }

    public static ObjCProtocols = [AVCaptureFileOutputRecordingDelegate];

}
export class AdvancedVideoView extends View {
    nativeView: UIView;
    recorder: AdvancedVideoRecorder;
    public createNativeView() {
        return UIView.new();
    }
    public initNativeView() {
        this.recorder = new AdvancedVideoRecorder();
    }
    get duration() {
        return this.recorder.duration;
    }
    open(options): Promise<any> {
        return new Promise((resolve, reject) => {
            this.recorder.open(options).then(
                view => {
                    dispatch_async(dispatch_get_current_queue(), () => {
                        view.frame = this.nativeView.bounds;
                        this.nativeView.layer.addSublayer(view);
                    });
                    resolve();
                }, err => {
                    reject(err);
                }
            )
        });
    }
    record(cb) {
        this.recorder.record(cb);
    }
    stop() {
        this.recorder.stop();
    }
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        this.setMeasuredDimension(width, height);
    }
}