
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js");

let pyodide;

async function initPyodide() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  self.postMessage({ type: "READY" });
}

self.onmessage = async (e) => {
  const { type, code, libraries } = e.data;

  if (type === "INIT") {
    await initPyodide();
    return;
  }

  if (type === "RUN") {
    const { inputData } = e.data;
    if (!pyodide) {
      self.postMessage({ type: "ERROR", error: "Pyodide not initialized" });
      return;
    }

    try {
      if (libraries && libraries.length > 0) {
        const micropip = pyodide.pyimport("micropip");
        for (const lib of libraries) {
          self.postMessage({ type: "STATUS", status: `Установка ${lib}...` });
          await micropip.install(lib);
        }
      }


      const { stdinBuffer } = e.data;
      const lines = (inputData || "").split("\n");
      let currentLine = 0;
      
      pyodide.setStdin({
        stdin: () => {
          if (stdinBuffer) {
            const int32Buffer = new Int32Array(stdinBuffer);
            const uint8Buffer = new Uint8Array(stdinBuffer, 8); 

            self.postMessage({ type: "INPUT_REQUEST" });

            
            Atomics.wait(int32Buffer, 0, 0);

            const length = Atomics.load(int32Buffer, 1);
            if (length === -1) return null; 

            const data = new TextDecoder().decode(uint8Buffer.slice(0, length));
            
            
            Atomics.store(int32Buffer, 0, 0);
            
            return data + "\n";
          }

          if (currentLine < lines.length) {
            const line = lines[currentLine++];
            console.log(`[WORKER] Providing stdin line ${currentLine}: ${line}`);
            return line + "\n";
          }
          return null; 
        },
      });


      pyodide.setStdout({
        batched: (text) => {
          self.postMessage({ type: "STDOUT", content: text });
        },
      });


      pyodide.setStderr({
        batched: (text) => {
          self.postMessage({ type: "STDERR", content: text });
        },
      });

      self.onInputPrompt = (prompt) => {
        self.postMessage({ type: "INPUT_PROMPT", prompt });
      };

      const setupCode = `
import builtins
import js

_orig_input = builtins.input
def _custom_input(prompt=""):
    js.onInputPrompt(str(prompt))
    return _orig_input("")
builtins.input = _custom_input
`;

      const startTime = performance.now();
      await pyodide.runPythonAsync(setupCode);
      await pyodide.runPythonAsync(code);
      const endTime = performance.now();

      self.postMessage({
        type: "SUCCESS",
        executionTime: (endTime - startTime).toFixed(2)
      });
    } catch (err) {
      self.postMessage({ type: "ERROR", error: err.message });
    }
  }
};
