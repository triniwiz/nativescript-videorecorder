import * as frame from 'tns-core-modules/ui/frame';
import * as fs from 'tns-core-modules/file-system';
import * as types from 'tns-core-modules/utils/types';
import { Color } from 'tns-core-modules/color';
import { View, layout, Property } from 'tns-core-modules/ui/core/view';
import '../async-await';
import { device } from 'tns-core-modules/platform/platform';
import { requestPermissions } from '..';
import * as app from 'tns-core-modules/application';
import * as permissions from 'nativescript-permissions';
import * as utils from 'tns-core-modules/utils/utils';
import {
  AdvancedVideoViewBase,
  cameraPositionProperty,
  saveToGalleryProperty,
  CameraPosition,
  qualityProperty,
  Quality
} from './advanced-video-view.common';
import { fromObject } from 'tns-core-modules/data/observable';
// declare const com;
export class AdvancedVideoView extends AdvancedVideoViewBase {
  get duration() {
    return this.nativeView && this.nativeView.getDuration()
      ? this.nativeView.getDuration()
      : 0;
  }
  private durationInterval: any;
  public createNativeView() {
    const nativeView = new co.fitcom.fancycamera.FancyCamera(this._context);
    return nativeView;
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
        }
      }
    );
    this.nativeView.setListener(new listener());
    this.setCameraPosition(this.cameraPosition);
  }
  onLoaded() {
    super.onLoaded();
    this.startPreview();
  }
  onUnloaded() {
    this.stopPreview();
    super.onUnloaded();
  }
  private setCameraPosition(position) {
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
  [qualityProperty.setNative](quality) {
    if (!quality) return quality;
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
