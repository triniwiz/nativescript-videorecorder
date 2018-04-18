import * as frame from 'tns-core-modules/ui/frame';
import * as fs from 'tns-core-modules/file-system';
import * as types from 'tns-core-modules/utils/types';
import './async-await';

import {
    CameraPosition,
    Options,
    RecordResult,
    VideoFormat,
    VideoFormatType,
    VideoRecorderCommon,
} from './videorecorder.common';

export * from './videorecorder.common';

let listener;

export class VideoRecorder extends VideoRecorderCommon {
    public requestPermissions(options?: Options): Promise<any> {
        return new Promise((resolve, reject) => {
            // Permission is only necessary when file needs to be saved in gallery
            if (!options.saveToGallery) return resolve();

            let authStatus = PHPhotoLibrary.authorizationStatus();
            if (authStatus === PHAuthorizationStatus.NotDetermined) {
                PHPhotoLibrary.requestAuthorization(auth => {
                    if (auth === PHAuthorizationStatus.Authorized) {
                        resolve();
                    }
                });
            } else if (authStatus !== PHAuthorizationStatus.Authorized) {
                reject();
            }
        });
    }

    public static isAvailable() {
        return UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.Camera);
    }

    protected _startRecording(options: Options = this.options): Promise<RecordResult> {
        return new Promise((resolve, reject) => {
            listener = null;
            let picker = UIImagePickerController.new();
            picker.mediaTypes = <any>[kUTTypeMovie];
            picker.sourceType = UIImagePickerControllerSourceType.Camera;
            picker.cameraCaptureMode = UIImagePickerControllerCameraCaptureMode.Video;

            if (options.position !== CameraPosition.NONE) {
                picker.cameraDevice = options.position === CameraPosition.FRONT
                    ? UIImagePickerControllerCameraDevice.Front
                    : UIImagePickerControllerCameraDevice.Rear;
            }

            picker.allowsEditing = false;
            picker.videoQuality = options.hd
                ? UIImagePickerControllerQualityType.TypeHigh
                : UIImagePickerControllerQualityType.TypeLow;

            picker.videoMaximumDuration =
                types.isNumber(options.duration) && options.duration > 0
                    ? Number(options.duration)
                    : Number.POSITIVE_INFINITY;

            if (options) {
                listener = UIImagePickerControllerDelegateImpl.initWithOwnerCallbackOptions(
                    new WeakRef(this),
                    resolve,
                    options
                );
            } else {
                listener = UIImagePickerControllerDelegateImpl.initWithCallback(
                    resolve
                );
            }

            picker.delegate = listener;
            picker.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

            let topMostFrame = frame.topmost();
            if (topMostFrame) {
                let viewController =
                    topMostFrame.currentPage && topMostFrame.currentPage.ios;
                if (viewController) {
                    viewController.presentViewControllerAnimatedCompletion(
                        picker,
                        true,
                        null
                    );
                }
            }
        });
    }
}

class UIImagePickerControllerDelegateImpl extends NSObject
    implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];
    private _saveToGallery: boolean;
    private _callback: (result?: RecordResult) => void;
    private _format: VideoFormatType = VideoFormat.DEFAULT;
    private _hd: boolean;

    public static initWithCallback(
        callback: (result?) => void
    ): UIImagePickerControllerDelegateImpl {
        let delegate = new UIImagePickerControllerDelegateImpl();
        delegate._callback = callback;
        return delegate;
    }

    public static initWithOwnerCallbackOptions(
        owner: any /*WeakRef<VideoRecorder>*/,
        callback: (result?: RecordResult) => void,
        options?: Options
    ): UIImagePickerControllerDelegateImpl {
        let delegate = new UIImagePickerControllerDelegateImpl();
        if (options) {
            delegate._saveToGallery = options.saveToGallery;
            delegate._format = options.format;
            delegate._hd = options.hd;
        }
        delegate._callback = callback;
        return delegate;
    }

    imagePickerControllerDidCancel(picker: any /*UIImagePickerController*/) {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(
            true,
            null
        );
        listener = null;
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(
        picker: any /*UIImagePickerController*/,
        info: any /*NSDictionary<string, any>*/
    ) {
        if (info) {
            let currentDate: Date = new Date();
            if (this._saveToGallery) {
                let source = info.objectForKey(UIImagePickerControllerMediaURL);
                if (this._format === VideoFormat.MP4) {
                    let asset = AVAsset.assetWithURL(source);
                    let preset = this._hd
                        ? AVAssetExportPresetHighestQuality
                        : AVAssetExportPresetLowQuality;
                    let session = AVAssetExportSession.exportSessionWithAssetPresetName(
                        asset,
                        preset
                    );
                    session.outputFileType = AVFileTypeMPEG4;
                    let fileName = `VID_${+new Date()}.mp4`;
                    let path = fs.path.join(fs.knownFolders.documents().path, fileName);
                    let nativePath = NSURL.fileURLWithPath(path);
                    session.outputURL = nativePath;
                    session.exportAsynchronouslyWithCompletionHandler(() => {
                        let assetLibrary = ALAssetsLibrary.alloc().init();
                        assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(
                            nativePath,
                            (file, error) => {
                                if (!error) {
                                    this._callback({file: file.path});
                                }
                                fs.File.fromPath(path).remove();
                            }
                        );
                    });
                } else {
                    let assetLibrary = ALAssetsLibrary.alloc().init();
                    assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(
                        source,
                        (file, error) => {
                            if (!error) {
                                this._callback({file: file.path});
                            } else {
                                console.log(error.localizedDescription);
                            }
                        }
                    );
                }
            } else {
                let source = info.objectForKey(UIImagePickerControllerMediaURL);
                if (this._format === VideoFormat.MP4) {
                    let asset = AVAsset.assetWithURL(source);
                    let preset = this._hd
                        ? AVAssetExportPresetHighestQuality
                        : AVAssetExportPresetLowQuality;
                    let session = AVAssetExportSession.exportSessionWithAssetPresetName(
                        asset,
                        preset
                    );
                    session.outputFileType = AVFileTypeMPEG4;
                    let fileName = `VID_${+new Date()}.mp4`;
                    let path = fs.path.join(fs.knownFolders.documents().path, fileName);
                    let nativePath = NSURL.fileURLWithPath(path);
                    session.outputURL = nativePath;
                    session.exportAsynchronouslyWithCompletionHandler(() => {
                        fs.File.fromPath(source.path).remove();
                        this._callback({file: path});
                    });
                } else {
                    this._callback({file: source.path});
                }
            }
            picker.presentingViewController.dismissViewControllerAnimatedCompletion(
                true,
                null
            );
            listener = null;
        }
    }
}
