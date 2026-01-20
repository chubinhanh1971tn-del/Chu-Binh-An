import { ChangeDetectionStrategy, Component, output, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PropertyType } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-submission-modal',
  standalone: true,
  templateUrl: './submission-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class SubmissionModalComponent {
  @ViewChild('submissionForm') submissionForm?: NgForm;
  close = output<void>();

  private propertyService = inject(PropertyService);
  availableGroups = this.propertyService.availableGroups;

  submissionData = {
    // Contact info
    name: '',
    phone: '',
    email: '',
    // Property info
    type: 'Nhà' as PropertyType,
    address: '',
    area: null as number | null,
    price: null as number | null,
    bedrooms: null as number | null,
    bathrooms: null as number | null,
    legalStatus: '',
    description: '',
    group: '',
    // Apartment specific
    buildingName: '',
    floorNumber: null as number | null,
    apartmentNumber: ''
  };

  imageFiles: File[] = [];
  readonly MAX_FILES = 5;

  isHouseOrApartment(): boolean {
    return this.submissionData.type === 'Nhà' || this.submissionData.type === 'Căn hộ';
  }

  closeModal() {
    this.close.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const rejectedFiles: { name: string; reason: string }[] = [];
    const acceptedFiles: File[] = [];

    let currentFileCount = this.imageFiles.length;

    for (const file of files) {
      if (currentFileCount >= this.MAX_FILES) {
        rejectedFiles.push({ name: file.name, reason: 'vượt quá giới hạn' });
        continue;
      }
      if (!file.type.startsWith('image/')) {
        rejectedFiles.push({ name: file.name, reason: 'sai định dạng' });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        rejectedFiles.push({ name: file.name, reason: 'quá lớn' });
        continue;
      }
      
      acceptedFiles.push(file);
      currentFileCount++;
    }

    if (acceptedFiles.length > 0) {
      this.imageFiles.push(...acceptedFiles);
    }

    if (rejectedFiles.length > 0) {
      let alertMessage = `Đã từ chối ${rejectedFiles.length} tệp:\n`;
      rejectedFiles.forEach(file => {
        alertMessage += `- ${file.name} (${file.reason})\n`;
      });
      alert(alertMessage);
    }
    
    // Reset file input
    input.value = '';
  }

  removeImage(index: number) {
    this.imageFiles.splice(index, 1);
  }

  // Helper to create a URL for previewing the image
  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }

  resetForm() {
    this.submissionForm?.resetForm();
    this.imageFiles = [];
    this.submissionData = {
      name: '',
      phone: '',
      email: '',
      type: 'Nhà' as PropertyType,
      address: '',
      area: null,
      price: null,
      bedrooms: null,
      bathrooms: null,
      legalStatus: '',
      description: '',
      group: '',
      buildingName: '',
      floorNumber: null,
      apartmentNumber: ''
    };
  }

  submitForm() {
    // In a real app, this data would be sent to a server.
    // For now, we log it and show a success alert.
    console.log('New property submission:', this.submissionData);
    console.log('Images to upload:', this.imageFiles.map(f => ({ name: f.name, size: f.size })));
    alert('Cảm ơn bạn đã gửi thông tin! Chúng tôi sẽ xem xét và liên hệ lại với bạn sớm nhất.');
    this.resetForm();
    this.closeModal();
  }
}