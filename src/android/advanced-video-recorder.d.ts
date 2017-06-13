import { View } from "ui/core/view";
export declare class AdvancedVideoRecorder {
    readonly duration: number;
    stop(): void;
    open(options?: {
        saveToGallery: boolean;
        hd: boolean;
        format: string;
        position: string;
        size: number;
        duration: number;
    }): void;
    record(cb: any): void;
}
export declare class AdvancedVideoView extends View {
    recorder: AdvancedVideoRecorder;
    createNativeView(): android.widget.LinearLayout;
    initNativeView(): void;
    readonly duration: number;
    open(options: any): void;
    record(cb: any): void;
    stop(): void;
}
