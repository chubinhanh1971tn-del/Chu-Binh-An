import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, inject, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyType, ListingType, PropertySource, FilterCriteria, SortOrder } from '../../models/property.model';
import { SavedSearch, SavedSearchesService } from '../../services/saved-searches.service';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  templateUrl: './search-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class SearchFilterComponent {
  private savedSearchesService = inject(SavedSearchesService);
  private elementRef = inject(ElementRef);

  initialFilters = input.required<FilterCriteria>();
  regions = input<string[]>([]);
  filtersChanged = output<Partial<FilterCriteria>>();
  
  readonly currentYear = new Date().getFullYear();

  keyword = signal('');
  type = signal<'all' | PropertyType>('all');
  region = signal('all');
  listingType = signal<ListingType | 'all'>('all');
  minPrice = signal<string>('');
  maxPrice = signal<string>('');
  minRentPrice = signal<string>('');
  maxRentPrice = signal<string>('');
  sortOrder = signal<SortOrder>('default');
  bedrooms = signal(0);
  bathrooms = signal(0);
  featured = signal(false);
  showOnlyFavorites = signal(false);
  legalStatus = signal('all');
  minYearBuilt = signal<number | null>(null);
  maxYearBuilt = signal<number | null>(null);
  minArea = signal<number | null>(null);
  maxArea = signal<number | null>(null);
  source = signal<'all' | PropertySource>('all');
  datePostedRange = signal<'all' | '24h' | '7d' | '30d'>('all');

  isAdvancedPanelOpen = signal(false);

  savedSearches = this.savedSearchesService.searches;
  selectedSavedSearchName = signal<string | null>(null);


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isAdvancedPanelOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isAdvancedPanelOpen.set(false);
    }
  }

  advancedFilterCount = computed(() => {
    let count = 0;
    if (this.type() !== 'all') count++;
    if (this.region() !== 'all') count++;
    if (this.bedrooms() !== 0) count++;
    if (this.bathrooms() !== 0) count++;
    if (this.source() !== 'all') count++;
    if (this.minYearBuilt() !== null || this.maxYearBuilt() !== null) count++;
    if (this.minPrice() !== '' || this.maxPrice() !== '') count++;
    if (this.minRentPrice() !== '' || this.maxRentPrice() !== '') count++;
    if (this.minArea() !== null || this.maxArea() !== null) count++;
    return count;
  });

  hasActiveFilters = computed(() => {
    return this.keyword() !== '' ||
           this.type() !== 'all' ||
           this.region() !== 'all' ||
           this.listingType() !== 'all' ||
           this.minPrice() !== '' ||
           this.maxPrice() !== '' ||
           this.minRentPrice() !== '' ||
           this.maxRentPrice() !== '' ||
           this.sortOrder() !== 'default' ||
           this.bedrooms() !== 0 ||
           this.bathrooms() !== 0 ||
           this.legalStatus() !== 'all' ||
           this.featured() ||
           this.showOnlyFavorites() ||
           this.minYearBuilt() !== null ||
           this.maxYearBuilt() !== null ||
           this.minArea() !== null ||
           this.maxArea() !== null ||
           this.source() !== 'all' ||
           this.datePostedRange() !== 'all';
  });

  constructor() {
    effect(() => {
      const initial = this.initialFilters();
      this.setFilters(initial);
    });

    effect(() => {
      this.keyword(); this.type(); this.region(); this.listingType(); this.minPrice(); this.maxPrice();
      this.minRentPrice(); this.maxRentPrice(); this.sortOrder(); this.bedrooms();
      this.bathrooms(); this.featured(); this.showOnlyFavorites(); this.legalStatus();
      this.minYearBuilt(); this.maxYearBuilt(); this.minArea(); this.maxArea();
      this.source(); this.datePostedRange();

      if (this.selectedSavedSearchName()) {
        const selectedSearch = this.savedSearches().find(s => s.name === this.selectedSavedSearchName());
        if (selectedSearch && JSON.stringify(this.getCurrentFilters()) !== JSON.stringify(selectedSearch.filters)) {
          this.selectedSavedSearchName.set(null);
        }
      }
    }, { allowSignalWrites: true });
  }

  private setFilters(filters: FilterCriteria) {
    this.keyword.set(filters.keyword);
    this.type.set(filters.type);
    this.region.set(filters.region);
    this.listingType.set(filters.listingType);
    this.minPrice.set(filters.minPrice);
    this.maxPrice.set(filters.maxPrice);
    this.minRentPrice.set(filters.minRentPrice);
    this.maxRentPrice.set(filters.maxRentPrice);
    this.sortOrder.set(filters.sortOrder);
    this.bedrooms.set(filters.bedrooms);
    this.bathrooms.set(filters.bathrooms);
    this.featured.set(filters.featured);
    this.showOnlyFavorites.set(filters.showOnlyFavorites);
    this.legalStatus.set(filters.legalStatus);
    this.minYearBuilt.set(filters.minYearBuilt);
    this.maxYearBuilt.set(filters.maxYearBuilt);
    this.minArea.set(filters.minArea);
    this.maxArea.set(filters.maxArea);
    this.source.set(filters.source);
    this.datePostedRange.set(filters.datePostedRange);
  }
  
  private getCurrentFilters(): FilterCriteria {
    return {
      keyword: this.keyword(),
      type: this.type(),
      region: this.region(),
      listingType: this.listingType(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      minRentPrice: this.minRentPrice(),
      maxRentPrice: this.maxRentPrice(),
      sortOrder: this.sortOrder(),
      bedrooms: this.bedrooms(),
      bathrooms: this.bathrooms(),
      featured: this.featured(),
      showOnlyFavorites: this.showOnlyFavorites(),
      legalStatus: this.legalStatus(),
      minYearBuilt: this.minYearBuilt(),
      maxYearBuilt: this.maxYearBuilt(),
      minArea: this.minArea(),
      maxArea: this.maxArea(),
      source: this.source(),
      datePostedRange: this.datePostedRange(),
    };
  }

  onFilterChange() {
    this.filtersChanged.emit(this.getCurrentFilters());
  }

  resetAllFilters() {
    const initial = this.initialFilters();
    this.setFilters({ ...initial, keyword: '', featured: false, showOnlyFavorites: false });
    this.selectedSavedSearchName.set(null);
    this.onFilterChange();
  }

  toggleAdvancedPanel() {
    this.isAdvancedPanelOpen.update(v => !v);
  }

  resetAdvancedFilters() {
    const initial = this.initialFilters();
    this.type.set(initial.type);
    this.region.set(initial.region);
    this.minPrice.set(initial.minPrice);
    this.maxPrice.set(initial.maxPrice);
    this.minRentPrice.set(initial.minRentPrice);
    this.maxRentPrice.set(initial.maxRentPrice);
    this.bedrooms.set(initial.bedrooms);
    this.bathrooms.set(initial.bathrooms);
    this.minYearBuilt.set(initial.minYearBuilt);
    this.maxYearBuilt.set(initial.maxYearBuilt);
    this.minArea.set(initial.minArea);
    this.maxArea.set(initial.maxArea);
    this.source.set(initial.source);
    this.onFilterChange();
  }

  saveCurrentSearch() {
    let searchName = prompt('Nhập tên cho bộ lọc này:');
    if (searchName) {
      searchName = searchName.trim();
      if (searchName) {
        this.savedSearchesService.saveSearch(searchName, this.getCurrentFilters());
        this.selectedSavedSearchName.set(searchName);
        alert(`Bộ lọc "${searchName}" đã được lưu.`);
      }
    }
  }

  loadSelectedSearch() {
    const selectedName = this.selectedSavedSearchName();
    if (selectedName) {
      const selected = this.savedSearches().find(s => s.name === selectedName);
      if (selected) {
        this.setFilters(selected.filters);
        this.onFilterChange();
        alert(`Bộ lọc "${selectedName}" đã được tải.`);
      }
    }
  }

  deleteSelectedSearch(searchName: string, event: Event) {
    event.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa bộ lọc "${searchName}" không?`)) {
      this.savedSearchesService.deleteSearch(searchName);
      if (this.selectedSavedSearchName() === searchName) {
        this.selectedSavedSearchName.set(null);
      }
      alert(`Bộ lọc "${searchName}" đã được xóa.`);
    }
  }
}