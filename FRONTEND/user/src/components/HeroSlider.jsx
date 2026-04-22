import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSlider() {
    const slides = [
        {
            img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
            title: "Crack Your Exams 🚀",
            subtitle: "Practice daily and improve your score",
        },
        {
            img: "https://images.unsplash.com/photo-1509062522246-3755977927d7",
            title: "1000+ Questions",
            subtitle: "From beginner to advanced",
        },
        {
            img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
            title: "Track Progress 📊",
            subtitle: "Analyze & improve performance",
        },  
    ];

    return (
        <div className="hero-swiper">

            <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 3000 }}
                pagination={{ clickable: true }}
                loop={true}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="hero-slide"
                            style={{
                                backgroundImage: `url(${slide.img})`,
                            }}
                        >
                            <div className="overlay">
                                <h1>{slide.title}</h1>
                                <p>{slide.subtitle}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

        </div>
    );
}