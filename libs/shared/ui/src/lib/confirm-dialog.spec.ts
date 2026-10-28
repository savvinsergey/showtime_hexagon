import { ComponentHarness, TestKey } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialog } from './confirm-dialog';

/**
 * Overlay panel of {@link ConfirmDialog}, queried from the document root because CDK attaches it to `body`.
 */
class ConfirmDialogPanelHarness extends ComponentHarness {
  static readonly hostSelector = '[role="alertdialog"]';

  private readonly title = this.locatorFor('h2');
  private readonly description = this.locatorFor('p');
  private readonly buttons = this.locatorForAll('button');

  async titleText(): Promise<string> {
    const title = await this.title();
    return title.text();
  }

  async descriptionText(): Promise<string> {
    const description = await this.description();
    return description.text();
  }

  async buttonNames(): Promise<string[]> {
    const buttons = await this.buttons();
    return Promise.all(
      buttons.map(async button => {
        const label = await button.text();
        return label.trim();
      }),
    );
  }

  async clickNamed(name: string): Promise<void> {
    const buttons = await this.buttons();
    for (const button of buttons) {
      const label = await button.text();
      if (label.trim() === name) {
        await button.click();
        return;
      }
    }
    throw new Error(`No button with accessible name "${name}"`);
  }

  async pressEscape(): Promise<void> {
    const host = await this.host();
    await host.sendKeys(TestKey.ESCAPE);
  }
}

describe('Requirement: Confirm dialog asks before an action', () => {
  let fixture: ComponentFixture<ConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('Scenario: Dialog shows texts - title, description and confirm label are displayed when open', async () => {
    const panel = await openDialog();

    expect(await panel.titleText()).toBe('Deactivate user');
    expect(await panel.descriptionText()).toBe('This will revoke access immediately.');
    expect(await panel.buttonNames()).toContain('Deactivate');
  });

  it('Scenario: Confirm is reported - confirm emits confirmed and closes', async () => {
    const panel = await openDialog();
    const { confirmed, cancelled } = trackOutputs();

    await panel.clickNamed('Deactivate');
    await fixture.whenStable();

    expect(confirmed).toHaveLength(1);
    expect(cancelled).toHaveLength(0);
    expect(await panelOrNull()).toBeNull();
  });

  it('Scenario: Cancel is reported - cancel emits cancelled and closes', async () => {
    const panel = await openDialog();
    const { confirmed, cancelled } = trackOutputs();

    await panel.clickNamed('Cancel');
    await fixture.whenStable();

    expect(cancelled).toHaveLength(1);
    expect(confirmed).toHaveLength(0);
    expect(await panelOrNull()).toBeNull();
  });

  it('Scenario: Escape cancels - Escape emits cancelled and closes without confirmed', async () => {
    const panel = await openDialog();
    const { confirmed, cancelled } = trackOutputs();

    await panel.pressEscape();
    await fixture.whenStable();

    expect(cancelled).toHaveLength(1);
    expect(confirmed).toHaveLength(0);
    expect(await panelOrNull()).toBeNull();
  });

  it('Scenario: Closed dialog is not shown - no dialog content is rendered when closed', async () => {
    await createDialog(false);

    expect(await overlayAlertdialogs()).toEqual([]);
  });

  it('Scenario: Components are accessible - dialog actions are reachable by role and name', async () => {
    const panel = await openDialog();

    expect(await panel.buttonNames()).toEqual(expect.arrayContaining(['Cancel', 'Deactivate']));
  });

  async function createDialog(isOpen: boolean): Promise<void> {
    fixture = TestBed.createComponent(ConfirmDialog);
    fixture.componentRef.setInput('title', 'Deactivate user');
    fixture.componentRef.setInput('description', 'This will revoke access immediately.');
    fixture.componentRef.setInput('confirmLabel', 'Deactivate');
    fixture.componentRef.setInput('open', isOpen);
    await fixture.whenStable();
  }

  async function openDialog(): Promise<ConfirmDialogPanelHarness> {
    await createDialog(true);
    return TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
      ConfirmDialogPanelHarness,
    );
  }

  function trackOutputs(): { confirmed: number[]; cancelled: number[] } {
    const confirmed: number[] = [];
    const cancelled: number[] = [];
    fixture.componentInstance.confirmed.subscribe(() => {
      confirmed.push(1);
    });
    fixture.componentInstance.cancelled.subscribe(() => {
      cancelled.push(1);
    });
    return { confirmed, cancelled };
  }

  /**
   * Overlay panel when present; used after confirm/cancel/Escape to assert the dialog closed.
   */
  async function panelOrNull(): Promise<ConfirmDialogPanelHarness | null> {
    return TestbedHarnessEnvironment.documentRootLoader(fixture).getHarnessOrNull(
      ConfirmDialogPanelHarness,
    );
  }

  /**
   * All overlay alertdialogs in the document a11y tree (empty when the dialog is closed).
   */
  async function overlayAlertdialogs(): Promise<ConfirmDialogPanelHarness[]> {
    return TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(
      ConfirmDialogPanelHarness,
    );
  }
});
