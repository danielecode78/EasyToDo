import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
const basePath = import.meta.env.BASE_URL;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const SpeechInput = ({
  setText,
  isActive,
  onActivate,
  onSpeechResult,
  inputType,
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startSound = useRef(new Audio(`${basePath}/start_rec.mp3`));
  const stopSound = useRef(new Audio(`${basePath}/stop_rec.mp3`));

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition non supportato");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "it-IT";

    recognition.onstart = () => {
      setIsListening(true);
      if (!isMobile) {
        startSound.current.play();
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      if (transcript && isActive) {
        setText(transcript);
        if (transcript.trim() && onSpeechResult) {
          onSpeechResult(transcript, inputType);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isMobile) {
        stopSound.current.play();
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microfono non autorizzato. Abilita il microfono per questo sito."
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [setText, isActive, onSpeechResult, inputType]);

  const toggleRecognition = () => {
    if (!recognitionRef.current) {
      alert("Riconoscimento vocale non disponibile.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      onActivate();
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error("Errore nell'avvio:", error);
          setIsListening(false);
        }
      }, 50);
    }
  };

  const browserSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  return (
    <button
      onClick={toggleRecognition}
      disabled={!browserSupported}
      className={`speech-button ${isListening && isActive ? "listening" : ""}`}
      title={isListening ? "Clicca per fermare" : "Clicca per registrare"}
    >
      {isListening && isActive ? <FaStop /> : <FaMicrophone />}
    </button>
  );
};

export default SpeechInput;
