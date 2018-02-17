import { AdvancedVideoViewBase } from './advanced-video-view.common';
export declare class AdvancedVideoView extends AdvancedVideoViewBase {
  readonly duration: number;
  startRecording(): void;
  stopRecording(): void;
  stopPreview(): void;
  toggleCamera(): void;
  startPreview(): void;
}
