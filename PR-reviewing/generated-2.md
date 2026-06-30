# PR Orientation exercise 2
[generated exercise 2](./generated-2.ts)
## What is this file responsible for?
This file is responsible for defining the types, and accepting data to construct into a html and send an email, alongside logging data related to the email.
## Main abstractions
- User
- Report
- Email
- Logger
- Email Client
## State
### Inputs
- user
- report
- includeMarketingBanner
### Dependencies
- emailClient
- auditLogger
### Local State 
- subject
- html
- sentAt
## What enters?
- user data
- report data
- config: inclueMarketingBanner
- dependencies: emailClient, auditLogger
## What leaves?
- email with html and metadata
- log
## Initial mental model
arguments sent in
v
email strings formatted and constructed
v
email client sends constructed email via emailClient arg implementation
v
logger sends log of relevent data
## Unknowns / assumptions
does the object in an async func have its expressions calculated when sent to event loop or when the event loop hands it off?
- constructed before async call is made

## Review
I would consider looking at whether we can sanitise the format string that constructs the html to send as an email. Any user provided information such as `user.name` may not actually be the user's name but a delayed attack, such as signing up with a name that's actually an unsafe link.

I'm curious to know aobut the need for the marketing banner in this particular email. Do all emails to users come with the banner in the email? Is there a strategy behind it?

The logging catches my eye next for two reasons: The first is that it contains user information. Do we know where the logging is sent to? Is the download URL by default giving access to the report? If I knew more about this sytem and the domain knowledge, I could be more informed on whether this could be a blocker.

The second reason is that the email client and the audit logger are two events that seem to correlate strongly together, where a failure could be introduced betweeen their completion. There's a failure boundary between sending the email and writing the audit event. If auditability is important, we may need an outbox/job model or separate success/failure audit events so retries don't create duplicate emails.