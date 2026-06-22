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

# System Design
Mission: Recieve an event, and send it to the appropriate users through their preferred channel

Creating a user is much less common than reading users and their preferences, so we'll focus on optimising for reads when it comes to the database and processing information. 

We should also push notifications to users to allow their preference method handle storing the information rather than holding a store and having the users preference methods to poll. This also allows easier integrations for the platform, and lets us keep an API architecture where we don't have to keep any lines open, delivering messages as soon as we can.

## V1:
![alt text](v1.png)
There's quite a lot of processing, to go through each user and create a notification.
Getting the full set of users and storing their data in memory seems expensive here, can we break it up into chunks and asynchronously process it?

Lets create a batching process, and process each batch, keeping track of where we were last and using an offset for the next.

## V2:
![alt text](v2.png)
The bottleneck now doesnt solely lay on a single payload from reading the database and holding it in memory, and retries are easier to process.

The API, while still has a lower set of information to process each time, still needs to process before the next batch happens.

It seems to be a good idea to keep batches, as well as have preferences stored in a seperate table with a bridge table to record which user prefers which channel. `limit` happens after `group by` and `order_by` however, so a decision with batching needs to happen. A nice side-effect though is that we can also optimise to deliver in app first, and hand off other methods to another process.

We can cut up the SQL query. Process batches in-app first using `where`, then later after the event has completed, do the other methods. The issue here is that we'll have to filter the whole table and discard that 'view' each batch. Lets index this bridge table, and query for the in-app `preference_id`, then handling the remaining preferences after that's done.

## V3:
![alt text](v3.png)
This is going to allow us to have quick batching, without the risk of losing a lot of processing time when a failure occurs on large payloads. 

The variable in the sql `:preference_id_to_batch` will be the preference type we want to collect `users` by. We'll also get the preferences table and hold that in memory as a list (skipping over the in-app ID) to keep track of where we are regarding the notification method, as it's not guaranteed the id's will always be incrementing by a single value (such as deleted rows). We'd move down a row when the final batch of a preference is processed, ie the latest batch had less than 1000 entries.

The issue still lies in the API having to finish each call before each iteration, but now we can pioritise preferences.

## V4:
![alt text](image.png)
Earlier versions assumed all notifications fan out to all users. The domain knowledge of where this platform would be implemented clarified places where optimisations could take place. Recipient resolution becomes the primary optimisation, as the amount of users to to target delivery of a notification from an event to becomes much clearer.

We can take the load off the API processing the preference by offloading the work into an asynchronous process and another service. We can use a queue service and another server to handle this, freeing up the API server.

Queue services can be from cloud services or in bespoke services, its main function is to collect the messages with the `user_id` and required information. The notification sending server can be very small, as it only needs to recieve the information and process each message through the method the preference requires, so a serverless function can fit.

## V5:
If not all events fan out to all users, then lets resolve recipients and then create the deliveries.

If we're building on top of an existing app, we can use the context of the app to refine what events exist, and reduce the information regarding what users the work is done for.

Lets work with a:
- Creator/community platform.
Where users can:
- follow creators
- comment on posts
- like posts
- subscribe to creators
- join live streams/events
- receive account/security updates

We can expect events to support notifications in various ways:
- Social, usually 1 or few recipients:
    - user.followed
    - post.liked
    - post.commented
    - comment.replied
    - user.mentioned
- Creator, usually many recipients, possibly fan-out to followers/subscribers:
    - creator.post_published
    - creator.stream_started
    - creator.event_scheduled
    - creator.event_starting_soon
- Transactional, usually 1 recipient, higher importance:
    - subscription.started
    - subscription.renewed
    - payment.failed
    - refund.processed
- Security/Account, 1 recipient, high importance, probably email/push even if marketing notifications are off:
    - password.changed
    - email.changed
    - new_login_detected
    - two_factor_enabled
- Moderation/System, can be 1, few, or all users:
    - comment.removed
    - account_warning_issued
    - creator_content_flagged
    - system_announcement

We can use this to help seperate some concepts: 
- The Event: When something happens which we need to handle
- Notification: The user-viewed record of the event
- Delivery: The attempt of sending the already-created notification through a channel
  
This could change how we want to access our data. First, we recieve an event. This event should be described in our service with its priority and any rules it requires.

There's a few events that only require 1 user, such as those in social, transactional, security, and moderation types of notifications:
- user.followed
- post.liked
- new_login_detected
- comment.removed

There's some that go to a few users:
- comment.replied
- user.mentioned

Some where it goes to many users:
- creator.stream_started
- creator.event_starting_soon

And all:
- system_announcement

Right now, our system handles events that notifies all users. Lets see what we can do to reduce the work in the other cases.

For events that to notify 1 user, we can reduce the sql query to collecting the preferences for that user. However, there's some high priority cases, such as in the transactional security/account type of notification (ie `password_changed) where they should get an email irregardless of if they've opted in to email notifications.

Designing to align with the delivery policy, the user preferences will need to be reviewed for these cases. We'll make it so the user preferences to determine delivery channels for social and informational notifications. Security notifications may bypass user preferences to ensure important account events are communicated.

We also need a place to store our delivery policies. Policies may be needed elsewhere in the app service we're building on, but for now since we're concerned with just delivery policies, lets build it into our API server. In the future, we can think about moving this out, but having this in the API server allows us to quickly retrieve the policies and avoid unecessary network calls while keeping the design simple. 

If deployments are blocking policy updates, we can opt to use databse-backed configuration tables with validation, audit logs and caching. Seperate services for policies can be left until we definitely know that shared policies are needed across multiple systems as this adds complexity and effort.

Another benefit of keeping our policies in the API server is simpler testing and version control. 

