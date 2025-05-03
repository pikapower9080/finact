import { useContext, useEffect, useRef } from "react";
import { LoadingContext } from "../App";

const canvasStyle = {
  position: "fixed",
  top: 0,
  left: 0
};

export default function Visualizer(props) {
  const { setLoading } = useContext(LoadingContext);

  const canvasRef = useRef(null);

  useEffect(() => {
    let closing = false;
    const audioContext = new AudioContext();
    setLoading(true);
    async function setup() {
      const butterchurn = (await import("butterchurn")).default;
      const butterchurnPresets = (await import("butterchurn-presets")).default;

      const streamNode = audioContext.createMediaStreamSource(props.audioRef.current.captureStream());
      props.audioRef.current.muted = true;

      const gainNode = audioContext.createGain();

      streamNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const visualizer = butterchurn.createVisualizer(audioContext, canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        textureRatio: 1
      });

      visualizer.connectAudio(gainNode);

      visualizer.loadPreset(Object.values(butterchurnPresets.getPresets())[0]);

      setLoading(false);
      function render() {
        visualizer.render();

        if (closing) {
          return;
        }

        requestAnimationFrame(render);
      }

      render();
    }

    setup();

    return () => {
      closing = true;
      props.audioRef.current.muted = false;
      audioContext.close();
    };
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={canvasStyle}></canvas>;
}
