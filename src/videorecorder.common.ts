import { VideoRecorder as VideoRecorderDefinition } from '.'
import { Options } from '.'

export abstract class VideoRecorder implements VideoRecorderDefinition {
  options: Options
  
  constructor(options?: Options) {
    this.options = {
      format: 'default',
      position: 'back',
      size: 0,
      duration: 0,
      explanation: null,
      ...options,
      saveToGallery: !!options.saveToGallery,
      hd: !!options.hd,
    }
  }

  public record(options?: Options): Promise<any> {
    options = { ...this.options, ...options }

    return this.requestPermissions(options).catch((err) => {
      throw { event: 'denied' }
    }).then(() => this._startRecording(options))
  }

  public requestPermissions(options?: Options): Promise<any> {
    return Promise.resolve()
  }

  protected _startRecording(options?: Options): Promise<any> {
    return Promise.reject({ event: 'failed' })
  }
}

export default VideoRecorder