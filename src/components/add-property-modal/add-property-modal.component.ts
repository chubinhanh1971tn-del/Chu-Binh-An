import { ChangeDetectionStrategy, Component, output, input, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertySource, PropertyType, ListingType } from '../../models/property.model';

@Component({
  selector: 'app-add-property-modal',
  standalone: true,
  templateUrl: './add-property-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class AddPropertyModalComponent {
  close = output<void>();
  propertyAdded = output<any>();
  
  initialSource = input<PropertySource | null>(null);
  initialCollaboratorName = input<string | null>(null);

  newProperty = {
    title: '',
    address: '',
    price: null as number | null,
    rentPrice: null as number | null,
    listingType: 'Bán' as ListingType,
    source: 'Nguồn tổng hợp' as PropertySource,
    bedrooms: 0,
    bathrooms: 0,
    area: null as number | null,
    type: 'Nhà' as PropertyType,
    featured: false,
    legalStatus: 'Sổ đỏ chính chủ',
    coverImageUrl: '',
    imageUrlsInput: '',
    description: '',
    yearBuilt: null as number | null,
    buildingName: '',
    floorNumber: null as number | null,
    apartmentNumber: '',
    collaboratorName: '',
  };
  
  constructor() {
    effect(() => {
      const source = this.initialSource();
      const collaborator = this.initialCollaboratorName();
      if(source) {
        this.newProperty.source = source;
      }
      if(collaborator) {
        this.newProperty.collaboratorName = collaborator;
      }
    });
  }

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    const urls = this.newProperty.imageUrlsInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    // Ensure cover image is the first in the list
    if (this.newProperty.coverImageUrl && !urls.includes(this.newProperty.coverImageUrl)) {
      urls.unshift(this.newProperty.coverImageUrl);
    } else if (!this.newProperty.coverImageUrl && urls.length > 0) {
      // If no cover image is specified, use the first from the list
      this.newProperty.coverImageUrl = urls[0];
    }

    const payload = {
      ...this.newProperty,
      price: this.newProperty.price ?? 0,
      rentPrice: this.newProperty.rentPrice,
      area: this.newProperty.area ?? 0,
      imageUrls: urls.length > 0 ? urls : (this.newProperty.coverImageUrl ? [this.newProperty.coverImageUrl] : []),
    };
    
    delete (payload as any).imageUrlsInput;
    
    this.propertyAdded.emit(payload);
  }
}