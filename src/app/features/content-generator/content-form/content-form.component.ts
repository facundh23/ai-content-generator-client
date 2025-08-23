import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { ContentService } from '../../../core/services/content.service';
import { StateService } from '../../../core/services/state.service';
import { ContentRequest } from '../../../shared/models/content-request';
import { GeneratedContent } from '../../../shared/models/generated-content';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.scss'],
})
export class ContentFormComponent implements OnInit, OnDestroy {
  contentForm!: FormGroup;

  // Observables del estado (reemplazamos las propiedades locales)
  isLoading$ = this.stateService.isLoading$;
  error$ = this.stateService.error$;
  currentContent$ = this.stateService.currentContent$;
  stats$ = this.stateService.stats$;

  // 🧹 Para limpiar subscripciones
  private destroy$ = new Subject<void>();

  // Opciones para los selects
  contentTypes = [
    { value: 'social_post', label: 'Post de Redes Sociales' },
    { value: 'email', label: 'Email' },
    { value: 'product_description', label: 'Descripción de Producto' },
  ];

  tones = [
    { value: 'professional', label: 'Profesional' },
    { value: 'casual', label: 'Casual' },
    { value: 'friendly', label: 'Amigable' },
    { value: 'formal', label: 'Formal' },
  ];

  languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ];

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private stateService: StateService // Inyectamos el StateService
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadUserPreferences();
    this.subscribeToStateChanges();
  }

  ngOnDestroy() {
    // Limpiar subscripciones para evitar memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm() {
    this.contentForm = this.fb.group({
      prompt: ['', [Validators.required, Validators.minLength(10)]],
      contentType: ['social_post', Validators.required],
      tone: ['friendly', Validators.required],
      maxLength: [200, [Validators.min(50), Validators.max(1000)]],
      language: ['es'],
    });
  }

  private loadUserPreferences() {
    //  Cargar preferencias del usuario desde el estado
    const preferences = this.stateService.currentState.userPreferences;

    this.contentForm.patchValue({
      contentType: preferences.defaultContentType,
      tone: preferences.defaultTone,
      language: preferences.defaultLanguage,
    });
  }

  private subscribeToStateChanges() {
    //  Escuchar cambios en el estado y reaccionar
    this.stateService.state$
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((state) => {
        // Aquí puedes reaccionar a cambios en el estado completo
        console.log('Estado actualizado:', state);
      });

    // Escuchar errores específicamente
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        console.error('Error en la aplicación:', error);
        // Podrías mostrar una notificación aquí
      }
    });
  }

  onSubmit() {
    if (this.contentForm.valid) {
      const request: ContentRequest = this.contentForm.value;

      //  Usar StateService en lugar de variables locales
      this.stateService.setLoading(true);
      this.stateService.setError(null);

      // 🌊 Observable en acción - integrado con el estado
      this.contentService
        .generateContent(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (content) => {
            console.log('¡Contenido generado!', content);

            //  Actualizar estado con el contenido exitoso
            this.stateService.addToHistory(content);
            this.stateService.setLoading(false);

            //  Guardar preferencias del usuario
            this.saveUserPreferences();

            // 🎯 Opcional: limpiar formulario o mantener valores
            // this.contentForm.reset();
          },
          error: (error) => {
            console.error('Error:', error);

            // 🚨 Manejar error a través del estado
            this.stateService.setError(error.message);
            this.stateService.setLoading(false);
          },
        });
    } else {
      console.log('Formulario inválido');
      this.markFormGroupTouched();
    }
  }

  private saveUserPreferences() {
    // 💾 Guardar las preferencias actuales del formulario
    const formValue = this.contentForm.value;

    this.stateService.updateUserPreferences({
      defaultContentType: formValue.contentType,
      defaultTone: formValue.tone,
      defaultLanguage: formValue.language,
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.contentForm.controls).forEach((key) => {
      const control = this.contentForm.get(key);
      control?.markAsTouched();
    });
  }

  // 🧹 Métodos públicos para interactuar con el estado
  clearCurrentContent() {
    this.stateService.clearCurrentState();
  }

  clearError() {
    this.stateService.setError(null);
  }

  copyToClipboard(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log('Contenido copiado al portapapeles');
        // Podrías mostrar una notificación de éxito aquí
      })
      .catch((err) => {
        console.error('Error al copiar:', err);
      });
  }

  // Helpers para el template (mantener los existentes)
  get prompt() {
    return this.contentForm.get('prompt');
  }
  get maxLength() {
    return this.contentForm.get('maxLength');
  }
}
