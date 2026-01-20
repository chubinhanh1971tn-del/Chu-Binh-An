import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Property } from '../../models/property.model';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-compare-modal',
  standalone: true,
  templateUrl: './compare-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class CompareModalComponent {
  properties = input.required<Property[]>();
  close = output<void>();

  closeModal() {
    this.close.emit();
  }

  formatPrice(price: number): string {
    if (price >= 1000000000) {
      const value = price / 1000000000;
      return `${value % 1 === 0 ? value : value.toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  }

  // Find best values for highlighting
  private getBestValue(key: keyof Property, direction: 'min' | 'max'): number | null {
      const props = this.properties();
      if (props.length < 2) return null;

      const values = props.map(p => p[key] as number).filter(v => v > 0);
      if (values.length === 0) return null;

      return direction === 'min' ? Math.min(...values) : Math.max(...values);
  }

  bestPrice = computed(() => this.getBestValue('price', 'min'));
  bestArea = computed(() => this.getBestValue('area', 'max'));
  bestBedrooms = computed(() => this.getBestValue('bedrooms', 'max'));
  bestBathrooms = computed(() => this.getBestValue('bathrooms', 'max'));
}