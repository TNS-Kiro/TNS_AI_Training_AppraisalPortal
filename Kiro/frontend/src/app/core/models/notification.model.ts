export interface NotificationTemplate {
  id: number;
  triggerEvent: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotificationLog {
  id: number;
  recipientEmail: string;
  triggerEvent: string;
  subject: string;
  body: string;
  status: 'SENT' | 'FAILED';
  errorMessage?: string;
  sentAt: string;
}
