import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Property } from '../../models/property.model';
import { FavoritesService } from '../../services/favorites.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { ImageCarouselModalComponent } from '../image-carousel-modal/image-carousel-modal.component';
import { CompareService } from '../../services/compare.service';
// import { AuthService } from '../../services/auth.service'; // Removed as per new central Zalo group strategy

@Component({
  selector: 'app-apartment-card',
  standalone: true,
  templateUrl: './apartment-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, ContactModalComponent, ImageCarouselModalComponent],
})
export class ApartmentCardComponent {
  property = input.required<Property>();
  detailClicked = output<void>();
  viewOnMapClicked = output<void>();
  
  private favoritesService = inject(FavoritesService);
  private compareService = inject(CompareService);
  // private authService = inject(AuthService); // Removed as per new central Zalo group strategy

  readonly imagePlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
  
  isContactModalOpen = signal(false);
  isImageModalOpen = signal(false);
  isShareMenuOpen = signal(false);
  linkCopied = signal(false);

  isFavorite = computed(() => this.favoritesService.favoriteIds().has(this.property().id));
  isInCompare = computed(() => this.compareService.compareIds().has(this.property().id));
  canAddMoreToCompare = computed(() => this.compareService.compareIds().size < this.compareService.MAX_COMPARE_ITEMS);

  // collaboratorZaloLink = computed(() => { // Removed as per new central Zalo group strategy
  //   const prop = this.property();
  //   if (prop.collaboratorName) {
  //     const user = this.authService.getUserByName(prop.collaboratorName);
  //     return user?.zaloGroupLink;
  //   }
  //   return null;
  // });

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.property().id);
  }
  
  toggleCompare() {
    this.compareService.toggleCompare(this.property().id);
  }

  formatPrice(price: number | undefined): string {
    if (!price || price === 0) {
      return 'Thỏa thuận';
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace('.0', '')} triệu/tháng`;
    }
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ/tháng';
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