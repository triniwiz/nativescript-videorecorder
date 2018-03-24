import '../async-await';
import { AdvancedVideoViewBase } from './advanced-video-view.common';
export declare class AdvancedVideoView extends AdvancedVideoViewBase {
    readonly duration: any;
    private durationInterval;
    createNativeView(): co.fitcom.fancycamera.FancyCamera;
    initNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    private setCameraPosition(position);
    private setQuality(quality);
    toggleCamera(): void;
    startRecording(cb: any): void;
    stopRecording(): void;
    startPreview(): void;
    stopPreview(): void;
}
