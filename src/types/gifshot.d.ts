declare module 'gifshot' {
  interface GifshotOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    quality?: number;
  }

  interface GifshotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image?: string;
  }

  interface Gifshot {
    createGIF(
      options: GifshotOptions,
      callback: (result: GifshotResult) => void
    ): void;
  }

  const gifshot: Gifshot;
  export default gifshot;
} 