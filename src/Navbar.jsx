import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const basePath = import.meta.env.BASE_URL;
  const [clicked, setClicked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.classList.add("animate-logo");
    }
  }, []);

  const playImageSound = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setClicked(true);
    const audio = new Audio(basePath + "logosound3.mp3");
    audio.play();
    setTimeout(() => {
      setIsPlaying(false);
      setClicked(false);
    }, 3000);
  };

  return (
    <nav className="container navbar-theme mx-auto">
      <div ref={logoRef} className="inline-block w-auto h-auto rounded-lg">
        <img
          onClick={playImageSound}
          src={basePath + "easylogowidth.jpg"}
          alt="Logo"
          className={`cursor-pointer bg-white h-15 w-auto rounded-lg ${
            clicked ? "logo-click" : ""
          }`}
        />
      </div>
    </nav>
  );
}
