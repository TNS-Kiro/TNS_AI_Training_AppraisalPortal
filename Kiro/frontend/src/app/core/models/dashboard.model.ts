export interface EmployeeDashboardData {
  totalForms: number;
  pendingForms: number;
  submittedForms: number;
  completedForms: number;
}

/** Alias used by DashboardService and EmployeeDashboardComponent */
export type EmployeeDashboard = EmployeeDashboardData;

export interface ManagerDashboardData {
  totalTeamForms: number;
  pendingReview: number;
  completedReviews: number;
  completionPercentage: number;
  /** Historical appraisal forms for the manager (read-only, Req 8.6) */
  historicalForms: AppraisalFormSummary[];
  teamStats: TeamMemberStats[];
}

/** Alias used by DashboardService and ManagerDashboardComponent */
export type ManagerDashboard = ManagerDashboardData;

export interface HrDashboardData {
  totalForms: number;
  pendingEmployee: number;
  pendingReview: number;
  completed: number;
  overallCompletion: number;
  departmentStats: DepartmentStats[];
  cycleStats: CycleStats[];
}

/** Alias used by DashboardService and CycleDashboardComponent */
export type HRDashboard = HrDashboardData;

/** Department progress — alias for CycleDashboardComponent */
export type DepartmentProgress = DepartmentStats;

export interface TeamMemberStats {
  employeeName: string;
  designation: string;
  department?: string;
  status: string;
  formCount: number;
}

/** Form entry for a team member — used by TeamAppraisalListComponent */
export interface TeamMemberForm {
  formId: number;
  employeeId: number;
  employeeName: string;
  designation: string;
  department?: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface AppraisalFormSummary {
  id: number;
  cycleId: number;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface DepartmentStats {
  department: string;
  totalForms: number;
  completedForms: number;
  completionPercentage: number;
}

export interface CycleStats {
  cycleName: string;
  totalForms: number;
  completedForms: number;
  completionPercentage: number;
}
