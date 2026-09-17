import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

import { LAYOUT_UI_CONFIG_TOKEN } from '../../../constants';
import type { ILayoutUiModuleConfig } from '../../../interfaces';
import { HeaderComponent, SidebarComponent } from '../../presentational';

@Component({
  selector: 'st-main-layout',
  templateUrl: './main-layout.container.html',
  styleUrls: ['./main-layout.container.scss'],
  standalone: true,
  imports: [HlmSidebarImports, HeaderComponent, SidebarComponent, RouterOutlet],
  host: {
    class: '[--header-height:--spacing(14)]',
  },
})
export class MainLayoutContainer {
  readonly moduleConfig: ILayoutUiModuleConfig = inject(LAYOUT_UI_CONFIG_TOKEN);
}
