
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-qh5-case-study',
  standalone: true,
  templateUrl: './qh5-case-study.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent],
})
export class Qh5CaseStudyComponent {}
