import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { ContentRequest } from '../../../shared/models/content-request';
import { GeneratedContent } from '../../../shared/models/generated-content';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './content-form.component.html',
  styleUrl: './content-form.component.scss',
})
export class ContentFormComponent implements OnInit {
  contentForm!: FormGroup;
  isLoading = false;
  generatedContent: GeneratedContent | null = null;
  error: string | null = null;

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
    private contentService: ContentService
  ) {}
  ngOnInit() {
    //* Crear el formulario con Validaciones
    this.contentForm = this.fb.group({
      prompt: ['', [Validators.required, Validators.minLength(10)]],
      contentType: ['social_post', Validators.required],
      tone: ['friendly', Validators.required],
      maxLength: [200, [Validators.min(50), Validators.max(1000)]],
      language: ['es'],
    });
  }

  onSubmit() {
    if (this.contentForm.valid) {
      this.isLoading = true;
      this.error = null;

      const request: ContentRequest = this.contentForm.value;

      //*OBSERVABLES
      this.contentService.generateContent(request).subscribe({
        next: (content) => {
          console.log('Contenido Generado!', content);
          this.generatedContent = content;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = error.message;
          this.isLoading = false;
        },
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  get prompt() {
    return this.contentForm.get('prompt');
  }
  get maxLength() {
    return this.contentForm.get('maxLength');
  }
}
