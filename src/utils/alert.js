import { Alert, Platform } from 'react-native';

export function notify(title, message, onOk) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
}

export function confirmAction(title, message, onConfirm, confirmText = 'Delete') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
}
