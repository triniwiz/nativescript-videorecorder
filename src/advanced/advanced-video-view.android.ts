import '../async-await';
import {
    AdvancedVideoViewBase,
    CameraPosition,
    cameraPositionProperty,
    Quality,
    qualityProperty,
    saveToGalleryProperty,
    Orientation,
    outputOrientation
} from './advanced-video-view.common';

export * from './advanced-video-view.common';

import { fromObject } from 'tns-core-modules/data/observable';
// declare const com;
import * as app from 'tns-core-modules/application';
import * as permissions from 'nativescript-permissions';
let MediaMetadataRetriever = android.media.MediaMetadataRetriever;

export enum NativeOrientation {
    Unknown,
    Portrait,
    PortraitUpsideDown,
    LandscapeLeft,
    LandscapeRight,
}

export class AdvancedVideoView extends AdvancedVideoViewBase {
    thumbnails: any[];
    get duration() {
        return this.nativeView && this.nativeView.getDuration()
            ? this.nativeView.getDuration()
            : 0;
    }

    public static requestPermissions(explanation = ''): Promise<any> {
        return permissions.requestPermissions(
            [
                (android as any).Manifest.permission.CAMERA,
                (android as any).Manifest.permission.RECORD_AUDIO
            ],
            explanation && explanation.length > 0 ? explanation : ''
        );
    }

    private durationInterval: any;

