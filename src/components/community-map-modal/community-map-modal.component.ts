import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Property } from '../../models/property.model';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-community-map-modal',
  standalone: true,
  templateUrl: './community-map-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MapComponent],
  host: {
    '(document:keydown.escape)': 'closeModal()',
  },
})
export class CommunityMapModalComponent {
  properties = input.required<Property[]>();
  groupName = input.required<string>();
  close = output<void>();

  closeModal() {
    this.close.emit();
  }
}
