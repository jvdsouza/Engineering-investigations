# PR Orientation exercise 1
[generated exercise 1](./generated-1.tsx)
## What is this file responsible for?
This file seems to be a visual component, holding the rendering logic and orchestrates the behaviour of a carousel.
## What are the main abstractions?
- Carousel
  - Slides
    - Slide
  - Behaviour
## What state exists?
- Slides
  - Slide Metadata
- Autoplay
  - If it should autoplay
  - How long until autoplay
- isPaused
- Current slide index
## What enters this file?
- Pre defined slides with metadata
- carousel options for autoplay
- hook for defining behaviours when a slide changes
## What leaves this file?
- Rendered carousel and slides
- Buttons that action slide transition behaviour
- Behaviour defined by the on change hook passed in as a prop
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
Carousel updates slide/behaviour outcomes
## Review
It might be worth reviewing the `useEffect` hook, and when the dependencies that would cause `useEffect` to fire or cause a rerender. `autoplay` seems to be passed as a prop, so it seems that the only dynamic variable is `isPaused`. 