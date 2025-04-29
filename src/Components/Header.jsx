import { Header, Navbar, Nav, Avatar, Image } from "rsuite";
import { getStorage } from "../storage";
import { Menu, MenuItem } from "@szhsin/react-menu";
import MaterialIcon from "material-icons-react";

const storage = getStorage();

export default function MainHeader(props) {
  function LibraryNavigation() {
    return (
      <>
        <Nav.Item href="/#">
          <MaterialIcon icon="home" invert />
          Home
        </Nav.Item>
        <Nav.Item href="/#playlists">
          <MaterialIcon icon="video_library" invert />
          Playlists
        </Nav.Item>
        <Nav.Item href="/#collections">
          <MaterialIcon icon="photo_library" invert />
          Collections
        </Nav.Item>
      </>
    );
  }
  return (
    <Header>
      <Navbar>
        <Navbar.Brand>
          <Image src="finact.png" style={{ height: "1.5em", marginRight: "5px" }} />
          Finact
        </Navbar.Brand>
        <Nav>{props.user ? <LibraryNavigation /> : ""}</Nav>
        <Nav pullRight>
          {props.user ? (
            <Menu
              menuButton={
                <Nav.Item>
                  <Avatar circle size="sm" src={`${storage.get("serverURL")}/Users/${props.user.Id}/Images/Primary`} />
                </Nav.Item>
              }
              transition
              theming="dark"
            >
              <MenuItem href={`${storage.get("serverURL")}/web/#/mypreferencesmenu.html`} target="_blank">
                <MaterialIcon icon="open_in_new" invert />
                User Settings
              </MenuItem>
              <MenuItem
                onClick={() => {
                  storage.clearAll();
                  window.location.reload();
                }}
              >
                <MaterialIcon icon="logout" invert />
                Sign out
              </MenuItem>
            </Menu>
          ) : (
            ""
          )}
        </Nav>
      </Navbar>
    </Header>
  );
}
