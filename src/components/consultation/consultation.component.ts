import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-consultation',
  standalone: true,
  templateUrl: './consultation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, FormsModule],
})
export class ConsultationComponent {
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);

  activeTab = signal<'fengShui' | 'investment'>('fengShui');
  isAiConfigured = this.geminiService.isAiConfigured;
  isAiFeatureEnabled = this.settingsService.isAiFeatureEnabled;

  // Feng Shui state
  fengShuiData = {
    birthYear: null as number | null,
    direction: 'Đông'
  };
  fengShuiResult = signal<any>(null);
  isGeneratingFengShui = signal(false);

  // Investment state
  investmentData = {
    budget: null as number | null,
    goal: 'Tăng trưởng dài hạn',
    risk: 'Trung bình'
  };
  investmentResult = signal<any>(null);
  isGeneratingInvestment = signal(false);


  async getFengShuiAnalysis() {
    if (this.isGeneratingFengShui() || !this.fengShuiData.birthYear) return;

    this.isGeneratingFengShui.set(true);
    this.fengShuiResult.set(null);
    try {
      const result = await this.geminiService.generateFengShuiAnalysis(this.fengShuiData.birthYear, this.fengShuiData.direction);
      this.fengShuiResult.set(result);
    } catch (error) {
      console.error("Failed to get Feng Shui analysis", error);
      this.fengShuiResult.set({ error: 'Đã xảy ra lỗi khi phân tích. Vui lòng thử lại.' });
    } finally {
      this.isGeneratingFengShui.set(false);
    }
  }

  async getInvestmentAdvice() {
    if (this.isGeneratingInvestment() || !this.investmentData.budget) return;
    
    this.isGeneratingInvestment.set(true);
    this.investmentResult.set(null);
    try {
      const result = await this.geminiService.generateInvestmentAdvice(this.investmentData.budget, this.investmentData.goal, this.investmentData.risk);
      this.investmentResult.set(result);
    } catch (error) {
      console.error("Failed to get investment advice", error);
      this.investmentResult.set({ error: 'Đã xảy ra lỗi khi tạo tư vấn. Vui lòng thử lại.' });
    } finally {
      this.isGeneratingInvestment.set(false);
    }
  }
}