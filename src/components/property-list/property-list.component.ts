import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Property } from '../../models/property.model';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { ApartmentCardComponent } from '../apartment-card/apartment-card.component';
import { PropertyListItemComponent } from '../property-list-item/property-list-item.component'; // Ensure this is imported
import { NgIf, NgFor } from '@angular/common'; // Explicitly import NgIf, NgFor

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PropertyCardComponent, ApartmentCardComponent, PropertyListItemComponent, NgIf, NgFor], // Ensure PropertyListItemComponent is in imports
})
export class PropertyListComponent {
  properties = input.required<Property[]>();
  detailClicked = output<Property>();
  viewOnMapClicked = output<Property>();
  viewMode = input<'grid' | 'list'>('grid'); // Add viewMode input
}