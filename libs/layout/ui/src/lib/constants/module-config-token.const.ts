import { InjectionToken } from '@angular/core';

import type { ILayoutUiModuleConfig } from '../interfaces';

export const LAYOUT_UI_CONFIG_TOKEN = new InjectionToken<ILayoutUiModuleConfig>(
  'LAYOUT_UI_CONFIG_TOKEN',
);
