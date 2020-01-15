import '../async-await';
import { AdvancedVideoViewBase } from './advanced-video-view.common';
export * from './advanced-video-view.common';
export declare enum NativeOrientation {
    Unknown = 0,
    Portrait = 1,
    PortraitUpsideDown = 2,
    LandscapeLeft = 3,
    LandscapeRight = 4
}
export declare class AdvancedVideoView extends AdvancedVideoViewBase {
    thumbnails: any[];
    readonly duration: any;
    static requestPermissions(explanation?: string): Promise<any>;
    private durationInterval;
    static isAvailable(): any;
    private _view;
    createNativeView(): any;
    private _handlePermission;
    initNativeView(): void;
    disposeNativeView(): void;
    private setCameraPosition;
    private setCameraOrientation;
    private setQuality;
    readonly isTorchAvailable: any;
    toggleTorch(): void;
    toggleCamera(): void;
    startRecording(): void;
    stopRecording(): void;
    startPreview(): void;
    stopPreview(): void;
    extractThumbnails(file: any): void;
}
export declare const TNSCameraProvider: any;
export declare const TNSCamera: any;
