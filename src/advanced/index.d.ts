import { AdvancedVideoViewBase } from './advanced-video-view.common'

export * from './advanced-video-view.common'

export declare class AdvancedVideoView extends AdvancedVideoViewBase {
    readonly duration: number;
    readonly thumbnails: string[];
    readonly isTorchAvailable: boolean;

    public startRecording(): void;
    public stopRecording(): void;
    public stopPreview(): void;
    public toggleCamera(): void;
    public toggleTorch(): void;
    public startPreview(): void;
}