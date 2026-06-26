interface event_data {
    event_name: string;
    recipient_ids: number[];
    actor_id: number;
    entity_id: number;
    event_time: number;
    event_data: any;
}

enum EventType {
    IN_APP = 'in-app',
    EMAIL = 'email',
    PUSH = 'push',
    SMS = 'sms'
}

type TimePolicy = {
    [event_name: string]: TimePolicy | Record<string, number>; // time in milliseconds
}

const timePolicies: TimePolicy = {
    "user": {
        "password_reset":  60 * 60 * 1000, // 24 hours
        "comment_reply": 15 * 60 * 1000, // 15 minutes
    },
    "stream" :{}
};

const applyTimePolicies = (event_data: event_data): boolean => {
    const policy = timePolicies[event_data.event_name];
    if (!policy) {
        return true;
    }
    const lastEventTime = eventStore[event_data.event_name];
    if (!lastEventTime) {
        return true;
    }
    const timeDiff = event_data.event_time - lastEventTime.getTime();
    return timeDiff + policy;
}

const eventStore: Record<string, Date> = {

}

const storeEvent= (event_data: event_data): void => {}