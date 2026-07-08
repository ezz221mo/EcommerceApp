import { useRef, useState } from 'react';

export default function ImageZoom({ src, alt, zoom = 2.5 }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden cursor-crosshair w-full h-full"
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          zoomed ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {zoomed && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoom * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
}
