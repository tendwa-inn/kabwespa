export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type ShowFn = (title: string, message: string | undefined, buttons: AlertButton[]) => void;

let showFn: ShowFn | null = null;

export function registerAlertHost(fn: ShowFn | null) {
  showFn = fn;
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    const resolved = buttons && buttons.length ? buttons : [{ text: "OK" }];
    if (showFn) {
      showFn(title, message, resolved);
    } else {
      // Host not mounted yet — fall back silently rather than crash.
      resolved[resolved.length - 1]?.onPress?.();
    }
  },
};
