import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@features/certificate/models/form-field.interface';
import { NgSelectModule } from '@ng-select/ng-select';

// export interface CertificateField {
//   id: number;
//   name: string;
//   label: string;
//   type: string;
//   required: boolean;
//   placeholder: string | null;
//   options: any[] | null;
//   minLength: number | null;
//   maxLength: number | null;
//   minValue: number | null;
//   maxValue: number | null;
//   certificateType: {
//     id: number;
//     name: string;
//     paid: boolean;
//     price: number;
//   };
// }

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './input-field.component.html',
  styles: [
    `
    :host {
      display: block;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem 1rem;
      padding-left: 2.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      transition: all 0.2s;
      min-height: 42px;
    }

    .form-control:hover {
      border-color: var(--color-primary-300);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-primary-100);
    }

    .form-control.ng-invalid.ng-touched {
      border-color: #ef4444;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-primary);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
    }

    .error-icon {
      margin-right: 0.25rem;
    }

    .date-range-container {
      display: flex;
      gap: 0.5rem;
    }

    .date-range-container > div {
      flex: 1;
    }

    .date-range-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
  `,
  ],
})
export class InputFieldComponent {
  @Input() field!: FormField;
  @Input() formGroup!: FormGroup;

  getFieldIconClass(): string {
    switch (this.field.type) {
      case 'TEXT':
        return 'bi-person';
      case 'DATE':
      case 'DATE_RANGE':
        return 'bi-calendar';
      case 'EMAIL':
        return 'bi-envelope';
      case 'NUMBER':
        return 'bi-123';
      case 'SELECT_SINGLE':
      case 'SELECT_MULTIPLE':
        return 'bi-list';
      default:
        return 'bi-question-circle';
    }
  }

  getFieldType(): string {
    switch (this.field.type) {
      case 'TEXT':
        return 'text';
      case 'DATE':
        return 'date';
      case 'EMAIL':
        return 'email';
      case 'NUMBER':
        return 'number';
      default:
        return 'text';
    }
  }
}
