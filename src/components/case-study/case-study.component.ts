import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PropertyService } from '../../services/property.service';
import { computed } from '@angular/core';
import { Property } from '../../models/property.model';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { PropertyListComponent } from '../property-list/property-list.component';
import { PropertyDetailModalComponent } from '../property-detail-modal/property-detail-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-case-study',
  standalone: true,
  templateUrl: './case-study.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, FooterComponent, PropertyListComponent, PropertyDetailModalComponent, FormsModule],
})
export class CaseStudyComponent {
  private propertyService = inject(PropertyService);
  private allProperties = this.propertyService.getProperties();

  isDetailModalOpen = signal(false);
  selectedPropertyForDetail = signal<Property | null>(null);

  // State for the public letter signature
  signatureCount = signal(17); // Start with a realistic number
  signerName = signal('');
  hasSigned = signal(false);

  readonly projectProperties = computed(() => {
    return this.allProperties().filter(p => p.address.includes('Khu số 5, P. Phan Đình Phùng'));
  });
  
  readonly documentImages = [
    'https://i.imgur.com/v8dbJ7L.jpeg',
    'https://i.imgur.com/k6fB229.jpeg',
    'https://i.imgur.com/2s7B8bQ.jpeg',
    'https://i.imgur.com/w9c2L9W.jpeg',
    'https://i.imgur.com/Q2yH0P1.jpeg',
  ];

  readonly mapImages = [
      'https://i.imgur.com/Aca0V3A.jpeg',
      'https://i.imgur.com/sIuY01q.jpeg',
  ];
  
  readonly historicalMapUrl = 'https://i.imgur.com/9T7Y5c5.jpeg';

  openPropertyDetail(property: Property) {
    this.selectedPropertyForDetail.set(property);
    this.isDetailModalOpen.set(true);
  }

  closePropertyDetail() {
    this.isDetailModalOpen.set(false);
    this.selectedPropertyForDetail.set(null);
  }

  submitSignature() {
    if (this.signerName().trim() && !this.hasSigned()) {
      // In a real app, this signature would be sent to a server.
      console.log(`Signature added: ${this.signerName()}`);
      this.signatureCount.update(c => c + 1);
      this.hasSigned.set(true);
      
      alert('Cảm ơn bạn đã chung tay vì công lý! Tiếng nói của bạn đã được ghi nhận.');
    }
  }
}