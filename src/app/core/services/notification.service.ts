import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Notification,
  NotificationType,
  NotificationDefaults,
} from '../../shared/models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private idCounter = 0;

  constructor() {}

  // 🎊 Método principal para mostrar notificaciones
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

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-dismiss si tiene duración
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  // 🎉 Métodos específicos para cada tipo
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

  // 🎯 Métodos específicos para nuestro contexto
  contentGenerated(tokensUsed: number): string {
    return this.success(
      '¡Contenido generado!',
      `Se ha generado el contenido exitosamente usando ${tokensUsed} tokens.`
    );
  }

  contentCopied(): string {
    return this.success(
      'Copiado',
      'El contenido se ha copiado al portapapeles.'
    );
  }

  apiError(errorMessage: string): string {
    return this.error(
      'Error de conexión',
      `No se pudo conectar con el servidor: ${errorMessage}`,
      8000 // Error duration más larga
    );
  }

  validationError(): string {
    return this.warning(
      'Formulario incompleto',
      'Por favor, completa todos los campos requeridos.'
    );
  }

  // 🗑️ Cerrar notificación específica
  dismiss(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(
      (n) => n.id !== id
    );
    this.notificationsSubject.next(filteredNotifications);
  }

  // 🧹 Limpiar todas las notificaciones
  clear(): void {
    this.notificationsSubject.next([]);
  }

  // 🔧 Métodos privados
  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`;
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
