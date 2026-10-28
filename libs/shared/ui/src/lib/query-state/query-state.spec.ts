import { ComponentHarness } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  provideZonelessChangeDetection,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryState } from './query-state';

const PROJECTED_CONTENT = 'Users list';
const ERROR_MESSAGE = 'Could not load users';

/**
 * Host that projects content into {@link QueryState} so tests cover ng-content.
 */
@Component({
  selector: 'st-query-state-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [QueryState],
  template: `
    <st-query-state [loading]="loading()" [error]="error()" [empty]="empty()">
      <p>{{ projected }}</p>
    </st-query-state>
  `,
})
class QueryStateHost {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly empty = input(false);
  readonly projected = PROJECTED_CONTENT;
}

/**
 * Query-state view queried by role and visible text, not CSS classes.
 */
class QueryStateHarness extends ComponentHarness {
  static readonly hostSelector = 'st-query-state';

  private readonly status = this.locatorForOptional('[role="status"]');
  private readonly alert = this.locatorForOptional('[role="alert"]');

  async text(): Promise<string> {
    const host = await this.host();
    const text = await host.text();
    return text.trim();
  }

  async statusName(): Promise<string | null> {
    const status = await this.status();
    if (!status) {
      return null;
    }
    const labelled = await status.getAttribute('aria-label');
    if (labelled) {
      return labelled;
    }
    const text = await status.text();
    return text.trim();
  }

  async alertText(): Promise<string | null> {
    const alert = await this.alert();
    if (!alert) {
      return null;
    }
    const text = await alert.text();
    return text.trim();
  }
}

describe('Requirement: Query state wraps loading, error and empty views', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryStateHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('Scenario: Loading hides content - a loading indicator is shown and the content is not rendered', async () => {
    const harness = await render({ loading: true });

    expect(await harness.statusName()).toBe('Loading');
    expect(await harness.text()).not.toContain(PROJECTED_CONTENT);
  });

  it('Scenario: Error is shown - the message is shown and the content is not rendered', async () => {
    const harness = await render({ error: ERROR_MESSAGE });

    expect(await harness.alertText()).toBe(ERROR_MESSAGE);
    expect(await harness.text()).not.toContain(PROJECTED_CONTENT);
  });

  it('Scenario: Empty state is shown - the empty state is shown and the content is not rendered', async () => {
    const harness = await render({ empty: true });

    expect(await harness.statusName()).toBe('No results');
    expect(await harness.text()).not.toContain(PROJECTED_CONTENT);
  });

  it('Scenario: Content is shown - the projected content is rendered', async () => {
    const harness = await render({});

    expect(await harness.text()).toContain(PROJECTED_CONTENT);
    expect(await harness.statusName()).toBeNull();
    expect(await harness.alertText()).toBeNull();
  });

  it('Scenario: Loading takes precedence over error - only the loading indicator is shown', async () => {
    const harness = await render({ loading: true, error: ERROR_MESSAGE });

    expect(await harness.statusName()).toBe('Loading');
    expect(await harness.alertText()).toBeNull();
    expect(await harness.text()).not.toContain(ERROR_MESSAGE);
    expect(await harness.text()).not.toContain(PROJECTED_CONTENT);
  });

  it('empty-string error is treated as no error - projected content is rendered', async () => {
    const harness = await render({ error: '' });

    expect(await harness.alertText()).toBeNull();
    expect(await harness.statusName()).toBeNull();
    expect(await harness.text()).toContain(PROJECTED_CONTENT);
  });

  it('error takes precedence over empty - the message is shown and the empty state is not', async () => {
    const harness = await render({ error: ERROR_MESSAGE, empty: true });

    expect(await harness.alertText()).toBe(ERROR_MESSAGE);
    expect(await harness.statusName()).toBeNull();
    expect(await harness.text()).not.toContain('No results');
    expect(await harness.text()).not.toContain(PROJECTED_CONTENT);
  });
});

async function render(inputs: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
}): Promise<QueryStateHarness> {
  const fixture: ComponentFixture<QueryStateHost> = TestBed.createComponent(QueryStateHost);
  fixture.componentRef.setInput('loading', inputs.loading ?? false);
  fixture.componentRef.setInput('error', inputs.error ?? null);
  fixture.componentRef.setInput('empty', inputs.empty ?? false);
  await fixture.whenStable();
  return TestbedHarnessEnvironment.loader(fixture).getHarness(QueryStateHarness);
}
