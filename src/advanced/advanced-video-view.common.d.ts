import { Property, View } from 'tns-core-modules/ui/core/view';
import { Options } from '../videorecorder.common';
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
export declare type CameraPositionType = 'back' | 'front';
export declare class AdvancedVideoViewBase extends View {
    cameraPosition: CameraPositionType;
    saveToGallery: boolean;
    quality: Quality;
    static isAvailable(): boolean;
    static requestPermissions(options?: Options): Promise<any>;
}
export declare const qualityProperty: Property<AdvancedVideoViewBase, any>;
export declare const cameraPositionProperty: Property<AdvancedVideoViewBase, CameraPositionType>;
export declare const saveToGalleryProperty: Property<AdvancedVideoViewBase, boolean>;
