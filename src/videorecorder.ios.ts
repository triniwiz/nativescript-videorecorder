import * as fs from '@nativescript/core/file-system';
import * as types from '@nativescript/core/utils/types';
import './async-await';

import {
    CameraPosition,
    Options,
    RecordResult,
    VideoFormat,
    VideoFormatType,
    VideoRecorderCommon,
} from './videorecorder.common';
import { Frame } from '@nativescript/core/ui/frame';

export * from './videorecorder.common';

let listener;

export class VideoRecorder extends VideoRecorderCommon {
    public requestPermissions(explanation?: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const cameraPermissionStatus = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo);
            const audioPermissionStatus = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeAudio);
            let authStatus = cameraPermissionStatus === AVAuthorizationStatus.Authorized && audioPermissionStatus === AVAuthorizationStatus.Authorized;
            if (cameraPermissionStatus === AVAuthorizationStatus.NotDetermined) {
                try {
                    await this.requestCameraPermission();
                    authStatus = true;
                } catch (e) {
                    authStatus = false;
                }
            }

            if (audioPermissionStatus === AVAuthorizationStatus.NotDetermined) {
                try {
                    await this.requestAudioPermission();
                    authStatus = true;
                } catch (e) {
                    authStatus = false;
                }
            }
            if (authStatus) {
                resolve();
            } else {
                reject();
            }
        });
    }

    private requestCameraPermission() {
        return new Promise((resolve, reject) => {
            AVCaptureDevice.requestAccessForMediaTypeCompletionHandler(AVMediaTypeVideo, cameraPermissionStatus => {
                if (cameraPermissionStatus) {
                    resolve()
                } else {
                    reject();
                }
            });
        });
    }

    private requestAudioPermission() {
        return new Promise((resolve, reject) => {
            AVCaptureDevice.requestAccessForMediaTypeCompletionHandler(AVMediaTypeAudio, audioPermissionStatus => {
                if (audioPermissionStatus) {
                    resolve()
                } else {
                    reject();
                }
            });
        });
    }

    public hasCameraPermission(): boolean {
        return AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo) === AVAuthorizationStatus.Authorized
    }

    public hasAudioPermission(): boolean {
        return AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeAudio) === AVAuthorizationStatus.Authorized
    }

    public hasStoragePermission(): boolean {
        return PHPhotoLibrary.authorizationStatus() === PHAuthorizationStatus.Authorized;
    }

    public requestStoragePermission(explanation?: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            PHPhotoLibrary.requestAuthorization(auth => {
                if (auth === PHAuthorizationStatus.Authorized) {
                    resolve();
                } else {
                    reject();
                }
            });
        })
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

            if (types.isNumber(options.duration) && options.duration > 0) {
                picker.videoMaximumDuration = Number(options.duration);
            }

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

            let viewController;
            let topMostFrame = Frame.topmost();
            if (topMostFrame) {
                const topPage =
                    (topMostFrame.currentPage || topMostFrame.page);
                viewController = topPage.ios;
            } else {
                viewController = this.topViewController;
            }
            if (viewController) {
                viewController.presentViewControllerAnimatedCompletion(
                    picker,
                    true,
                    null
                );
            } else {
                reject('Failed');
            }
        });
    }


    private static get rootViewController(): UIViewController | undefined {
        const keyWindow = UIApplication.sharedApplication.keyWindow;
        return keyWindow != null ? keyWindow.rootViewController : undefined;
    }

    private get topViewController(): UIViewController | undefined {
        const root = VideoRecorder.rootViewController;
        if (root == null) {
            return undefined;
        }
        return this.findTopViewController(root);
    }

    private findTopViewController(
        root: UIViewController
    ): UIViewController | undefined {
        const presented = root.presentedViewController;
        if (presented != null) {
            return this.findTopViewController(presented);
        }
        if (root instanceof UISplitViewController) {
            const last = root.viewControllers.lastObject;
            if (last == null) {
                return root;
            }
            return this.findTopViewController(last);
        } else if (root instanceof UINavigationController) {
            const top = root.topViewController;
            if (top == null) {
                return root;
            }
            return this.findTopViewController(top);
        } else if (root instanceof UITabBarController) {
            const selected = root.selectedViewController;
            if (selected == null) {
                return root;
            }
            return this.findTopViewController(selected);
        } else {
            return root;
        }
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


