import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { simpleShowtime } from '@ng-icons/simple-icons';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

import type { ILayoutUiModuleConfig } from '../../../interfaces';

@Component({
  selector: 'st-sidebar-c',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmSidebarImports, NgIcon, RouterLink],
  providers: [provideIcons({ simpleShowtime })],
})
export class SidebarComponent {
  readonly config = input.required<ILayoutUiModuleConfig>();
}
