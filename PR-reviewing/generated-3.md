# PR Orientation exercise 3
[generated exercise 3](./generated-3.ts)
## What is this file responsible for?
This file seems to be responsible for owning and orchestrating the behaviours and objects relating to user login.
## Main abstractions
- User
- User Repository
- Password
- Hashing
- Form Input
- Login Attempts
- Account Locking
## Inputs
- Form Input
## Dependencies
- `hasher` Hashing Function
- `UserRepository`
- `PasswordRepository`
- `SessionRepository`
## Internal State / Derived Values
Internal State:
- No state is created 
Derived Values:
- `user`
  - `failedLoginAttempts`
  - `accountLockedUntil`
  - `id`
- `hash`
- `matches`
- `sessionId`
## Outputs / Side Effects
Outputs:
- `sessionId`
- `userId`
Side Effects:
- calls to `get` from external services
  - `UserRepository`
  - `PasswordRepository`
  - `SessionRepository`
- `failedLoginAttempts` updates
- `acountLockedUntil` update
- `sessionId` creation
## Initial mental model

## Failure modes
In its lifecycle, where can it fail?

## Unknowns / assumptions

## Review