import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
// FIX: Corrected the import path for FilterCriteria. It's defined in property.model.ts.
import { FilterCriteria } from '../../models/property.model';

@Component({
  selector: 'app-advanced-search-modal',
  standalone: true,
  templateUrl: './advanced-search-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class AdvancedSearchModalComponent {
  initialFilters = input.required<FilterCriteria>();
  close = output<void>();
  filtersApplied = output<Partial<FilterCriteria>>();

  minArea = signal<number | null>(null);
  maxArea = signal<number | null>(null);

  constructor() {
    effect(() => {
        const initial = this.initialFilters();
        if(initial) {
            this.minArea.set(initial.minArea);
            this.maxArea.set(initial.maxArea);
        }
    });
  }

  closeModal() {
    this.close.emit();
  }

  applyFilters() {
    this.filtersApplied.emit({
      minArea: this.minArea(),
      maxArea: this.maxArea(),
    });
  }
}