export interface EmployeeDashboardData {
  totalForms: number;
  pendingForms: number;
  submittedForms: number;
  completedForms: number;
}

export interface ManagerDashboardData {
  totalTeamForms: number;
  pendingReview: number;
  completedReviews: number;
  completionPercentage: number;
  /** Historical appraisal forms for the manager (read-only, Req 8.6) */
  historicalForms: AppraisalFormSummary[];
  teamStats: TeamMemberStats[];
}

export interface HrDashboardData {
  totalForms: number;
  pendingEmployee: number;
  pendingReview: number;
  completed: number;
  overallCompletion: number;
  departmentStats: DepartmentStats[];
  cycleStats: CycleStats[];
}

export interface TeamMemberStats {
  employeeName: string;
  designation: string;
  department?: string;
  status: string;
  formCount: number;
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
