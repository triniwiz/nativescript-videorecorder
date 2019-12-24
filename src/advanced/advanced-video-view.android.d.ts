import '../async-await';
import { AdvancedVideoViewBase } from './advanced-video-view.common';
export * from './advanced-video-view.common';
export declare enum NativeOrientation {
    Unknown = 0,
    Portrait = 1,
    PortraitUpsideDown = 2,
    LandscapeLeft = 3,
    LandscapeRight = 4,
}
export declare class AdvancedVideoView extends AdvancedVideoViewBase {
    thumbnails: any[];
    readonly duration: any;
    static requestPermissions(explanation?: string): Promise<any>;
    private durationInterval;
    static isAvailable(): any;
    createNativeView(): co.fitcom.fancycamera.FancyCamera;
    initNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    private setCameraPosition(position);
    private setCameraOrientation(orientation);
    private setQuality(quality);
    readonly isTorchAvailable: boolean;
    toggleTorch(): void;
    toggleCamera(): void;
    startRecording(): void;
    stopRecording(): void;
    startPreview(): void;
    stopPreview(): void;
    extractThumbnails(file: any): void;
}
