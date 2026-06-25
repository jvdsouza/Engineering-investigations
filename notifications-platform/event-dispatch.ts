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

const dispatchEventHandlers: Record<string, (event_data: event_data) => void> = {
    [EventType.IN_APP]: (event_data: event_data) => {},
    [EventType.EMAIL]: (event_data: event_data) => {},
    [EventType.PUSH]: (event_data: event_data) => {},
    [EventType.SMS]: (event_data: event_data) => {},
}

const dispatchEvent = (event_data: event_data): boolean => {
    const handler = dispatchEventHandlers[event_data.event_name];
    if (handler) {
        handler(event_data);
        return true;
    }
    console.error(`No handler found for event: ${event_data.event_name}`);
    return false;
}

export default dispatchEvent;