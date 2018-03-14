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
  record(options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      options = options || {};
      let data = null;
      let file;
      const pkgName = utils.ad.getApplication().getPackageName();
      options.size = options.size || 0;
      options.hd = options.hd ? 1 : 0;
      options.saveToGallery = options.saveToGallery || false;
      options.duration = options.duration || 0;
      options.explanation = options.explanation || '';
      const startRecording = () => {
        const intent = new android.content.Intent(
          android.provider.MediaStore.ACTION_VIDEO_CAPTURE
        );

        intent.putExtra('android.intent.extra.videoQuality', options.hd);

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

        if (!options.saveToGallery) {
          // path = fs.path.join(fs.knownFolders.temp().path, fileName);
          // file = new java.io.File(path);
          if (sdkVersionInt >= 21) {
            path = app.android.currentContext.getExternalCacheDir(null)
            file = new java.io.File(path, fileName);
            tempPictureUri = (<any>android.support.v4
              .content).FileProvider.getUriForFile(
              app.android.foregroundActivity,
              pkgName + '.provider',
              file
            );
          } else {
            path = fs.path.join(fs.knownFolders.temp().path, fileName);
            file = new java.io.File(path);
            tempPictureUri = android.net.Uri.fromFile(file);
          }

          intent.putExtra(
            android.provider.MediaStore.EXTRA_OUTPUT,
            tempPictureUri
          );
        }

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
      };

      if (currentapiVersion >= MARSHMALLOW) {
        if (options.explanation.length > 0) {
          if (
            permissions.hasPermission(
              (android as any).Manifest.permission.CAMERA
            ) &&
            permissions.hasPermission(
              (android as any).Manifest.permission.RECORD_AUDIO
            )
          ) {
            startRecording();
          } else {
            requestPermissions(options.explanation)
              .then(function() {
                startRecording();
              })
              .catch(function() {
                reject({ event: 'camera permission needed' });
              });
          }
        } else {
          if (
            permissions.hasPermission(
              (android as any).Manifest.permission.CAMERA
            ) &&
            permissions.hasPermission(
              (android as any).Manifest.permission.RECORD_AUDIO
            )
          ) {
            startRecording();
          } else {
            requestPermissions(requestPermissions)
              .then(function() {
                startRecording();
              })
              .catch(function() {
                reject({ event: 'camera permission needed' });
              });
          }
        }
      } else {
        startRecording();
      }
    });
  }
}

export const requestPermissions = (options): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (currentapiVersion >= MARSHMALLOW) {
      if (
        Boolean(
          options && options.explanation && options.explanation.length > 0
        )
      ) {
        permissions
          .requestPermissions(
            [
              (android as any).Manifest.permission.CAMERA,
              (android as any).Manifest.permission.RECORD_AUDIO
            ],
            options.explanation
          )
          .then(granted => {
            console.dir(granted);
            resolve();
          })
          .catch(() => {
            reject();
          });
      } else {
        permissions
          .requestPermissions([
            (android as any).Manifest.permission.CAMERA,
            (android as any).Manifest.permission.RECORD_AUDIO
          ])
          .then(granted => {
            console.log(granted);
            resolve();
          })
          .catch(() => {
            reject();
          });
      }
    } else {
      resolve();
    }
  });
};

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