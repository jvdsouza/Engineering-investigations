# Implementation
## API
A REST API should do well here, as we have a storage attached with resources. A notification follows the same interface each time, and mixing of various resources isn't happening right now. We can use a graphql layer at a later time if needed.

Focusing on notifications:
Endpoints:
```
POST
/notifications
/preferences/{user_id}
GET
/notifications
/preferences/{user_id}
PUT
/notifications/{id}
/preferences/{user_id}
DELETE
/notifications/{id}
/preferences/{user_id}
```
## Technology Mapping
What real technology provides this?
Storage:
- Amazon RDS
- Other cloud services
- Postgres/MySQL/MariaDB
- LocalStorage

HashMap
- JS Map
- JS Object
- Redis

Set
- JS Set

MinHeap
- Manual Implementation/Library

TTL Cleanup
- Redis TTL

Queues:
- JS implementation with array
- AWS SQS
- RabbitMQ
- Apache Kafka
- Redis TTL
- Azure Service Bus

Workers:
- Kubernetes to host servers
- serverless 
- AWS Lambda

## Local Implementation
### Event handler/dispatcher

### Dedupe cache

### Retry scheduler

