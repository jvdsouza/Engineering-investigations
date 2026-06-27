import { useEffect, useState } from "react"

type Slide = {
  id: string
  title: string
  imageUrl: string
  href?: string
}

type CarouselProps = {
  slides: Slide[]
  autoPlay?: boolean
  intervalMs?: number
  onSlideChange?: (slideId: string) => void
}

export function MarketingCarousel({
  slides,
  autoPlay = true,
  intervalMs = 5000,
  onSlideChange,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const currentSlide = slides[currentIndex]

  useEffect(() => {
    if (!autoPlay || isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex(currentIndex + 1)

      if (onSlideChange) {
        onSlideChange(slides[currentIndex + 1].id)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [autoPlay, isPaused])

  const goToNext = () => {
    setCurrentIndex(currentIndex + 1)

    if (onSlideChange) {
      onSlideChange(slides[currentIndex + 1].id)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex - 1)

    if (onSlideChange) {
      onSlideChange(slides[currentIndex - 1].id)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)

    if (onSlideChange) {
      onSlideChange(slides[index].id)
    }
  }

  if (!slides.length) {
    return null
  }

  return (
    <section
      aria-label="Marketing carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div>
        <img src={currentSlide.imageUrl} alt={currentSlide.title} />
        <h2>{currentSlide.title}</h2>

        {currentSlide.href && (
          <a href={currentSlide.href}>
            Learn more
          </a>
        )}
      </div>

      <button onClick={goToPrevious}>
        Previous
      </button>

      <button onClick={goToNext}>
        Next
      </button>

      <div>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  )
}