import { Property, View } from 'tns-core-modules/ui/core/view';
export declare enum CameraPosition {
    BACK = "back",
    FRONT = "front",
}
export declare enum Quality {
    MAX_480P = "480p",
    MAX_720P = "720p",
    MAX_1080P = "1080p",
    MAX_2160P = "2160p",
    HIGHEST = "highest",
    LOWEST = "lowest",
    QVGA = "qvga",
}
export declare enum Orientation {
    Unknown = "unknown",
    Portrait = "portrait",
    PortraitUpsideDown = "portraitUpsideDown",
    LandscapeLeft = "landscapeLeft",
    LandscapeRight = "landscapeRight",
}
export declare type CameraPositionType = 'back' | 'front';
export declare abstract class AdvancedVideoViewBase extends View {
    cameraPosition: CameraPositionType;
    saveToGallery: boolean;
    quality: Quality;
    thumbnailCount: number;
    fill: boolean;
    outputOrientation: Orientation;
    readonly abstract duration: number;
    readonly abstract thumbnails: string[];
    abstract startRecording(): void;
    abstract stopRecording(): void;
    abstract stopPreview(): void;
    abstract toggleCamera(): void;
    abstract startPreview(): void;
    static isAvailable(): boolean;
    static requestPermissions(explanation?: string): Promise<any>;
}
export declare const outputOrientation: Property<AdvancedVideoViewBase, string>;
export declare const fillProperty: Property<AdvancedVideoViewBase, boolean>;
export declare const thumbnailCountProperty: Property<AdvancedVideoViewBase, number>;
export declare const qualityProperty: Property<AdvancedVideoViewBase, any>;
export declare const cameraPositionProperty: Property<AdvancedVideoViewBase, CameraPositionType>;
export declare const saveToGalleryProperty: Property<AdvancedVideoViewBase, boolean>;
