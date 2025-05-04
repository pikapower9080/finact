import { useContext, useRef } from "react";
import { Text } from "rsuite";
import { PlaybackContext } from "../App";
import Icon from "./Icon";

export default function Lyrics(props) {
  const state = props.state;
  const lyrics = props.lyrics;
  const lastLine = useRef(-1);

  const { setPlaybackState } = useContext(PlaybackContext);

  let isSynced = true;

  const activeLines = lyrics.Lyrics.filter((line) => {
    if (!("Start" in line)) {
      isSynced = false;
    }
    return props.position >= line.Start / 10000;
  });

  return (
    <div className="lyrics">
      {lyrics.Lyrics.map((line, index) => {
        const isCurrent = index === activeLines.length - 1;

        if (isCurrent && lastLine.current !== index) {
          lastLine.current = index;
          // Scroll to the current line
          const lineElement = document.querySelector(`.lyrics > p:nth-child(${index + 1})`);
          if (lineElement) {
            lineElement.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }
        }

        return (
          <Text
            className={isSynced ? "pointer" : ""}
            onClick={() => {
              if (!isSynced) {
                return;
              }
              setPlaybackState((prevState) => {
                return {
                  ...prevState,
                  position: line.Start / 1e7
                };
              });
            }}
            muted={isSynced ? !isCurrent : false}
            key={index + (line.Start || "")}
          >
            {line.Text || <Icon icon="more_horiz" noSpace />}
          </Text>
        );
      })}
    </div>
  );
}
