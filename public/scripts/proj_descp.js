let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;

    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }

    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
}

// Auto-advance carousel every 5 seconds (optional)
if (totalSlides > 1) {
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Pause video when slide changes
document.addEventListener('DOMContentLoaded', function () {
    const videos = document.querySelectorAll('video');
    const originalChangeSlide = changeSlide;
    const originalCurrentSlide = currentSlide;

    function pauseAllVideos() {
        videos.forEach(video => {
            video.pause();
        });
    }

    changeSlide = function (direction) {
        pauseAllVideos();
        originalChangeSlide(direction);
    };

    currentSlide = function (index) {
        pauseAllVideos();
        originalCurrentSlide(index);
    };
});