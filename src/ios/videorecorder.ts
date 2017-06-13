import * as frame from "ui/frame";
import * as trace from "trace";
import * as fs from "file-system";
import * as types from "utils/types";
import { Color } from "color";
let listener;
export class VideoRecorder {
	record(options?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			listener = null;
			let picker = UIImagePickerController.new();
			let sourceType = UIImagePickerControllerSourceType.Camera;
			picker.mediaTypes = <any>[kUTTypeMovie];
			picker.sourceType = sourceType;
			options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
			options.hd = Boolean(options.hd) ? true : false;
			picker.cameraCaptureMode = UIImagePickerControllerCameraCaptureMode.Video;

			picker.allowsEditing = false;

			picker.videoQuality = options.hd ? UIImagePickerControllerQualityType.TypeHigh : UIImagePickerControllerQualityType.TypeLow;

			picker.videoMaximumDuration = types.isNumber(options.duration) ? Number(options.duration) : Number.POSITIVE_INFINITY;

			if (options && options.saveToGallery) {
				let authStatus = PHPhotoLibrary.authorizationStatus();
				if (authStatus === PHAuthorizationStatus.Authorized) {
					options.saveToGallery = true;
				}
			}

			if (options) {
				listener = UIImagePickerControllerDelegateImpl.initWithOwnerCallbackOptions(new WeakRef(this), resolve, options);
			} else {
				listener = UIImagePickerControllerDelegateImpl.initWithCallback(resolve);
			}

			picker.delegate = listener;
			picker.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

			let topMostFrame = frame.topmost();
			if (topMostFrame) {
				let viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
				if (viewController) {
					viewController.presentViewControllerAnimatedCompletion(picker, true, null);
				}
			}

		});
	}
}
type VideoFormat = "default" | "mp4";
class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
	public static ObjCProtocols = [UIImagePickerControllerDelegate];
	private _saveToGallery: boolean;
	private _callback: (result?) => void;
	private _format: VideoFormat = "default";
	private _hd: boolean;
	public static initWithCallback(callback: (result?) => void): UIImagePickerControllerDelegateImpl {
		let delegate = new UIImagePickerControllerDelegateImpl();
		delegate._callback = callback;
		return delegate;
	}
	public static initWithOwnerCallbackOptions(owner: WeakRef<VideoRecorder>, callback: (result?) => void, options?: any): UIImagePickerControllerDelegateImpl {
		let delegate = new UIImagePickerControllerDelegateImpl();
		if (options) {
			delegate._saveToGallery = options.saveToGallery;
			delegate._format = options.format;
			delegate._hd = options.hd;
		}
		delegate._callback = callback;
		return delegate;
	}
	imagePickerControllerDidCancel(picker: UIImagePickerController) {
		picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
		listener = null;
	}

	imagePickerControllerDidFinishPickingMediaWithInfo(picker: UIImagePickerController, info: NSDictionary<string, any>) {
		if (info) {
			let currentDate: Date = new Date();
			if (this._saveToGallery) {
				let source = info.objectForKey(UIImagePickerControllerMediaURL);
				if (this._format === "mp4") {
					let asset = AVAsset.assetWithURL(source);
					let preset = this._hd ? AVAssetExportPresetHighestQuality : AVAssetExportPresetLowQuality;
					let session = AVAssetExportSession.exportSessionWithAssetPresetName(asset, preset);
					session.outputFileType = AVFileTypeMPEG4;
					let fileName = `videoCapture_${+new Date()}.mp4`;
					let path = fs.path.join(fs.knownFolders.documents().path, fileName);
					let nativePath = NSURL.fileURLWithPath(path);
					session.outputURL = nativePath;
					session.exportAsynchronouslyWithCompletionHandler(() => {
						let assetLibrary = ALAssetsLibrary.alloc().init();
						assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(nativePath, (file, error) => {
							if (!error) {
								this._callback();
							}
							fs.File.fromPath(path).remove();
						});
					});

				} else {
					let assetLibrary = ALAssetsLibrary.alloc().init();
					assetLibrary.writeVideoAtPathToSavedPhotosAlbumCompletionBlock(source, (file, error) => {
						if (!error) {
							this._callback();
						} else {
							console.log(error.localizedDescription);
						}
						//fs.File.fromPath(source.path).remove();
					});
				}
			} else {
				let source = info.objectForKey(UIImagePickerControllerMediaURL);
				if (this._format === "mp4") {
					let asset = AVAsset.assetWithURL(source);
					let preset = this._hd ? AVAssetExportPresetHighestQuality : AVAssetExportPresetLowQuality;
					let session = AVAssetExportSession.exportSessionWithAssetPresetName(asset, preset);
					session.outputFileType = AVFileTypeMPEG4;
					let fileName = `videoCapture_${+new Date()}.mp4`;
					let path = fs.path.join(fs.knownFolders.documents().path, fileName);
					let nativePath = NSURL.fileURLWithPath(path);
					session.outputURL = nativePath;
					session.exportAsynchronouslyWithCompletionHandler(() => {
						fs.File.fromPath(source.path).remove();
						this._callback({ file: path });
					});
				} else {
					this._callback({ file: source.path });
				}
			}
			picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
			listener = null;
		}
	};
}

