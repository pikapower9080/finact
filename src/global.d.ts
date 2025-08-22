export {};

declare global {
  interface Window {
    electron?: {
      onCommand: (callback: (command: string) => void) => void;
      sendCommand: (command: string) => void;
      sendMessage: (message: string) => void;
      platform?: string;
    };
    process?: {
      type?: string;
    };
    debug?: any;
  }
  const __VERSION__: string;
}
