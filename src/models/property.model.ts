export type PropertyType = 'Nhà' | 'Đất' | 'Căn hộ';
export type ListingType = 'Bán' | 'Cho Thuê';
export type PropertySource = 'Ký gửi cá nhân' | 'Đối tác MGA' | 'Nguồn tổng hợp';

export interface TransactionDetails {
  legalStatus: string;
  yearBuilt?: number;
  description: string;
}

export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  rentPrice?: number;
  listingType: ListingType;
  source: PropertySource;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  imageUrls: string[];
  coverImageUrl: string;
  type: PropertyType;
  featured?: boolean;
  lat?: number;
  lng?: number;
  transactionDetails: TransactionDetails;
  datePosted: Date;
  buildingName?: string;
  floorNumber?: number;
  apartmentNumber?: string;
  collaboratorName?: string;
  group?: string;
  visibility?: 'public' | 'group';
  priceHistory?: { date: Date; price: number }[];
}

export type SortOrder = 'price-asc' | 'price-desc' | 'area-desc' | 'area-asc' | 'date-desc' | 'date-asc' | 'default';

export interface FilterCriteria {
  keyword: string;
  type: 'all' | PropertyType;
  listingType: 'all' | ListingType;
  minPrice: string;
  maxPrice: string;
  minRentPrice: string;
  maxRentPrice: string;
  sortOrder: SortOrder;
  bedrooms: number;
  bathrooms: number;
  featured: boolean;
  showOnlyFavorites: boolean;
  legalStatus: string;
  minYearBuilt: number | null;
  maxYearBuilt: number | null;
  minArea: number | null;
  maxArea: number | null;
  source: 'all' | PropertySource;
  region: string;
  datePostedRange: 'all' | '24h' | '7d' | '30d';
}