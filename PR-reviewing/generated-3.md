# PR Orientation exercise 3
[generated exercise 3](./generated-3.ts)
## What is this file responsible for?
This file seems to be responsible for owning and orchestrating the behaviours and objects relating to user login.

Domain concepts:
- User
- Login
- Password
- Security

Implementation concepts:
- Repositories
  - User
  - Password
  - Session
- `LoginInput`
- `PasswordHasher`
## Main abstractions
- User
- Password
- User Repository
- Form Input
- Hashing
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
| critical path | failed login | several failed logins |
| --- | --- | --- |
| values are passed in from some `login` input |    |    |
| &darr; |   |   |
| input values passed into `login` function |   |   |
| &darr; |   |    |
| user is fetched, and validation actions are applied |   |   |
| &darr; | &darr; on failure | &darr; on max retry failures or more (5) |
| user is validated  | validation failures recorded and effects actioned, sent back to input | account is locked |
| &darr; |   |   |
| sessionId created |   |   |
| &darr; |   |   |
| user is updated |   |   |
| session and user id is returned |   |   |
## Failure modes (In its lifecycle, where can it fail that's critical?)
We aren't pushing any critical information outwards, failure does not seem critical along the lifecycle
## Unknowns / assumptions
- Where does the login come from, is it sanitised?
- What happens in sessions.create, and is it enough to warrant just user.id directly input to create the session?
## Review
