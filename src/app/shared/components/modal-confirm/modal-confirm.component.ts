import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-modal-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirm.component.html',
})
export class ModalConfirmComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar';
  @Input() email = '';
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _messageService: MessageService) {}

  onConfirmGenerate(): void {
    this.isOpen = false;

    this._messageService.add({
      key: 'confirm',
      severity: 'success',
      summary: '¡Certificado generado con éxito!',
      detail: `Se ha enviado el certificado al correo electrónico: ${this.email}`,
      life: 2000,
      closable: false,
    });
  }

  onCancelGenerate(): void {
    this.isOpen = false;
  }
}
