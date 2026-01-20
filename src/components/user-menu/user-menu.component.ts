import { ChangeDetectionStrategy, Component, inject, output, input, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  templateUrl: './user-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class UserMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isMobile = input(false);
  
  menuClosed = output<void>();

  isUserMenuOpen = signal(false);

  currentUser = this.authService.currentUser;
  
  toggleUserMenu(event?: MouseEvent) {
    event?.stopPropagation();
    this.isUserMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
    this.menuClosed.emit();
    this.router.navigate(['/']);
  }

  getPortalLink(): string {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'Admin': return '/admin';
      case 'Group Leader': return '/group-leader';
      case 'Collaborator': return '/collaborator';
      default: return '/';
    }
  }
}