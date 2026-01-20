import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, HeaderComponent, FooterComponent],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = {
    email: 'admin@binhanapp.com',
    password: 'password'
  };
  
  errorMessage = signal('');

  submitForm() {
    this.errorMessage.set('');
    const result = this.authService.login(this.loginData.email, this.loginData.password);
    if (result.success) {
      const user = this.authService.currentUser();
      switch(user?.role) {
        case 'Admin':
          this.router.navigate(['/admin']);
          break;
        case 'Group Leader':
          this.router.navigate(['/group-leader']);
          break;
        case 'Collaborator':
           this.router.navigate(['/collaborator']);
           break;
        default:
          this.router.navigate(['/']);
      }
    } else {
      this.errorMessage.set(result.message);
    }
  }
}