import '../async-await';
import {
    AdvancedVideoViewBase,
    CameraPosition,
    cameraPositionProperty,
    Quality,
    qualityProperty,
    saveToGalleryProperty
} from './advanced-video-view.common';
import { fromObject } from 'tns-core-modules/data/observable';
// declare const com;
import * as app from 'tns-core-modules/application';
import * as permissions from 'nativescript-permissions';

export class AdvancedVideoView extends AdvancedVideoViewBase {
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
        const listener = (co as any).fitcom.fancycamera.CameraEventListenerUI.extend(
            {
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

    public startRecording(cb): void {
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
}
