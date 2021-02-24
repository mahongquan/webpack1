rem node_modules\.bin\webpack src/index.js dist/bundle.js
esbuild --bundle src\index.js --outfile=main.js --loader:.js=jsx