In the server, we can add the "important notification" delivery policy by creating a message with the email preference for the user, after collecting that user from the database to ensure they exist first, get their email, and any other information we require to send the email.

A similar method for gathering the users to deliver to when there's few or many can be done, creating queries to handle events where we need to gather based on the information the event has provided us from the app service.

As such, the notification system should not always determine recipients from scratch. For simple events, the producer service can include recipient_ids. For fan-out events, such as creator.stream_started, the notification service can run recipient resolution using follower/subscriber data. This avoids unnecessary work and keeps the system flexible.

This means we'll also have to consider the Objects of the app. In our database, we'll be storing comments, user type (user, creator), posts, etc. Based on the event, we should have queries to obtain users to notify with the event.

## V6:
Since we're working ontop of an existing app, we might have useful context that comes in from the product service (the app). For example:
```
{
    "event_type": "comment.created",
    "recipient_ids": ["<post_owner_id>"],
    "actor_id": "<commenter_id>",
    "entity_id": "comment_id",
    ...
}
```

We can reduce the work the DBMS needs to do as we have the recipient ids, and just collect the preferences for that. Since we also have notification types that need to be prioritised with regards to the delivery policy some notifications require, we can acommodate for that too, having a check for the type of notification and applying the necessary values such as adding email preference type.

## V7:
![alt text](v7.png)
The bottleneck moves to the queue and notification sending server, as they'll be responsible for working all types of notifications. We can have parallel working services for each type of notification delivery option, such as workers. Splitting up the notification sending server so that each function is in their own, and having them long living lets us achieve part of the parallel setup.

We can also do this for the queues, having each queue responsible for a channel which is responsible for sending a notification type. This allows increased isolation, throughput control, observability benefits, and independent scaling for each queue. Since total volume is more related to the cost, rather than amount of queues, we can leverage having these parallel system to reduce time and customising policies for each queue based on what the channel delivers. This does come at the cost of operational complexity, and depending compute costs with long running workers, however it is a trade-off worth considering if the system starts to show bottlenecking with delivering notifications. 

## Further scaling options:
We could consider using a cache in front of the database, but this can be an issue when handling a new user signing up. It's difficult to answer when a cache should clear based on events that are out of our control. With the current optimisation it might be better to use database read only replicas with the speed of the query to rely on.

Further optimisations would include scaling up the notification sending services with replicas since that would be where the current load looks where it could be. This would move the bottleneck into the queue service, as only 1 queue is sending messages to more than 1 server. Since each message holds its own state, it's not an issue to determine which queue a message gets sent to. This can be done to handle inceased traffic, hotspots, manage failures.

For further scaling, using a load balancer to route to replicas of API servers, routing to the read replica databases. Automatic sharding for relational databases can be utilised through cloud services as well to improve the speeds we can read data in to the notification process.


## Design approach improvements
Mission:
- Find what NEEDS to be done and leave what DOESN't need to be done right now
- Find this system's context and needs as if it exists in the real world

Domain modelling:
- Currently the system is designed as:
  - Event -> Preferences -> Queue -> Channel
- System could be designed under a different model:
  - Event -> Notification -> Delivery

For domains you havent seen before, try to extract it:
- Start with verbs, ie what states are happening?
  - What happens?
- Example: notifications:
  - comment created
  - stream started
  - password changed
  - notifications sent
  - notification read
  - delivery failed
- Extract concrete nouns from the workflow, then generalise them into useful domain abstractions:
  - Comment
  - Stream
  - PasswordChange
  - Notification
  - Delivery
  - User
  - Channel
  - Preference
- Seperate "something happened" from "we did something"
  - Event = something happened (in the product/outside system sending message to us)
  - Notification = we create a message/state for a user
  - Delivery = we attempt to send that notification through a channel
  - Seperation comes from asking if it's the:
    - cause/Domain Event/Something happened
    - user-visible record/Read model/record/thing we store or display
    - side effect/command/actions/effect/things we'll do because of it
- Ask lifecycle questions:
  - For each noun ask:
    - who creates it?
    - who reads it?
    - can it fail?
    - can it be retried?
    - can it be deleted?
    - does it have status/lifecycle state?
    - does it need history (audit trails, logs, versioning, artefacts)?
  - Example:
    - A delivery can be:
      - pending -> sent -> failed -> retrying -> dead_lettered
- Find one-to-many relationships
  - One Event may create many Notifications
  - one Notification may create many Deliveries
  - One User may have many Preferences
  - One Channel may have many DeliveryAttempts
- Create smallest model first
  - User
  - Preference
  - Event
  - Notification
  - Delivery
  - Channel
- Evolve the model
  - Question it
    - What feels awkward
    - Where is retrying hard
    - Where are duplicates hard
    - What is missing from what we found? What feels hard to implement?
- Reusable domain modelling prompt:
  - What happened?
  - Who cares/who would want to know?
  - What user-visible objects are created?
  - What actions occur due to it?
  - Which of these is allowed to fail independently?
  - Which of these needs status/history?
  - Where are the one-to-many relationships
  - Where is the source of truth for each of these?

Product intent with preferences and importance of notifications:
- Prefer to use language that aligns with 'following policies' over 'overriding'

Database and information optimising:
- Consider if we need to do any work at all first
- Given we get recipient id's, do we need to do any work at all?
- Maybe underlying app already did do work regarding collecting information already
- Can we avoid another dependency this way?

Total work with async responsibility channels:
- Total work doesn't change
- What has improved is:
  - Isolation
  - Scalability
  - Retry behavious
  - Failure containment
  - Observability
Further scaling:
- Talk about bottlenecks, then say what can be done

## What was "done well"
- structured thinking
- iterative design
- bottleneck identification
- willingness to revisit assumptions
- understanding of asynchronous processing
- understanding of recipient resolution
- understanding of channel-specific scaling