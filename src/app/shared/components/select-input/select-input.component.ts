import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  CertificateType,
  CertificateTypeEvent,
  CompareWithCertificateType,
} from '@shared/models/interfaces/form-field.interface';

@Component({
  selector: 'app-select-input',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './select-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInputComponent),
      multi: true,
    },
  ],
})
export class SelectInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Seleccione una opción';
  @Input() options: CertificateTypeEvent[] = [];
  @Input() clearable = false;
  @Input() required = false;

  @Output() selectedChange: EventEmitter<CertificateTypeEvent | null> =
    new EventEmitter<CertificateTypeEvent | null>();
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();

  selectedValue: null | CertificateTypeEvent = null;
  isDisabled = false;
  private _propagateChange: (value: CertificateTypeEvent | null) => void =
    (): void => {};
  private _propagateTouch: () => void = (): void => {};

  compareWith: CompareWithCertificateType = (
    item: CertificateTypeEvent,
    selected: CertificateType,
  ): boolean => {
    return item?.value?.id === selected?.id;
  };

  writeValue(value: CertificateTypeEvent | null): void {
    this.selectedValue = value ?? null;
  }

  registerOnChange(fn: (value: CertificateTypeEvent | null) => void): void {
    this._propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._propagateTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onSelectionChange(event: CertificateTypeEvent | null): void {
    this.selectedValue = event;
    this._propagateChange(event);
    this._propagateTouch();
    this.selectedChange.emit(event);
  }

  onOpen(): void {
    this.opened.emit();
  }

  onClose(): void {
    this._propagateTouch();
    this.closed.emit();
  }
}
