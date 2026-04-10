import { Injectable } from '@angular/core';
import { DialogService as PrimeDialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';

/**
 * Service for showing dialogs throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialogService: PrimeDialogService) {}

  /**
   * Show a confirmation dialog
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialogService.open(ConfirmDialogComponent, {
      header: data.title,
      width: '400px',
      data
    });

    return new Observable(observer => {
      ref.onClose.subscribe((result: boolean) => {
        observer.next(result || false);
        observer.complete();
      });
    });
  }

  /**
   * Show a simple confirmation with default text
   */
  confirmAction(message: string, title = 'Confirm Action'): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel'
    });
  }
}
