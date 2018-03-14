import { Options } from '.'

import * as permissions from 'nativescript-permissions';
import * as app from 'tns-core-modules/application';
import * as platform from 'tns-core-modules/platform';
import * as fs from 'tns-core-modules/file-system';
import * as utils from 'tns-core-modules/utils/utils';
import './async-await';
const RESULT_CANCELED = 0;
const RESULT_OK = -1;
const REQUEST_VIDEO_CAPTURE = 999;
const REQUEST_CODE_ASK_PERMISSIONS = 1000;
const ORIENTATION_UNKNOWN = -1;
const PERMISSION_DENIED = -1;
const PERMISSION_GRANTED = 0;
const MARSHMALLOW = 23;
const currentapiVersion = android.os.Build.VERSION.SDK_INT;

export class VideoRecorder {
  record(options: Options = null): Promise<any> {
    options = options || {};
    options.size = options.size || 0;
    options.hd = !!options.hd;
    options.saveToGallery = options.saveToGallery || false;
    options.duration = options.duration || 0;
    options.explanation = options.explanation || '';

    return this._handlePermissions(options).then(() => this._startRecording(options))
  }

  private _handlePermissions (options: Options): Promise<any> {
    return permissions.requestPermissions(
      [
        (android as any).Manifest.permission.CAMERA,
        (android as any).Manifest.permission.RECORD_AUDIO
      ],
      options.explanation && options.explanation.length && options.explanation
    )
      .catch((err) => {
        throw { event: 'denied' }
      })
  }

  private _startRecording (options: Options): Promise<any> {
    return new Promise ((resolve, reject) => {
      let data = null;
      let file;
      const pkgName = utils.ad.getApplication().getPackageName();

      const state = app.android.currentContext.getExternalStorageState()
      if (state !== android.os.Environment.MEDIA_MOUNTED) {
        return reject({ event: 'no_external_storage_access' })
      }

      const intent = new android.content.Intent(
        android.provider.MediaStore.ACTION_VIDEO_CAPTURE
      );

      intent.putExtra('android.intent.extra.videoQuality', options.hd ? 1 : 0);

      if (options.size > 0) {
        intent.putExtra(
          android.provider.MediaStore.EXTRA_SIZE_LIMIT,
          options.size * 1024 * 1024
        );
      }
      const fileName = `VID_${+new Date()}.mp4`;
      let path;
      let tempPictureUri;
      const sdkVersionInt = parseInt(platform.device.sdkVersion, 10);

      if (options.saveToGallery) {
        path = android.os.Environment.getExternalStoragePublicDirectory(
          android.os.Environment.DIRECTORY_DCIM
        ).getAbsolutePath() + '/Camera';
      } else {
        path = app.android.currentContext.getExternalFileDir(null).getAbsolutePath();
      }

      file = new java.io.File(path + '/' + fileName);

      if (sdkVersionInt >= 21) {
        tempPictureUri = (<any>android.support.v4.content).FileProvider.getUriForFile(
          app.android.foregroundActivity, // or app.android.currentContext ??
          `${pkgName}.provider`,
          file
        );
      } else {
        tempPictureUri = android.net.Uri.fromFile(file);
      }

      intent.putExtra(
        android.provider.MediaStore.EXTRA_OUTPUT,
        tempPictureUri
      );

      if (options.duration > 0) {
        intent.putExtra(
          android.provider.MediaStore.EXTRA_DURATION_LIMIT,
          options.duration
        );
      }

      if (
        intent.resolveActivity(app.android.context.getPackageManager()) !=
        null
      ) {
        app.android.off(app.AndroidApplication.activityResultEvent);
        app.android.currentContext.onActivityResult = (requestCode, resultCode, resultData) => {
          if (requestCode === REQUEST_VIDEO_CAPTURE && resultCode === RESULT_OK) {
            const mediaFile = resultData ? resultData.getData() : file
            if (options.saveToGallery) {
              resolve({ file: getRealPathFromURI(mediaFile) });
            } else {
              resolve({ file: file.toString() });
            }
          } else if (resultCode === RESULT_CANCELED) {
            reject({ event: 'cancelled' });
          } else {
            reject({ event: 'failed' });
          }
        };

        app.android.foregroundActivity.startActivityForResult(
          intent,
          REQUEST_VIDEO_CAPTURE
        );
      } else {
        reject({ event: 'failed' });
      }
    });
  }
}

function getRealPathFromURI(contentUri: android.net.Uri): string {
  let path: string;
  const activity = app.android.startActivity;
  const proj: Array<string> = [android.provider.MediaStore.MediaColumns.DATA];
  const cursor: android.database.Cursor = activity.getApplicationContext()
    .getContentResolver()
    .query(contentUri, proj, null, null, null);

  if (cursor.moveToFirst()) {
    const columnIndex: number = cursor.getColumnIndexOrThrow(android.provider.MediaStore.MediaColumns.DATA);
    path = cursor.getString(columnIndex);
  }
  cursor.close();

  return path;
}