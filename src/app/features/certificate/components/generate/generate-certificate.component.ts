import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CertificatesService, CertificateType, CertificateField } from '@features/certificate/services/certificates.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { SelectInputComponent, SelectOption } from '@shared/components/select-input/select-input.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-generate-certificate',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    NgSelectModule, 
    InputFieldComponent,
    SelectInputComponent
  ],
  templateUrl: './generate-certificate.component.html',
})
export class GenerateCertificateComponent implements OnInit, OnDestroy {
  certificateForm: FormGroup;
  selectedCertificateType: CertificateType | null = null;
  certificateTypes: CertificateType[] = [];
  certificateTypesOptions: SelectOption[] = [];
  certificateFields: CertificateField[] = [];
  filteredFields: CertificateField[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _certificationService: CertificatesService,
  ) {
    this.certificateForm = this._fb.group({});
  }

  ngOnInit() {
    // Suscribirse a los cambios en los tipos de certificados
    this._certificationService.getCertificateTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types: CertificateType[]) => {
          this.certificateTypes = types;
          this.certificateTypesOptions = types.map(type => ({
            value: type,
            label: type.name
          }));
          this.isLoading = false;
          
          // Si hay un tipo seleccionado, actualizar los campos
          if (this.selectedCertificateType) {
            const currentType = types.find(t => t.id === this.selectedCertificateType?.id);
            if (currentType) {
              this.onCertificateTypeChange({ value: currentType, label: currentType.name });
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar los tipos de certificados';
          console.error('Error al cargar los tipos de certificados:', error);
        },
      });

    // Suscribirse a los cambios en los campos
    this._certificationService.getCertificateParameters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields: CertificateField[]) => {
          this.certificateFields = fields;
          
          // Si hay un tipo seleccionado, actualizar los campos filtrados
          if (this.selectedCertificateType) {
            this.updateFilteredFields();
          }
        },
        error: (error) => {
          console.error('Error al cargar los parámetros de certificados:', error);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateFilteredFields() {
    if (!this.selectedCertificateType) return;

    // Filtrar los campos para el tipo seleccionado
    this.filteredFields = this.certificateFields.filter(
      (field) => field.certificateType.id === this.selectedCertificateType?.id
    );

    // Actualizar el formulario con los campos actualizados
    const group: { [key: string]: any } = {};

    this.filteredFields.forEach((field) => {
      // Preservar el valor actual si existe
      const currentValue = this.certificateForm.get(field.name)?.value;

      if (field.type === 'DATE_RANGE') {
        const startValue = this.certificateForm.get(`${field.name}_start`)?.value;
        const endValue = this.certificateForm.get(`${field.name}_end`)?.value;
        
        group[`${field.name}_start`] = [startValue || '', field.required ? [Validators.required] : []];
        group[`${field.name}_end`] = [endValue || '', field.required ? [Validators.required] : []];
      } else {
        group[field.name] = [currentValue || '', field.required ? [Validators.required] : []];
      }
    });

    this.certificateForm = this._fb.group(group);
    console.log('Form updated with new structure:', this.certificateForm.value);
  }

  onCertificateTypeChange(event: SelectOption): void {
    const selectedType = event.value as CertificateType;
    this.selectedCertificateType = selectedType;
    this.updateFilteredFields();

    console.log('Selected Certificate Type:', {
      id: this.selectedCertificateType.id,
      name: this.selectedCertificateType.name
    });
    console.log('Fields for this certificate type:', this.filteredFields);
  }

  onCertificateTypeSelectOpen(): void {
    // Refrescar la lista de tipos de certificados cuando se abre el select
    this._certificationService.refreshCertificateTypes();
  }

  getFieldOptions(field: CertificateField): { value: string; label: string }[] {
    return field.options || [];
  }

  onSubmit(): void {
    if (this.certificateForm.valid) {
      console.log('Form submitted:', this.certificateForm.value);
    } else {
      console.log('Form is invalid');
      // Marcar todos los campos como touched para mostrar los errores
      Object.keys(this.certificateForm.controls).forEach(key => {
        const control = this.certificateForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
