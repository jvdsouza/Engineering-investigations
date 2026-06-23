# MISSION
Build an internal notification platform that receives product events, determines which users should be notified, respects user preferences, and delivers notifications through supported channels such as in-app, email, SMS, or push.

## Problem statement:
A user wishes to alert one or many people on something that has occured. There is cognitive and mechanical overhead of finding a means to have the target user(s) notified. What way are they receiving the message? How do we know they've received it or have seen it? What if we have many people we want to tell? What if they, or some of them, don't use the existing platform that notifications are being sent out to?

## User stories
- A user recieves a notification
- A user does not recieve a notification on desired platform
  - System retries to send notification
- A user leaves the notification unread
- A user consumes a notification
- A user turns notifications off
- A user chooses one or more platforms to recieve notifications

## Function Requirements
-  The system must be able to receive an event
-  The system must be able to identify the recipients a notification goes to
-  The system must respect a user's notification preferences
-  In app notifications must be supported in V1
-  The system must retry to send a notification if it fails to send
-  Read/unread stats must be tracked
-  The system must not send a duplicated notification to the same user on a single platform
-  The system can optionally support SMS/Email/push delivery channels

## Non-Functional Requirements
- In-app notifications should appear quickly, within a few hundreds of milliseconds to a few seconds
- Out of app notiifcations should be handled asynchronously, and be eventually consistent
- The system should be not slow main product flow
- Delivery failures should be observable
- The system should be able reliable enough as to not lose events
- User preferences and notifications data must be access controlled
- For a single user, notifications should usually be displayed in order of created_at. Exact global ordering is not required
  
## Out of scope for V1:
- Moderator dashboard
- Full analytics
- Mobile-Specific UX
- Multi-tenant external platform
- Exact global ordering