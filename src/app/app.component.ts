import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContentFormComponent } from './features/content-generator/content-form/content-form.component';
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContentFormComponent, NotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AI Content Generator';
}
