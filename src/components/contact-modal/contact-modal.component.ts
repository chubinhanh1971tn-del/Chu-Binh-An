import { ChangeDetectionStrategy, Component, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  templateUrl: './contact-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ContactModalComponent implements OnInit {
  property = input.required<Property>();
  close = output<void>();

  readonly zaloQrCodeUrl = 'https://i.imgur.com/W2Y21cR.png';
  readonly phoneNumber = '0208365365';

  contact = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  ngOnInit() {
    if (this.property().price === 0) {
       this.contact.message = `Tôi muốn nhận báo giá cho bất động sản "${this.property().title}" tại địa chỉ ${this.property().address}. Vui lòng liên hệ với tôi.`;
    } else {
       this.contact.message = `Tôi quan tâm đến bất động sản "${this.property().title}" tại địa chỉ ${this.property().address}. Vui lòng liên hệ với tôi.`;
    }
  }
  
  formatPhoneNumber(value: string) {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
    if (match) {
      this.contact.phone = `${match[1]} ${match[2]} ${match[3]}`;
    } else {
        this.contact.phone = value;
    }
  }

  closeModal() {
    this.close.emit();
  }

  submitForm() {
    // In a real app, you'd send this data to a server.
    // For now, we'll just log it and show an alert.
    console.log('Contact form submitted:', this.contact);
    alert('Yêu cầu của bạn đã được gửi đi. Chúng tôi sẽ liên hệ lại sớm nhất có thể!');
    this.closeModal();
  }
}