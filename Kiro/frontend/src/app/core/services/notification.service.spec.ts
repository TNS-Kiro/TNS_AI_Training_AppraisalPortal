import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { NotificationTemplate, EmailNotificationLog } from '../models/notification.model';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all templates', () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        id: 1,
        triggerEvent: 'CYCLE_TRIGGERED',
        subject: 'Test Subject',
        body: 'Test Body',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    service.getAllTemplates(0, 20).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.content).toEqual(mockTemplates);
    });

    const req = httpMock.expectOne('/api/notifications/templates?page=0&size=20');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: mockTemplates }, message: null });
  });

  it('should get template by trigger event', () => {
    const mockTemplate: NotificationTemplate = {
      id: 1,
      triggerEvent: 'CYCLE_TRIGGERED',
      subject: 'Test Subject',
      body: 'Test Body',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    service.getTemplate('CYCLE_TRIGGERED').subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockTemplate);
    });

    const req = httpMock.expectOne('/api/notifications/templates/CYCLE_TRIGGERED');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockTemplate, message: null });
  });

  it('should update template', () => {
    const updateData = {
      subject: 'Updated Subject',
      body: 'Updated Body',
      isActive: false
    };

    const mockUpdatedTemplate: NotificationTemplate = {
      id: 1,
      triggerEvent: 'CYCLE_TRIGGERED',
      ...updateData,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    service.updateTemplate(1, updateData).subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data.subject).toBe('Updated Subject');
    });

    const req = httpMock.expectOne('/api/notifications/templates/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush({ success: true, data: mockUpdatedTemplate, message: null });
  });

  it('should search notification logs with filters', () => {
    const mockLogs: EmailNotificationLog[] = [
      {
        id: 1,
        recipientEmail: 'test@example.com',
        triggerEvent: 'CYCLE_TRIGGERED',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'SENT',
        sentAt: '2024-01-01T10:00:00Z'
      }
    ];

    service.searchNotificationLogs('test@example.com', 'CYCLE_TRIGGERED', 'SENT', 0, 25)
      .subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.content).toEqual(mockLogs);
      });

    const req = httpMock.expectOne(
      '/api/notifications/logs?page=0&size=25&recipientEmail=test@example.com&triggerEvent=CYCLE_TRIGGERED&status=SENT'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: mockLogs }, message: null });
  });

  it('should search notification logs without filters', () => {
    service.searchNotificationLogs(null, null, null, 0, 25).subscribe();

    const req = httpMock.expectOne('/api/notifications/logs?page=0&size=25');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: [] }, message: null });
  });

  it('should handle error when getting templates', () => {
    service.getAllTemplates().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/notifications/templates?page=0&size=20');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });
});
