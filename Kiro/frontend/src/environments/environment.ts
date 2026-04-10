export const environment = {
  production: false,
  apiUrl: '/api',
  // DEV KILL SWITCH: set to true to bypass login and work on your modules directly
  devBypassAuth: true,
  devMockUser: {
    id: 4,
    employeeId: 'EMP004',
    fullName: 'Amit Shingankar',
    email: 'amitkumars@thinknsolutions.com',
    designation: 'Senior Developer',
    department: 'Engineering',
    isActive: true,
    roles: [{ id: 3, name: 'HR' as const }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
