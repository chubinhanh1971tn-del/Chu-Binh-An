import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component'; // Import HeaderComponent
import { FooterComponent } from './components/footer/footer.component'; // Import FooterComponent
import { PropertyService } from './services/property.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent], // Add HeaderComponent and FooterComponent to imports
})
export class AppComponent {
  private propertyService = inject(PropertyService);

  constructor() {
    afterNextRender(() => {
      this.propertyService.generateAllDescriptions();
    });
  }
}