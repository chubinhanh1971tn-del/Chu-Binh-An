import { ChangeDetectionStrategy, Component, computed, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChanged = output<number>();

  jumpToPageInput = signal<string>('');

  constructor() {
    effect(() => {
      // Update the input field whenever the current page changes
      this.jumpToPageInput.set(String(this.currentPage()));
    });
  }

  pages = computed<(number | string)[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    
    // If 7 or fewer pages, show all page numbers
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    // Logic for ellipses to handle many pages
    // Current page is near the beginning
    if (current < 5) {
      return [1, 2, 3, 4, 5, '...', total];
    } 
    // Current page is near the end
    else if (current > total - 4) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    } 
    // Current page is in the middle
    else {
      return [1, '...', current - 1, current, current + 1, '...', total];
    }
  });

  goToPage(page: number) {
    const total = this.totalPages();
    if (total <= 1) return; // Do nothing if there's only one page or fewer

    let targetPage = page;
    if (targetPage < 1) {
      targetPage = 1; 
    } else if (targetPage > total) {
      targetPage = total;
    }

    if (targetPage !== this.currentPage()) {
      this.pageChanged.emit(targetPage);
    }
  }

  handleJumpToPage() {
    const page = parseInt(this.jumpToPageInput(), 10);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages()) {
      if (page !== this.currentPage()) {
        this.goToPage(page);
      }
    } else {
      // On invalid input, reset the input field to the current page
      this.jumpToPageInput.set(String(this.currentPage()));
    }
  }

  isNumber(value: any): value is number {
    return typeof value === 'number';
  }
}