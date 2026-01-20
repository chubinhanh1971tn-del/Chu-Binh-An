import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Property } from '../../models/property.model';
import { FavoritesService } from '../../services/favorites.service';
import { CompareService } from '../../services/compare.service';
import { SettingsService } from '../../services/settings.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { ImageCarouselModalComponent } from '../image-carousel-modal/image-carousel-modal.component';
import { Router } from '@angular/router'; // Import Router for window.location.href

export interface BestValueBadge {
  text: string;
  className: string;
}

@Component({
  selector: 'app-property-list-item',
  standalone: true, // Critical fix: Declaring as standalone
  templateUrl: './property-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ContactModalComponent, ImageCarouselModalComponent], // AuthService removed from here
})
export class PropertyListItemComponent {
  property = input.required<Property>();
  priority = input<boolean>(false);
  detailClicked = output<void>();
  viewOnMapClicked = output<void>();
  
  private favoritesService = inject(FavoritesService);
  private compareService = inject(CompareService);
  private settingsService = inject(SettingsService);
  private router = inject(Router); // Inject Router

  readonly imagePlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
  
  isContactModalOpen = signal(false);
  isImageModalOpen = signal(false);
  isShareMenuOpen = signal(false);
  linkCopied = signal(false);
  
  isFavorite = computed(() => this.favoritesService.favoriteIds().has(this.property().id));
  isInCompare = computed(() => this.compareService.compareIds().has(this.property().id));
  canAddMoreToCompare = computed(() => this.compareService.compareIds().size < this.compareService.MAX_COMPARE_ITEMS);
  isAiFeatureEnabled = this.settingsService.isAiFeatureEnabled;
  
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
    // Use window.location.origin + this.router.url to get the full current URL
    const currentUrl = window.location.origin + this.router.url;
    const url = encodeURIComponent(currentUrl);
    // const text = encodeURIComponent(this.property().title); // Not used for Facebook sharer
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'zalo':
        // Zalo sharing via URL is complex and often restricted. This is a basic attempt.
        // It's often better to encourage users to copy link for Zalo or use mobile app's share functionality.
        shareUrl = `https://sp.zalo.me/share_inline?d={"feed":{"link":"${currentUrl}"}}&b={"style":"2","color":"blue"}&button=null&app_id=`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    this.isShareMenuOpen.set(false);
  }

  copyLink(event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + this.router.url).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => {
        this.linkCopied.set(false);
        this.isShareMenuOpen.set(false);
      }, 1500);
    });
  }
}