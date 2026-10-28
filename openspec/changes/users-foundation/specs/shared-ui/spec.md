# Spec Delta

## Purpose

Provides reusable presentational components without domain knowledge, built on the spartan UI barrel, so feature screens share status, confirmation and query-state visuals instead of duplicating them.

## ADDED Requirements

### Requirement: Status badge shows a labeled tone
The `StatusBadge` component SHALL render a text label and visually distinguish the tones `success`, `neutral`, `warning` and `danger`; the label text SHALL always be present so meaning does not depend on color alone.

#### Scenario: Label is rendered
- **WHEN** the badge receives a label
- **THEN** the label text is visible to users and assistive technology

#### Scenario: Tone changes styling
- **WHEN** the tone changes from `success` to `danger`
- **THEN** the rendered badge styling changes accordingly while the label stays the same

#### Scenario: Default tone
- **WHEN** no tone is provided
- **THEN** the badge uses the `neutral` tone

### Requirement: Confirm dialog asks before an action
The `ConfirmDialog` component SHALL show a title, a description and a confirm action when open, and report the user's decision.

#### Scenario: Dialog shows texts
- **WHEN** the dialog is opened with a title, a description and a confirm label
- **THEN** all three are displayed

#### Scenario: Confirm is reported
- **WHEN** the user activates the confirm action
- **THEN** the dialog emits a `confirmed` event and closes

#### Scenario: Cancel is reported
- **WHEN** the user activates the cancel action
- **THEN** the dialog emits a `cancelled` event and closes

#### Scenario: Escape cancels
- **WHEN** the user presses Escape while the dialog is open
- **THEN** the dialog emits `cancelled` and closes without emitting `confirmed`

#### Scenario: Closed dialog is not shown
- **WHEN** the dialog is not open
- **THEN** no dialog content is rendered

### Requirement: Query state wraps loading, error and empty views
The `QueryState` component SHALL show exactly one of: a loading indicator, an error message, an empty state, or the projected content, with the precedence loading, then error, then empty, then content.

#### Scenario: Loading hides content
- **WHEN** the component is loading
- **THEN** a loading indicator is shown and the content is not rendered

#### Scenario: Error is shown
- **WHEN** the component is not loading and has an error message
- **THEN** the message is shown and the content is not rendered

#### Scenario: Empty state is shown
- **WHEN** the component is not loading, has no error and is flagged empty
- **THEN** the empty state is shown and the content is not rendered

#### Scenario: Content is shown
- **WHEN** the component is not loading, has no error and is not empty
- **THEN** the projected content is rendered

#### Scenario: Loading takes precedence over error
- **WHEN** the component is loading and also has an error message
- **THEN** only the loading indicator is shown

### Requirement: Shared UI has no domain knowledge
Shared UI components SHALL be presentational: they use only inputs and outputs with simple types, inject no application or business services, and depend only on the spartan UI barrel and utilities.

#### Scenario: Dependencies are limited
- **WHEN** the project graph lists dependencies of the shared UI project
- **THEN** only the spartan UI barrel and utility projects appear

#### Scenario: Components are accessible
- **WHEN** the components are rendered in a test
- **THEN** interactive elements are reachable by role and name (for example, the dialog actions as buttons)
