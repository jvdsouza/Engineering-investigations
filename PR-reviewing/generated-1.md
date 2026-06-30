# PR Orientation exercise 1
[generated exercise 1](./generated-1.tsx)
## What is this file responsible for?
This file seems to be a UI component, a marketing carousel, responsible for coordinating user interaction and autoplay behaviour.
## What are the main abstractions?
- Carousel
  - Slides
    - Slide
  - Behaviour
## What state exists?
- isPaused
- Current slide index
## What enters this file?
- Pre defined slides with metadata
- carousel options for autoplay
- hook for defining behaviours when a slide changes
## What leaves this file?
UI:
- Rendered carousel 
- Slides Metadata
- Buttons that action slide transition behaviour
- Callback invoked when the active slide changes
Side effects:
- onSlideChange callback
## Initial mental model
Slide metadata, Carousel metadata, Config
v passed as props
Carousel component
v instantiated
Create behaviours and set autoplay
v 
Render Carousel and attach behaviours
v made visible to the user
Behaviours executed
v function call
Carousel updates slide/behaviour outcomes/rerender
v
Updated render 
## Review
It might be worth reviewing the `useEffect` hook, and when the dependencies that would cause `useEffect` to fire or cause a rerender. `autoplay` seems to be passed as a prop, so it seems that the only dynamic variable is `isPaused`. 

## To understand:
- React useEffect lifecycle
- When dependency arrays rerun
- Whether currentIndex correctly updates inside setInterval