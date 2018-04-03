import { Property, View } from 'tns-core-modules/ui/core/view';

export enum CameraPosition {
    BACK = 'back',
    FRONT = 'front'
}

export enum Quality {
    MAX_480P = '480p',
    MAX_720P = '720p',
    MAX_1080P = '1080p',
    MAX_2160P = '2160p',
    HIGHEST = 'highest',
    LOWEST = 'lowest',
    QVGA = 'qvga'
}

export type CameraPositionType = 'back' | 'front';

export class AdvancedVideoViewBase extends View {
    cameraPosition: CameraPositionType;
    saveToGallery: boolean;
    quality: Quality;

    public static isAvailable(): boolean {
        return false;
    }
}

export const qualityProperty = new Property<AdvancedVideoViewBase, any>({
    name: 'quality',
    defaultValue: Quality.MAX_480P
});
export const cameraPositionProperty = new Property<AdvancedVideoViewBase,
    CameraPositionType>({
    name: 'cameraPosition',
    defaultValue: 'back'
});

export const saveToGalleryProperty = new Property<AdvancedVideoViewBase,
    boolean>({
    name: 'saveToGallery',
    defaultValue: false
});

qualityProperty.register(AdvancedVideoViewBase);
cameraPositionProperty.register(AdvancedVideoViewBase);
saveToGalleryProperty.register(AdvancedVideoViewBase);
