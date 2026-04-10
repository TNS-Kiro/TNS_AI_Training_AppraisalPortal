import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { EmployeeDashboardData, ManagerDashboardData, HrDashboardData } from '../models/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get employee dashboard data', () => {
    const mockData: EmployeeDashboardData = {
      totalForms: 10,
      pendingForms: 3,
      submittedForms: 2,
      completedForms: 5
    };

    service.getEmployeeDashboard().subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/dashboard/employee');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockData, message: null });
  });

  it('should get manager dashboard data', () => {
    const mockData: ManagerDashboardData = {
      totalTeamForms: 20,
      pendingReview: 5,
      completedReviews: 15,
      completionPercentage: 75.0,
      teamStats: [
        { employeeName: 'John Doe', status: 'COMPLETED', formCount: 5 }
      ]
    };

    service.getManagerDashboard().subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/dashboard/manager');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockData, message: null });
  });

  it('should get HR dashboard data', () => {
    const mockData: HrDashboardData = {
      totalForms: 100,
      pendingEmployee: 30,
      pendingReview: 20,
      completed: 50,
      overallCompletion: 50.0,
      departmentStats: [
        {
          department: 'Engineering',
          totalForms: 50,
          completedForms: 30,
          completionPercentage: 60.0
        }
      ],
      cycleStats: [
        {
          cycleName: 'Q1 2024',
          totalForms: 60,
          completedForms: 40,
          completionPercentage: 66.67
        }
      ]
    };

    service.getHrDashboard().subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/dashboard/hr');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockData, message: null });
  });

  it('should get status distribution', () => {
    const mockData = {
      'PENDING_EMPLOYEE': 30,
      'SUBMITTED': 20,
      'COMPLETED': 50
    };

    service.getStatusDistribution().subscribe(response => {
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/dashboard/status-distribution');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockData, message: null });
  });

  it('should handle error when getting employee dashboard', () => {
    service.getEmployeeDashboard().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/dashboard/employee');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
