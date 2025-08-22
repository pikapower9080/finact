import { Notification, Text } from "rsuite";

export function errorNotification(title: string, message: string, extraProps: Record<string, any> = {}) {
  return (
    <Notification type="error" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function successNotification(title: string, message: string, extraProps: Record<string, any> = {}) {
  return (
    <Notification type="success" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}

export function infoNotification(title: string, message: string, extraProps: Record<string, any> = {}) {
  return (
    <Notification type="info" header={title} {...extraProps}>
      <Text>{message}</Text>
    </Notification>
  );
}
