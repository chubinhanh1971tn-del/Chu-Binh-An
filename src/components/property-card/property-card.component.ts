import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Property } from '../../models/property.model';
import { GeminiService } from '../../services/gemini.service';
import { FavoritesService } from '../../services/favorites.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { ImageCarouselModalComponent } from '../image-carousel-modal/image-carousel-modal.component';
import { CompareService } from '../../services/compare.service';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';

export interface PriceTier {
  label: string;
  className: string;
}

export interface BestValueBadge {
  text: string;
  className: string;
}

@Component({
  selector: 'app-property-card',
  standalone: true,
  templateUrl: './property-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ContactModalComponent, ImageCarouselModalComponent],
})
export class PropertyCardComponent {
  property = input.required<Property>();
  priority = input<boolean>(false);
  detailClicked = output<void>();
  viewOnMapClicked = output<void>();
  
  private geminiService = inject(GeminiService);
  private favoritesService = inject(FavoritesService);
  private compareService = inject(CompareService);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  readonly imagePlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';

  isContactModalOpen = signal(false);
  isImageModalOpen = signal(false);
  isShareMenuOpen = signal(false);
  linkCopied = signal(false);
  isDescriptionExpanded = signal(false);
  isGeneratingDescription = signal(false);

  isFavorite = computed(() => this.favoritesService.favoriteIds().has(this.property().id));
  isInCompare = computed(() => this.compareService.compareIds().has(this.property().id));
  canAddMoreToCompare = computed(() => this.compareService.compareIds().size < this.compareService.MAX_COMPARE_ITEMS);
  isAiConfigured = this.geminiService.isAiConfigured;

  displayPrice = computed(() => {
    const prop = this.property();
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
  });

  priceTier = computed<PriceTier | null>(() => {
    const price = this.property().price;
    if (price === 0) return null;

    if (price < 1000000000) {
        return { label: 'Phân khúc thấp', className: 'bg-green-100 text-green-800' };
    } else if (price < 3000000000) {
        return { label: 'Phân khúc trung', className: 'bg-blue-100 text-blue-800' };
    } else if (price < 7000000000) {
        return { label: 'Phân khúc cao', className: 'bg-purple-100 text-purple-800' };
    } else {
        return { label: 'Hạng sang', className: 'bg-red-100 text-red-800' };
    }
  });

  bestValueBadge = computed<BestValueBadge | null>(() => {
    if (!this.isInCompare() || this.compareService.compareIds().size < 2) {
      return null;
    }
    const id = this.property().id;
    if (id === this.compareService.bestPricePerSqmId()) {
      return { text: 'Giá/m² tốt nhất', className: 'bg-teal-500 text-white' };
    }
    if (id === this.compareService.bestPriceId()) {
      return { text: 'Giá tốt nhất', className: 'bg-green-600 text-white' };
    }
    if (id === this.compareService.bestAreaId()) {
      return { text: 'Rộng nhất', className: 'bg-sky-600 text-white' };
    }
    return null;
  });

  priceTextColor = computed(() => {
    const price = this.property().price;
    if (price === 0) return 'text-amber-600';
    return 'text-green-600';
  });

  typeBadge = computed(() => {
    const prop = this.property();
    let className = 'bg-gray-100 text-gray-800'; // Default
    switch (prop.type) {
      case 'Nhà': className = 'bg-green-100 text-green-800'; break;
      case 'Đất': className = 'bg-amber-100 text-amber-800'; break;
      case 'Căn hộ': className = 'bg-sky-100 text-sky-800'; break;
    }
    return { label: prop.type, className };
  });

  region = computed<string | null>(() => {
    const address = this.property().address;
    if (!address) return null;
    const parts = address.split(',').map(p => p.trim());
    const ward = parts.find(p => p.startsWith('Phường') || p.startsWith('Xã'));
    if (ward) return ward;
    const district = parts.find(p => p.startsWith('Huyện') || p.startsWith('TP.'));
    if (district) return district;
    return null;
  });

  cardBorderClass = computed(() => {
    const prop = this.property();
    switch (prop.type) {
      case 'Nhà': return 'border-t-4 border-green-600';
      case 'Đất': return 'border-t-4 border-amber-600';
      case 'Căn hộ': return 'border-t-4 border-sky-600';
      default: return 'border-t-4 border-gray-600';
    }
  });

  async regenerateDescription() {
    this.isGeneratingDescription.set(true);
    try {
      await this.propertyService.regeneratePropertyDescription(this.property().id);
    } catch (e) {
      console.error(e);
    } finally {
      this.isGeneratingDescription.set(false);
    }
  }

  toggleDescription() {
    this.isDescriptionExpanded.update(v => !v);
  }

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.property().id);
  }
  
  toggleCompare() {
    this.compareService.toggleCompare(this.property().id);
  }

  openContactModal() {
    this.isContactModalOpen.set(true);
  }

  closeContactModal() {
    this.isContactModalOpen.set(false);
  }

  openImageModal() {
    this.isImageModalOpen.set(true);
  }

  closeImageModal() {
    this.isImageModalOpen.set(false);
  }
  
  toggleShareMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isShareMenuOpen.update(v => !v);
  }

  share(platform: 'facebook' | 'zalo', event: MouseEvent) {
    event.stopPropagation();
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.property().title);
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'zalo':
        shareUrl = `https://sp.zalo.me/share_inline?d={"feed":{"link":"${window.location.href}"}}&b={"style":"2","color":"blue"}&button=null&app_id=`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    this.isShareMenuOpen.set(false);
  }

  copyLink(event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => {
        this.linkCopied.set(false);
        this.isShareMenuOpen.set(false);
      }, 1500);
    });
  }
}