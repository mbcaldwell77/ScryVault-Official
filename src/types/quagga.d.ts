declare module 'quagga' {
  export interface QuaggaConfig {
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

  export interface QuaggaResult {
    codeResult: {
      code: string;
    };
  }

  export interface QuaggaProcessedResult {
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
    offDetected(callback?: (result: QuaggaResult) => void): void;
    offProcessed(callback?: (result: QuaggaProcessedResult) => void): void;
    canvas: {
      dom: {
        overlay: HTMLCanvasElement;
      };
    };
    ImageDebug: {
      drawPath(path: unknown, opts: { x: number | string; y: number | string }, ctx: CanvasRenderingContext2D, style: { color: string; lineWidth: number }): void;
    };
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
}
