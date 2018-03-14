export interface Options {
  size?: number,
  hd?: boolean,
  saveToGallery?: boolean,
  duration?: number,
  explanation?: string,
  format?: VideoFormatType,
  position?: CameraPositionType,
}

export type CameraPositionType = 'front' | 'back' | 'none';
export type VideoFormatType = 'default' | 'mp4';

export enum CameraPosition {
  FRONT = 'front',
  BACK = 'back',
  NONE = 'none',
}

export enum VideoFormat {
  DEFAULT = 'default',
  MP4 = 'mp4',
}

export declare class VideoRecorder {
  options: Options
  
  constructor(options?: Options);

  public record(options?: Options): Promise<any>;
  public requestPermissions(): Promise<any>;
  public isAvailable(): boolean;
}
