# Spec Delta

## Purpose

Defines Users domain contracts for validated, serializable user data and stable role values shared by typed consumers.

## ADDED Requirements

### Requirement: User roles have one public enum contract
The domain SHALL export `UserRoleEnum` with `Admin` and `Member` members serialized as `admin` and `member`. The public `UserRole` type SHALL reference that enum. Typed user records SHALL require enum members. Application SHALL expose the enum for consumers of its User model without requiring a domain import.

#### Scenario: Role enum preserves wire values
- **WHEN** a consumer imports the enum through the domain or application public entry and serializes its members
- **THEN** both entries expose the same enum with exactly `Admin = admin` and `Member = member`

#### Scenario: Typed users require role enum members
- **WHEN** a typed user or draft is constructed
- **THEN** enum role members are accepted and raw string assignments to the role field fail type checking

### Requirement: Raw role validation remains compatible
Raw role inputs SHALL remain strings. The role guard and domain transitions SHALL accept only `admin` and `member`, narrow valid inputs to the role enum, and reject unsupported values without changing successful state or event behavior.

#### Scenario: Raw supported roles still validate
- **WHEN** the guard, draft creation or change-role transition receives raw `admin` or `member`
- **THEN** validation succeeds and the resulting role equals the corresponding enum member

#### Scenario: Invalid roles remain rejected
- **WHEN** validation receives an empty role, whitespace or `superuser`, or the guard receives a non-string value
- **THEN** the guard returns false and domain operations with invalid strings return `invalid-role` without a successful model or event
