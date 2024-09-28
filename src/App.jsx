import { useMemo, useRef, useState } from "react";

function App() {
  const inputRef = useRef(null);

  const [isLoading, setLoading] = useState(false);
  const [inputField, setInputField] = useState("");
  const [lastFileName, setFileName] = useState("file");
  const [shift, setShift] = useState(0);
  const [lang, setLang] = useState("uk");

  const { selectedAlphabet, selectedAlphabetMap } = useMemo(() => {
    const ukrainianAlphabet =
      "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзииіїйклмнопрстуфхцчшщьюя";
    const englishAlphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ,abcdefghijklmnopqrstuvwxyz.' ";

    const alphabet = lang === "en" ? englishAlphabet : ukrainianAlphabet;
    const alphabetMap = new Map();
    alphabet.split("").forEach((value, index) => {
      alphabetMap.set(value, index);
      alphabetMap.set(index, value);
    });

    return { selectedAlphabet: alphabet, selectedAlphabetMap: alphabetMap };
  }, [lang]);

  const outputField = useMemo(() => {
    if (shift === 0 || inputField.length === 0) return inputField;

    return inputField
      .split("")
      .map((char) => {
        if (!isNaN(+char) || !selectedAlphabetMap.has(char)) return char;

        const charShift = shift + selectedAlphabetMap.get(char);
        const nextIndex =
          charShift > selectedAlphabet.length
            ? charShift - selectedAlphabet.length
            : charShift;

        return selectedAlphabetMap.get(nextIndex);
      })
      .join("");
  }, [inputField, selectedAlphabet.length, selectedAlphabetMap, shift]);

  const showFile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setInputField(text);
      };
      setFileName(e.target.files[0].name.split(".")[0]);
      reader.readAsText(e.target.files[0]);
    } catch {
      alert("Something wrong! Try again");
    } finally {
      setLoading(false);
    }
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    element.hidden = true;
    const file = new Blob([outputField], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${
      lastFileName ? `${lastFileName}_shifted` : "file_shifted"
    }.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-dvh w-full flex justify-center items-center p-40">
      <div className="flex flex-row w-full items-end gap-4">
        <div className="flex flex-col flex-1 gap-4">
          <div className="gap-4 flex flex-col">
            <select
              className="border p-2"
              value={lang}
              onChange={(e) => setLang(e.currentTarget.value)}
            >
              <option
                label="Англійська з розділовими знаками та пробілами"
                value="en"
              />
              <option
                label="Українська без розділових знаків та пробілів"
                value="uk"
              />
            </select>
            <label className="text-lg">Число зсуву шифру</label>
            <input
              className="border p-2"
              type="number"
              value={shift}
              onChange={(e) => setShift(+e.currentTarget.value)}
              min={-31}
              max={31}
            />
          </div>
          <label className="text-lg">Оригінальний текст</label>
          <textarea
            className="border p-2"
            value={inputField}
            onChange={(event) => setInputField(event.currentTarget.value)}
          />
          <button
            className="bg-black text-white px-4 py-2"
            onClick={() => inputRef.current?.click()}
          >
            {isLoading ? "Завантаження..." : "Додати файл"}
          </button>
          <input hidden ref={inputRef} type="file" onChange={showFile} />
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <textarea className="border p-2" readOnly value={outputField} />
          <button
            className="bg-black text-white px-4 py-2"
            onClick={downloadTxtFile}
          >
            Завантажити файл
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
