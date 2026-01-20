import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, RouterLink],
})
export class AboutComponent {}