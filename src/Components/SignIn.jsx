import { Form, InputGroup, Stack, Panel, useToaster, Notification } from "rsuite";
import { getStorage } from "../storage";
import { jellyfinRequest } from "../Util/Network";
import { useContext, useState } from "react";
import Icon from "./Icon";
import { GlobalState } from "../App";
import { errorNotification } from "../Util/Toaster";

const storage = getStorage();

export function SignIn(props) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toaster } = useContext(GlobalState);

  function ServerURL() {
    const styles = {
      width: 300,
      marginBottom: 10
    };

    return (
      <>
        <Form
          onSubmit={async (e) => {
            const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
            let serverURL = e.serverURL;
            if (serverURL && urlRegex.test(serverURL)) {
              serverURL = serverURL.trim();
              if (serverURL.endsWith("/")) {
                serverURL = serverURL.slice(0, -1);
              }
              console.log("Using server URL: " + serverURL);
              storage.set("serverURL", serverURL);
              setLoading(true);
              try {
                const info = await jellyfinRequest("/System/Info/Public");
                setLoading(false);
                if (info && info.ProductName == "Jellyfin Server") {
                  if (info.SetupWizardCompleted == false) {
                    toaster.push(errorNotification("Server error", "This server is not fully set up yet."));
                    return;
                  }
                  setConnected(true);
                } else {
                  toaster.push(errorNotification("Connection error", "Is this a Jellyfin server, check the URL."));
                }
              } catch (e) {
                setLoading(false);
                console.error(e);
                toaster.push(errorNotification("Connection error", "Could not communicate with the server, check the URL and your connection."));
                return;
              }
            } else {
              if (serverURL) {
                toaster.push(errorNotification("Invalid URL", "Make sure you entered the full URL."));
              }
            }
          }}
        >
          <Form.Group content="serverURL">
            <Form.ControlLabel>Server URL</Form.ControlLabel>
            <InputGroup style={styles}>
              <Form.Control name="serverURL" placeholder="https://jellyfin.example.com" />
              <InputGroup.Button loading={loading} type="submit">
                <Icon icon="arrow_forward" size="tiny" />
              </InputGroup.Button>
            </InputGroup>
          </Form.Group>
        </Form>
      </>
    );
  }

  function SignInForm() {
    return (
      <>
        <Form
          onSubmit={async (e) => {
            setLoading(true);
            try {
              const authResult = await jellyfinRequest("/Users/AuthenticateByName", {
                method: "POST",
                body: JSON.stringify({
                  Username: e.username,
                  Pw: e.password
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              });
              storage.set("AccessToken", authResult.AccessToken);
              storage.set("User", authResult.User);
              setLoading(false);
              props.setUser(authResult.User);
            } catch (e) {
              console.error(e);
              setLoading(false);
              toaster.push(errorNotification("Login failed", "Incorrect username or password."));
              return;
            }
          }}
        >
          <Form.Group content="username">
            <Form.ControlLabel>Username</Form.ControlLabel>
            <Form.Control autoFocus name="username" placeholder="Username" />
          </Form.Group>
          <Form.Group content="password">
            <Form.ControlLabel>Password</Form.ControlLabel>
            <InputGroup>
              <Form.Control name="password" type="password" placeholder="Password" />
              <InputGroup.Button loading={loading} type="submit">
                <Icon icon="arrow_forward" size="tiny" />
              </InputGroup.Button>
            </InputGroup>
          </Form.Group>
        </Form>
      </>
    );
  }

  return (
    <Stack alignItems="center" justifyContent="center" style={{ height: "100%" }}>
      <Panel header="Sign in" bordered>
        {!connected ? <ServerURL /> : <SignInForm />}
      </Panel>
    </Stack>
  );
}
