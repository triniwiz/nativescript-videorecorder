
export interface Options {
  size?: number,
  hd?: boolean,
  saveToGallery?: boolean,
  duration?: number,
  explanation?: string,
  format?: 'default' | 'mp4',
  position?: CameraPosition,
}

export type CameraPosition = 'front' | 'back';
export type VideoFormat = 'default' | 'mp4';

export declare class VideoRecorder {
  record(options?: Options): Promise<any>;
}
export declare const requestPermissions: (options: any) => Promise<any>;
