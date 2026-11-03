import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmEmptyImports, HlmSpinnerImports } from '@shared/spartan-ui';

/**
 * Presentational query-state wrapper: shows exactly one of loading, error, empty, or projected content.
 * Dumb UI: no application or domain types; the parent maps query status onto these flags.
 */
@Component({
  selector: 'st-query-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HlmEmptyImports, HlmSpinnerImports],
  templateUrl: './query-state.html',
})
export class QueryState {
  /**
   * When true, a spinner is shown and every other state (including error) is hidden.
   */
  readonly loading = input(false);

  /**
   * Error message shown when not loading. `null` and `''` mean no error; any other string is shown.
   */
  readonly error = input<string | null>(null);

  /**
   * When true (and not loading, and with no error), the empty state is shown instead of content.
   */
  readonly empty = input(false);
}
