import { useEffect, useRef, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

import { useAutocompleteStore } from "./strores/autocomplete";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "./App.css";

import "codemirror/mode/javascript/javascript";

function MyEditor() {
  const [value, setValue] = useState(``);
  const [editor, setEditor] = useState();
  const [ranges, setRanges] = useState([]);
  const [result, setResult] = useState("--");
  const autocompleteRef = useRef();
  const codemirrorRef = useRef();

  const autocompleteState = useAutocompleteStore();

  const options = {
    mode: "javascript",
    lineWrapping: true,
  };

  useEffect(() => {
    autocompleteState.getItems();
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

  useEffect(() => {
    const handler = (e) => {
      if (
        autocompleteRef.current &&
        codemirrorRef.current &&
        !autocompleteRef.current.contains(e.target) &&
        !codemirrorRef.current.contains(e.target)
      ) {
        autocompleteState.setVariants([]);
      }
    };
    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, [autocompleteRef, codemirrorRef]);

  useEffect(() => {
    const x = Array.from(
      document.querySelectorAll("span.my-marker.cm-variable")
    ).filter((el) => el.innerText === "x");

    x.forEach((item) =>
      item.addEventListener("click", (e) => {
        const input = document.createElement("input");
        input.value = "x";
        e.target.after(input);
        e.target.innerText = "";
        input.focus();
        input.onblur = () => {
          e.target.innerText = "x";
          input.remove();
          // console.log(editor.getAllMarks());
        };
      })
    );
  }, [value]);

  const calculate = async () => {
    const str = value.replaceAll(/name\s\d+\s\|\sx/g, (match) => {
      console.log(match);
      const item = autocompleteState.items.find(
        (item) => item.name === match.replace(" | x", "")
      );
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
    <div className="container">
      {autocompleteState.error && (
        <p className="error">{autocompleteState.error}</p>
      )}
      <div className="autocomplete">
        <div className="codemirror-wrapper" ref={codemirrorRef}>
          <CodeMirror
            value={value}
            options={options}
            onBeforeChange={(editor, data, value) => {
              setValue(value);

              const words = value.split(" ");
              const lastWord = words[words.length - 1];
              if (!lastWord) {
                return autocompleteState.setVariants([]);
              }

              const variants = autocompleteState.items.filter((item) =>
                item.name.toLowerCase().includes(lastWord.toLowerCase())
              );
              autocompleteState.setVariants(variants);
            }}
            editorDidMount={(editor) => {
              setEditor(editor);
              editor.setSize(null, "auto");
              // editor.markText({}, {}, {})
              // editor.getAllMarks()
            }}
          />
        </div>
        {autocompleteState.variants.length !== 0 && (
          <ul className="autocomplete-list" ref={autocompleteRef}>
            {autocompleteState.variants.map((variant) => (
              <li key={variant.id}>
                <button
                  onClick={() => {
                    const splittedValue = value.split(" ");
                    const lastWord = splittedValue[splittedValue.length - 1];
                    const lastWordIndex = value.length - lastWord.length;

                    const newValue =
                      value.slice(0, lastWordIndex) + variant.name + " | x ";
                    setValue(newValue);
                    setRanges([
                      ...ranges,
                      { from: lastWordIndex, to: newValue.length },
                    ]);
                    autocompleteState.setVariants([]);
                  }}
                >
                  {variant.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="result-wrapper">
        <p>Result: {result}</p>
        <button onClick={calculate}>Calculate</button>
      </div>
    </div>
  );
}

export default MyEditor;
