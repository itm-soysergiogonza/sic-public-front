import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

export interface SelectOption {
  id?: number;
  value: any;
  label: string;
}

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './select-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInputComponent),
      multi: true
    }
  ]
})
export class SelectInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Seleccione una opción';
  @Input() options: SelectOption[] = [];
  @Input() clearable = false;
  @Input() required = false;

  @Output() selectedChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  selectedValue: any = null;
  isDisabled = false;
  private propagateChange = (_: any) => {};
  private propagateTouch = () => {};

  compareWith = (item: any, selected: any): boolean => {
    if (item && selected) {
      // Si el item o selected son objetos con id
      if (item.id && selected.id) {
        return item.id === selected.id;
      }
      // Si el item tiene value con id y selected tiene id
      if (item.value?.id && selected.id) {
        return item.value.id === selected.id;
      }
      // Si ambos tienen value con id
      if (item.value?.id && selected.value?.id) {
        return item.value.id === selected.value.id;
      }
      // Comparación directa
      return item === selected;
    }
    return false;
  };

  writeValue(value: any): void {
    this.selectedValue = value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.selectedValue = event;
    this.propagateChange(event);
    this.propagateTouch();
    this.selectedChange.emit(event);
  }

  onOpen(): void {
    this.opened.emit();
  }

  onClose(): void {
    this.propagateTouch();
    this.closed.emit();
  }
}
