import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  NotificationDefaults,
  NotificationType,
  Notification,
} from '../../shared/models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationSubject.asObservable();

  private idCounter = 0;

  constructor() {}

  show(
    type: NotificationType,
    title: string,
    message: string,
    duration?: number,
    actions?: any[]
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.getDefaultDuration(type),
      actions,
      createdAt: new Date(),
    };

    const currentNotifications = this.notificationSubject.value;
    this.notificationSubject.next([...currentNotifications, notification]);

    // Auto-dismiss si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
    return notification.id;
  }

  // Metodos especificos para cada tipo
  success(title: string, message: string, duration?: number): string {
    return this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number): string {
    return this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): string {
    return this.show('info', title, message, duration);
  }

  // Metodos específicos para nuestro contexto
  contentGenerated(tokensUsed: number): string {
    return this.success(
      '¡Contenido generado!',
      `Se ha generado el contenido exitosamente usando ${tokensUsed} tokens`,
      8000 // Error duration más larga
    );
  }

  // Cerrar notificcioón especifica
  dismiss(id: string): void {
    const currentNotifications = this.notificationSubject.value;
    const filteredNotificactions = currentNotifications.filter(
      (n) => n.id !== id
    );
    this.notificationSubject.next(filteredNotificactions);
  }

  // Limpiar todas las notificaciones
  clear(): void {
    this.notificationSubject.next([]);
  }

  private generateId(): string {
    return `notification-${this.idCounter}-${Date.now()}`;
  }

  private getDefaultDuration(type: NotificationType): number {
    switch (type) {
      case 'success':
        return NotificationDefaults.SUCCESS_DURATION;
      case 'error':
        return NotificationDefaults.ERROR_DURATION;
      case 'warning':
        return NotificationDefaults.WARNING_DURATION;
      case 'info':
        return NotificationDefaults.INFO_DURATION;
      default:
        return NotificationDefaults.INFO_DURATION;
    }
  }
}
