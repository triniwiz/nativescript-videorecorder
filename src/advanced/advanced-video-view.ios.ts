import * as fs from 'tns-core-modules/file-system';
import { layout } from 'tns-core-modules/ui/core/view';
import '../async-await';
import { AdvancedVideoViewBase, CameraPosition, Quality, saveToGalleryProperty } from './advanced-video-view.common';
import { fromObject } from 'tns-core-modules/data/observable';

class AVCaptureFileOutputRecordingDelegateImpl extends NSObject
    implements AVCaptureFileOutputRecordingDelegate {
    private _owner: WeakRef<AdvancedVideoView>;
    private _interval;

    public static initWithOwner(
        owner: WeakRef<AdvancedVideoView>
    ): AVCaptureFileOutputRecordingDelegateImpl {
        let delegate = new AVCaptureFileOutputRecordingDelegateImpl();
        delegate._owner = owner;
        return delegate;
    }

    captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(
        captureOutput: AVCaptureFileOutput,
        outputFileURL: NSURL,
        connections: NSArray<any>,
        error: NSError
    ): void {
        const owner = this._owner.get();
        if (!error) {
            owner.notify({
                eventName: 'finished',
                object: fromObject({
                    file: outputFileURL.absoluteString
                })
            });
        } else {
            owner.notify({
                eventName: 'error',
                object: fromObject({
                    message: error.localizedDescription
                })
            });
        }
    }

    captureOutputDidStartRecordingToOutputFileAtURLFromConnections(
        captureOutput: AVCaptureFileOutput,
        fileURL: NSURL,
        connections: NSArray<any>
    ): void {
        const owner = this._owner.get();
        owner.notify({
            eventName: 'started',
            object: fromObject({})
        });
    }

    public static ObjCProtocols = [AVCaptureFileOutputRecordingDelegate];
}

export class AdvancedVideoView extends AdvancedVideoViewBase {
    nativeView: UIView;
    _output: AVCaptureMovieFileOutput;
    _file: NSURL;
    private session: AVCaptureSession;

    public static isAvailable() {
        return UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.Camera);
    }

    public createNativeView() {
        return UIView.new();
    }

    public initNativeView() {
    }

    onLoaded() {
        super.onLoaded();
        this.startPreview();
    }

    onUnloaded() {
        this.stopPreview();
        super.onUnloaded();
    }

    get duration(): number {
        if (this._output && this._output.recordedDuration) {
            return Math.floor(
                Math.round(CMTimeGetSeconds(this._output.recordedDuration))
            );
        } else {
            return 0;
        }
    }

    [saveToGalleryProperty.getDefault]() {
        return false;
    }

    [saveToGalleryProperty.setNative](save: boolean) {
        return save;
    }

    private openCamera(): void {
        try {
            this.session = new AVCaptureSession();
            let devices = AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo);
            let device: AVCaptureDevice;
            let pos =
                this.cameraPosition === 'front'
                    ? AVCaptureDevicePosition.Front
                    : AVCaptureDevicePosition.Back;
            for (let i = 0; i < devices.count; i++) {
                if (devices[i].position === pos) {
                    device = devices[i];
                    break;
                }
            }

            let input: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(
                device,
                null
            );

            let audioDevice = AVCaptureDevice.defaultDeviceWithMediaType(
                AVMediaTypeAudio
            );
            let audioInput: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(
                audioDevice,
                null
            );

            this._output = new AVCaptureMovieFileOutput();
            let format = '.mp4'; // options && options.format === 'default' ? '.mov' : '.' + options.format;
            let fileName = `VID_${+new Date()}${format}`;
            let path = fs.path.join(fs.knownFolders.temp().path, fileName);
            this._file = NSURL.fileURLWithPath(path);

            if (!input) {
                this.notify({
                    eventName: 'error',
                    object: fromObject({
                        message: 'Error trying to open camera.'
                    })
                });
            }

            if (!audioInput) {
                this.notify({
                    eventName: 'error',
                    object: fromObject({
                        message: 'Error trying to open mic.'
                    })
                });
            }

            // this._output.maxRecordedDuration =
            //   types.isNumber(options.duration) && options.duration > 0
            //     ? CMTimeMakeWithSeconds(options.duration, 1)
            //     : kCMTimePositiveInfinity;

            // if (options.size > 0) {
            //   this._output.maxRecordedFileSize = options.size * 1024 * 1024;
            // }

            this.session.beginConfiguration();

            switch (this.quality) {
                case Quality.MAX_720P:
                    this.session.sessionPreset = AVCaptureSessionPreset1280x720;
                    break;
                case Quality.MAX_1080P:
                    this.session.sessionPreset = AVCaptureSessionPreset1920x1080;
                    break;
                case Quality.MAX_2160P:
                    this.session.sessionPreset = AVCaptureSessionPreset3840x2160;
                    break;
                case Quality.HIGHEST:
                    this.session.sessionPreset = AVCaptureSessionPresetHigh;
                    break;
                case Quality.LOWEST:
                    this.session.sessionPreset = AVCaptureSessionPresetLow;
                    break;
                case Quality.QVGA:
                    this.session.sessionPreset = AVCaptureSessionPreset352x288;
                    break;
                default:
                    this.session.sessionPreset = AVCaptureSessionPreset640x480;
                    break;
            }

            this.session.addInput(input);

            this.session.addInput(audioInput);

            this.session.addOutput(this._output);

            this.session.commitConfiguration();

            let preview = AVCaptureVideoPreviewLayer.alloc().initWithSession(
                this.session
            );
            dispatch_async(dispatch_get_current_queue(), () => {
                preview.videoGravity = AVLayerVideoGravityResizeAspectFill;
            });
            if (!this.session.running) {
                this.session.startRunning();
            }

            dispatch_async(dispatch_get_current_queue(), () => {
                preview.frame = this.nativeView.bounds;
                this.nativeView.layer.addSublayer(preview);
            });
        } catch (ex) {
            this.notify({
                eventName: 'error',
                object: fromObject({
                    message: ex.getMessage()
                })
            });
        }
    }

    public startRecording(): void {
        let delegate = AVCaptureFileOutputRecordingDelegateImpl.initWithOwner(
            new WeakRef(this)
        );
        this._output.startRecordingToOutputFileURLRecordingDelegate(
            this._file,
            delegate
        );
    }

    public stopRecording(): void {
        this.session.stopRunning();
        setTimeout(() => {
            this.startPreview();
        }, 30);
    }

    public stopPreview(): void {
        this.session.stopRunning();
    }

    public toggleCamera(): void {
        if (this.cameraPosition === CameraPosition.BACK.toString()) {
            this.cameraPosition = 'front';
        } else {
            this.cameraPosition = 'back';
        }
        this.stopPreview();
        this.startPreview();
    }

    public startPreview(): void {
        this.openCamera();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        this.setMeasuredDimension(width, height);
    }
}
