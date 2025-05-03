import { useContext, useEffect, useRef } from "react";
import { PlaybackContext } from "../App";

import butterchurn from "butterchurn";
import butterchurnPresets from "butterchurn-presets";

const canvasStyle = {
  // width: "100%",
  // height: "100%",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: -1
};

export default function Visualizer(props) {
  const { playbackState } = useContext(PlaybackContext);

  const canvasRef = useRef(null);

  useEffect(() => {
    let closing = false;
    const audioContext = new AudioContext();

    const sourceNode = audioContext.createMediaElementSource(props.audioRef.current);

    const gainNode = audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    // gainNode.connect(audioContext.destination);

    const visualizer = butterchurn.createVisualizer(audioContext, canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      textureRatio: 1
    });

    visualizer.connectAudio(gainNode);

    visualizer.loadPreset(Object.values(butterchurnPresets.getPresets())[0]);

    function render() {
      visualizer.render();

      if (closing) {
        return;
      }

      requestAnimationFrame(render);
    }

    render();

    return () => {
      closing = true;
      sourceNode.disconnect(gainNode);
      gainNode.disconnect(audioContext.destination);
      audioContext.close();
    };
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={canvasStyle}></canvas>;
}
