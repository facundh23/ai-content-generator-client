export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

export const NotificationDefaults = {
  SUCCESS_DURATION: 4000,
  ERROR_DURATION: 6000,
  WARNING_DURATION: 5000,
  INFO_DURATION: 4000,
};
