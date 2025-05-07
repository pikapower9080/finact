import { useContext, useEffect, useRef, useState } from "react";
import { Text } from "rsuite";
import { GlobalState } from "../App";
import Icon from "./Icon";
import { getCacheStorage } from "../storage";
import { jellyfinRequest } from "../Util/Network";

const cacheStorage = getCacheStorage();

export default function Lyrics(props) {
  const state = props.state;
  const lastLine = useRef(-1);
  const [lyrics, setLyrics] = useState(null);

  const { setPlaybackState, setLoading } = useContext(GlobalState);

  let isSynced = true;

  async function fetchLyrics() {
    let lyrics;
    if (state.item && state.item.HasLyrics) {
      if (!cacheStorage.get(`lyrics-${props.state.item.Id}`)) {
        setLoading(true);
        lyrics = await jellyfinRequest(`/Audio/${props.state.item.Id}/Lyrics`);
        cacheStorage.set(`lyrics-${props.state.item.Id}`, lyrics);
        setLoading(false);
      } else {
        lyrics = cacheStorage.get(`lyrics-${props.state.item.Id}`);
      }
    } else {
      lyrics = {
        Lyrics: [
          {
            Text: "No lyrics found"
          }
        ]
      };
    }
    setLyrics(lyrics);
  }

  useEffect(() => {
    fetchLyrics();
  }, []);
  useEffect(() => {
    fetchLyrics();
  }, [state]);

  let activeLines = [];

  if (lyrics) {
    activeLines = lyrics.Lyrics.filter((line) => {
      if (!("Start" in line)) {
        isSynced = false;
      }
      return props.position >= line.Start / 10000;
    });
  }

  return (
    <>
      {lyrics && (
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
      )}
    </>
  );
}
