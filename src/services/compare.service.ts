import { Injectable, computed, signal, inject } from '@angular/core';
import { Property } from '../models/property.model';
import { PropertyService } from './property.service';

@Injectable({ providedIn: 'root' })
export class CompareService {
  private propertyService = inject(PropertyService);
  private allProperties = this.propertyService.getProperties();

  readonly MAX_COMPARE_ITEMS = 4;
  readonly compareIds = signal<Set<number>>(new Set());

  readonly comparedProperties = computed(() => {
    const ids = this.compareIds();
    return this.allProperties().filter(p => ids.has(p.id));
  });

  // --- NEW: Best Value Computations ---
  
  /**
   * Generic function to find the best property based on a value and direction.
   */
  private getBestPropertyId(
    props: Property[],
    valueFn: (p: Property) => number,
    direction: 'min' | 'max'
  ): number | null {
    const validProps = props.filter(p => valueFn(p) > 0);
    if (validProps.length < 2) return null;

    const bestProp = validProps.reduce((best, current) => {
      return direction === 'min'
        ? valueFn(current) < valueFn(best) ? current : best
        : valueFn(current) > valueFn(best) ? current : best;
    });
    return bestProp.id;
  }
  
  readonly bestPriceId = computed(() => {
    const saleProps = this.comparedProperties().filter(p => p.listingType === 'Bán');
    return this.getBestPropertyId(saleProps, p => p.price, 'min');
  });

  readonly bestAreaId = computed(() => {
    return this.getBestPropertyId(this.comparedProperties(), p => p.area, 'max');
  });

  readonly bestPricePerSqmId = computed(() => {
    const saleProps = this.comparedProperties().filter(p => p.listingType === 'Bán' && p.price > 0 && p.area > 0);
    return this.getBestPropertyId(saleProps, p => p.price / p.area, 'min');
  });

  // --- END: New Computations ---


  toggleCompare(propertyId: number) {
    this.compareIds.update(currentIds => {
      const newIds = new Set(currentIds);
      if (newIds.has(propertyId)) {
        newIds.delete(propertyId);
      } else {
        if (newIds.size < this.MAX_COMPARE_ITEMS) {
          newIds.add(propertyId);
        }
      }
      return newIds;
    });
  }

  clearCompare() {
    this.compareIds.set(new Set());
  }
}