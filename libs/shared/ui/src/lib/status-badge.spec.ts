import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('Requirement: Status badge shows a labeled tone', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('Scenario: Label is rendered - label text is visible to users and assistive technology', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('label', 'Active');
    await fixture.whenStable();

    expect(accessibleLabel(fixture)).toBe('Active');
  });

  it('Scenario: Tone changes styling - styling changes from success to danger while the label stays the same', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('label', 'Active');
    fixture.componentRef.setInput('tone', 'success');
    await fixture.whenStable();

    const successLabel = accessibleLabel(fixture);
    const successTone = badgeTone(fixture);

    fixture.componentRef.setInput('tone', 'danger');
    await fixture.whenStable();

    expect(accessibleLabel(fixture)).toBe(successLabel);
    expect(accessibleLabel(fixture)).toBe('Active');
    expect(successTone).toBe('success');
    expect(badgeTone(fixture)).toBe('danger');
    expect(badgeTone(fixture)).not.toBe(successTone);
  });

  it('Scenario: Default tone - uses the neutral tone when none is provided', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('label', 'Active');
    await fixture.whenStable();

    const explicit = TestBed.createComponent(StatusBadge);
    explicit.componentRef.setInput('label', 'Active');
    explicit.componentRef.setInput('tone', 'neutral');
    await explicit.whenStable();

    expect(badgeTone(fixture)).toBe('neutral');
    expect(badgeTone(fixture)).toBe(badgeTone(explicit));
  });
});

/**
 * Visible badge label from the host, which is the accessible text source.
 */
function accessibleLabel(fixture: ComponentFixture<StatusBadge>): string {
  return ((fixture.nativeElement as HTMLElement).textContent ?? '').trim();
}

/**
 * Documented visual-tone hook (`[attr.data-tone]`), not CSS class names.
 */
function badgeTone(fixture: ComponentFixture<StatusBadge>): string | undefined {
  const host = fixture.nativeElement as HTMLElement;
  const badge = host.querySelector('[data-tone]');
  return badge instanceof HTMLElement ? badge.dataset['tone'] : undefined;
}
