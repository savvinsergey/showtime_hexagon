import { MainLayoutContainer } from '@showtime/layout/ui';

import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutContainer,
    /* children: [
      {
        path: 'users',
        loadChildren: () => import('@showtime/app/users-management/Routes').then(m => m.appRoutes),
        data: { preload: true },
      },
    ], */
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
