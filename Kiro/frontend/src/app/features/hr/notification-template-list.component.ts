import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;font-family:sans-serif;background:#f8fafc;min-height:100vh;">

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
        <h1 style="margin:0;color:#1e293b;">Notification Templates</h1>
        <span style="font-size:13px;color:#64748b;background:#e2e8f0;padding:4px 10px;border-radius:999px;">
          {{ templates.length }} templates
        </span>
      </div>

      <!-- Info banner -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#1d4ed8;">
        <strong>About Notification Templates:</strong> These are the email templates sent automatically at each workflow trigger point.
        Use <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">{{ placeholderExample }}</code> syntax for dynamic values like
        <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">employeeName</code>,
        <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">cycleName</code>,
        <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">managerName</code>.
        Set a template to <strong>Inactive</strong> to disable that notification without deleting it.
      </div>

      @if (saveSuccess) {
        <div style="background:#dcfce7;border:1px solid #86efac;color:#16a34a;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;">
          ✓ Template saved successfully
        </div>
      }
      @if (saveError) {
        <div style="background:#fee2e2;border:1px solid #fca5a5;color:#dc2626;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;">
          {{ saveError }}
        </div>
      }

      <div style="display:flex;flex-direction:column;gap:12px;">
        @for (t of templates; track t.id) {
          <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"
               [style.border-left]="t.isActive ? '4px solid #22c55e' : '4px solid #d1d5db'">

            <!-- Template header row -->
            <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="flex:1;min-width:200px;">
                <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Trigger Event</div>
                <div style="font-weight:600;color:#1e293b;font-size:15px;">{{ t.triggerEvent }}</div>
              </div>
              <div style="flex:2;min-width:200px;">
                <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Subject</div>
                <div style="color:#334155;font-size:14px;">{{ t.subject }}</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <!-- Active/Inactive toggle -->
                <button (click)="toggleActive(t)"
                  [style.background]="t.isActive ? '#dcfce7' : '#f1f5f9'"
                  [style.color]="t.isActive ? '#16a34a' : '#64748b'"
                  [style.border]="t.isActive ? '1px solid #86efac' : '1px solid #d1d5db'"
                  style="padding:5px 14px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:600;min-width:90px;">
                  {{ t.isActive ? '● Active' : '○ Inactive' }}
                </button>
                <button (click)="togglePreview(t)"
                  style="background:#f1f5f9;color:#374151;border:1px solid #e2e8f0;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;">
                  {{ previewId === t.id ? 'Hide Preview' : 'Preview' }}
                </button>
                <button (click)="startEdit(t)"
                  style="background:#6366f1;color:white;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;">
                  Edit
                </button>
              </div>
            </div>

            <!-- Preview panel -->
            @if (previewId === t.id) {
              <div style="border-top:1px solid #f1f5f9;padding:16px 20px;background:#f8fafc;">
                <div style="font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Email Body Preview</div>
                <div style="background:white;border:1px solid #e2e8f0;border-radius:6px;padding:16px;font-size:14px;color:#334155;white-space:pre-wrap;line-height:1.6;">{{ t.body }}</div>
              </div>
            }

            <!-- Edit panel -->
            @if (editingId === t.id) {
              <div style="border-top:2px solid #6366f1;padding:20px;background:#fafafa;">
                <h3 style="margin:0 0 16px;font-size:15px;color:#1e293b;">Edit Template: {{ t.triggerEvent }}</h3>
                <div style="display:flex;flex-direction:column;gap:14px;max-width:700px;">

                  <div>
                    <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;color:#374151;">Subject Line</label>
                    <input [(ngModel)]="editForm.subject"
                      style="width:100%;padding:9px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;box-sizing:border-box;" />
                  </div>

                  <div>
                    <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:600;color:#374151;">Email Body (HTML supported)</label>
                    <textarea [(ngModel)]="editForm.body" rows="8"
                      style="width:100%;padding:9px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;box-sizing:border-box;resize:vertical;font-family:monospace;"></textarea>
                    <div style="font-size:12px;color:#94a3b8;margin-top:4px;">
                      Available placeholders: {{ '{' }}{{ '{' }}employeeName{{ '}' }}{{ '}' }} {{ '{' }}{{ '{' }}cycleName{{ '}' }}{{ '}' }} {{ '{' }}{{ '{' }}managerName{{ '}' }}{{ '}' }} {{ '{' }}{{ '{' }}dueDate{{ '}' }}{{ '}' }}
                    </div>
                  </div>

                  <!-- Active toggle in edit form -->
                  <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:white;border:1px solid #e2e8f0;border-radius:8px;">
                    <div style="flex:1;">
                      <div style="font-size:14px;font-weight:600;color:#1e293b;">Template Status</div>
                      <div style="font-size:12px;color:#64748b;margin-top:2px;">
                        Inactive templates will NOT send emails when the trigger event fires.
                      </div>
                    </div>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                      <div style="position:relative;width:44px;height:24px;">
                        <input type="checkbox" [(ngModel)]="editForm.isActive"
                          style="opacity:0;width:0;height:0;position:absolute;" />
                        <div (click)="editForm.isActive = !editForm.isActive"
                          [style.background]="editForm.isActive ? '#6366f1' : '#d1d5db'"
                          style="position:absolute;inset:0;border-radius:999px;cursor:pointer;transition:background 0.2s;">
                          <div [style.left]="editForm.isActive ? '22px' : '2px'"
                            style="position:absolute;top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
                        </div>
                      </div>
                      <span style="font-size:14px;font-weight:600;" [style.color]="editForm.isActive ? '#16a34a' : '#64748b'">
                        {{ editForm.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </label>
                  </div>

                  <div style="display:flex;gap:8px;">
                    <button (click)="saveEdit(t.id)"
                      style="background:#22c55e;color:white;border:none;padding:9px 24px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">
                      Save Changes
                    </button>
                    <button (click)="cancelEdit()"
                      style="background:#f1f5f9;color:#374151;border:1px solid #e2e8f0;padding:9px 20px;border-radius:6px;cursor:pointer;font-size:14px;">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (templates.length === 0) {
          <div style="text-align:center;padding:48px;color:#94a3b8;background:white;border-radius:8px;border:1px solid #e2e8f0;">
            No templates found. Make sure the backend is running.
          </div>
        }
      </div>
    </div>
  `
})
export class NotificationTemplateListComponent implements OnInit {
  templates: any[] = [];
  editingId: number | null = null;
  previewId: number | null = null;
  editForm = { subject: '', body: '', isActive: true };
  saveSuccess = false;
  saveError = '';
  placeholderExample = '{{placeholder}}';

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadTemplates(); }

  loadTemplates(): void {
    this.notificationService.getAllTemplates().subscribe({
      next: (r) => { this.templates = r.data?.content ?? []; this.cdr.detectChanges(); },
      error: () => { this.saveError = 'Could not load templates. Is the backend running?'; this.cdr.detectChanges(); }
    });
  }

  startEdit(t: any): void {
    this.editingId = t.id;
    this.previewId = null;
    this.saveSuccess = false;
    this.saveError = '';
    this.editForm = { subject: t.subject, body: t.body, isActive: t.isActive ?? true };
  }

  cancelEdit(): void { this.editingId = null; }

  saveEdit(id: number): void {
    this.saveError = '';
    this.notificationService.updateTemplate(id, this.editForm).subscribe({
      next: () => {
        this.saveSuccess = true;
        this.editingId = null;
        this.loadTemplates();
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => { this.saveError = 'Save failed. Check backend connection.'; }
    });
  }

  toggleActive(t: any): void {
    const newActive = !t.isActive;
    this.notificationService.updateTemplate(t.id, {
      subject: t.subject,
      body: t.body,
      isActive: newActive
    }).subscribe({
      next: (r) => {
        t.isActive = r.data?.isActive ?? newActive;
        this.cdr.detectChanges();
      },
      error: () => { this.saveError = 'Could not update status.'; this.cdr.detectChanges(); }
    });
  }

  togglePreview(t: any): void {
    this.previewId = this.previewId === t.id ? null : t.id;
  }
}
