declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class BuildConfig {
        public static DEBUG: boolean;
        public static APPLICATION_ID: string;
        public static BUILD_TYPE: string;
        public static FLAVOR: string;
        public static VERSION_CODE: number;
        public static VERSION_NAME: string;
        public constructor();
      }
    }
  }
}

declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class Camera1 extends co.fitcom.fancycamera.CameraBase {
      }
    }
  }
}

declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class Camera2 extends co.fitcom.fancycamera.CameraBase {
      }
    }
  }
}

import androidviewTextureView = android.view.TextureView;
/// <reference path="./android.view.TextureView.d.ts" />
/// <reference path="./co.fitcom.fancycamera.CameraEventListener.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export abstract class CameraBase {
        public static CameraThread: string;
        public static CameraRecorderThread: string;
        public static PreviewThread: string;
        public static sessionThread: string;
        public getHolder(): androidviewTextureView;
        public getListener(): co.fitcom.fancycamera.CameraEventListener;
        public setListener(param0: co.fitcom.fancycamera.CameraEventListener): void;
      }
    }
  }
}

/// <reference path="./co.fitcom.fancycamera.PhotoEvent.d.ts" />
/// <reference path="./co.fitcom.fancycamera.VideoEvent.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class CameraEventListener {
        /**
         * Constructs a new instance of the co.fitcom.fancycamera.CameraEventListener interface with the provided implementation.
         */
        public constructor(implementation: {
          onPhotoEvent(param0: co.fitcom.fancycamera.PhotoEvent): void;
          onVideoEvent(param0: co.fitcom.fancycamera.VideoEvent): void;
        });
        public onPhotoEvent(param0: co.fitcom.fancycamera.PhotoEvent): void;
        public onVideoEvent(param0: co.fitcom.fancycamera.VideoEvent): void;
      }
    }
  }
}

/// <reference path="./co.fitcom.fancycamera.PhotoEvent.d.ts" />
/// <reference path="./co.fitcom.fancycamera.VideoEvent.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export abstract class CameraEventListenerUI {
        public onPhotoEvent(param0: co.fitcom.fancycamera.PhotoEvent): void;
        public onPhotoEventUI(param0: co.fitcom.fancycamera.PhotoEvent): void;
        public onVideoEvent(param0: co.fitcom.fancycamera.VideoEvent): void;
        public constructor();
        public onVideoEventUI(param0: co.fitcom.fancycamera.VideoEvent): void;
      }
    }
  }
}

/// <reference path="./java.lang.String.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class EventType {
        public static ERROR: co.fitcom.fancycamera.EventType;
        public static INFO: co.fitcom.fancycamera.EventType;
        public static values(): native.Array<co.fitcom.fancycamera.EventType>;
        public static valueOf(param0: string): co.fitcom.fancycamera.EventType;
      }
    }
  }
}

