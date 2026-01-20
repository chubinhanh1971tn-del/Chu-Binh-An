import { Injectable, signal, effect } from '@angular/core';
import { User, UserRole, UserStatus } from '../models/user.model';

const MOCK_USERS: User[] = [
    { id: 1, name: 'Chu Bình An', email: 'admin@binhanapp.com', password: 'password', role: 'Admin', status: 'Active', group: 'Phòng Điều Hành' },
    { id: 2, name: 'Trưởng Nhóm A', email: 'lead.a@binhanapp.com', password: 'password', role: 'Group Leader', group: 'Nhóm A', status: 'Active' },
    { id: 3, name: 'Nguyễn Văn Hùng', email: 'ctv.hung@binhanapp.com', password: 'password', role: 'Collaborator', group: 'Nhóm A', status: 'Active' },
    { id: 4, name: 'Phạm Thị Dung', email: 'ctv.dung@binhanapp.com', password: 'password', role: 'Collaborator', group: 'Nhóm B', status: 'Active' },
    { id: 5, name: 'Trưởng Nhóm B', email: 'lead.b@binhanapp.com', password: 'password', role: 'Group Leader', group: 'Nhóm B', status: 'Active' },
    { id: 6, name: 'Lê Minh Tuấn', email: 'ctv.tuan@binhanapp.com', password: 'password', role: 'Collaborator', group: 'Nhóm A', status: 'Pending' }
];

const AUTH_STORAGE_KEY = 'ndtn365_auth_user_id';

@Injectable({ providedIn: 'root' })
export class AuthService {
    
  private users = signal<User[]>(MOCK_USERS);

  private getInitialUser(): User | null {
    try {
      const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUserId) {
        const userId = parseInt(storedUserId, 10);
        const user = this.users().find(u => u.id === userId);
        return user || null;
      }
    } catch (error) {
      console.error('Error reading auth user from localStorage', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  }
  
  readonly currentUser = signal<User | null>(this.getInitialUser());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, String(user.id));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });
  }

  // Public method to get all users (for admin purposes)
  allUsers() {
    return this.users();
  }
  
  getUsersByGroup(groupName: string): User[] {
    return this.users().filter(u => u.group === groupName && u.role !== 'Group Leader');
  }

  getUserByName(name: string): User | undefined {
    return this.users().find(u => u.name === name);
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.users().find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status === 'Pending') {
        return { success: false, message: 'Tài khoản của bạn đang chờ duyệt bởi quản trị viên.' };
      }
      this.currentUser.set(user);
      return { success: true, message: 'Đăng nhập thành công!' };
    }
    return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
  }

  register(userData: { name: string; email: string; password: string }, groupName?: string): { success: boolean; message: string } {
    if (this.users().some(u => u.email === userData.email)) {
      return { success: false, message: 'Email này đã tồn tại.' };
    }
    const newId = this.users().length > 0 ? Math.max(...this.users().map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'Collaborator', // Default role for new registrations
      status: 'Pending', // New users are pending by default
      group: groupName || 'Chưa có nhóm' // Assign to invited group or default
    };
    this.users.update(currentUsers => [...currentUsers, newUser]);
    return { success: true, message: 'Đăng ký thành công! Vui lòng chờ quản trị viên duyệt tài khoản của bạn.' };
  }

  logout() {
    this.currentUser.set(null);
  }

  approveUser(userId: number) {
    this.users.update(currentUsers => {
      return currentUsers.map(user => 
        user.id === userId ? { ...user, status: 'Active', group: user.group === 'Chưa có nhóm' ? 'Nhóm A' : user.group } : user
      );
    });
  }

  addUserByAdmin(userData: { name: string; email: string; password: string; role: UserRole; group?: string }): { success: boolean; message: string } {
    if (this.users().some(u => u.email === userData.email)) {
      return { success: false, message: 'Email này đã tồn tại.' };
    }
    const newId = this.users().length > 0 ? Math.max(...this.users().map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      status: 'Active', 
      group: userData.group || (userData.role === 'Admin' ? 'Phòng Điều Hành' : 'Chưa có nhóm')
    };
    this.users.update(currentUsers => [...currentUsers, newUser]);
    return { success: true, message: 'Thêm người dùng thành công!' };
  }

  addCollaboratorToGroup(leaderGroup: string, userData: { name: string; email: string; password: string }): { success: boolean; message: string } {
    if (this.users().some(u => u.email === userData.email)) {
      return { success: false, message: 'Email này đã tồn tại.' };
    }
    const newId = this.users().length > 0 ? Math.max(...this.users().map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'Collaborator',
      status: 'Active',
      group: leaderGroup,
    };
    this.users.update(currentUsers => [...currentUsers, newUser]);
    return { success: true, message: 'Thêm cộng tác viên vào nhóm thành công!' };
  }
}