/* TODO finish overlay
type CameraPosition = "front" | "back";
export class AdvancedVideoRecorder {
	_output: AVCaptureMovieFileOutput;
	_file: NSURL;
	private session: AVCaptureSession;
	stop() {
		this.session.stopRunning();
	}
	open(options?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			try {


				this.session = new AVCaptureSession();
				let devices = AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo);
				let device: AVCaptureDevice;

				options.saveToGallery = Boolean(options.saveToGallery) ? true : false;
				options.hd = Boolean(options.hd) ? true : false;
				options.position = types.isString(options.position) ? options.position : "back";
				let pos = options.position === "front" ? AVCaptureDevicePosition.Front : AVCaptureDevicePosition.Back;
				for (let i = 0; i < devices.count; i++) {
					if (devices[i].position === pos) {
						device = devices[i];
						break;
					}
				}

				//let errorRef = new interop.Reference();
				let input: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(device, null);


				let audioDevice = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeAudio);
				//let errorRef = new interop.Reference();
				let audioInput: AVCaptureDeviceInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(audioDevice, null);

				this._output = new AVCaptureMovieFileOutput();
				let fileName = `videoCapture_${+new Date()}.mp4`;
				let path = fs.path.join(fs.knownFolders.documents().path, fileName);
				this._file = NSURL.fileURLWithPath(path);
				if (!input) {
					throw new Error("Error trying to open camera.");
				}

				if (!audioInput) {
					throw new Error("Error trying to open mic.");
				}
				//this._output.maxRecordedDuration = types.isNumber(options.duration) ? CMTimeMakeWithSeconds(options.duration, 1) : kCMTimePositiveInfinity;

				// if (options.size > 0) {
				// 	this._output.maxRecordedFileSize = (options.size * 1024 * 1024);
				// }

				this.session.beginConfiguration();
				this.session.sessionPreset = options.hd ? AVCaptureSessionPresetHigh : AVCaptureSessionPresetLow;

				this.session.addInput(input);

				this.session.addInput(audioInput);

				this.session.addOutput(this._output);

				this.session.commitConfiguration();

				let preview = AVCaptureVideoPreviewLayer.alloc().initWithSession(this.session);

				let vc: UIViewController = UIViewController.new(); // frame.topmost().currentPage && frame.topmost().currentPage.ios;
				vc.view = UIView.new();
				let parentLayer = CALayer.layer();
				let fgLayer = CALayer.layer();
				let nc = (<UINavigationController>frame.topmost().ios.controller).initWithRootViewController(vc);
				let fg = UIView.new();
				let fgFooter = UIView.new();
				let fgHeader = UIView.new();
				fgFooter.backgroundColor = new Color("40000000").ios;
				let bg = UIView.new();
				fg.frame = CGRectMake(0,0,300,600)
				fgLayer.contents = <any>[fg];

				fg.translatesAutoresizingMaskIntoConstraints = false;
				fgFooter.translatesAutoresizingMaskIntoConstraints = false;
				bg.translatesAutoresizingMaskIntoConstraints = false;

				let fgFooterConstraintHeight = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(fgFooter, NSLayoutAttribute.Height, NSLayoutRelation.Equal, fg, NSLayoutAttribute.Height, .2, 0);
				let fgFooterConstraintAlign = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(fgFooter, NSLayoutAttribute.Bottom, NSLayoutRelation.Equal, fg, NSLayoutAttribute.Bottom, 1, 0);
				let fgFooterConstraintWidth = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(fgFooter, NSLayoutAttribute.Width, NSLayoutRelation.Equal, fg, NSLayoutAttribute.Width, 1, 0);

				let fgConstraintHeight = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(fg, NSLayoutAttribute.Height, NSLayoutRelation.Equal, vc.view, NSLayoutAttribute.Height, 1, 0);
				let fgConstraintWidth = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(fg, NSLayoutAttribute.Width, NSLayoutRelation.Equal, vc.view, NSLayoutAttribute.Width, 1, 0);

				let bgConstraintHeight = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(bg, NSLayoutAttribute.Height, NSLayoutRelation.Equal, vc.view, NSLayoutAttribute.Height, 1, 0);
				let bgConstraintWidth = NSLayoutConstraint.constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(bg, NSLayoutAttribute.Width, NSLayoutRelation.Equal, vc.view, NSLayoutAttribute.Width, 1, 0);

				// vc.view.addConstraints(<any>[
				// 	fgConstraintHeight,
				// 	fgConstraintWidth,
				// 	bgConstraintHeight,
				// 	bgConstraintWidth
				// ]);
				vc.view.backgroundColor = UIColor.orangeColor;
				fg.backgroundColor = UIColor.redColor;
				fg.addSubview(fgFooter);
				fg.addConstraints(<any>[
					fgFooterConstraintHeight,
					fgFooterConstraintAlign,
					fgFooterConstraintWidth
				]);

				let btn = UIButton.new();
				btn.setTitleForState("Record", UIControlState.Normal);
				btn.backgroundColor = UIColor.blueColor;
				fgFooter.addSubview(btn);

				dispatch_async(dispatch_get_current_queue(), () => {
					preview.videoGravity = AVLayerVideoGravityResizeAspectFill;
					preview.frame = fg.bounds;
					parentLayer.addSublayer(preview);
					parentLayer.addSublayer(fgLayer);
					vc.view.layer.addSublayer(parentLayer);
				});

				if (!this.session.running) {
					this.session.startRunning();
				}
				resolve();
			} catch (ex) {
				reject(ex);
			}
		});
	}
	record(): Promise<any> {
		return new Promise((resolve, reject) => {
			let delegate = AVCaptureFileOutputRecordingDelegateImpl.initWithOwnerCallback(new WeakRef(this), resolve);
			this._output.startRecordingToOutputFileURLRecordingDelegate(this._file, delegate);
		});
	}
}

class AVCaptureFileOutputRecordingDelegateImpl extends NSObject implements AVCaptureFileOutputRecordingDelegate {
	private _callback;
	private _owner: WeakRef<AdvancedVideoRecorder>;
	public static initWithOwnerCallback(owner: WeakRef<AdvancedVideoRecorder>, callback: Function): AVCaptureFileOutputRecordingDelegateImpl {
		let delegate = new AVCaptureFileOutputRecordingDelegateImpl();
		delegate._callback = callback;
		delegate._owner = owner;
		return delegate;
	}
	captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(captureOutput: AVCaptureFileOutput, outputFileURL: NSURL, connections: NSArray<any>, error: NSError): void {
		if (!error) {
			this._callback(null, { file: outputFileURL });
		} else {
			this._callback(error.localizedDescription);
		}
	}
	captureOutputDidStartRecordingToOutputFileAtURLFromConnections(captureOutput: AVCaptureFileOutput, fileURL: NSURL, connections: NSArray<any>): void {
		//	throw new Error('Method not implemented.');
		console.log("Started")
		setTimeout(() => {
			this._owner.get().stop();
		}, 5000);
	}

	public static ObjCProtocols = [AVCaptureFileOutputRecordingDelegate];

}
*/
export var requestPermissions = function () {
	let authStatus = PHPhotoLibrary.authorizationStatus();
	if (authStatus === PHAuthorizationStatus.NotDetermined) {
		PHPhotoLibrary.requestAuthorization((auth) => {
			if (auth === PHAuthorizationStatus.Authorized) {
				if (trace.enabled) {
					trace.write("Application can access photo library assets.", trace.categories.Debug);
				}
				return;
			}
		})
	} else if (authStatus !== PHAuthorizationStatus.Authorized) {
		if (trace.enabled) {
			trace.write("Application can not access photo library assets.", trace.categories.Debug);
		}
	}
}
