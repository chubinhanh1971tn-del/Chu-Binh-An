import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, PropertySource, ListingType } from '../../models/property.model';
import { AddPropertyModalComponent } from '../add-property-modal/add-property-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-collaborator',
  standalone: true,
  templateUrl: './collaborator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AddPropertyModalComponent],
})
export class CollaboratorComponent {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  
  private allProperties = this.propertyService.getProperties();
  
  searchTerm = signal('');
  isAddModalOpen = signal(false);

  // Helper to determine sorting price (sale or rent)
  private getEffectivePrice(p: Property): number {
    return p.price > 0 ? p.price : (p.rentPrice ?? 0);
  }

  properties = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const collaboratorName = this.currentUser()?.name;
    
    if (!collaboratorName) return [];

    let collaboratorProps = this.allProperties().filter(p => p.collaboratorName === collaboratorName);

    if (term) {
        collaboratorProps = collaboratorProps.filter(p => 
            p.title.toLowerCase().includes(term) || 
            p.address.toLowerCase().includes(term)
        );
    }

    // Sort by effective price descending
    return [...collaboratorProps].sort((a, b) => this.getEffectivePrice(b) - this.getEffectivePrice(a));
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  formatDisplayPrice(property: Property): string {
    const prop = property;
    if (prop.listingType === 'Cho Thuê') {
      const price = prop.rentPrice;
      if (!price || price === 0) return 'Thỏa thuận';
      return `${(price / 1000000).toFixed(1).replace('.0', '')} tr/tháng`;
    } else {
      const price = prop.price;
      if (price === 0) return 'Liên hệ';
      if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(1)} tỷ`;
      }
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
  }

  handleAddProperty(propertyData: any) {
    // Automatically assign source and collaborator name
    const payload = {
      ...propertyData,
      source: 'Đối tác MGA' as PropertySource,
    };
    this.propertyService.addProperty(payload);
    this.isAddModalOpen.set(false);
  }
  
  editProperty(property: Property) {
    alert(`Chức năng sửa BĐS "${property.title}" đang được phát triển.`);
  }

  deleteProperty(property: Property) {
    if (confirm(`Bạn có chắc chắn muốn xóa BĐS "${property.title}" không?`)) {
      this.propertyService.deleteProperty(property.id);
    }
  }

  toggleFeatured(property: Property) {
    this.propertyService.toggleFeatured(property.id);
  }
  
  getListingTypeClass(listingType: ListingType): string {
    switch (listingType) {
      case 'Bán': return 'bg-yellow-100 text-yellow-800';
      case 'Cho Thuê': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
