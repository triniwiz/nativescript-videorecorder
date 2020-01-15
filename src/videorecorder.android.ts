import * as permissions from 'nativescript-permissions';
import * as app from '@nativescript/core/application';
import * as platform from '@nativescript/core/platform';
import * as utils from '@nativescript/core/utils/utils';
import * as types from '@nativescript/core/utils/types';
import './async-await';
import { CameraPosition, Options, RecordResult, VideoRecorderCommon } from './videorecorder.common';

declare let global: any;

function useAndroidX() {
    return global.androidx && global.androidx.appcompat;
}

const ContentNamespace = useAndroidX() ? (androidx as any).core.content : (android as any).support.v4.content;

export * from './videorecorder.common';

const RESULT_CANCELED = 0;
const RESULT_OK = -1;
const REQUEST_VIDEO_CAPTURE = 999;

export class VideoRecorder extends VideoRecorderCommon {
    public requestPermissions(explanation?: string): Promise<void> {
        return permissions.requestPermissions(
            [
                (android as any).Manifest.permission.CAMERA,
                (android as any).Manifest.permission.RECORD_AUDIO
            ],
            types.isNullOrUndefined(explanation) ? '' : explanation
        );
    }

    public hasCameraPermission(): boolean {
        return permissions.hasPermission((android as any).Manifest.permission.CAMERA);
    }

    public hasAudioPermission(): boolean {
        return permissions.hasPermission((android as any).Manifest.permission.RECORD_AUDIO)
    }

    public hasStoragePermission(): boolean {
        return permissions.hasPermission((android as any).Manifest.permission.WRITE_EXTERNAL_STORAGE) &&
            permissions.hasPermission((android as any).Manifest.permission.READ_EXTERNAL_STORAGE)
    }

    public requestStoragePermission(explanation?: string): Promise<any> {
        return permissions.requestPermissions([
                (android as any).Manifest.permission.READ_EXTERNAL_STORAGE,
                (android as any).Manifest.permission.WRITE_EXTERNAL_STORAGE
            ],
            types.isNullOrUndefined(explanation) ? '' : explanation)
    }

    public static isAvailable() {
        return app.android.context
            .getPackageManager()
            .hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA);
    }

    protected _startRecording(
        options: Options = this.options
    ): Promise<RecordResult> {
        return new Promise((resolve, reject) => {
            let data = null;
            let file;
            const pkgName = utils.ad.getApplication().getPackageName();

            const state = android.os.Environment.getExternalStorageState();
            if (state !== android.os.Environment.MEDIA_MOUNTED) {
                return reject({event: 'failed'});
            }

            const intent = new android.content.Intent(
                android.provider.MediaStore.ACTION_VIDEO_CAPTURE
            );

            intent.putExtra('android.intent.extra.videoQuality', options.hd ? 1 : 0);

            if (options.position !== CameraPosition.NONE) {
                intent.putExtra(
                    'android.intent.extras.CAMERA_FACING',
                    options.position === CameraPosition.BACK
                        ? android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT
                        : android.hardware.Camera.CameraInfo.CAMERA_FACING_BACK
                );
            }

            if (options.size > 0) {
                intent.putExtra(
                    android.provider.MediaStore.EXTRA_SIZE_LIMIT,
                    options.size * 1024 * 1024
                );
            }

            const fileName = `VID_${Date.now()}.mp4`;
            let path;
            let tempPictureUri;
            const sdkVersionInt = parseInt(platform.device.sdkVersion, 10);

            if (options.saveToGallery) {
                path =
                    android.os.Environment.getExternalStoragePublicDirectory(
                        android.os.Environment.DIRECTORY_DCIM
                    ).getAbsolutePath() + '/Camera';
            } else {
                path = app.android.context
                    .getExternalFilesDir(null)
                    .getAbsolutePath();
            }

            file = new java.io.File(path + '/' + fileName);

            if (sdkVersionInt >= 21) {
                tempPictureUri = (<any>(
                    ContentNamespace
                )).FileProvider.getUriForFile(
                    app.android.foregroundActivity || app.android.startActivity,
                    `${pkgName}.provider`,
                    file
                );
            } else {
                tempPictureUri = android.net.Uri.fromFile(file);
            }

            intent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);

            if (options.duration > 0) {
                intent.putExtra(
                    android.provider.MediaStore.EXTRA_DURATION_LIMIT,
                    options.duration
                );
            }

            if (
                intent.resolveActivity(app.android.context.getPackageManager()) != null
            ) {
                const callBack = (args: app.AndroidActivityResultEventData) => {
                    if (
                        args.requestCode === REQUEST_VIDEO_CAPTURE &&
                        args.resultCode === RESULT_OK
                    ) {
                          const mediaFile = args.intent ? args.intent.getData() : file;
                        if (options.saveToGallery) {
                            resolve({file: getRealPathFromURI(mediaFile)});
                        } else {
                            resolve({file: file.toString()});
                        }
                    } else if (args.resultCode === RESULT_CANCELED) {
                        reject({event: 'cancelled'});
                    } else {
                        reject({event: 'failed'});
                    }

                    app.android.off(app.AndroidApplication.activityResultEvent, callBack);
                };
                app.android.on(app.AndroidApplication.activityResultEvent, callBack);

                app.android.foregroundActivity.startActivityForResult(
                    intent,
                    REQUEST_VIDEO_CAPTURE
                );
            } else {
                reject({event: 'failed'});
            }
        });
    }


}

function getRealPathFromURI(contentUri: android.net.Uri): string {
    let path: string;
    const activity = app.android.startActivity || app.android.foregroundActivity;
    const proj: Array<string> = [android.provider.MediaStore.MediaColumns.DATA];
    const cursor: android.database.Cursor = activity
        .getApplicationContext()
        .getContentResolver()
        .query(contentUri, proj, null, null, null);

    if (cursor.moveToFirst()) {
        const columnIndex: number = cursor.getColumnIndexOrThrow(
            android.provider.MediaStore.MediaColumns.DATA
        );
        path = cursor.getString(columnIndex);
    }
    cursor.close();
    return path;
}
