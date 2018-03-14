export interface Options {
  size?: number,
  hd?: boolean,
  saveToGallery?: boolean,
  duration?: number,
  explanation?: string,
  format?: VideoFormat,
  position?: CameraPosition,
}

export type CameraPosition = 'front' | 'back';
export type VideoFormat = 'default' | 'mp4';

export declare class VideoRecorder {
  options: Options
  
  constructor(options?: Options);

  public record(): Promise<any>;
  public requestPermissions(): Promise<any>;
}
