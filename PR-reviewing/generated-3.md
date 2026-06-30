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
  - `id`
- `hash`
- `matches`
- `sessionId`
Mutable Persisted Domain State:
  - `failedLoginAttempts`
  - `accountLockedUntil`
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
Login is security-sensitive, failure are critical even if much data isnt exposed

Important failure points:
- Failed login attempts not properly persisted
- Lookup failures and timing differences leaking if an email exists
- Concurrent failed logins may race, overwriting `failedLoginAttempts`
- Account lockout may not apply properly if updates fail
- Failed login attempts reset may fail while login is successful
- Password hash lookup and comparison need proper handling to not leak info
## Unknowns / assumptions
- Where does the login come from, is it sanitised?
- What happens in sessions.create, and is it enough to warrant just user.id directly input to create the session?
- The `user.accountLockedUntil` date seems a bit strange, is this a calculation commonly used for a specific time in this system?
## Review
One consideration I would bring up, although not a blocker, is the extraction of the failed login attempts checking logic into a new component. Alongside this, pulling out the retry amount into a variable can create improved readibility.

I want to ask about the time an account is locked for on max failed attempts, is this a know calculation? 15 and 1000 seem to not have a clear meaning on what they represent.

I would block this PR on the sessionId creation, unless there's more that happens within `sessions.create` this seems like an easy target for malicious users to steal or replicate a `sessionId`. Similar to the hashing function for the password, we should add more security to this. Using the time this sessionId was created and having a TTL assigned to it as well. 

We also return this information raw. If this component is sending this information externally, the `sessionId` is in danger from being stolen.

The `User` object is also updated in various locations, and failures along this piece of code can cause state to not be reflected properly. Do we have any existing strategies in this codebase, or can we introduce one? A `try-catch-finally` block can provide such behaviour. If we're writing to a database, we can include using a transaction function offered by the package.