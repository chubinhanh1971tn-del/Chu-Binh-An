
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-tac-minh-cau-case-study',
  standalone: true,
  templateUrl: './tac-minh-cau-case-study.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent],
})
export class TacMinhCauCaseStudyComponent {}
