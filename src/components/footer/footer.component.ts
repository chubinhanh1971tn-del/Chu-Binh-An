import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class FooterComponent {
    currentYear = new Date().getFullYear();
    settingsService = inject(SettingsService);

    isAiFeatureEnabled = this.settingsService.isAiFeatureEnabled;

    toggleAiFeature() {
        this.settingsService.toggleAiFeature();
    }
}