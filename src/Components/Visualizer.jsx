import { useContext, useEffect, useRef } from "react";
import { GlobalState } from "../App";

const canvasStyle = {
  position: "fixed",
  top: 0,
  left: 0
};

export default function Visualizer(props) {
  const { setLoading } = useContext(GlobalState);

  const canvasRef = useRef(null);
  const presetIndex = useRef(0);
  const visualizerRef = useRef(null);

  let presets = useRef(null);

  useEffect(() => {
    let closing = false;
    const audioContext = new AudioContext();
    setLoading(true);
    async function setup() {
      const butterchurn = (await import("butterchurn")).default;
      const butterchurnPresets = (await import("butterchurn-presets")).default;
      presets.current = butterchurnPresets.getPresets();

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
      visualizerRef.current = visualizer;

      visualizer.connectAudio(gainNode);

      visualizer.loadPreset(Object.values(presets.current)[0]);

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

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={canvasStyle}
      onClick={() => {
        if (!presets.current || !visualizerRef.current) {
          return;
        }
        if (presetIndex.current >= Object.values(presets.current).length) {
          presetIndex.current = 0;
        }

        visualizerRef.current.loadPreset(Object.values(presets.current)[presetIndex.current]);
        presetIndex.current++;
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!presets.current || !visualizerRef.current) {
          return;
        }
        if (presetIndex.current <= 0) {
          presetIndex.current = Object.values(presets.current).length - 1;
        } else {
          presetIndex.current--;
        }

        visualizerRef.current.loadPreset(Object.values(presets.current)[presetIndex.current]);
      }}
    ></canvas>
  );
}
