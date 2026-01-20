import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Property } from '../../models/property.model';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GeminiService } from '../../services/gemini.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import { FutureArchitectComponent } from '../future-architect/future-architect.component';

@Component({
  selector: 'app-property-detail-modal',
  standalone: true,
  templateUrl: './property-detail-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ContactModalComponent, FutureArchitectComponent],
  host: {
    '(document:keydown.escape)': 'closeModal()',
  },
})
export class PropertyDetailModalComponent {
  property = input.required<Property>();
  close = output<void>();

  private sanitizer = inject(DomSanitizer);
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);
  // private authService = inject(AuthService); // Removed as per new central Zalo group strategy

  isAiConfigured = this.geminiService.isAiConfigured;
  isAiFeatureEnabled = this.settingsService.isAiFeatureEnabled;
  isContactModalOpen = signal(false);
  currentImageIndex = signal(0);

  // AI Agent Analysis State
  aiAnalysis = signal<{ strengths: string; weaknesses: string; potential: string; suitableFor: string; } | null>(null);
  isGeneratingAnalysis = signal(false);
  
  // collaboratorZaloLink = computed(() => { // Removed as per new central Zalo group strategy
  //   const prop = this.property();
  //   if (prop.collaboratorName) {
  //     const user = this.authService.getUserByName(prop.collaboratorName);
  //     return user?.zaloGroupLink;
  //   }
  //   return null;
  // });

  mapUrl = computed<SafeResourceUrl | null>(() => {
    const prop = this.property();
    if (!prop?.lat || !prop?.lng) {
        return null;
    }
    const { lat, lng } = prop;
    // Create a small bounding box for the view
    const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  nextImage() {
    this.currentImageIndex.update(i => (i + 1) % this.property().imageUrls.length);
  }

  prevImage() {
    this.currentImageIndex.update(i => (i - 1 + this.property().imageUrls.length) % this.property().imageUrls.length);
  }

  goToImage(index: number) {
    this.currentImageIndex.set(index);
  }

  displayPrice = computed(() => {
    const prop = this.property();
    if (prop.listingType === 'Cho Thuê') {
      const price = prop.rentPrice;
      if (!price || price === 0) return 'Thỏa thuận';
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1).replace('.0', '')} triệu/tháng`;
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ/tháng';
    } else {
      const price = prop.price;
      if (price === 0) return 'Liên hệ';
      if (price >= 1000000000) {
        const value = price / 1000000000;
        return `${value % 1 === 0 ? value : value.toFixed(1)} tỷ`;
      }
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(0)} triệu`;
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }
  });

  async getAiAnalysis() {
    if (this.isGeneratingAnalysis()) return;
    this.isGeneratingAnalysis.set(true);
    this.aiAnalysis.set(null);
    try {
      const analysis = await this.geminiService.generateAgentAnalysis(this.property());
      this.aiAnalysis.set(analysis);
    } catch (error) {
      console.error("Failed to get AI analysis", error);
    } finally {
      this.isGeneratingAnalysis.set(false);
    }
  }

  closeModal() {
    this.close.emit();
  }

  openContactModal() {
    this.isContactModalOpen.set(true);
  }

  closeContactModal() {
    this.isContactModalOpen.set(false);
  }
}