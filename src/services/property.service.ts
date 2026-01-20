import { Injectable, signal, inject, computed } from '@angular/core';
import { Property, PropertySource, ListingType, FilterCriteria, SortOrder, PropertyType } from '../models/property.model';
import { GeminiService } from './gemini.service';
import { AuthService } from './auth.service'; // Import AuthService
import { User, UserRole } from '../models/user.model'; // Import User model
import { FavoritesService } from './favorites.service';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private geminiService = inject(GeminiService);
  private authService = inject(AuthService); // Inject AuthService
  private favoritesService = inject(FavoritesService);

  private readonly INITIAL_PROPERTIES: Property[] = [
    {
      id: 1,
      title: 'Bán nhà 3 tầng, đường Quang Trung, gần trung tâm',
      address: 'Phường Quang Trung, TP. Thái Nguyên',
      price: 3500000000,
      listingType: 'Bán',
      source: 'Đối tác MGA',
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
      imageUrls: ['https://picsum.photos/seed/prop1/800/600', 'https://picsum.photos/seed/prop1_2/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop1/800/600',
      type: 'Nhà',
      featured: true,
      lat: 21.5934,
      lng: 105.8451,
      transactionDetails: { legalStatus: 'Sổ đỏ chính chủ', yearBuilt: 2018, description: '' },
      datePosted: new Date('2024-07-28T10:00:00Z'),
      collaboratorName: 'Nguyễn Văn Hùng',
      group: 'Nhóm A',
      visibility: 'public',
      priceHistory: [
        { date: new Date('2024-07-01T10:00:00Z'), price: 3400000000 },
        { date: new Date('2024-07-28T10:00:00Z'), price: 3500000000 },
      ]
    },
    {
      id: 2,
      title: 'Đất nền dự án view hồ Núi Cốc',
      address: 'Xã Tân Thái, Huyện Đại Từ, Thái Nguyên',
      price: 1200000000,
      listingType: 'Bán',
      source: 'Nguồn tổng hợp',
      bedrooms: 0,
      bathrooms: 0,
      area: 150,
      imageUrls: ['https://picsum.photos/seed/prop2/800/600', 'https://picsum.photos/seed/prop2_2/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop2/800/600',
      type: 'Đất',
      lat: 21.601,
      lng: 105.689,
      transactionDetails: { legalStatus: 'Hợp đồng mua bán', description: '' },
      datePosted: new Date('2024-07-25T14:30:00Z'),
      group: 'Công khai',
      visibility: 'public'
    },
    {
      id: 3,
      title: 'Căn hộ chung cư Tecco Elite City, 2 phòng ngủ',
      address: 'Phường Thịnh Đán, TP. Thái Nguyên',
      price: 1850000000,
      listingType: 'Bán',
      source: 'Đối tác MGA',
      bedrooms: 2,
      bathrooms: 2,
      area: 75,
      imageUrls: ['https://picsum.photos/seed/prop3/800/600', 'https://picsum.photos/seed/prop3_2/800/600', 'https://picsum.photos/seed/prop3_3/800/600', 'https://picsum.photos/seed/prop3_4/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop3/800/600',
      type: 'Căn hộ',
      featured: true,
      lat: 21.574,
      lng: 105.821,
      transactionDetails: { legalStatus: 'Sổ hồng lâu dài', yearBuilt: 2021, description: '' },
      datePosted: new Date('2024-07-29T09:00:00Z'),
      buildingName: 'Tecco Elite City',
      floorNumber: 15,
      apartmentNumber: 'A-1502',
      collaboratorName: 'Phạm Thị Dung',
      group: 'Nhóm B',
      visibility: 'public',
      priceHistory: [
        { date: new Date('2024-06-20T09:00:00Z'), price: 1880000000 },
        { date: new Date('2024-07-29T09:00:00Z'), price: 1850000000 },
      ]
    },
     {
      id: 4,
      title: 'Nhà cấp 4 có sân vườn rộng rãi, yên tĩnh',
      address: 'Phường Gia Sàng, TP. Thái Nguyên',
      price: 2100000000,
      listingType: 'Bán',
      source: 'Ký gửi cá nhân',
      bedrooms: 3,
      bathrooms: 2,
      area: 250,
      imageUrls: ['https://picsum.photos/seed/prop4/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop4/800/600',
      type: 'Nhà',
      lat: 21.572,
      lng: 105.835,
      transactionDetails: { legalStatus: 'Sổ đỏ chính chủ', yearBuilt: 2015, description: '' },
      datePosted: new Date('2024-07-20T11:00:00Z'),
      group: 'Công khai',
      visibility: 'public'
    },
    {
      id: 5,
      title: 'Bán gấp lô đất mặt tiền đường lớn, kinh doanh tốt',
      address: 'Phường Phan Đình Phùng, TP. Thái Nguyên',
      price: 2800000000,
      listingType: 'Bán',
      source: 'Ký gửi cá nhân',
      bedrooms: 0,
      bathrooms: 0,
      area: 120,
      imageUrls: ['https://picsum.photos/seed/prop5/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop5/800/600',
      type: 'Đất',
      lat: 21.585,
      lng: 105.839,
      transactionDetails: { legalStatus: 'Sổ đỏ chính chủ', description: '' },
      datePosted: new Date('2024-07-15T08:00:00Z'),
      group: 'Công khai',
      visibility: 'public'
    },
    {
        id: 6,
        title: 'Cho thuê căn hộ mini full nội thất, gần ĐH Sư Phạm',
        address: 'Phường Quang Trung, TP. Thái Nguyên',
        price: 0,
        rentPrice: 3500000,
        listingType: 'Cho Thuê',
        source: 'Đối tác MGA',
        bedrooms: 1,
        bathrooms: 1,
        area: 30,
        imageUrls: ['https://picsum.photos/seed/prop6/800/600'],
        coverImageUrl: 'https://picsum.photos/seed/prop6/800/600',
        type: 'Căn hộ',
        lat: 21.590,
        lng: 105.842,
        transactionDetails: { legalStatus: 'Hợp đồng dài hạn', yearBuilt: 2022, description: '' },
        datePosted: new Date('2024-07-27T18:00:00Z'),
        collaboratorName: 'Phạm Thị Dung',
        group: 'Nhóm B',
        visibility: 'public'
    },
    {
      id: 7,
      title: 'Đất thổ cư sổ đỏ, ngõ ô tô, tại Đồng Hỷ',
      address: 'Xã Hóa Thượng, Huyện Đồng Hỷ, Thái Nguyên',
      price: 850000000,
      listingType: 'Bán',
      source: 'Nguồn tổng hợp',
      bedrooms: 0,
      bathrooms: 0,
      area: 100,
      imageUrls: ['https://picsum.photos/seed/prop7/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop7/800/600',
      type: 'Đất',
      featured: true,
      lat: 21.621,
      lng: 105.865,
      transactionDetails: { legalStatus: 'Sổ đỏ chính chủ', description: '' },
      datePosted: new Date('2024-07-29T11:20:00Z'),
      group: 'Công khai',
      visibility: 'public',
      priceHistory: [
        { date: new Date('2024-07-10T11:20:00Z'), price: 830000000 },
        { date: new Date('2024-07-29T11:20:00Z'), price: 850000000 },
      ]
    },
    {
      id: 8,
      title: 'Cho thuê nhà nguyên căn, 2 mặt tiền, khu vực Sông Công',
      address: 'Phường Cải Đan, TP. Sông Công, Thái Nguyên',
      price: 0,
      rentPrice: 12000000,
      listingType: 'Cho Thuê',
      source: 'Ký gửi cá nhân',
      bedrooms: 5,
      bathrooms: 4,
      area: 300,
      imageUrls: ['https://picsum.photos/seed/prop8/800/600'],
      coverImageUrl: 'https://picsum.photos/seed/prop8/800/600',
      type: 'Nhà',
      lat: 21.500,
      lng: 105.833,
      transactionDetails: { legalStatus: 'Hợp đồng dài hạn', yearBuilt: 2020, description: '' },
      datePosted: new Date('2024-07-18T16:00:00Z'),
      group: 'Sông Công',
      visibility: 'public'
    }
  ];

  private properties = signal<Property[]>(this.INITIAL_PROPERTIES);

  getProperties() {
    return this.properties.asReadonly();
  }

  availableRegions = computed(() => {
    const properties = this.properties();
    const regions = new Set<string>();
    properties.forEach(p => {
      const parts = p.address.split(',').map(part => part.trim());
      if (parts.length > 1) {
        const region = parts[parts.length - 2];
        if (region && (region.startsWith('TP.') || region.startsWith('Huyện') || region.startsWith('Thị xã'))) {
          regions.add(region);
        }
      }
    });
    return Array.from(regions).sort();
  });

  availableGroups = computed(() => {
    const properties = this.properties();
    const groups = new Set<string>();
    properties.forEach(p => {
      if (p.group && p.group !== 'Công khai') {
        groups.add(p.group);
      }
    });
    // Add groups that might not have properties yet but are defined elsewhere
    groups.add('Shipper');
    groups.add('AEX');
    return Array.from(groups).sort();
  });

  getFilteredProperties(filters: FilterCriteria, currentUser: User | null): Property[] {
    const favoriteIds = this.favoritesService.favoriteIds();
    let filtered = this.properties().filter(p => {
      if (p.visibility === 'group' && (!currentUser || currentUser.group !== p.group)) {
        return false;
      }

      const keyword = filters.keyword.toLowerCase().trim();
      if (keyword && !(p.title.toLowerCase().includes(keyword) || p.address.toLowerCase().includes(keyword))) {
        return false;
      }

      if (filters.type !== 'all' && p.type !== filters.type) return false;
      if (filters.region !== 'all' && !p.address.includes(filters.region)) return false;
      if (filters.listingType !== 'all' && p.listingType !== filters.listingType) return false;

      if (filters.listingType === 'Bán' || filters.listingType === 'all') {
        const minPrice = parseFloat(filters.minPrice);
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(minPrice) && p.price < minPrice) return false;
        if (!isNaN(maxPrice) && p.price > maxPrice && p.price > 0) return false;
      }

      if (filters.listingType === 'Cho Thuê' || filters.listingType === 'all') {
        const minRentPrice = parseFloat(filters.minRentPrice);
        const maxRentPrice = parseFloat(filters.maxRentPrice);
        if (p.listingType === 'Cho Thuê') {
          if (!isNaN(minRentPrice) && (p.rentPrice ?? 0) < minRentPrice) return false;
          if (!isNaN(maxRentPrice) && (p.rentPrice ?? 0) > maxRentPrice && (p.rentPrice ?? 0) > 0) return false;
        }
      }

      if (filters.bedrooms > 0 && p.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms > 0 && p.bathrooms < filters.bathrooms) return false;
      if (filters.minArea !== null && p.area < filters.minArea) return false;
      if (filters.maxArea !== null && p.area > filters.maxArea) return false;
      if (filters.featured && !p.featured) return false;
      if (filters.showOnlyFavorites && !favoriteIds.has(p.id)) return false;
      if (filters.source !== 'all' && p.source !== filters.source) return false;

      if (filters.datePostedRange !== 'all') {
        const now = new Date();
        const propertyDate = p.datePosted;
        let days = 0;
        if (filters.datePostedRange === '24h') days = 1;
        else if (filters.datePostedRange === '7d') days = 7;
        else if (filters.datePostedRange === '30d') days = 30;
        
        if (days > 0) {
          const diffTime = Math.abs(now.getTime() - propertyDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > days) return false;
        }
      }

      return true;
    });

    switch (filters.sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => (a.price || a.rentPrice || Infinity) - (b.price || b.rentPrice || Infinity));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.price || b.rentPrice || 0) - (a.price || a.rentPrice || 0));
        break;
      case 'area-desc':
        filtered.sort((a, b) => b.area - a.area);
        break;
      case 'area-asc':
        filtered.sort((a, b) => a.area - b.area);
        break;
      case 'date-desc':
        filtered.sort((a, b) => b.datePosted.getTime() - a.datePosted.getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.datePosted.getTime() - b.datePosted.getTime());
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.datePosted.getTime() - a.datePosted.getTime());
        break;
    }

    return filtered;
  }

  getPropertyById(id: number): Property | undefined {
    return this.properties().find(p => p.id === id);
  }

  async generateAllDescriptions(): Promise<void> {
    if (!this.geminiService.isAiConfigured()) return;
    const propertiesToUpdate = this.properties().filter(p => !p.transactionDetails.description);
    for (const property of propertiesToUpdate) {
      try {
        const newDescription = await this.geminiService.generateDescription(property);
        this.updatePropertyDescription(property.id, newDescription);
      } catch (error) {
        console.error(`Failed to generate description for property ${property.id}:`, error);
      }
    }
  }

  async regeneratePropertyDescription(propertyId: number): Promise<void> {
    if (!this.geminiService.isAiConfigured()) {
      throw new Error('AI Service not configured.');
    }
    const property = this.getPropertyById(propertyId);
    if (!property) {
      throw new Error('Property not found.');
    }
    const newDescription = await this.geminiService.generateDescription(property);
    this.updatePropertyDescription(propertyId, newDescription);
  }

  private updatePropertyDescription(propertyId: number, description: string): void {
    this.properties.update(props =>
      props.map(p =>
        p.id === propertyId
          ? { ...p, transactionDetails: { ...p.transactionDetails, description } }
          : p
      )
    );
  }

  addProperty(propertyData: any): void {
    const newId = this.properties().length > 0 ? Math.max(...this.properties().map(p => p.id)) + 1 : 1;
    const newProperty: Property = {
      id: newId,
      title: propertyData.title,
      address: propertyData.address,
      price: propertyData.price ?? 0,
      rentPrice: propertyData.rentPrice,
      listingType: propertyData.listingType,
      source: propertyData.source,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      area: propertyData.area ?? 0,
      imageUrls: propertyData.imageUrls,
      coverImageUrl: propertyData.coverImageUrl,
      type: propertyData.type,
      featured: propertyData.featured,
      transactionDetails: {
        legalStatus: propertyData.legalStatus,
        description: propertyData.description || '',
        yearBuilt: propertyData.yearBuilt || undefined,
      },
      datePosted: new Date(),
      buildingName: propertyData.buildingName,
      floorNumber: propertyData.floorNumber,
      apartmentNumber: propertyData.apartmentNumber,
      collaboratorName: propertyData.collaboratorName,
      group: propertyData.group,
      visibility: propertyData.visibility || 'public',
      priceHistory: [{ date: new Date(), price: propertyData.price ?? 0 }],
    };
    this.properties.update(props => [...props, newProperty]);
  }

  deleteProperty(propertyId: number): void {
    this.properties.update(props => props.filter(p => p.id !== propertyId));
  }

  toggleFeatured(propertyId: number): void {
    this.properties.update(props =>
      props.map(p =>
        p.id === propertyId ? { ...p, featured: !p.featured } : p
      )
    );
  }
}