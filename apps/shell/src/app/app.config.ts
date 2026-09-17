import { importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { lucideBuilding, lucideCalendar, lucideTicket, lucideUsers } from '@ng-icons/lucide';

import { LayoutUiModule } from '@showtime/layout/ui';

import { appRoutes } from './app.routes';

import type { ApplicationConfig } from '@angular/core';
import type { ILayoutUiModuleConfig } from '@showtime/layout/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    importProvidersFrom(
      LayoutUiModule.forRoot({
        title: 'SHOWTIME',
        subtitle: 'The Show Must Go On',
        menu: [
          {
            text: 'Events',
            link: '/events',
            icon: lucideTicket,
          },
          {
            text: 'Places',
            link: '/places',
            icon: lucideBuilding,
          },
          {
            text: 'Calendar',
            link: '/calendar',
            icon: lucideCalendar,
          },
          {
            text: 'Users',
            link: '/users',
            icon: lucideUsers,
            preload: 'users',
          },
        ],
      } as ILayoutUiModuleConfig),
    ),
  ],
};
