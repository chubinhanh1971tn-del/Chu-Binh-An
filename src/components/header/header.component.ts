import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { PropertyType } from '../../models/property.model';
import { RouterLink } from '@angular/router';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserMenuComponent],
})
export class HeaderComponent {
  headerFilterSelected = output<string>();

  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}