export type UserRole = 'Admin' | 'Group Leader' | 'Collaborator';
export type UserStatus = 'Active' | 'Pending';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Password is used for mock auth
  role: UserRole;
  status: UserStatus;
  group?: string; // e.g., 'Nhóm A', 'Nhóm B' for Group Leaders and Collaborators
}