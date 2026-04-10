import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <div class="confirm-dialog">
      <p>{{ data.message }}</p>
      <div class="dialog-actions">
        <p-button [label]="data.cancelText || 'Cancel'" 
                  icon="pi pi-times" 
                  (onClick)="onCancel()" 
                  styleClass="p-button-text"></p-button>
        <p-button [label]="data.confirmText || 'Confirm'" 
                  icon="pi pi-check" 
                  (onClick)="onConfirm()"></p-button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 300px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `]
})
export class ConfirmDialogComponent {
  data: ConfirmDialogData;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.data = config.data;
  }

  onConfirm(): void {
    this.ref.close(true);
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
