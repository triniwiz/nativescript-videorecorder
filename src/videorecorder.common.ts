import { VideoRecorder as VideoRecorderDefinition, VideoFormat, CameraPosition } from '.'
import { Options } from '.'

export abstract class VideoRecorder implements VideoRecorderDefinition {
  options: Options
  
  constructor(options?: Options) {
    this.options = {
      format: VideoFormat.DEFAULT,
      position: CameraPosition.NONE,
      size: 0,
      duration: 0,
      explanation: null,
      ...options,
      saveToGallery: !!options.saveToGallery,
      hd: !!options.hd,
    }
  }

  // @deprecated Options as argument is deprecated here
  public record(options?: Options): Promise<any> {
    options = { ...this.options, ...options }

    return this.requestPermissions(options).catch((err) => {
      throw { event: 'denied' }
    }).then(() => this._startRecording(options))
  }

  public requestPermissions(options?: Options): Promise<any> {
    return Promise.resolve()
  }

  public isAvailable(): boolean {
    return false
  }

  protected _startRecording(options?: Options): Promise<any> {
    return Promise.reject({ event: 'failed' })
  }
}

export default VideoRecorder