import { useState, useEffect } from "react";
import {LeftOutlined,RightOutlined} from '@ant-design/icons';

export default function Carousel({
  children: slides,
  autoSlide = true, // Auto slide is true by default
  autoSlideInterval = 3000,
}) {
  const [curr, setCurr] = useState(0);
  const [autoplayDisabled, setAutoplayDisabled] = useState(false);

  const handleAutoplay = () => {
    if (!autoplayDisabled) {
      setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
    }
  };

  const prev = () => {
    setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
    setAutoplayDisabled(true);
    setTimeout(() => {
      setAutoplayDisabled(false);
    }, 3000);
  };

  const next = () => {
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
    setAutoplayDisabled(true);
    setTimeout(() => {
      setAutoplayDisabled(false);
    }, 3000);
  };

  useEffect(() => {
    if (autoSlide && !autoplayDisabled) {
      const slideInterval = setInterval(handleAutoplay, autoSlideInterval);
      return () => clearInterval(slideInterval);
    }
  }, [curr, autoplayDisabled]);


  return (
    <div className="overflow-hidden relative">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides}
      </div>
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={prev}
          className="p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
        >
          <LeftOutlined size={40} />
        </button>
        <button
          onClick={next}
          className="p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white"
        >
          <RightOutlined  size={40} />
        </button>
      </div>

      <div className="absolute bottom-4 right-0 left-0">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`
              transition-all w-3 h-3 bg-white rounded-full
              ${curr === i ? "p-2" : "bg-opacity-50"}
            `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
