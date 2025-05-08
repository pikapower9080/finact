import { Notification, Text } from "rsuite";

export function errorNotification(title, message, extraProps = {}) {
  return (
    <Notification type="error" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function successNotification(title, message, extraProps = {}) {
  return (
    <Notification type="success" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function infoNotification(title, message, extraProps = {}) {
  return (
    <Notification type="info" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}
