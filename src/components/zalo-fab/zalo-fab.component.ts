import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-zalo-fab',
  standalone: true,
  templateUrl: './zalo-fab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ZaloFabComponent {
  zaloGroupLink = input.required<string>();
}