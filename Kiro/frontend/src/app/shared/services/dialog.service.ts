import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

/**
 * Service for showing dialogs throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Show a confirmation dialog
   */
  confirm(
    title: string,
    message: string,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title,
        message,
        confirmText,
        cancelText
      }
    });

    return dialogRef.afterClosed().toPromise().then(result => result === true);
  }

  /**
   * Show a simple confirmation with default text
   */
  confirmAction(message: string, title = 'Confirm Action'): Promise<boolean> {
    return this.confirm(title, message, 'Confirm', 'Cancel');
  }
}
