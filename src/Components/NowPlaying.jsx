import MaterialIcon from "material-icons-react";
import { Avatar, FlexboxGrid, Navbar } from "rsuite";

export default function NowPlaying(props) {
  return (
    <Navbar className="now-playing">
      <FlexboxGrid justify="space-between" align="middle">
        <FlexboxGrid.Item>
          <Avatar />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item></FlexboxGrid.Item>
        <FlexboxGrid.Item>
          <MaterialIcon icon={"play_arrow"} invert />
        </FlexboxGrid.Item>
        <FlexboxGrid.Item></FlexboxGrid.Item>
      </FlexboxGrid>
    </Navbar>
  );
}
