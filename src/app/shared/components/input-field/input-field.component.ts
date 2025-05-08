import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { CertificateField } from "@shared/models/interfaces/form-field.interface";

@Component({
  selector: "app-input-field",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: "./input-field.component.html",
})
export class InputFieldComponent {
  @Input() field!: CertificateField;
  @Input() formGroup!: FormGroup;
  @Input() isGenerating!: boolean;

  getFieldIconClass(): string {
    switch (this.field.type) {
      case "TEXT":
        return "bi-person";
      case "DATE":
      case "DATE_RANGE":
        return "bi-calendar";
      case "EMAIL":
        return "bi-envelope";
      case "NUMBER":
        return "bi-123";
      case "SELECT_SINGLE":
      case "SELECT_MULTIPLE":
        return "bi-list";
      default:
        return "bi-question-circle";
    }
  }

  getFieldType(): string {
    switch (this.field.type) {
      case "TEXT":
        return "text";
      case "DATE":
        return "date";
      case "EMAIL":
        return "email";
      case "NUMBER":
        return "text";
      default:
        return "text";
    }
  }
}
