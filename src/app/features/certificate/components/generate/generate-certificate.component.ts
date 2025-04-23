import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CertificateField,
  CertificateType,
} from '@features/certificate/models/form-field.interface';
import { CertificatesService } from '@features/certificate/services/certificates.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ModalConfirmComponent } from '@shared/components/modal-confirm/modal-confirm.component';
import { SelectInputComponent } from '@shared/components/select-input/select-input.component';
import { SelectOption } from '@shared/models/interfaces/select.interface';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
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
    SelectInputComponent,
    ModalConfirmComponent,
    ToastModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
  ],
  providers: [MessageService],
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
  showModal = false;

  email = 'john.connor@itm.edu.co';

  private _destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _certificationService: CertificatesService,
  ) {
    this.certificateForm = this._fb.group({});
  }

  ngOnInit() {
    this._certificationService
      .getCertificateTypes()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (types: CertificateType[]) => {
          this.certificateTypes = types;
          this.certificateTypesOptions = types.map((type) => ({
            value: type,
            label: type.name,
          }));
          this.isLoading = false;

          if (this.selectedCertificateType) {
            const currentType = types.find(
              (t) => t.id === this.selectedCertificateType?.id,
            );
            if (currentType) {
              this.onCertificateTypeChange({
                value: currentType,
                label: currentType.name,
              });
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar los tipos de certificados';
          console.error('Error al cargar los tipos de certificados:', error);
        },
      });

    this._certificationService
      .getCertificateParameters()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (fields: CertificateField[]) => {
          this.certificateFields = fields;

          if (this.selectedCertificateType) {
            this._updateFilteredFields();
          }
        },
        error: (error) => {
          console.error(
            'Error al cargar los parámetros de certificados:',
            error,
          );
        },
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _updateFilteredFields() {
    if (!this.selectedCertificateType) return;

    this.filteredFields = this.certificateFields.filter(
      (field) => field.certificateType.id === this.selectedCertificateType?.id,
    );

    const group: { [key: string]: unknown[] | [string, Validators[]] } = {};

    for (const field of this.filteredFields) {
      const currentValue = this.certificateForm.get(field.name)?.value;

      if (field.type === 'DATE_RANGE') {
        const startValue = this.certificateForm.get(
          `${field.name}_start`,
        )?.value;
        const endValue = this.certificateForm.get(`${field.name}_end`)?.value;

        group[`${field.name}_start`] = [
          startValue || '',
          field.required ? [Validators.required] : [],
        ];
        group[`${field.name}_end`] = [
          endValue || '',
          field.required ? [Validators.required] : [],
        ];
      } else {
        group[field.name] = [
          currentValue || '',
          field.required ? [Validators.required] : [],
        ];
      }
    }

    this.certificateForm = this._fb.group(group);
  }

  onCertificateTypeChange(event: SelectOption): void {
    this.selectedCertificateType = event.value as CertificateType;
    this._updateFilteredFields();
  }

  onCertificateTypeSelectOpen(): void {
    this._certificationService.refreshCertificateTypes();
  }

  onSubmit(): void {
    if (!this.certificateForm.valid) {
      for (const key of Object.keys(this.certificateForm.controls)) {
        const control = this.certificateForm.get(key);
        control?.markAsTouched();
      }
    } else {
      this.showModal = true;
    }
  }
}
