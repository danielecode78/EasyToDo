import { useEffect, useState } from "react";

export default function Footer() {
  const basePath = import.meta.env.BASE_URL;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isClosed = sessionStorage.getItem("disclaimerClosed");
    if (isClosed === "true") {
      setIsVisible(false);
    }
  }, []);

  const closeDisclaimer = () => {
    const audio = new Audio(basePath + "pop_close.mp3");
    audio.play();
    setIsVisible(false);
    sessionStorage.setItem("disclaimerClosed", "true");
  };

  return (
    <footer
      className="footer-theme container navbar-theme mx-auto relative"
      role="contentinfo"
    >
      {isVisible && (
        <button
          onClick={closeDisclaimer}
          className="absolute top-2 right-2 p-1 text-white hover:text-gray-400 hover:cursor-pointer"
          aria-label="Chiudi disclaimer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <p className="text-md text-justify pr-8">
        &copy; 2025 EasyToDo – DanieleCode78. Tutti i diritti riservati.
      </p>

      {isVisible && (
        <p
          className="text-xs text-justify leading-relaxed"
          role="status"
          aria-live="polite"
        >
          Questo sito è un portfolio personale sviluppato esclusivamente a scopo
          dimostrativo e non costituisce né una piattaforma commerciale né un
          servizio pubblico. L’accesso e l’utilizzo sono riservati unicamente a
          persone autorizzate dal proprietario. Qualsiasi contenuto generato
          dagli utenti deve intendersi come parte di un ambiente di test o
          dimostrazione. Le informazioni presenti nel sito hanno carattere
          puramente illustrativo e non possiedono alcun valore reale,
          commerciale o informativo. Il proprietario del sito declina ogni
          responsabilità per l’uso improprio del sito da parte di terzi, per i
          contenuti inseriti da utenti autorizzati e per eventuali danni,
          diretti o indiretti, derivanti dall’accesso, consultazione o
          interpretazione delle informazioni pubblicate.
        </p>
      )}
    </footer>
  );
}
