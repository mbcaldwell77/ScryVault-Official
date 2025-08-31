declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target: HTMLElement;
      constraints: {
        width: { min: number };
        height: { min: number };
        facingMode: string;
        aspectRatio: { min: number; max: number };
      };
    };
    locator: {
      patchSize: string;
      halfSample: boolean;
    };
    numOfWorkers: number;
    frequency: number;
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
    };
  }

  interface QuaggaProcessedResult {
    boxes?: unknown[];
    box?: unknown;
    codeResult?: {
      code: string;
    };
    line?: unknown;
  }

  interface QuaggaStatic {
    init(config: QuaggaConfig, callback: (err: unknown) => void): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: QuaggaProcessedResult) => void): void;
    canvas: {
      dom: {
        overlay: HTMLCanvasElement;
      };
    };
    ImageDebug: {
      drawPath(path: unknown, options: { x: number | string; y: number | string }, context: CanvasRenderingContext2D, options2: { color: string; lineWidth: number }): void;
    };
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
}
