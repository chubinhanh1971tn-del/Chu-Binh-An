import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, PropertySource, ListingType, PropertyType } from '../../models/property.model';
import { AddPropertyModalComponent } from '../add-property-modal/add-property-modal.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AddPropertyModalComponent],
})
export class AdminComponent {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private allProperties = this.propertyService.getProperties();
  private allUsers = this.authService.allUsers;
  
  currentUser = this.authService.currentUser;
  activeMenu = signal<'properties' | 'users'>('users');
  searchTerm = signal('');
  isAddModalOpen = signal(false);
  
  shareMenuOpenForPropertyId = signal<number | null>(null);
  linkCopied = signal(false);

  // Helper to determine sorting price (sale or rent)
  private getEffectivePrice(p: Property): number {
    const price = p.listingType === 'Bán' ? p.price : p.rentPrice ?? 0;
    // Treat 0 as a very high number so it sorts to the end when ascending
    return price === 0 ? Infinity : price;
  }

  properties = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    let props = this.allProperties();
    if (term) {
        props = props.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.address.toLowerCase().includes(term)
        );
    }
    return [...props].sort((a, b) => {
        // Sort by featured first, then by date
        const featuredA = a.featured ? 1 : 0;
        const featuredB = b.featured ? 1 : 0;
        if (featuredB !== featuredA) {
            return featuredB - featuredA;
        }
        return b.datePosted.getTime() - a.datePosted.getTime();
    });
  });

  pendingUsers = computed(() => {
    return this.allUsers().filter(u => u.status === 'Pending');
  });

  activeUsers = computed(() => {
    return this.allUsers().filter(u => u.status === 'Active');
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  approveUser(user: User) {
    if (confirm(`Bạn có chắc chắn muốn duyệt thành viên "${user.name}" không?`)) {
      this.authService.approveUser(user.id);
    }
  }

  deleteProperty(property: Property) {
    if (confirm(`Bạn có chắc chắn muốn xóa BĐS "${property.title}" không?`)) {
      this.propertyService.deleteProperty(property.id);
    }
  }

  toggleFeatured(property: Property) {
    this.propertyService.toggleFeatured(property.id);
  }

  handleAddProperty(propertyData: any) {
    this.propertyService.addProperty(propertyData);
    this.isAddModalOpen.set(false);
  }
  
  formatDisplayPrice(property: Property): string {
    const prop = property;
    if (prop.listingType === 'Cho Thuê') {
      const price = prop.rentPrice;
      if (!price || price === 0) return 'Thỏa thuận';
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1).replace('.0', '')} tr/tháng`;
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ/tháng';
    } else {
      const price = prop.price;
      if (price === 0) return 'Liên hệ';
      if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(1).replace('.0', '')} tỷ`;
      }
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(0)} triệu`;
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }
  }

  getRowClass(property: Property): string {
    if (property.featured) return 'bg-yellow-50';
    switch (property.type) {
        case 'Nhà': return 'bg-blue-50/30';
        case 'Đất': return 'bg-amber-50/30';
        case 'Căn hộ': return 'bg-sky-50/30';
        default: return 'bg-white';
    }
  }
  
  getTypeClass(type: PropertyType): string {
    switch (type) {
      case 'Nhà': return 'bg-blue-100 text-blue-800';
      case 'Đất': return 'bg-amber-100 text-amber-800';
      case 'Căn hộ': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getListingTypeClass(listingType: ListingType): string {
    switch (listingType) {
      case 'Bán': return 'bg-yellow-100 text-yellow-800';
      case 'Cho Thuê': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getSourceClass(source: PropertySource): string {
    switch (source) {
      case 'Ký gửi cá nhân': return 'bg-fuchsia-100 text-fuchsia-800';
      case 'Đối tác MGA': return 'bg-blue-100 text-blue-800';
      case 'Nguồn tổng hợp': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  toggleShareMenu(event: MouseEvent, propertyId: number) {
    event.stopPropagation();
    this.shareMenuOpenForPropertyId.update(currentId => 
      currentId === propertyId ? null : propertyId
    );
  }

  share(platform: 'facebook' | 'zalo', property: Property, event: MouseEvent) {
    event.stopPropagation();
    const url = encodeURIComponent(window.location.origin + window.location.pathname);
    const text = encodeURIComponent(property.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'zalo':
        shareUrl = `https://sp.zalo.me/share_inline?d={"feed":{"link":"${window.location.origin + window.location.pathname}"}}&b={"style":"2","color":"blue"}&button=null&app_id=`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    this.shareMenuOpenForPropertyId.set(null);
  }

  copyLink(property: Property, event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + window.location.pathname).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => {
        this.linkCopied.set(false);
        this.shareMenuOpenForPropertyId.set(null);
      }, 1500);
    });
  }
}