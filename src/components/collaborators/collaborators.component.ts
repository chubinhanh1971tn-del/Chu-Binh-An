import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-collaborators',
  standalone: true,
  templateUrl: './collaborators.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent],
})
export class CollaboratorsComponent {
  private authService = inject(AuthService);

  collaborators = computed(() => {
    return this.authService.allUsers().filter(user => user.role !== 'Admin' && user.status === 'Active');
  });

  getRoleClass(role: string): string {
    switch (role) {
      case 'Group Leader': return 'bg-purple-100 text-purple-800';
      case 'Collaborator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
