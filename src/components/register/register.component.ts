import { ChangeDetectionStrategy, Component, inject, signal, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, HeaderComponent, FooterComponent],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  successMessage = signal('');
  errorMessage = signal('');
  groupFromInvite = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
        this.route.queryParams.subscribe(params => {
            if (params['group']) {
                this.groupFromInvite.set(decodeURIComponent(params['group']));
            }
        });
    });
  }

  submitForm() {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.registerData.password !== this.registerData.confirmPassword) {
        this.errorMessage.set('Mật khẩu xác nhận không khớp.');
        return;
    }

    const result = this.authService.register({
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password
    }, this.groupFromInvite() ?? undefined);
    
    if (result.success) {
        this.successMessage.set(result.message);
        // Optionally clear form or redirect
        // this.router.navigate(['/login']);
    } else {
        this.errorMessage.set(result.message);
    }
  }
}
