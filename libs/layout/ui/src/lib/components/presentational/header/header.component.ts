import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import {
  HlmBreadcrumbImports,
  HlmInputGroupImports,
  HlmSeparatorImports,
  HlmSidebarImports,
} from '@shared/spartan-ui';

@Component({
  selector: 'st-header-c',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HlmSidebarImports,
    HlmSeparatorImports,
    HlmBreadcrumbImports,
    HlmInputGroupImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideSearch })],
})
export class HeaderComponent {}
