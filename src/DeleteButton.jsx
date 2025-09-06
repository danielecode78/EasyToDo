import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  onClick,
  className = "",
  variant = "default",
  confirmTimeout = 3000,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  // Audio caricato una sola volta
  const popAudioRef = useRef(null);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    popAudioRef.current = new Audio(basePath + "/pop_delete.mp3");
    popAudioRef.current.preload = "auto";
  }, []);

  const playPop = () => {
    if (!popAudioRef.current) return;

    try {
      popAudioRef.current.currentTime = 0;
      popAudioRef.current.play().catch((err) => {
        console.warn("Autoplay bloccato o file audio non trovato:", err);
      });
    } catch (error) {
      console.warn("Impossibile riprodurre il suono:", error);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (variant === "confirm") {
      if (!isConfirming) {
        setIsConfirming(true);
        if (timeoutId) clearTimeout(timeoutId);
        const id = setTimeout(() => setIsConfirming(false), confirmTimeout);
        setTimeoutId(id);
      } else {
        playPop();
        onClick();
        setIsConfirming(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    } else {
      playPop();
      onClick();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div className="flex items-center">
      <button
        className={`delete-button-theme ${variant} ${
          isConfirming ? "confirming" : ""
        } ${className}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        title={isConfirming ? "Clicca per confermare" : "Elimina"}
        aria-label={isConfirming ? "Conferma eliminazione" : "Elimina"}
        aria-pressed={isConfirming}>
        <Trash2
          size={18}
          className={`trash-icon ${isHovered ? "hovered" : ""}`}
        />
        <div
          className={`delete-overlay ${isHovered ? "hovered" : ""} ${
            variant === "confirm" && isConfirming ? "confirming" : ""
          }`}
        />
      </button>

      {isHovered && (
        <div className="tooltip-container">
          <div className="tooltip">
            {isConfirming ? "Conferma eliminazione" : "Elimina"}
            <div className="tooltip-arrow" />
          </div>
        </div>
      )}
    </div>
  );
}