import androidcontentContext = android.content.Context;
import androidutilAttributeSet = android.util.AttributeSet;
import javaioFile = java.io.File;
import androidgraphicsSurfaceTexture = android.graphics.SurfaceTexture;
/// <reference path="./android.content.Context.d.ts" />
/// <reference path="./android.graphics.SurfaceTexture.d.ts" />
/// <reference path="./android.util.AttributeSet.d.ts" />
/// <reference path="./co.fitcom.fancycamera.CameraEventListener.d.ts" />
/// <reference path="./java.io.File.d.ts" />
/// <reference path="./java.lang.String.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class FancyCamera {
        public setQuality(param0: number): void;
        public getDuration(): number;
        public setListener(param0: co.fitcom.fancycamera.CameraEventListener): void;
        public startRecording(): void;
        public requestPermission(): void;
        public setCameraPosition(param0: number): void;
        public setCameraOrientation(param0: number): void;
        public onSurfaceTextureAvailable(param0: androidgraphicsSurfaceTexture, param1: number, param2: number): void;
        public onSurfaceTextureSizeChanged(param0: androidgraphicsSurfaceTexture, param1: number, param2: number): void;
        public hasPermission(): boolean;
        public stop(): void;
        public onSurfaceTextureDestroyed(param0: androidgraphicsSurfaceTexture): boolean;
        public start(): void;
        public setFile(param0: javaioFile): void;
        public toggleCamera(): void;
        public getCameraPosition(): number;
        public getCameraOrientation(): number;
        public constructor(param0: androidcontentContext);
        public onSurfaceTextureUpdated(param0: androidgraphicsSurfaceTexture): void;
        public constructor(param0: androidcontentContext, param1: androidutilAttributeSet);
        public stopRecording(): void;
        public release(): void;
      }
      export namespace FancyCamera {
        export class CameraPosition {
          public static BACK: co.fitcom.fancycamera.FancyCamera.CameraPosition;
          public static FRONT: co.fitcom.fancycamera.FancyCamera.CameraPosition;
          public getValue(): number;
          public static values(): native.Array<co.fitcom.fancycamera.FancyCamera.CameraPosition>;
          public static valueOf(param0: string): co.fitcom.fancycamera.FancyCamera.CameraPosition;
        }
        export class CameraOrientation {
          public static UNKNOWN: co.fitcom.fancycamera.FancyCamera.CameraOrientation;
          public static PORTRAIT: co.fitcom.fancycamera.FancyCamera.CameraOrientation;
          public static PORTRAIT_UPSIDE_DOWN: co.fitcom.fancycamera.FancyCamera.CameraOrientation;
          public static LANDSCAPE_LEFT: co.fitcom.fancycamera.FancyCamera.CameraOrientation;
          public static LANDSCAPE_RIGHT: co.fitcom.fancycamera.FancyCamera.CameraOrientation;
          public getValue(): number;
          public static values(): native.Array<co.fitcom.fancycamera.FancyCamera.CameraOrientation>;
          public static valueOf(param0: string): co.fitcom.fancycamera.FancyCamera.CameraOrientation;
        }
        export class Quality {
          public static MAX_480P: co.fitcom.fancycamera.FancyCamera.Quality;
          public static MAX_720P: co.fitcom.fancycamera.FancyCamera.Quality;
          public static MAX_1080P: co.fitcom.fancycamera.FancyCamera.Quality;
          public static MAX_2160P: co.fitcom.fancycamera.FancyCamera.Quality;
          public static HIGHEST: co.fitcom.fancycamera.FancyCamera.Quality;
          public static LOWEST: co.fitcom.fancycamera.FancyCamera.Quality;
          public static QVGA: co.fitcom.fancycamera.FancyCamera.Quality;
          public getValue(): number;
          public static valueOf(param0: string): co.fitcom.fancycamera.FancyCamera.Quality;
          public static values(): native.Array<co.fitcom.fancycamera.FancyCamera.Quality>;
        }
      }
    }
  }
}

/// <reference path="./co.fitcom.fancycamera.EventType.d.ts" />
/// <reference path="./java.io.File.d.ts" />
/// <reference path="./java.lang.String.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class PhotoEvent {
        public getFile(): javaioFile;
        public getMessage(): string;
        public getType(): co.fitcom.fancycamera.EventType;
      }
      export namespace PhotoEvent {
        export class EventError {
          public static values(): native.Array<co.fitcom.fancycamera.PhotoEvent.EventError>;
          public static valueOf(param0: string): co.fitcom.fancycamera.PhotoEvent.EventError;
        }
        export class EventInfo {
          public static values(): native.Array<co.fitcom.fancycamera.PhotoEvent.EventInfo>;
          public static valueOf(param0: string): co.fitcom.fancycamera.PhotoEvent.EventInfo;
        }
      }
    }
  }
}

/// <reference path="./co.fitcom.fancycamera.EventType.d.ts" />
/// <reference path="./java.io.File.d.ts" />
/// <reference path="./java.lang.String.d.ts" />
declare namespace co {
  export namespace fitcom {
    export namespace fancycamera {
      export class VideoEvent {
        public getFile(): javaioFile;
        public getMessage(): string;
        public getType(): co.fitcom.fancycamera.EventType;
      }
      export namespace VideoEvent {
        export class EventError {
          public static SERVER_DIED: co.fitcom.fancycamera.VideoEvent.EventError;
          public static UNKNOWN: co.fitcom.fancycamera.VideoEvent.EventError;
          public static values(): native.Array<co.fitcom.fancycamera.VideoEvent.EventError>;
          public static valueOf(param0: string): co.fitcom.fancycamera.VideoEvent.EventError;
        }
        export class EventInfo {
          public static RECORDING_STARTED: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static RECORDING_FINISHED: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static MAX_DURATION_REACHED: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static MAX_FILESIZE_APPROACHING: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static MAX_FILESIZE_REACHED: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static NEXT_OUTPUT_FILE_STARTED: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static UNKNOWN: co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static valueOf(param0: string): co.fitcom.fancycamera.VideoEvent.EventInfo;
          public static values(): native.Array<co.fitcom.fancycamera.VideoEvent.EventInfo>;
        }
      }
    }
  }
}

