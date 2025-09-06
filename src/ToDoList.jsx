import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "./Button";
import DeleteButton from "./DeleteButton";
import SpeechInput from "./SpeechInput";
import Input from "./Input";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const basePath = import.meta.env.BASE_URL;

export default function ToDoList() {
  const audio = new Audio(basePath + "fail.mp3");
  // Viene definita la variabile saved con il contenuto dell'elemento con chiave categories salvato in localStorage. Se il contenuto esiste, viene convertito da stringa JSON a oggetto JavaScript e usato come valore iniziale dello stato categories. Altrimenti, viene inizializzato con un oggetto vuoto.
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : {};
  });

  const [newCategory, setNewCategory] = useState("");
  const [newElement, setNewElement] = useState("");
  const [selected, setSelected] = useState("");
  const [activeInputId, setActiveInputId] = useState(null);
  const [editingDateId, setEditingDateId] = useState(null);

  const categoryInputRef = useRef(null);
  const elementInputRef = useRef(null);

  // Ogni volta che il valore di categories cambia, viene convertito in stringa JSON e salvato nel localStorage sotto la chiave categories.
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // Quando cambia il valore di categories o selected, viene definita categoryKeys come array contenente le chiavi dell'oggetto categories. Se selected è falsy (null, undefined, stringa vuota) e categoryKeys  contiene almeno un elemento, oppure se invece selected ha un valore ma non è presente tra le chiavi di categories allora selected viene impostato al primo elemento dell'array, oppure a una stringa vuota se l'array è vuoto.
  useEffect(() => {
    const categoryKeys = Object.keys(categories);
    if (
      (!selected && categoryKeys.length > 0) ||
      (selected && !categoryKeys.includes(selected))
    ) {
      setSelected(categoryKeys[0] || "");
    }
  }, [categories, selected]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Funzione => Se la data è falsy (null, undefined, stringa vuota), restituisce una stringa vuota. Altrimenti, crea un oggetto Date a partire dalla stringa fornita. Restituisce la data formattata in stile italiano (gg/mm/aaaa) con due cifre per giorno e mese.
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Funzione per aggiornare la data di un elemento
  const updateElementDate = (elementId, date) => {
    if (!date) {
      setCategories((prev) => ({
        ...prev,
        [selected]: (prev[selected] || []).map((el) =>
          el.id === elementId ? { ...el, date: "" } : el
        ),
      }));
      return;
    }
    // Imposta la data alle 00:00 locali
    const adjustedDate = new Date(date);
    adjustedDate.setHours(12); // Evita problemi di fuso orario

    const dateString = adjustedDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    setCategories((prev) => ({
      ...prev,
      [selected]: (prev[selected] || []).map((el) =>
        el.id === elementId ? { ...el, date: dateString } : el
      ),
    }));
  };

  // Funzione per rimuovere la data di un elemento
  const clearElementDate = (elementId) => {
    updateElementDate(elementId, null);
  };

  // Funzione per riprodurre il suono di aggiunta
  const playAddSound = () => {
    const basePath = import.meta.env.BASE_URL || "";
    const audio = new Audio(`${basePath}/pop_add.mp3`);
    audio.currentTime = 0;
    audio.volume = 0.3;
    audio.play();
  };

  // Funzione per leggere gli elementi
  const speakElements = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const elementsText = sortedElements
      .map((el) => {
        const dateText = el.date ? `, con data ${formatDate(el.date)}` : "";
        return `${el.text}${dateText}`;
      })
      .join(", ");
    const utterance = new SpeechSynthesisUtterance(
      !selected || !sortedElements.length
        ? `Nessun elemento disponibile nella categoria ${selected}`
        : `Elementi di ${selected}: ${elementsText}`
    );

    utterance.lang = "it-IT";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);

    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Google") && voice.lang === "it-IT"
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener("voiceschanged", setVoice, {
        once: true,
      });
    } else {
      setVoice();
    }
  };

  // Funzioni per gestire le categorie
  const addCategory = (categoryText = newCategory) => {
    const trimmedCategory = categoryText.trim();
    if (!trimmedCategory) {
      categoryInputRef.current?.focus();
      return;
    }

    const cleanCategory =
      trimmedCategory.charAt(0).toUpperCase() +
      trimmedCategory.slice(1).toLowerCase();

    const existingKeys = Object.keys(categories).map((key) =>
      key.toLowerCase()
    );

    if (existingKeys.includes(cleanCategory.toLowerCase())) {
      audio.play();
      setTimeout(() => {
        alert("Questa categoria esiste già!");
      }, 100);
      setNewCategory("");
      categoryInputRef.current?.focus();
      return;
    }

    setCategories((prev) => ({
      ...prev,
      [cleanCategory]: [],
    }));

    setSelected(cleanCategory);
    setNewCategory("");
    playAddSound();
    categoryInputRef.current?.focus();
  };

  const deleteCategory = (categoryName) => {
    setCategories((prev) => {
      const newCategories = { ...prev };
      delete newCategories[categoryName];
      return newCategories;
    });
  };

  // Funzioni per gestire gli elementi
  const addElement = (elementText = newElement) => {
    const trimmedElement = elementText.trim();
    if (!trimmedElement || !selected) {
      elementInputRef.current?.focus();
      return;
    }

    const cleanElement =
      trimmedElement.charAt(0).toUpperCase() +
      trimmedElement.slice(1).toLowerCase();

    const existingElements = categories[selected] || [];
    const existingTexts = existingElements.map((el) => el.text.toLowerCase());
    if (existingTexts.includes(cleanElement.toLowerCase())) {
      audio.play();
      setTimeout(() => {
        alert("Questo elemento esiste già in questa categoria!");
      }, 100);
      setNewElement("");
      elementInputRef.current?.focus();
      return;
    }

    setCategories((prev) => ({
      ...prev,
      [selected]: [
        ...(prev[selected] || []),
        { id: uuidv4(), text: cleanElement, done: false, date: "" },
      ],
    }));

    setNewElement("");
    playAddSound();
    elementInputRef.current?.focus();
  };

  const deleteElement = (elementId) => {
    setCategories((prev) => ({
      ...prev,
      [selected]: (prev[selected] || []).filter((el) => el.id !== elementId),
    }));
  };

  // Gestore per il risultato del riconoscimento vocale
  const handleSpeechResult = (transcript, inputType) => {
    if (!transcript.trim()) return;

    if (inputType === "category") {
      addCategory(transcript);
    } else if (inputType === "element") {
      addElement(transcript);
    }
  };

  // Gestori di eventi
  const handleCategoryKeyDown = (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      addCategory();
    }
  };

  const handleElementKeyDown = (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      addElement();
    }
  };

  // Ordinamento degli elementi per giorno e mese
  const sortedElements = [...(categories[selected] || [])].sort((a, b) => {
    if (!a.date && !b.date) return 0; // Entrambi senza data, ordine invariato
    if (!a.date) return 1; // a senza data, va in fondo
    if (!b.date) return -1; // b senza data, va in fondo

    const [yearA, monthA, dayA] = a.date.split("-").map(Number);
    const [yearB, monthB, dayB] = b.date.split("-").map(Number);

    // Confronta mese e giorno, ignorando l'anno
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  // Stati derivati
  const categoryKeys = Object.keys(categories);
  const hasCategories = categoryKeys.length > 0;

  return (
    <div className="container flex flex-col xl:flex-row mt-5 mx-auto gap-4 p-4">
      <div className="w-full xl:w-2/5 box-theme">
        <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
          <h1 className="text-2xl font-bold text-center pl-2">Categorie</h1>
        </div>
        <div className="mb-4">
          {hasCategories ? (
            <ul className="space-y-2">
              {categoryKeys.map((categoryName) => (
                <li
                  key={categoryName}
                  className="grid grid-cols-[1fr_2rem] gap-3 place-items-center"
                >
                  <div className="w-full min-w-0">
                    <Button
                      onClick={() => setSelected(categoryName)}
                      className={`w-full whitespace-normal break-words text-justify ${
                        selected === categoryName ? "selected-category" : ""
                      }`}
                    >
                      <span className="font-bold text-base">
                        {categoryName}
                      </span>
                      <span className="font-bold ml-2 text-sm opacity-70">
                        ({(categories[categoryName] || []).length})
                      </span>
                    </Button>
                  </div>
                  <DeleteButton
                    variant="confirm"
                    onClick={() => deleteCategory(categoryName)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="grid grid-cols-[1fr_2rem] text-gray-500 text-center py-8">
              Nessuna categoria disponibile.
              <br />
              Aggiungine una per iniziare!
            </p>
          )}
        </div>

        {/* Input nuova categoria */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
            <Input
              inputRef={categoryInputRef}
              maxLength={50}
              onKeyDown={handleCategoryKeyDown}
              onChange={(evt) => setNewCategory(evt.target.value)}
              value={newCategory}
              placeholder="Nome nuova categoria..."
            />
          </div>
          <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
            <Button
              className="font-bold"
              onClick={() => addCategory()}
              s
              disabled={!newCategory.trim()}
            >
              Aggiungi Categoria
            </Button>
            <SpeechInput
              setText={setNewCategory}
              isActive={activeInputId === "category"}
              onActivate={() => setActiveInputId("category")}
              onSpeechResult={(transcript) =>
                handleSpeechResult(transcript, "category")
              }
              inputType="category"
            />
          </div>
        </div>
      </div>

      {/* Sezione Elementi */}
      <div className="w-full xl:w-3/5 box-theme">
        <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
          <div className="w-full min-w-0">
            <h2 className="text-2xl font-bold text-center pl-2 whitespace-normal break-words">
              {selected ? `Elementi di "${selected}"` : "Elementi"}
            </h2>
          </div>
        </div>
        {hasCategories ? (
          <>
            {/* Lista elementi */}
            <div className="mb-4 mt-[10px]">
              {sortedElements.length > 0 ? (
                <ul className="space-y-3">
                  {sortedElements.map((element) => (
                    <li
                      key={element.id}
                      className="grid grid-cols-[1fr_2rem] gap-3 place-items-center"
                    >
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg  w-full min-w-0  relative">
                        {editingDateId === element.id && (
                          <div className="col-span-2 mx-auto flex">
                            <DatePicker
                              selected={
                                element.date ? new Date(element.date) : null
                              }
                              onChange={(date) => {
                                updateElementDate(element.id, date);
                                setEditingDateId(null); // Chiude il selettore correttamente
                              }}
                              dateFormat="dd/MM/yyyy"
                              showYearDropdown
                              showMonthDropdown
                              dropdownMode="select"
                              className="text-sm text-gray-600 border border-gray-300 rounded"
                              placeholderText="Seleziona data"
                              autoFocus={editingDateId === element.id} // AutoFocus solo quando necessario
                            />
                          </div>
                        )}
                        {element.date && (
                          <>
                            <div className="absolute top-[0.1rem] left-1/2 transform -translate-x-[50%] flex">
                              <p className="text-sm text-gray-500 pr-1 ">
                                {formatDate(element.date)}
                              </p>
                              <button
                                onClick={() => {
                                  clearElementDate(element.id);
                                }}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                title="Rimuovi data"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          </>
                        )}
                        <p className="text-gray-800 w-full whitespace-normal break-words min-w-0 text-justify py-2">
                          {element.text}
                        </p>

                        <button
                          onClick={() => {
                            clearElementDate(element.id);
                            setEditingDateId(
                              editingDateId === element.id ? null : element.id
                            );
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors w-auto h-auto absolute top-1 right-2"
                          title="Imposta data"
                        >
                          <FaCalendarAlt size={14} />
                        </button>
                      </div>
                      <DeleteButton
                        onClick={() => deleteElement(element.id)}
                        variant="confirm"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="grid grid-cols-[1fr_2rem] gap-3 text-gray-500 text-center py-4">
                  Nessun elemento in questa categoria.
                  <br />
                  Aggiungine uno qui sotto!
                </p>
              )}
            </div>

            {/* Input nuovo elemento */}
            {selected && (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
                  <Input
                    inputRef={elementInputRef}
                    onKeyDown={handleElementKeyDown}
                    onChange={(e) => setNewElement(e.target.value)}
                    value={newElement}
                    placeholder={`Nuovo elemento...`}
                  />
                </div>
                <div className="grid grid-cols-[1fr_2rem] gap-3 place-items-center">
                  <Button
                    className="font-bold"
                    onClick={() => addElement()}
                    disabled={!newElement.trim()}
                  >
                    Aggiungi Elemento
                  </Button>
                  <SpeechInput
                    setText={setNewElement}
                    isActive={activeInputId === "element"}
                    onActivate={() => setActiveInputId("element")}
                    onSpeechResult={(transcript) =>
                      handleSpeechResult(transcript, "element")
                    }
                    inputType="element"
                  />
                  <button
                    onClick={speakElements}
                    className={`button-theme col-start-1 w-full speaker-button rounded text-white transition-colors duration-200 
              ${isSpeaking ? "bg-red-600" : "bg-green-600"}`}
                    title={isSpeaking ? "Ferma lettura" : "Avvia lettura"}
                  >
                    <div className="transition-transform duration-200 ease-in-out scale-100 scale-div flex justify-center items-center">
                      {isSpeaking ? (
                        <>
                          <svg fill="currentColor" viewBox="1 3 24 24">
                            <rect x="6" y="6" width="5" height="17" rx="1" />
                            <rect x="14" y="6" width="5" height="17" rx="1" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg fill="currentColor" viewBox="3 3 24 24">
                            <path d="M8 5v14l11-7z" className="scale-120" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="grid grid-cols-[1fr_2rem] gap-3  text-gray-500 text-center py-4">
            Crea prima una categoria per poter aggiungere elementi.
          </p>
        )}
      </div>
    </div>
  );
}
