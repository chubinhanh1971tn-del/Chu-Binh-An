import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CompareService } from '../../services/compare.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-compare-tray',
  standalone: true,
  templateUrl: './compare-tray.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class CompareTrayComponent {
  private compareService = inject(CompareService);
  compareNow = output<void>();

  comparedProperties = this.compareService.comparedProperties;
  MAX_COMPARE_ITEMS = this.compareService.MAX_COMPARE_ITEMS;

  placeholders = Array(this.MAX_COMPARE_ITEMS).fill(null);

  clear() {
    this.compareService.clearCompare();
  }
  
  removeFromCompare(id: number) {
    this.compareService.toggleCompare(id);
  }
}