import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
  afterNextRender,
  signal,
  effect,
  OnDestroy,
  NgZone,
  untracked
} from '@angular/core';
import { Property, PropertyType } from '../../models/property.model';
import { FormsModule } from '@angular/forms';

// Declare Google Maps and MarkerClusterer types to inform TypeScript they exist globally
declare const google: any;
declare const MarkerClusterer: any;

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class MapComponent implements OnDestroy {
  properties = input.required<Property[]>();
  highlightedPropertyId = input<number | null>(null);
  aiSearchLocation = input<string>('');
  detailClicked = output<Property>();
  areaContextChanged = output<string>();
  boundsChanged = output<google.maps.LatLngBounds | null>();

  mapContainer = viewChild<ElementRef>('mapContainer');
  
  private map: any; // google.maps.Map
  private markerClusterer: any; // MarkerClusterer instance
  private markers = new Map<number, any>(); // Map<property.id, google.maps.marker.AdvancedMarkerElement>
  private infoWindow: any; // google.maps.InfoWindow
  private previousHighlightId: number | null = null;
  
  mapInitialized = signal(false);
  searchQuery = signal('');
  mapMoved = signal(false);

  constructor(private ngZone: NgZone) {
    afterNextRender(() => {
        this.loadGoogleMapsScript().then(() => {
            this.initMap();
        }).catch(error => {
            console.error('Failed to load Google Maps script:', error);
            alert(error);
            this.mapInitialized.set(true); // Hide loader on error
        });
    });

    effect(() => {
      if (this.mapInitialized()) {
        this.updateMarkers(this.properties());
      }
    });
    
    effect(() => {
      if (!this.mapInitialized()) return;
      
      untracked(() => {
        if (this.previousHighlightId) {
          const oldMarker = this.markers.get(this.previousHighlightId);
          oldMarker?.content.classList.remove('marker-highlight');
        }
      });
      
      const propertyId = this.highlightedPropertyId();
      if (propertyId) {
        const marker = this.markers.get(propertyId);
        marker?.content.classList.add('marker-highlight');
      }
      this.previousHighlightId = propertyId;
    });

    effect(() => {
      const locationQuery = this.aiSearchLocation();
      if (locationQuery) {
        this.ngZone.run(() => {
          this.searchQuery.set(locationQuery);
          this.searchLocation();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.markers.forEach(marker => marker.map = null);
    this.markers.clear();
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers();
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).google?.maps !== 'undefined') {
        resolve();
        return;
      }
      
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        const message = 'Google Maps API Key not configured. Please provide it via the settings button in the footer.';
        reject(message);
        return;
      }

      (window as any).gMapsCallback = () => {
        resolve();
        delete (window as any).gMapsCallback;
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,geocoding&callback=gMapsCallback`;
      script.async = true;
      script.onerror = (error) => {
        reject(error);
        delete (window as any).gMapsCallback;
      };

      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    if (!this.mapContainer()?.nativeElement) return;

    const thaiNguyenCoords = { lat: 21.5934, lng: 105.8451 };

    this.map = new google.maps.Map(this.mapContainer()!.nativeElement, {
        center: thaiNguyenCoords,
        zoom: 12,
        mapId: 'MGA365_MAP_STYLE',
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
    });

    this.infoWindow = new google.maps.InfoWindow({
        minWidth: 250,
        pixelOffset: new google.maps.Size(0, -20)
    });
    
    google.maps.event.addListener(this.infoWindow, 'domready', () => {
      const button = document.querySelector('[id^="info-window-detail-btn-"]');
      if (button) {
        google.maps.event.clearInstanceListeners(button); 
        button.addEventListener('click', () => {
          const propertyId = parseInt(button.id.split('-').pop() || '0', 10);
          const property = this.properties().find(p => p.id === propertyId);
          if (property) {
            this.ngZone.run(() => {
              this.detailClicked.emit(property);
            });
          }
        });
      }
    });

    if (typeof MarkerClusterer !== 'undefined') {
      this.markerClusterer = new MarkerClusterer({ map: this.map });
    } else {
      console.warn('Google Maps MarkerClusterer library not loaded.');
    }

    this.map.addListener('idle', () => {
        this.ngZone.run(() => {
            if (this.mapInitialized()) {
                this.mapMoved.set(true);
            }
        });
    });

    this.mapInitialized.set(true);
  }

  searchThisArea(): void {
    this.mapMoved.set(false);
    const searchBounds = this.map.getBounds();
    if (!searchBounds) return;

    this.boundsChanged.emit(searchBounds);

    const center = this.map.getCenter();
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: center }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          const context = this.extractContextFromResult(results[0]);
          this.areaContextChanged.emit(context);
        }
      });
    });
  }
  
  private extractContextFromResult(result: any): string {
    const sublocality = result.address_components.find((c: any) => c.types.includes('sublocality_level_1'));
    if (sublocality) return sublocality.long_name;
    const district = result.address_components.find((c: any) => c.types.includes('administrative_area_level_2'));
    if (district) return district.long_name;
    return result.formatted_address.split(',')[0];
  }

  async searchLocation(): Promise<void> {
    const query = this.searchQuery().trim();
    if (!query) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 
      address: query,
      componentRestrictions: {
        country: 'VN',
        administrativeArea: 'Thái Nguyên'
      }
    }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          const geometry = results[0].geometry;
          if (geometry.viewport) {
            this.map.fitBounds(geometry.viewport);
          } else {
            this.map.setCenter(geometry.location);
            this.map.setZoom(16);
          }
          this.mapMoved.set(false); // Hide button after search
        } else {
          alert('Không tìm thấy địa điểm: ' + status);
        }
      });
    });
  }

  resetView(): void {
    this.searchQuery.set('');
    this.mapMoved.set(false);
    this.areaContextChanged.emit('');
    this.boundsChanged.emit(null);
    const thaiNguyenCoords = { lat: 21.5934, lng: 105.8451 };
    this.map.setCenter(thaiNguyenCoords);
    this.map.setZoom(12);
  }

  private updateMarkers(properties: Property[]): void {
    if (!this.mapInitialized()) return;
    
    this.markers.forEach(marker => marker.map = null);
    this.markers.clear();
    if(this.markerClusterer) this.markerClusterer.clearMarkers();

    const propertiesWithCoords = properties.filter(p => p.lat && p.lng);
    
    const newMarkerInstances = propertiesWithCoords.map(property => {
      const position = { lat: property.lat!, lng: property.lng! };
      
      const markerEl = document.createElement('div');
      markerEl.innerHTML = this.createMarkerIcon(this.formatDisplayPrice(property, true), property.type, !!property.featured);
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        content: markerEl,
        title: property.title,
        zIndex: property.featured ? 1000 : 100
      });

      marker.addListener('click', () => {
        this.ngZone.run(() => {
          const content = this.createInfoWindowContent(property);
          this.infoWindow.setContent(content);
          this.infoWindow.open({
            anchor: marker,
            map: this.map,
          });
        });
      });

      this.markers.set(property.id, marker);
      return marker;
    });

    if (this.markerClusterer) {
      this.markerClusterer.addMarkers(newMarkerInstances);
    } else {
      newMarkerInstances.forEach(m => m.map = this.map);
    }
  }

  private createMarkerIcon(price: string, type: PropertyType, isFeatured: boolean): string {
    let bgColor = 'bg-gray-600';
    let pointerColor = 'border-t-gray-600';
    let typeIconHtml = '';

    const housePath = 'M12 3L4 10v11h6v-7h4v7h6V10l-8-7z';
    const landPath = 'M12 2L2 10v10h20V10L12 2zM12 5l6 5-6 5-6-5 6-5z';
    const apartmentPath = 'M4 22V2h5v20H4zm7 0V6h5v16h-5zm7 0V10h3v12h-3z';
    
    switch (type) {
      case 'Nhà':
        bgColor = 'bg-blue-600';
        pointerColor = 'border-t-blue-600';
        typeIconHtml = `<svg class="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="${housePath}"></path></svg>`;
        break;
      case 'Đất':
        bgColor = 'bg-amber-600';
        pointerColor = 'border-t-amber-600';
        typeIconHtml = `<svg class="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="${landPath}"></path></svg>`;
        break;
      case 'Căn hộ':
        bgColor = 'bg-sky-600';
        pointerColor = 'border-t-sky-600';
        typeIconHtml = `<svg class="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="${apartmentPath}"></path></svg>`;
        break;
    }

    const featuredBadgeHtml = isFeatured 
      ? `<div class="absolute -top-2.5 -right-2.5 flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full shadow border-2 border-white"><svg class="w-4 h-4 text-yellow-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.305-.772 1.626 0l1.833 4.432a1.25 1.25 0 00.945.678l4.883.709c.852.124 1.191 1.166.574 1.768l-3.533 3.443a1.25 1.25 0 00-.363 1.114l.835 4.865c.145.848-.743 1.498-1.503 1.107l-4.366-2.296a1.25 1.25 0 00-1.164 0l-4.366 2.296c-.76.391-1.648-.259-1.503-1.107l.835-4.865a1.25 1.25 0 00-.363-1.114L2.01 9.87c-.617-.602-.278-1.644.574-1.768l4.883-.709a1.25 1.25 0 00.945-.678l1.833-4.432z" clip-rule="evenodd" /></svg></div>`
      : '';
      
    return `
      <div class="flex flex-col items-center drop-shadow-lg cursor-pointer" style="font-family: 'Be Vietnam Pro', sans-serif;">
        <div class="relative flex items-center justify-center gap-x-1.5 ${bgColor} text-white font-semibold text-base py-2 px-4 rounded-full">
          ${typeIconHtml}
          <span class="whitespace-nowrap" style="text-shadow: 0 0 3px rgba(0,0,0,1);">${price}</span>
          ${featuredBadgeHtml}
        </div>
        <div class="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent ${pointerColor}" style="border-top-width: 8px;"></div>
      </div>
    `;
  }

  private formatDisplayPrice(property: Property, short: boolean = false): string {
    const prop = property;
    if (prop.listingType === 'Cho Thuê') {
      const price = prop.rentPrice;
      if (!price || price === 0) return 'Giá thuê';
      if (price >= 1000000) {
        const value = (price / 1000000).toFixed(1).replace('.0', '');
        return `${value} tr` + (short ? '' : '/tháng');
      }
      return new Intl.NumberFormat('vi-VN').format(price) + (short ? '' : ' đ/tháng');
    } else {
      const price = prop.price;
      if (price === 0) return 'Giá bán';
      if (price >= 1000000000) {
        const value = (price / 1000000000).toFixed(1).replace('.0', '');
        return `${value} tỷ`;
      }
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(0)} triệu`;
      }
      return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }
  }

  private createInfoWindowContent(property: Property): string {
    const price = this.formatDisplayPrice(property);
    const pricePerSqm = (property.price > 0 && property.area > 0) ? `(${(property.price / property.area / 1000000).toFixed(1)} tr/m²)` : '';
    
    return `
      <div style="font-family: 'Be Vietnam Pro', sans-serif; width: 280px; color: #111827;">
        <img src="${property.coverImageUrl}" alt="${property.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px;">
        <h3 style="font-weight: 600; margin: 10px 0 5px; font-size: 1rem;">${property.title}</h3>
        <p style="margin: 0 0 8px; color: #4b5563; font-size: 0.875rem;">${property.address}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <p style="margin: 0; font-weight: 700; color: #16a34a; font-size: 1.125rem;">${price}</p>
          <p style="margin: 0; font-size: 0.8rem; color: #6b7280;">${pricePerSqm}</p>
        </div>
        <button id="info-window-detail-btn-${property.id}" style="background-color: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 500;">
          Xem chi tiết
        </button>
      </div>
    `;
  }
}