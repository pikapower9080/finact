import { Header, Navbar, Nav, Avatar, Image } from "rsuite";
import { getStorage } from "../storage";
import { Menu, MenuItem } from "@szhsin/react-menu";
import Icon from "./Icon";

const storage = getStorage();

export default function MainHeader(props) {
  function LibraryNavigation() {
    return (
      <>
        <Nav.Item href="/#">
          <Icon icon="home" />
          Home
        </Nav.Item>
        <Nav.Item href="/#playlists">
          <Icon icon="video_library" />
          Playlists
        </Nav.Item>
        <Nav.Item href="/#collections">
          <Icon icon="photo_library" />
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
            <>
              <Nav.Item as="a" href="/#search">
                <Icon icon="search" noSpace />
              </Nav.Item>
              <Menu
                menuButton={
                  <Nav.Item title="Profile">
                    <Avatar circle size="sm" src={`${storage.get("serverURL")}/Users/${props.user.Id}/Images/Primary`} />
                  </Nav.Item>
                }
                transition
                theming="dark"
              >
                <MenuItem href={`${storage.get("serverURL")}/web/#/mypreferencesmenu.html`} target="_blank">
                  <Icon icon="open_in_new" />
                  User Settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    storage.clearAll();
                    window.location.reload();
                  }}
                >
                  <Icon icon="logout" />
                  Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            ""
          )}
        </Nav>
      </Navbar>
    </Header>
  );
}
