import { useEffect, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import "./App.css";

import "codemirror/mode/javascript/javascript";

function MyEditor() {
  const [value, setValue] = useState(`Item 1. lalal`);
  const [items, setItems] = useState([]);
  const [editor, setEditor] = useState();
  const [variants, setVariants] = useState([]);
  const [ranges, setRanges] = useState([]);

  const options = {
    mode: "javascript",
  };

  useEffect(() => {
    async function getItems() {
      const res = await fetch(
        "https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete"
      );
      const data = await res.json();
      setItems(data.map((item, i) => ({ ...item, id: i + 1 })));
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

  return (
    <div>
      <div className="wrapper">
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
      {/* <div>
        <button>Calculate</button>
        <p>Result: </p>
      </div> */}
    </div>
  );
}

export default MyEditor;
