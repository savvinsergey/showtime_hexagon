import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { HlmAlertDialogImports } from '@shared/spartan-ui';

/**
 * Presentational confirm dialog: shows a question and reports whether the user confirmed or cancelled.
 * Dumb UI: no application or domain types; the parent maps the decision onto a use case.
 */
@Component({
  selector: 'st-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HlmAlertDialogImports],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  /**
   * Whether the dialog is shown; two-way so confirm, cancel and Escape keep the parent in sync.
   */
  readonly open = model<boolean>(false);

  /**
   * Heading that names the action being confirmed.
   */
  readonly title = input.required<string>();

  /**
   * Supporting copy that explains the consequence of confirming.
   */
  readonly description = input.required<string>();

  /**
   * Accessible name of the confirm button; cancel is always labelled `Cancel`.
   */
  readonly confirmLabel = input.required<string>();

  /**
   * Emits when the user activates the confirm action; the dialog then closes.
   */
  readonly confirmed = output<void>();

  /**
   * Emits when the user cancels (Cancel, Escape, or overlay dismiss) and the dialog closes.
   */
  readonly cancelled = output<void>();

  protected readonly dialogState = computed(() => (this.open() ? 'open' : 'closed'));

  protected onConfirm(): void {
    this.confirmed.emit();
    this.open.set(false);
  }

  protected onClosed(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.cancelled.emit();
  }
}
