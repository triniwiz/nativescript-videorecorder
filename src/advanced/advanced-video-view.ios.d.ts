import '../async-await';
import { AdvancedVideoViewBase } from './advanced-video-view.common';
export declare class AdvancedVideoView extends AdvancedVideoViewBase {
    nativeView: UIView;
    _output: AVCaptureMovieFileOutput;
    _file: NSURL;
    private session;
    static isAvailable(): boolean;
    createNativeView(): UIView;
    initNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    readonly duration: number;
    private openCamera();
    startRecording(): void;
    stopRecording(): void;
    stopPreview(): void;
    toggleCamera(): void;
    startPreview(): void;
    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
}
