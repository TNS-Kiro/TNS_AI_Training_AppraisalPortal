export interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;   // enriched by backend
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;   // ISO instant string from backend
}

export interface AuditLogSearchParams {
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
