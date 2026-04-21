import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { FormRendererService } from '../../form-renderer/form-renderer.service';
import { AppraisalForm, FormData, AppraisalTemplate } from '../../core/models/appraisal.model';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../shared/services/dialog.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { environment } from '../../../environments/environment';

// Import section components
import { HeaderSectionComponent } from '../../form-renderer/sections/header-section.component';
import { RatingKeySectionComponent } from '../../form-renderer/sections/rating-key-section.component';
import { KeyResponsibilitiesSectionComponent } from '../../form-renderer/sections/key-responsibilities-section.component';
import { IdpSectionComponent } from '../../form-renderer/sections/idp-section.component';
import { PolicyAdherenceSectionComponent } from '../../form-renderer/sections/policy-adherence-section.component';
import { GoalsSectionComponent } from '../../form-renderer/sections/goals-section.component';
import { SignatureSectionComponent } from '../../form-renderer/sections/signature-section.component';
import { FormNavigationComponent } from '../../form-renderer/form-navigation.component';

/**
 * Self-Appraisal Form Component
 * 
 * Requirements:
 * - Requirement 5: Employee Self-Appraisal
 * - 5.1: Display assigned appraisal form
 * - 5.2: Allow employee to fill self-appraisal fields
 * - 5.3: Save form as draft
 * - 5.4: Submit completed form
 * - 5.6: Prevent editing after submission
 * - 5.7: View historical forms in read-only mode
 */
