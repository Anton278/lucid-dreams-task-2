import { useEffect, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import axios from "axios";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "./App.css";

import "codemirror/mode/javascript/javascript";

function MyEditor() {
  const [value, setValue] = useState(``);
  const [items, setItems] = useState([]);
  const [editor, setEditor] = useState();
  const [variants, setVariants] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const options = {
    mode: "javascript",
  };

  useEffect(() => {
    async function getItems() {
      try {
        const res = await axios.get(
          "-https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete"
        );
        setItems(res.data.map((item, i) => ({ ...item, id: i + 1 })));
      } catch (err) {
        setError(
          "Failed to get autocomplete items. Check server or internet connection"
        );
      }
    }

    getItems();
  }, []);

  useEffect(() => {
    if (ranges.length === 0 || !editor) {
      return;
    }

    ranges.forEach((range) =>
      editor.markText(
        { line: 0, ch: range.from },
        { line: 0, ch: range.to },
        { className: "my-marker", atomic: true }
      )
    );
  }, [ranges, editor]);

  const calculate = async () => {
    const str = value.replaceAll(/name\s\d+/g, (match) => {
      const item = items.find((item) => item.name === match);
      return item.value;
    });

    try {
      const res = eval(str);
      setResult(res);
    } catch (err) {
      setResult("Error");
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="codemirror-wrapper">
        <CodeMirror
          value={value}
          options={options}
          onBeforeChange={(editor, data, value) => {
            setValue(value);

            const words = value.split(" ");
            const lastWord = words[words.length - 1];
            if (!lastWord) {
              return setVariants([]);
            }

            const variants = items.filter((item) =>
              item.name.toLowerCase().includes(lastWord.toLowerCase())
            );
            setVariants(variants);
          }}
          editorDidMount={(editor) => {
            setEditor(editor);
            editor.setSize(null, "auto");
          }}
        />
      </div>
      {variants.length !== 0 && (
        <ul>
          {variants.map((variant) => (
            <li key={variant.id}>
              <button
                onClick={() => {
                  const splittedValue = value.split(" ");
                  const lastWord = splittedValue[splittedValue.length - 1];
                  const lastWordIndex = value.length - lastWord.length;

                  const newValue = value.slice(0, lastWordIndex) + variant.name;
                  setValue(newValue);
                  setRanges([
                    ...ranges,
                    { from: lastWordIndex, to: newValue.length },
                  ]);
                  setVariants([]);
                }}
              >
                {variant.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div>
        <button onClick={calculate}>Calculate</button>
        <p>Result: {result}</p>
      </div>
    </div>
  );
}

export default MyEditor;
