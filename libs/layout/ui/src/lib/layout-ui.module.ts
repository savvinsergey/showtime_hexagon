import { CommonModule } from '@angular/common';
import type { ModuleWithProviders } from '@angular/core';
import { NgModule } from '@angular/core';

import { MainLayoutContainer } from './components/containers';
import { LAYOUT_UI_CONFIG_TOKEN } from './constants';
import type { ILayoutUiModuleConfig } from './interfaces';

@NgModule({
  imports: [CommonModule, MainLayoutContainer],
  exports: [MainLayoutContainer],
})
export class LayoutUiModule {
  public static forRoot(config: ILayoutUiModuleConfig): ModuleWithProviders<LayoutUiModule> {
    return {
      ngModule: this,
      providers: [
        {
          provide: LAYOUT_UI_CONFIG_TOKEN,
          useValue: config,
        },
      ],
    };
  }
}
