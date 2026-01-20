import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, PropertySource, ListingType, PropertyType } from '../../models/property.model';
import { AddPropertyModalComponent } from '../add-property-modal/add-property-modal.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-group-leader',
  standalone: true,
  templateUrl: './group-leader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AddPropertyModalComponent],
})
export class GroupLeaderComponent {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  
  private allProperties = this.propertyService.getProperties();
  
  activeMenu = signal<'properties' | 'members'>('properties');
  searchTerm = signal('');
  isAddModalOpen = signal(false);
  isInviteModalOpen = signal(false);
  inviteLinkCopied = signal(false);

  // Helper to determine sorting price (sale or rent)
  private getEffectivePrice(p: Property): number {
    return p.price > 0 ? p.price : (p.rentPrice ?? 0);
  }

  properties = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const groupName = this.currentUser()?.group;

    if (!groupName) return [];

    // Filter properties for the leader's group
    let groupProperties = this.allProperties().filter(p => p.group === groupName);

    if (term) {
      groupProperties = groupProperties.filter(p => 
          p.title.toLowerCase().includes(term) || 
          p.address.toLowerCase().includes(term)
      );
    }

    // Sort by effective price descending
    return [...groupProperties].sort((a, b) => this.getEffectivePrice(b) - this.getEffectivePrice(a));
  });
  
  groupMembers = computed(() => {
      const groupName = this.currentUser()?.group;
      if (!groupName) return [];
      return this.authService.getUsersByGroup(groupName);
  });
  
  invitationLink = computed(() => {
    const groupName = this.currentUser()?.group;
    if (!groupName) return '';
    // Use query parameter for the group name
    return `${window.location.origin}${window.location.pathname}#/register?group=${encodeURIComponent(groupName)}`;
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
    const user = this.currentUser();
    if (!user || !user.group) return;

    const payload = {
      ...propertyData,
      group: user.group, // Assign property to the leader's group
      collaboratorName: propertyData.collaboratorName || user.name, // Assign to a specific member or the leader
    };
    this.propertyService.addProperty(payload);
    this.isAddModalOpen.set(false);
  }
  
  deleteProperty(property: Property) {
    if (confirm(`Bạn có chắc chắn muốn xóa BĐS "${property.title}" không?`)) {
      this.propertyService.deleteProperty(property.id);
    }
  }

  toggleFeatured(property: Property) {
    this.propertyService.toggleFeatured(property.id);
  }
  
  openInviteModal() {
    this.isInviteModalOpen.set(true);
  }
  
  closeInviteModal() {
    this.isInviteModalOpen.set(false);
    this.inviteLinkCopied.set(false);
  }
  
  copyInviteLink() {
    navigator.clipboard.writeText(this.invitationLink()).then(() => {
      this.inviteLinkCopied.set(true);
      setTimeout(() => this.inviteLinkCopied.set(false), 2000);
    });
  }

  getListingTypeClass(listingType: ListingType): string {
    switch (listingType) {
      case 'Bán': return 'bg-yellow-100 text-yellow-800';
      case 'Cho Thuê': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
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

  getSourceClass(source: PropertySource): string {
    switch (source) {
      case 'Ký gửi cá nhân': return 'bg-fuchsia-100 text-fuchsia-800';
      case 'Đối tác MGA': return 'bg-blue-100 text-blue-800';
      case 'Nguồn tổng hợp': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getRowClass(property: Property): string {
    switch (property.type) {
        case 'Nhà': return 'bg-blue-50/30';
        case 'Đất': return 'bg-amber-50/30';
        case 'Căn hộ': return 'bg-sky-50/30';
        default: return 'bg-white';
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  }
}
