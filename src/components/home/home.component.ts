import { ChangeDetectionStrategy, Component, computed, effect, signal, inject, ElementRef, ViewChild, afterNextRender } from '@angular/core';
// FIX: Corrected the import path for FilterCriteria, which is now defined in property.model.ts.
import { Property, PropertyType, FilterCriteria } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';
import { HeaderComponent } from '../header/header.component';
import { SearchFilterComponent } from '../search-filter/search-filter.component';
import { PropertyListComponent } from '../property-list/property-list.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FavoritesService } from '../../services/favorites.service';
import { HeroComponent } from '../hero/hero.component';
import { MapComponent } from '../map/map.component';
import { FooterComponent } from '../footer/footer.component';
import { CompareService } from '../../services/compare.service';
import { CompareTrayComponent } from '../compare-tray/compare-tray.component';
import { CompareModalComponent } from '../compare-modal/compare-modal.component';
import { PropertyDetailModalComponent } from '../property-detail-modal/property-detail-modal.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { ZaloFabComponent } from '../zalo-fab/zalo-fab.component';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { AuthService } from '../../services/auth.service';
import { MapAIAssistantComponent } from '../map-ai-assistant/map-ai-assistant.component';
import { ApartmentCardComponent } from '../apartment-card/apartment-card.component';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { PropertyListItemComponent } from '../property-list-item/property-list-item.component';


declare const google: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    HeroComponent,
    SearchFilterComponent,
    PropertyListComponent,
    PaginationComponent,
    MapComponent,
    FooterComponent,
    CompareTrayComponent,
    CompareModalComponent,
    PropertyDetailModalComponent,
    SettingsModalComponent,
    ZaloFabComponent,
    MapAIAssistantComponent,
    ApartmentCardComponent,
    PropertyCardComponent,
    PropertyListItemComponent,
  ],
})
export class HomeComponent {
  @ViewChild(MapAIAssistantComponent) mapAiAssistant!: MapAIAssistantComponent;

  private propertyService = inject(PropertyService);
  private favoritesService = inject(FavoritesService);
  private compareService = inject(CompareService);
  private savedSearchesService = inject(SavedSearchesService);
  private authService = inject(AuthService);
  
  private getInitialFilters(): FilterCriteria {
    return {
      keyword: '',
      type: 'all',
      listingType: 'all',
      minPrice: '',
      maxPrice: '',
      minRentPrice: '',
      maxRentPrice: '',
      sortOrder: 'default',
      bedrooms: 0,
      bathrooms: 0,
      featured: false,
      showOnlyFavorites: false,
      legalStatus: 'all',
      minYearBuilt: null,
      maxYearBuilt: null,
      minArea: null, 
      maxArea: null, 
      source: 'all',
      region: 'all',
      datePostedRange: 'all',
    };
  }
  
  filters = signal<FilterCriteria>(this.getInitialFilters());

  isCompareModalOpen = signal(false);
  isDetailModalOpen = signal(false);
  isSettingsModalOpen = signal(false);
  selectedPropertyForDetail = signal<Property | null>(null);

  hoveredPropertyId = signal<number | null>(null);
  aiSearchLocation = signal('');
  aiAreaContext = signal('');
  isAiSearching = signal(false);
  
  isMapSearchActive = signal(false);
  mapBounds = signal<google.maps.LatLngBounds | null>(null);

  compareIds = this.compareService.compareIds;
  comparedProperties = this.compareService.comparedProperties;
  savedSearches = this.savedSearchesService.searches;
  availableRegions = this.propertyService.availableRegions;

  currentPage = signal(1);
  itemsPerPage = signal(12);
  
  viewMode = signal<'grid' | 'list'>('grid');

  // Properties filtered by the search form
  private textFilteredProperties = computed(() => {
    return this.propertyService.getFilteredProperties(this.filters(), this.authService.currentUser());
  });

  // Properties further filtered by map bounds if "Search this area" is active
  filteredProperties = computed(() => {
    const props = this.textFilteredProperties();
    const bounds = this.mapBounds();
    const isMapActive = this.isMapSearchActive();

    if (isMapActive && bounds) {
      return props.filter(p => 
        p.lat && p.lng && bounds.contains({ lat: p.lat, lng: p.lng })
      );
    }
    return props;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProperties().length / this.itemsPerPage());
  });

  paginatedProperties = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProperties().slice(start, end);
  });
  
  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) {
        this.currentPage.set(total || 1);
      }
    });

    effect(() => {
      const count = this.filteredProperties().length;
      if (this.isAiSearching()) {
        if (count === 0) {
          this.mapAiAssistant.handleNoResults();
        }
        this.isAiSearching.set(false); // Reset the flag after check
      }
    });
  }
  
  onPropertyHover(propertyId: number | null): void {
    this.hoveredPropertyId.set(propertyId);
  }

  onMapBoundsChanged(bounds: google.maps.LatLngBounds | null): void {
    if (bounds) {
      this.isMapSearchActive.set(true);
      this.mapBounds.set(bounds);
    } else {
      this.isMapSearchActive.set(false);
      this.mapBounds.set(null);
    }
    this.currentPage.set(1);
  }

  onAreaContextChanged(context: string) {
    this.aiAreaContext.set(context);
  }

  onFiltersChanged(newFilters: Partial<FilterCriteria> & { action?: string, name?: string }) {
    if (newFilters.action === 'deleteSavedSearch' && newFilters.name) {
      this.savedSearchesService.deleteSearch(newFilters.name);
    } else {
      this.filters.update(current => ({ ...current, ...newFilters }));
      this.currentPage.set(1);
    }
  }

  onAiFiltersApplied(aiFilters: Partial<FilterCriteria> & { location?: string }) {
    const { location, ...rest } = aiFilters;
    this.filters.update(current => ({...current, ...rest}));
    if (location) {
      this.aiSearchLocation.set(location);
      setTimeout(() => this.aiSearchLocation.set(''), 100); 
    }
    this.currentPage.set(1);
    this.isAiSearching.set(true);
  }

  onAiSuggestionClicked(location: string) {
    this.aiSearchLocation.set(location);
    setTimeout(() => this.aiSearchLocation.set(''), 100);
  }
  
  onHeaderFilterSelected(filterCommand: string) {
    this.filters.update(current => {
        let newFilters = { ...current, type: 'all' as 'all' | PropertyType, listingType: 'all' as 'all' | 'Bán' | 'Cho Thuê'};
        switch (filterCommand) {
            case 'Nhà':
                newFilters.type = 'Nhà';
                newFilters.listingType = 'Bán';
                break;
            case 'Đất':
                newFilters.type = 'Đất';
                newFilters.listingType = 'Bán';
                break;
            case 'Cho Thuê':
                newFilters.listingType = 'Cho Thuê';
                newFilters.type = 'all';
                break;
        }
        return newFilters;
    });
    this.currentPage.set(1);
  }

  onPageChanged(page: number) {
    this.currentPage.set(page);
    const propertyListElement = document.getElementById('property-list-section');
    propertyListElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openPropertyDetail(property: Property) {
    this.selectedPropertyForDetail.set(property);
    this.isDetailModalOpen.set(true);
  }

  closePropertyDetail() {
    this.isDetailModalOpen.set(false);
    this.selectedPropertyForDetail.set(null);
  }

  onSettingsSaved() {
    this.closeSettingsModal();
    window.location.reload();
  }

  closeSettingsModal() {
    this.isSettingsModalOpen.set(false);
  }
}