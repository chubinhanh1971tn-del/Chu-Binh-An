import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-urban-planning',
  standalone: true,
  templateUrl: './urban-planning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, RouterLink],
})
export class UrbanPlanningComponent {
    // This URL shows a real satellite image of the case study area before development.
    readonly historicalCityMapUrl = 'https://i.imgur.com/9T7Y5c5.jpeg';
}