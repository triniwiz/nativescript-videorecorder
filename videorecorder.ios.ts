import * as frameModule from "ui/frame";
var listener;
export class VideoRecorder {
    constructor() { }

    record(options: any): Promise<any> {
		return new Promise((resolve, reject) => {
			listener = null;
			var videoEditorController = new UIVideoEditorController();
			var saveToGallery = true;
			var quality = 0;
			var duration = 0.0;
			if (options) {
				saveToGallery = options.saveToGallery ? true : false;
				quality = options.hd ? 1 : 0;
				duration = options.duration || 0.0;
			}

			if (saveToGallery) {
				listener = UIVideoEditorControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { duration: duration, quality: quality, saveToGallery: saveToGallery });
			}
			else {
				listener = UIVideoEditorControllerDelegateImpl.new().initWithCallback(resolve);
			}
			videoEditorController.delegate = listener;

			var sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera;
			var mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(sourceType);

			if (mediaTypes) {
				videoEditorController.mediaTypes = mediaTypes;
				videoEditorController.sourceType = sourceType;
			}

			videoEditorController.modalPresentationStyle = UIModalPresentationStyle.UIModalPresentationCurrentContext;

			var frame: typeof frameModule = require("ui/frame");

			var topMostFrame = frame.topmost();
			if (topMostFrame) {
				var viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
				if (viewController) {
					viewController.presentViewControllerAnimatedCompletion(videoEditorController, true, null);
				}
			}
		}
		)
	}

}

class UIVideoEditorControllerDelegateImpl extends NSObject implements UIVideoEditorControllerDelegate {
    public static ObjCProtocols = [UIVideoEditorControllerDelegate];

    static new(): UIVideoEditorControllerDelegateImpl {
        return <UIVideoEditorControllerDelegateImpl>super.new();
    }

    private _callback: (result?) => void;

    private _saveToGallery: boolean;

    public initWithCallback(callback: (result?) => void): UIVideoEditorControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    public initWithCallbackAndOptions(callback: (result?) => void, options?): UIVideoEditorControllerDelegateImpl {
        this._callback = callback;
        if (options) {
			this.videoQuality = options.quality;
			this.videoMaximumDuration = options.duration;
			this._saveToGallery = options.saveToGallery;
        }
        return this;
    }

    didSaveEditedVideoToPath(editedVideoPath): void {
        if (editedVideoPath) {
			var moviePath = editedVideoPath;

			if (this._callback) {
				if (this._saveToGallery) {
					if (UIVideoAtPathIsCompatibleWithSavedPhotosAlbum(moviePath)) {
						UISaveVideoAtPathToSavedPhotosAlbum(moviePath, null, null, null);
					}
				}
				this._callback({ filePath: editedVideoPath });
			}
        }
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }

    videoEditorControllerDidCancel(picker): void {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }
}

