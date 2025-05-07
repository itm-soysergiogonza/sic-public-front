import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CertificatesService } from "@features/certificate/services/certificates.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { InputFieldComponent } from "@shared/components/input-field/input-field.component";
import { ModalConfirmComponent } from "@shared/components/modal-confirm/modal-confirm.component";
import { SelectInputComponent } from "@shared/components/select-input/select-input.component";
import {
  CertificateField,
  CertificateType,
  CertificateTypeEvent,
  FieldOption,
} from "@shared/models/interfaces/form-field.interface";
import { MessageService } from "primeng/api";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { ToastModule } from "primeng/toast";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

@Component({
  selector: "app-generate-certificate",
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
  templateUrl: "./generate-certificate.component.html",
})
export class GenerateCertificateComponent implements OnInit, OnDestroy {
  certificateForm: FormGroup;
  selectedCertificateType: CertificateType | null = null;
  certificateTypes: CertificateType[] = [];
  certificateTypesOptions: CertificateTypeEvent[] = [];
  certificateFields: CertificateField[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  showModal = false;

  email = "john.connor@itm.edu.co";

  private _destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _certificationService: CertificatesService
  ) {
    this.certificateForm = this._fb.group({});
  }

  ngOnInit(): void {
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
              (t) => t.id === this.selectedCertificateType?.id
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
          this.errorMessage = "Error al cargar los tipos de certificados";
          console.error("Error al cargar los tipos de certificados:", error);
        },
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private buildForm(fields: CertificateField[]) {
    const group: Record<string, any> = {};
    fields.forEach((f) => {
      // … tu creación de controles (igual que antes)
      group[f.name] = this._fb.control(
        f.type === "SELECT_MULTIPLE" ? [] : null,
        this.buildValidators(f)
      );
    });

    this.certificateForm = this._fb.group(group);

    fields.forEach((f) => {
      if (f.dataSource !== "SQL") return;
      const childControl = this.certificateForm.get(f.name)!;

      if (f.dependsOn) {
        const parentControl = this.certificateForm.get(f.dependsOn)!;
        const parentField = fields.find((x) => x.name === f.dependsOn)!;

        if (
          parentField.type === "SELECT_MULTIPLE" ||
          parentField.type === "SELECT_SINGLE"
        ) {
          // dropdown padre
          parentControl.valueChanges
            .pipe(
              // opcional: filter para valores no válidos
              switchMap((parentValue) =>
                this._certificationService
                  .fetchOptions(f.id, {
                    parameters: { [f.dependsOn!]: parentValue },
                  })
                  .pipe(catchError(() => of<FieldOption[]>([])))
              )
            )
            .subscribe((opts) => {
              f.options = [...opts];
              childControl.reset();
              opts.length ? childControl.enable() : childControl.disable();
            });
        } else {
          // campo de texto padre
          parentControl.valueChanges
            .pipe(
              debounceTime(500),
              distinctUntilChanged(),
              switchMap((searchTerm: string) => {
                // si quieres ignorar búsquedas vacías:
                if (!searchTerm) {
                  childControl.reset();
                  childControl.disable();
                  return of<FieldOption[]>([]);
                }
                return this._certificationService
                  .fetchOptions(f.id, {
                    parameters: { [f.dependsOn!]: searchTerm },
                  })
                  .pipe(
                    // esto evita que un error corte la suscripción
                    catchError((_) => of<FieldOption[]>([]))
                  );
              })
            )
            .subscribe((opts) => {
              f.options = [...opts];
              childControl.reset();
              opts.length ? childControl.enable() : childControl.disable();
            });
        }
      } else {
        // carga inicial cuando no depende de nada
        this._certificationService
          .fetchOptions(f.id, { parameters: null })
          .pipe(catchError(() => of<FieldOption[]>([])))
          .subscribe((opts) => (f.options = opts));
      }
    });
  }

  private buildValidators(f: CertificateField) {
    const v: any[] = [];
    if (f.required) v.push(Validators.required);
    if (f.type === "EMAIL") v.push(Validators.email);
    if (f.minLength != null) v.push(Validators.minLength(f.minLength));
    if (f.maxLength != null) v.push(Validators.maxLength(f.maxLength));
    if (f.minValue != null) v.push(Validators.min(f.minValue));
    if (f.maxValue != null) v.push(Validators.max(f.maxValue));
    return v;
  }

  onCertificateTypeChange(event: CertificateTypeEvent | null): void {
    this.selectedCertificateType = event?.value as CertificateType;
    this._certificationService
      .getCertificateParametersByType(this.selectedCertificateType.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (fields: CertificateField[]) => {
          this.certificateFields = fields;
          this.buildForm(this.certificateFields);
        },
        error: (error) => {
          console.error(
            "Error al cargar los parámetros del certificado:",
            error
          );
        },
      });
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
      this.downloadCertificate();
      this.showModal = true;
    }
  }

  downloadCertificate(): void {
    const request = {
      certificateTypeId: this.selectedCertificateType?.id,
      parameters: this.certificateForm.getRawValue(),
    };

    this._certificationService
      .generateCertificate(request)
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificado.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
