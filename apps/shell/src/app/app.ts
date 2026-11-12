import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Main shell app component
 */
@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'st-shell',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  protected title = 'shell';
}
