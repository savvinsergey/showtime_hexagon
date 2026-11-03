import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmBadgeImports, hlm } from '@shared/spartan-ui';

/**
 * Closed set of visual tones for {@link StatusBadge}.
 * Not a domain status: feature maps domain values onto this set.
 */
export type StatusBadgeTone = 'success' | 'neutral' | 'warning' | 'danger';

const TONE_CLASS: Record<StatusBadgeTone, string> = {
  success:
    'border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  neutral: 'border-transparent bg-secondary text-secondary-foreground',
  warning:
    'border-transparent bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400',
  danger: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
};

/**
 * Presentational status badge: a labeled tone so meaning does not depend on color alone.
 */
@Component({
  selector: 'st-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HlmBadgeImports],
  template: `<span hlmBadge [attr.data-tone]="tone()" [class]="toneClass()">{{ label() }}</span>`,
})
export class StatusBadge {
  /**
   * Visible status text; always shown so color is never the only signal.
   */
  readonly label = input.required<string>();

  /**
   * Visual tone of the badge; defaults to `neutral` when omitted.
   */
  readonly tone = input<StatusBadgeTone>('neutral');

  protected readonly toneClass = computed(() => hlm(TONE_CLASS[this.tone()]));
}
