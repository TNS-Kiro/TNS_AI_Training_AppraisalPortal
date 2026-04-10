import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    @if (isLoading) {
      <div class="loading-overlay">
        <p-progressSpinner [style]="{ width: diameter + 'px', height: diameter + 'px' }"></p-progressSpinner>
        @if (message) {
          <p class="loading-message">{{ message }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .loading-message {
      margin-top: 16px;
      color: #6c757d;
    }
  `]
})
export class LoadingComponent {
  @Input() isLoading = false;
  @Input() message?: string;
  @Input() diameter = 50;
}
