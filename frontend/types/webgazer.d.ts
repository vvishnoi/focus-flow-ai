// Type definitions for webgazer
declare module 'webgazer' {
  interface GazeData {
    x: number;
    y: number;
  }

  interface WebGazer {
    setGazeListener(listener: (data: GazeData | null, timestamp: number) => void): WebGazer;
    begin(): Promise<void>;
    end(): Promise<void>;
    pause(): void;
    resume(): void;
    showPredictionPoints(show: boolean): WebGazer;
    params: {
      showVideoPreview: boolean;
      showFaceOverlay: boolean;
      showFaceFeedbackBox: boolean;
    };
  }

  const webgazer: WebGazer;
  export default webgazer;
}
