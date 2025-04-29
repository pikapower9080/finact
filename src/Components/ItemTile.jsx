import { Col, Image, Text } from "rsuite";
import { getStorage } from "../storage";
import { Blurhash } from "react-blurhash";

const storage = getStorage();

const getColSize = () => ({
  xs: 12,
  sm: 8,
  md: 6,
  lg: 4,
  xl: 3
});

const squareStyle = {
  position: "relative",
  width: "100%",
  paddingTop: "100%", // 1:1 aspect ratio
  marginBottom: "3px",
  borderRadius: "8px",
  overflow: "hidden"
};

const contentStyle = {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold"
};

export default function ItemTile(props) {
  return (
    <Col key={props.item.Id} {...getColSize()} style={{ marginBottom: 5 }} {...props.tileProps}>
      <div style={squareStyle}>
        <div style={contentStyle}>
          <Blurhash style={{ zIndex: 0 }} hash={props.item.ImageBlurHashes.Primary[Object.keys(props.item.ImageBlurHashes.Primary)[0]]} width={"100%"} height={"100%"} />
          <Image
            style={{ visibility: "hidden", zIndex: 1, position: "absolute", backgroundColor: "var(--rs-body)" }}
            onLoad={(e) => {
              e.target.style.visibility = "visible";
            }}
            draggable={false}
            src={`${storage.get("serverURL")}/Items/${props.item.Id}/Images/Primary`}
          />
        </div>
      </div>
      <Text style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>{props.item.Name}</Text>
    </Col>
  );
}
