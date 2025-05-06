import { Notification, Text } from "rsuite";

export function errorNotification(title, message) {
  return (
    <Notification type="error" header={title}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function successNotification(title, message) {
  return (
    <Notification type="success" header={title}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function infoNotification(title, message) {
  return (
    <Notification type="info" header={title}>
      <Text>{message}</Text>
    </Notification>
  );
}