@Component({
  selector: 'app-self-appraisal-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    LoadingComponent,
    HeaderSectionComponent,
    RatingKeySectionComponent,
    KeyResponsibilitiesSectionComponent,
    IdpSectionComponent,
    PolicyAdherenceSectionComponent,
    GoalsSectionComponent,
    SignatureSectionComponent,
    FormNavigationComponent
  ],
  template: `
    <div class="form-container">
      <!-- Loading State -->
      <app-loading *ngIf="loading"></app-loading>

      <!-- Error State -->
      <mat-card *ngIf="error && !loading" class="error-card">
        <mat-card-content>
          <p class="error-message">{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadForm()">Retry</button>
        </mat-card-content>
      </mat-card>

      <!-- Form Content -->
      <div *ngIf="appraisalForm && template && !loading" class="form-content">
        <!-- Form Header -->
        <mat-card class="form-header-card">
          <mat-card-header>
            <mat-card-title>Self-Appraisal Form</mat-card-title>
            <mat-card-subtitle>{{ appraisalForm.cycleName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="form-meta">
              <div class="meta-item">
                <span class="label">Status:</span>
                <span class="value status-badge" [class]="'status-' + appraisalForm.status.toLowerCase()">
                  {{ getStatusLabel(appraisalForm.status) }}
                </span>
              </div>
              <div class="meta-item" *ngIf="appraisalForm.submittedAt">
                <span class="label">Submitted:</span>
                <span class="value">{{ appraisalForm.submittedAt | date: 'medium' }}</span>
              </div>
              <div class="meta-item" *ngIf="readonly">
                <span class="readonly-badge">Read-Only Mode</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Dynamic Form Sections -->
        <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
          <!-- Header Section -->
          <app-header-section
            [formGroup]="formGroup"
            [formData]="formData"
            [readonly]="readonly"
            [employeeName]="appraisalForm.employeeName || ''"
            [managerName]="appraisalForm.managerName || ''"
            [designation]="appraisalForm.designation || ''">
          </app-header-section>

          <!-- Rating Key Section -->
          <app-rating-key-section></app-rating-key-section>

          <!-- Key Responsibilities Section -->
          <app-key-responsibilities-section
            [formGroup]="formGroup"
            [items]="keyResponsibilitiesItems"
            [readonly]="readonly"
            [canEditSelf]="canEditSelfFields"
            [canEditManager]="false">
          </app-key-responsibilities-section>

          <!-- IDP Section -->
          <app-idp-section
            [formGroup]="formGroup"
            [items]="idpItems"
            [readonly]="readonly"
            [canEditSelf]="canEditSelfFields"
            [canEditManager]="false">
          </app-idp-section>

          <!-- Policy Adherence Section -->
          <app-policy-adherence-section
            [formGroup]="formGroup"
            [readonly]="readonly"
            [canEditManager]="false">
          </app-policy-adherence-section>

          <!-- Goals Section -->
          <app-goals-section
            [formGroup]="formGroup"
            [items]="goalsItems"
            [readonly]="readonly"
            [canEditSelf]="canEditSelfFields"
            [canEditManager]="false">
          </app-goals-section>

          <!-- Signature Section -->
          <app-signature-section
            [formGroup]="formGroup"
            [readonly]="readonly"
            [canEditSelf]="canEditSelfFields"
            [canEditManager]="false">
          </app-signature-section>

          <!-- Form Navigation -->
          <app-form-navigation
            [canSaveDraft]="canSaveDraft"
            [canSubmit]="canSubmit"
            [readonly]="readonly"
            [saving]="saving"
            (saveDraft)="onSaveDraft()"
            (submit)="onSubmit()"
            (cancel)="onCancel()">
          </app-form-navigation>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .error-card {
      margin-bottom: 24px;
    }

    .error-message {
      color: #d32f2f;
      margin-bottom: 16px;
    }

    .form-header-card {
      margin-bottom: 24px;
    }

    .form-meta {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-top: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-item .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .meta-item .value {
      color: rgba(0, 0, 0, 0.87);
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.status-not_started {
      background-color: #e0e0e0;
      color: #424242;
    }

    .status-badge.status-draft_saved {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-badge.status-submitted {
      background-color: #e3f2fd;
      color: #0d47a1;
    }

    .status-badge.status-under_review {
      background-color: #f3e5f5;
      color: #4a148c;
    }

    .status-badge.status-reviewed_and_completed {
      background-color: #e8f5e9;
      color: #1b5e20;
    }

    .readonly-badge {
      padding: 4px 12px;
      border-radius: 12px;
      background-color: #fafafa;
      color: #616161;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #e0e0e0;
    }

    .form-content {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class SelfAppraisalFormComponent implements OnInit, OnDestroy {
  appraisalForm: AppraisalForm | null = null;
  template: AppraisalTemplate | null = null;
  formData: FormData = {};
  formGroup: FormGroup = new FormGroup({});
  
  loading = false;
  saving = false;
  error: string | null = null;
  readonly = false;
  
  canEditSelfFields = false;
  canSaveDraft = false;
  canSubmit = false;

  keyResponsibilitiesItems: any[] = [];
  idpItems: any[] = [];
  goalsItems: any[] = [];

  private destroy$ = new Subject<void>();
  private formId: number | null = null;
  private autoSaveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private formRendererService: FormRendererService,
    private authService: AuthService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.formId = +params['id'];
      if (this.formId) {
        this.loadForm();
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.readonly = params['readonly'] === 'true';
    });

    // Auto-save draft every 2 minutes if editing
    if (!this.readonly) {
      this.autoSaveInterval = setInterval(() => {
        if (this.canSaveDraft && this.formGroup.dirty) {
          this.onSaveDraft(true);
        }
      }, 120000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  loadForm(): void {
    if (!this.formId) return;

    this.loading = true;
    this.error = null;

    this.http.get<any>(`${environment.apiUrl}/forms/${this.formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const form = response.data || response;
          this.appraisalForm = form;
          this.formData = form.formData || {};
          this.loadTemplate(form.templateId);
          this.updatePermissions();
        },
        error: (err) => {
          this.error = 'Failed to load appraisal form. Please try again.';
          this.loading = false;
          console.error('Form load error:', err);
        }
      });
  }

  private loadTemplate(templateId: number): void {
    this.http.get<any>(`${environment.apiUrl}/templates/${templateId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.template = response.data || response;
          this.initializeForm();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load form template. Please try again.';
          this.loading = false;
          console.error('Template load error:', err);
        }
      });
  }

  private initializeForm(): void {
    if (!this.template || !this.appraisalForm) return;

    const schema = this.formRendererService.parseTemplateSchema(this.template.schemaJson);

    this.keyResponsibilitiesItems = schema.sections.find(s => s.sectionType === 'key_responsibilities')?.items || [];
    this.idpItems = schema.sections.find(s => s.sectionType === 'idp')?.items || [];
    this.goalsItems = schema.sections.find(s => s.sectionType === 'goals')?.items || [];
    
    const controls: any = {
      header: new FormGroup({
        dateOfHire: new FormControl(this.formData.header?.dateOfHire || ''),
        dateOfReview: new FormControl(this.formData.header?.dateOfReview || ''),
        reviewPeriod: new FormControl(this.formData.header?.reviewPeriod || ''),
        typeOfReview: new FormControl(this.formData.header?.typeOfReview || 'Annual')
      })
    };

    // Initialize Key Responsibilities
    if (this.keyResponsibilitiesItems.length > 0) {
      const krArray = new FormArray(
        this.keyResponsibilitiesItems.map((item, idx) => {
          const existing = this.formData.keyResponsibilities?.[idx];
          return new FormGroup({
            itemId: new FormControl(item.id),
            selfComment: new FormControl(existing?.selfComment || ''),
            selfRating: new FormControl(existing?.selfRating || ''),
            managerComment: new FormControl(existing?.managerComment || ''),
            managerRating: new FormControl(existing?.managerRating || '')
          });
        })
      );
      controls.keyResponsibilities = krArray;
    }

    // Initialize IDP
    if (this.idpItems.length > 0) {
      const idpArray = new FormArray(
        this.idpItems.map((item, idx) => {
          const existing = this.formData.idp?.[idx];
          return new FormGroup({
            itemId: new FormControl(item.id),
            selfComment: new FormControl(existing?.selfComment || ''),
            selfRating: new FormControl(existing?.selfRating || ''),
            managerComment: new FormControl(existing?.managerComment || ''),
            managerRating: new FormControl(existing?.managerRating || '')
          });
        })
      );
      controls.idp = idpArray;
    }

    // Initialize Goals
    if (this.goalsItems.length > 0) {
      const goalsArray = new FormArray(
        this.goalsItems.map((item, idx) => {
          const existing = this.formData.goals?.[idx];
          return new FormGroup({
            itemId: new FormControl(item.id),
            selfComment: new FormControl(existing?.selfComment || ''),
            selfRating: new FormControl(existing?.selfRating || ''),
            managerComment: new FormControl(existing?.managerComment || ''),
            managerRating: new FormControl(existing?.managerRating || '')
          });
        })
      );
      controls.goals = goalsArray;
    }

    // Initialize other fields
    controls.nextYearGoals = new FormControl(this.formData.nextYearGoals || '');
    controls.teamMemberComments = new FormControl(this.formData.overallEvaluation?.teamMemberComments || '');

    this.formGroup = new FormGroup(controls);
  }

  private updatePermissions(): void {
    if (!this.appraisalForm) return;

    const currentUser = this.authService.currentUserValue;
    const isEmployee = currentUser?.id === this.appraisalForm.employeeId;
    
    const editability = this.formRendererService.getFieldEditability(
      isEmployee,
      false,
      this.appraisalForm.status
    );

    this.canEditSelfFields = editability.selfCommentEditable && !this.readonly;
    this.canSaveDraft = this.canEditSelfFields;
    this.canSubmit = this.canEditSelfFields;
  }

  getKeyResponsibilitiesItems(): any[] {
    if (!this.template) return [];
    const schema = this.formRendererService.parseTemplateSchema(this.template.schemaJson);
    const section = schema.sections.find(s => s.sectionType === 'key_responsibilities');
    return section?.items || [];
  }

  getIdpItems(): any[] {
    if (!this.template) return [];
    const schema = this.formRendererService.parseTemplateSchema(this.template.schemaJson);
    const section = schema.sections.find(s => s.sectionType === 'idp');
    return section?.items || [];
  }

  getGoalsItems(): any[] {
    if (!this.template) return [];
    const schema = this.formRendererService.parseTemplateSchema(this.template.schemaJson);
    const section = schema.sections.find(s => s.sectionType === 'goals');
    return section?.items || [];
  }

  onSaveDraft(isAutoSave = false): void {
    if (!this.canSaveDraft || this.saving) return;

    this.saving = true;
    const updatedFormData = this.collectFormData();

    this.http.put(`${environment.apiUrl}/forms/${this.formId}/draft`, updatedFormData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.formGroup.markAsPristine();
          if (!isAutoSave) {
            this.snackBar.open('Draft saved successfully', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to save draft', 'Close', { duration: 3000 });
          console.error('Save draft error:', err);
        }
      });
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit || this.saving) return;

    // Validate before showing confirmation
    const updatedFormData = this.collectFormData();
    const validation = this.formRendererService.validateForEmployeeSubmission(updatedFormData);
    if (!validation.valid) {
      // Build a specific error message listing which fields are missing
      const errorMessages: string[] = [];
      const errs = validation.errors;
      if (errs.keyResponsibilities) errorMessages.push(`Key Responsibilities: ${errs.keyResponsibilities}`);
      if (errs.idp) errorMessages.push(`IDP: ${errs.idp}`);
      if (errs.goals) errorMessages.push(`Goals: ${errs.goals}`);
      const msg = errorMessages.length > 0
        ? `Required fields missing — ${errorMessages.join(' | ')}`
        : 'Please complete all required fields (marked with *) before submitting';
      this.snackBar.open(msg, 'Close', { duration: 8000 });
      return;
    }

    const confirmed = await firstValueFrom(this.dialogService.confirm({
      title: 'Submit Appraisal',
      message: 'Are you sure you want to submit your self-appraisal? You will not be able to edit it after submission.',
      confirmText: 'Submit',
      cancelText: 'Cancel'
    }));

    if (!confirmed) return;

    this.saving = true;

    // First, save the current form data as draft
    this.http.put(`${environment.apiUrl}/forms/${this.formId}/draft`, updatedFormData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Then submit the form
          this.http.post(`${environment.apiUrl}/forms/${this.formId}/submit`, {})
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.saving = false;
                this.formGroup.markAsPristine();
                this.snackBar.open('Appraisal submitted successfully', 'Close', { duration: 3000 });
                this.router.navigate(['/employee/dashboard']);
              },
              error: (err) => {
                this.saving = false;
                this.snackBar.open('Failed to submit appraisal', 'Close', { duration: 3000 });
                console.error('Submit error:', err);
              }
            });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open('Failed to save form data before submission', 'Close', { duration: 3000 });
          console.error('Save before submit error:', err);
        }
      });
  }

  onCancel(): void {
    if (this.formGroup.dirty) {
      this.dialogService.confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to leave?',
        confirmText: 'Leave',
        cancelText: 'Stay'
      }).subscribe(confirmed => {
        if (confirmed) {
          this.router.navigate(['/employee/dashboard']);
        }
      });
    } else {
      this.router.navigate(['/employee/dashboard']);
    }
  }

  private collectFormData(): FormData {
    const formValue = this.formGroup.value;
    
    // Build the SaveDraftRequest structure
    const draftRequest: any = {
      header: {
        dateOfHire: formValue.header?.dateOfHire || '',
        dateOfReview: formValue.header?.dateOfReview || '',
        reviewPeriod: formValue.header?.reviewPeriod || '',
        typeOfReview: formValue.header?.typeOfReview || 'Annual'
      },
      keyResponsibilities: (formValue.keyResponsibilities || []).map((item: any) => ({
        itemId: item.itemId,
        selfComment: item.selfComment || '',
        selfRating: item.selfRating || ''
      })),
      idp: (formValue.idp || []).map((item: any) => ({
        itemId: item.itemId,
        selfComment: item.selfComment || '',
        selfRating: item.selfRating || ''
      })),
      goals: (formValue.goals || []).map((item: any) => ({
        itemId: item.itemId,
        selfComment: item.selfComment || '',
        selfRating: item.selfRating || ''
      })),
      nextYearGoals: formValue.nextYearGoals || '',
      teamMemberComments: formValue.teamMemberComments || ''
    };
    
    return draftRequest;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NOT_STARTED': 'Not Started',
      'DRAFT_SAVED': 'Draft Saved',
      'SUBMITTED': 'Submitted',
      'UNDER_REVIEW': 'Under Review',
      'REVIEW_DRAFT_SAVED': 'Review in Progress',
      'REVIEWED_AND_COMPLETED': 'Completed'
    };
    return labels[status] || status;
  }
}