    public static isAvailable() {
        return app.android.currentContext.getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA);
    }

    public createNativeView() {
        app.android.on(app.AndroidApplication.activityRequestPermissionsEvent, (args: app.AndroidActivityRequestPermissionsEventData) => {
            if (permissions.hasPermission((android as any).Manifest.permission.CAMERA) && permissions.hasPermission((android as any).Manifest.permission.RECORD_AUDIO)) {
                this.startPreview();
                app.android.off(app.AndroidApplication.activityRequestPermissionsEvent);
            }

        });
        return new co.fitcom.fancycamera.FancyCamera(this._context);
    }

    public initNativeView() {
        super.initNativeView();
        const ref = new WeakRef(this);
        let that = this;
        const listener = (co as any).fitcom.fancycamera.CameraEventListenerUI.extend(
            {
                onCameraOpenUI() {},
                onCameraCloseUI() {},
                onVideoEventUI(event: co.fitcom.fancycamera.VideoEvent) {
                    const owner = ref.get();
                    if (
                        event.getType() === co.fitcom.fancycamera.EventType.INFO &&
                        event
                            .getMessage()
                            .indexOf(
                                co.fitcom.fancycamera.VideoEvent.EventInfo.RECORDING_FINISHED.toString()
                            ) > -1
                    ) {
                        if (that.thumbnailCount && that.thumbnailCount > 0) {
                            that.extractThumbnails(event.getFile().getPath());
                        }
                        owner.notify({
                            eventName: 'finished',
                            object: fromObject({
                                file: event.getFile().getPath()
                            })
                        });
                    } else if (
                        event.getType() === co.fitcom.fancycamera.EventType.INFO &&
                        event
                            .getMessage()
                            .indexOf(
                                co.fitcom.fancycamera.VideoEvent.EventInfo.RECORDING_STARTED.toString()
                            ) > -1
                    ) {
                        owner.notify({
                            eventName: 'started',
                            object: fromObject({})
                        });
                    } else {
                        if (event.getType() === co.fitcom.fancycamera.EventType.ERROR) {
                            owner.notify({
                                eventName: 'error',
                                object: fromObject({
                                    message: event.getMessage()
                                })
                            });
                        } else {
                            owner.notify({
                                eventName: 'info',
                                object: fromObject({
                                    message: event.getMessage()
                                })
                            });
                        }
                    }
                },
                onPhotoEventUI(event: co.fitcom.fancycamera.PhotoEvent) {
                }
            }
        );
        this.nativeView.setListener(new listener());
        this.setQuality(this.quality);
        this.setCameraPosition(this.cameraPosition);
        this.setCameraOrientation(this.outputOrientation);
        this.nativeView.setCameraOrientation(2);
    }

    public onLoaded(): void {
        super.onLoaded();
        this.startPreview();
    }

    public onUnloaded(): void {
        if (this.nativeView && this.nativeView.release) {
            this.nativeView.release();
        }
        app.android.off(app.AndroidApplication.activityRequestPermissionsEvent);
        super.onUnloaded();
    }

    private setCameraPosition(position): void {
        switch (position) {
            case CameraPosition.FRONT:
                this.nativeView.setCameraPosition(1);
                break;
            default:
                this.nativeView.setCameraPosition(0);
                break;
        }
    }

    [cameraPositionProperty.getDefault]() {
        this.setCameraPosition('back');
        return 'back';
    }

    [cameraPositionProperty.setNative](position) {
        if (this.nativeView) {
            this.setCameraPosition(position);
        }
        return position;
    }

    private setCameraOrientation(orientation: Orientation): void {
        let nativeOrientation: number;
        switch (orientation) {
            case Orientation.LandscapeLeft:
                nativeOrientation = co.fitcom.fancycamera.FancyCamera.CameraOrientation.LANDSCAPE_LEFT.getValue();
                break;
            case Orientation.LandscapeRight:
                nativeOrientation = co.fitcom.fancycamera.FancyCamera.CameraOrientation.LANDSCAPE_RIGHT.getValue();
                break;
            case Orientation.Portrait:
                nativeOrientation = co.fitcom.fancycamera.FancyCamera.CameraOrientation.PORTRAIT.getValue();
                break;
            case Orientation.PortraitUpsideDown:
                nativeOrientation = co.fitcom.fancycamera.FancyCamera.CameraOrientation.PORTRAIT_UPSIDE_DOWN.getValue();
                break;
            default:
                nativeOrientation = co.fitcom.fancycamera.FancyCamera.CameraOrientation.UNKNOWN.getValue();
                break;
        }

        if (this.nativeView && nativeOrientation !== NativeOrientation.Unknown) {
            this.nativeView.setCameraOrientation(nativeOrientation);
        }
    }

    [outputOrientation.getDefault](): Orientation {
        this.setCameraOrientation(Orientation.Unknown);
        return Orientation.Unknown;
    }

    [outputOrientation.setNative](orientation: Orientation) {
        if (this.nativeView) {
            this.setCameraOrientation(orientation);
        }
        return orientation;
    }

    [saveToGalleryProperty.getDefault]() {
        return false;
    }

    [saveToGalleryProperty.setNative](save: boolean) {
        return save;
    }

    private setQuality(quality) {
        let q;
        if (quality && quality.valueof === 'function') {
            q = quality.valueof();
        } else {
            q = quality;
        }
        switch (q) {
            case Quality.MAX_720P.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.MAX_720P.getValue()
                );
                break;
            case Quality.MAX_1080P.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.MAX_1080P.getValue()
                );
                break;
            case Quality.MAX_2160P.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.MAX_2160P.getValue()
                );
                break;
            case Quality.HIGHEST.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.HIGHEST.getValue()
                );
                break;
            case Quality.LOWEST.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.LOWEST.getValue()
                );
                break;
            case Quality.QVGA.toString():
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.QVGA.getValue()
                );
                break;
            default:
                this.nativeView.setQuality(
                    co.fitcom.fancycamera.FancyCamera.Quality.MAX_480P.getValue()
                );
                break;
        }
    }


    [qualityProperty.setNative](quality) {
        if (!quality) return quality;
        this.setQuality(this.quality);
        return quality;
    }

    public toggleCamera() {
        this.nativeView.toggleCamera();
    }

    public startRecording(): void {
        this.nativeView.startRecording();
    }

    public stopRecording(): void {
        this.nativeView.stopRecording();
    }

    public startPreview(): void {
        if (this.nativeView) {
            this.nativeView.start();
        }
    }

    public stopPreview(): void {
        if (this.nativeView) {
            this.nativeView.stop();
        }
    }

    extractThumbnails(file) {
        this.thumbnails = [];
        console.log("file", file);
        let mediaMetadataRetriever = new MediaMetadataRetriever();

        mediaMetadataRetriever.setDataSource(file);
        let METADATA_KEY_DURATION = mediaMetadataRetriever.extractMetadata(
            MediaMetadataRetriever.METADATA_KEY_DURATION
        );

        let max = parseInt(METADATA_KEY_DURATION.toString());

        let it = parseInt((max / this.thumbnailCount).toString());

        for (let index = 0; index < this.thumbnailCount; index++) {
            let bmpOriginal = mediaMetadataRetriever.getFrameAtTime(
                index * it * 1000,
                MediaMetadataRetriever.OPTION_CLOSEST
            );
            let byteCount = bmpOriginal.getWidth() * bmpOriginal.getHeight() * 4;
            let tmpByteBuffer = java.nio.ByteBuffer.allocate(byteCount);
            bmpOriginal.copyPixelsToBuffer(tmpByteBuffer);
            let quality = 100;

            let outputFilePath =
                file.substr(0, file.lastIndexOf(".")) +
                "_thumbnail_" +
                index +
                ".png";
            let outputFile = new java.io.File(outputFilePath);
            let outputStream = null;

            try {
                outputStream = new java.io.FileOutputStream(outputFile);
            } catch (e) {
                console.log(e);
            }

            let bmpScaledSize = android.graphics.Bitmap.createScaledBitmap(
                bmpOriginal,
                bmpOriginal.getWidth(),
                bmpOriginal.getHeight(),
                false
            );
            bmpScaledSize.compress(
                android.graphics.Bitmap.CompressFormat.PNG,
                quality,
                outputStream
            );

            try {
                outputStream.close();
                this.thumbnails.push(outputFilePath);
            } catch (e) {
                console.log(e);
            }
        }

        mediaMetadataRetriever.release();
    }
}
