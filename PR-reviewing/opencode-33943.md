# Opencode 33943 PR
## What is this file responsible for?
packages/app
    e2e/smoke
        session-timeline.fixture.ts - smoke test file giving fixtures for the session timeline. Session timeline includes message and when it was created
        session-timeline.spec.ts - actual tests using the fixtures
    src
        context
            layout-scroll.test.ts - unit tests for layout-scroll.ts
            layout-scroll.ts - functions that define behaviours involving scrolling
        pages
            session
                timeline
                    message-timeline.tsx - component responsible for displaying and how the timeline should behave 
                use-session-hash-scroll.ts - behaviours that define how the scroll should work given a session hash/how it should scroll given context of a session 
            session.tsx - top level component that contains the state of the current session and defines the behaviour of a session
## What are the main abstractions?

## What state exists?

## What enters this file?

## What leaves this file?