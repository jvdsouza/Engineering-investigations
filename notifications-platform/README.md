Imagine you're joining a company.
Product asks:
> "We need a notification platform that any team can use."
# Product Mission
Users should receive notifications when events happen.
Examples:
Someone follows you.
Someone comments.
Your payment succeeded.
Your password changed.
A streamer you follow goes live.
A tournament starts.

# Part 1
## Product Investigation
Your first task isn't engineering.
### Mission
Who uses this?
Who sends notifications?
Why?
### User Stories
Write 5-10.
Example:

```
User receives notification.
User marks notification read.
User disables email notifications.
User enables push notifications.
System retries failed email delivery.
Moderator sends broadcast notification.
```
### Functional Requirements
What should the system do?
### Non-functional Requirements
Latency?
Reliability?
Ordering?
Availability?
Cost?
Security?
Privacy?
### User Behaviour
This is important.
Think:
Reads or writes?
Fan-out?
Traffic spikes?
Critical notifications?
What can wait?

separate **core path**, **async path**, and **future evolution**.
# Part 2
## System Design
### Mission
Clarify assumptions.
### Architecture
Start here.
```
Application
↓
Notification Service
↓
Database
↓
User
```
STOP.
Don't add Kafka.
### Follow the Work
Suppose:
User follows someone.
What happens?
Draw the flow.
### Risks
What breaks?
Celebrity posts.
Millions of notifications.
Email provider fails.
Duplicate notifications.
Spam.
Users with multiple devices.
### Scaling
Suppose.
10x.
What bottleneck?
100x.
What bottleneck?
1000x.
What bottleneck?
Ask questions.
Make assumptions.
Introduce ONE change.
STOP.
### Strategies
Should work wait?
Queue?
Worker?
Cache?
Rate limiting?
Retry?
Read replicas?
Why?
# Part 3
## DS&A Investigation
This is where we're changing the game.
Don't ask:
"What algorithm?"
Ask:
"What local problem exists?"

Question.
Need fast lookup.
User preferences.
Data structure?

Need duplicate prevention.
Data structure?
Need ordered notifications.
Data structure?
Need highest priority first.
Data structure?
Need retry queue.
Data structure?
Need unread notifications.
Data structure?
Need broadcast.
Data structure?
Need notification expiry.
Data structure?

You don't have to know all the answers.
Investigate.
# Part 4
## Implementation
Pretend you're building V1.

Backend.
What endpoints?
```
POST /notifications
GET /notifications
PATCH /notifications/{id}
DELETE /notifications/{id}
```

Database.
Tables?
Relationships?
Indexes?

Frontend.
User experience?
Loading?
Unread count?
Errors?

Authentication.
JWT?
Cookies?
Permissions?

Observability.
Metrics?
Logs?
Alerts?
# Part 5
## Production
Imagine you got paged.
Questions.

Users say notifications missing.
Where investigate?

Email provider down.
Now what?

Queue backed up.
Now what?

Database slow.
Now what?

Spam attack.
Now what?
# Part 6
## AI Layer
Suppose product asks:
Can AI help?
Maybe.
Prioritise notifications.
Summarise notifications.
Batch notifications.
Predict engagement.
Detect spam.
Generate notification text.
# Deliverables
Do not chase perfection.
Something like:
```
Mission
Requirements
User behaviour
Architecture
Work flow
Risks
Scaling
Strategies
DS&A observations
Implementation
Production failures
Future evolution
```
Is preferrable

**Do not Google "system design notification service."**
