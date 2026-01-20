import { ChangeDetectionStrategy, Component, output, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  templateUrl: './settings-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class SettingsModalComponent {
  close = output<void>();
  settingsSaved = output<void>();

  private settingsService = inject(SettingsService);
  
  apiKeyInput = signal(this.settingsService.apiKey() ?? '');
  isAiFeatureEnabled = this.settingsService.isAiFeatureEnabled;

  isKeyValid = computed(() => this.apiKeyInput().trim().length >= 38);

  closeModal() {
    this.close.emit();
  }

  toggleAiFeature() {
    this.settingsService.toggleAiFeature();
  }

  saveSettings() {
    if (!this.isKeyValid()) {
      alert('Định dạng API Key không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }
    this.settingsService.setApiKey(this.apiKeyInput().trim() || null);
    alert('Cài đặt đã được lưu!');
    this.settingsSaved.emit();
  }
}