import { useContext } from "react";
import { Text } from "rsuite";
import { PlaybackContext } from "../App";
import Icon from "./Icon";

export default function Lyrics(props) {
  const state = props.state;
  const lyrics = props.lyrics;

  const { setPlaybackState } = useContext(PlaybackContext);

  return (
    <div className="lyrics">
      {lyrics.Lyrics.map((line, index) => {
        const isCurrent = props.position >= line.Start / 10000;

        return (
          <Text
            className="pointer"
            onClick={() => {
              setPlaybackState((prevState) => {
                return {
                  ...prevState,
                  position: line.Start / 1e7
                };
              });
            }}
            muted={!isCurrent}
            key={index + (line.Start || "")}
          >
            {line.Text || <Icon icon="more_horiz" noSpace />}
          </Text>
        );
      })}
    </div>
  );
}
