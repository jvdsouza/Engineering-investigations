# DSA Investigation
## Local problems:
Some areas where logical processing is involved:
- Determine handler from event_type
- Have we processed this event/delivery?
- Preference lookup
- Batching by channel
- How do we order retries?
- How do we show unread and read notifications?

### Determine handler from event_type:
- Most likely JSON structure
  - Parse JSON into object/map-like structure where fields can be accessed by key
  - known contract most likely from design stage
  - look up fields in O(1) time
  - value from key most likely gives us the context for what we need to do for this information (ie user.password_reset, creator.stream_started)
    - Enum to hold these values if we dont have another single source
    - Hash to hold key-value pairs where key=context and value=function
      - we can make the function have another hash lookup to handle the nesting on the case-by-case basis of the event type

With the Event Dispatched to our system, once parsed and validated, the system needs to understand how to process it. Since the event type is known and maps directly to a behaviour, we can use a hash map or dictionary to resolve this with the key as event_type and value as the handler.

event-type -> Hash map lookup -> handler

Fast lookup, managable branching logic, and extensible in the case of more (or less) event types.

### Have we processed this event/deliivery?:
- How do we keep track of whats been done?
- What information should we keep?
- How long do we want to keep this event for?

When an event_type comes in, it comes with other data we can use to determine if a duplicate of a recently parsed event. Each event should be  handled differently in terms of time before it can be completed again, for example a streamer starting their stream should be able to occur more often notifying a specific person has followed them.

We should keep this information as a policy: a Hash map or dict with quick lookup for each event_type can be used.

Using a cache of sorts, where a TTL from that policy can be added to, is able to satisfy the storing and access of this data. It should have the properties of a Set, such that only one of this event can exist.

A Set keeps the information small, and we can use a Hash map as one. We could use a hashing algorithm to create unique keys, but we could probably create a unique enough ID, something like `event_name-invoking_user`, using the most identifying pieces of the data, without using as much time and compute power, reduce complexity, and improve readability with logging.

To know when a notification's TTL has expired, the value of the time relative the expiry should be set as the value in the Hash Map. Storing the actual expiry time is easiest, as the rule becomes very simple to know when something is ok to overwrite, since it's likely we'll have varying TTLs we'd need to keep pulling and comparing if we store the stored time instead, which would add complexity.

This introduces a problem of handling stale information, how do we prune old entries and free memory when some events wont be overwritten for a while (uncommon events like password reset, or during slow hours). Maybe a nested Hash Map, storing the `event_name`, then the `invoking_user` is more suitable. The TTLs stored can be directly compared in a frequency relative to the event_name's TTL, allowing us to clear any events that have expired through quick lookup, in O(L) time where L is the amount of layers we want to have to reach the key-value pair that has the expiry time.

Other methods could be a linear search through the hash to find TTLs, sorting based on the TTLs and then searching to find the latest surviving one, but both of these will be slower than implementing a Minheap to prune from. Minheap will allow us to easily access the oldest unique event in O(1), at the cost of inserting at O(log n).

TL;DR:
- Hash Map to store unique key value `event_name:invoking_user:receiving_user:entity_id` and the TTL
- Minheap for storing based on TTL for cleanup
- Use Redis to handle all of this instead

#### Improvements:
- System tech: Redis key TTL / SET NX, EX
- Local DS/A implementation: use minheap instead of nested Hash Map

### Preference Lookup:
Get recipients + preferences from database
Get event policies
Apply policies to usable channels (usable channels = policies and preferences)
Create delivery jobs

We want fast lookup and to transform the data into a standard delivery shape. Using Maps we can model key-value pairs such as User-Preference and event_type-policy

```
event_type = "creator.stream_started"
policy = { defaultChannels: ["in_app", push], requiredChannels: [] }

userPreference = { in_app: true, push: false, email: true }

result = ["in_app"]
```
The output created should follow an interface so that all messages that come from all these handlers are the same, and the message consumer doesn't need to be coupled to the handler.
```
DeliveryJob = {
    Recipients = {
        "user-1": {
            channel: ["in_app"],
            data: {
                title: "...",
                description: "...",
                ...
            }
        }
    }
}
```
### Batching by channel:
We have a set of users with prefrences which should be able to send to different delivery channels. 

We'll need to create a job for each user, and make versions for each channel.

We could iterate through the recipients and the data we need to send, but if we change the lookup to be prioritised by channel that makes it easier

We can model the database result by using `ORDER BY` with `WHERE` and taking advantage of the indexing.

Everything else should stay the same, and we can iterate through the users and apply policies much easier as now the preference is the key.

```
event_type = "creator.stream_started"
policy = { defaultChannels: ["in_app", push], requiredChannels: [] }

Users = { 
    in_app: [...], 
    push: [...], 
    email: [...] // discard
}

result = ["in_app"]
```

We can even cut down on the work done with the database so we only collect based on the default and required channels, meaning we dont have to prune and just get what we need.

---brain stopped here---