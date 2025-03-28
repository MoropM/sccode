import './style.css'
import Split from 'split-grid'
// import Split from 'split.js'
import { encode, decode } from 'js-base64';

import * as monaco from 'monaco-editor';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';


const $ = selector => document.querySelector(selector)??null;

const $js = $('#js')
const $html = $('#html')
const $css = $('#css')
const $split0 = $('#split-0')
const $split1 = $('#split-1')
const $split2 = $('#split-2')
const $prevIFrame = $('#previewIFrame')
const $prevUniqIFrame = $('#previewUniqIFrame')
const $iframe = $('iframe')

let htmlEditor = null, jsEditor = null, cssEditor = null;
const OPTIONS_EDITORS = {
  fontSize: 14,
  lineNumbers: 'on',
  tabSize: 2,
  wordWrap: 'on',
  theme: 'vs-dark',
  // theme: 'hc-black',
  cursorBlinking: 'expand',
  cursorSmoothCaretAnimation: 'explicit',
  minimap: {
    enabled: false
  },
  automaticLayout: true,
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  padding: {
    top: 16
  },
  
}


window.MonacoEnvironment = {
  getWorker(_, label) {
    if(label==='html') return new HtmlWorker();
    if(label==='css') return new CssWorker();
    if(label==='javascript') return new JsWorker();
  }
}


const {pathname} = window.location;
const [ rawHtml, rawCss, rawJs ] = pathname.slice(1).split('%7C');
let htmlVal = rawHtml??'';
htmlVal =  htmlVal.trim()!=''?decode(htmlVal):'';
let cssVal = rawCss??''; 
cssVal =  cssVal.trim()!=''?decode(cssVal):'';
let jsVal = rawJs??'';
jsVal =  jsVal.trim()!=''?decode(jsVal):'';


const initSplit = (typeSplit = 'grid', numCols = 3) => {
  console.log( typeSplit, numCols );
  if(typeSplit==='grid'){
      Split({
        columnGutters: [{
            track: 1,
            element: document.querySelector('.gutter-col-1'),
        }],
        rowGutters: [{
            track: 1,
            element: document.querySelector('.gutter-row-1'),
        }]
      });
      return;
  }

  import('./split_vh.js').then(module => {
    module.default(typeSplit, numCols);
  })
}

const initEditors = () => {
  htmlEditor = monaco.editor.create($html, {
    value: htmlVal,
    language: 'html',
    ...OPTIONS_EDITORS,
  });

  jsEditor = monaco.editor.create($js, {
    // value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
    value: jsVal,
    language: 'javascript',
    ...OPTIONS_EDITORS,
  });
  
  cssEditor = monaco.editor.create($css, {
    value: cssVal,
    language: 'css',
    ...OPTIONS_EDITORS,
  });
  
  if(window.screen.width>=768){
    document.querySelector('.split').style.display = 'none';
    $prevUniqIFrame.style.display = 'none';
  }
  if(window.screen.width<768){
    document.querySelector('.grid').style.display = 'none';
    $split0.appendChild($html);
    $split1.appendChild($js);
    $split2.appendChild($css);
  }
}

/** Creación del HTML que se mostrará en el iFrame
 * 
 * @param {*} param0 
 * @returns 
 */
const createHTML = ({html, js, css}) => {
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          scrollbar-width: thin;
        }
      ${css}</style>
    </head>
    <body>
      ${html}
      <script type="text/javascript">
        ${js}
      </script>
    </body>
  </html>
  `
}

/** Función para inicializar el HTML a visualizar ya renderizado
 * 
 */
const update = () => {
  const html = htmlEditor.getValue() // $html.value
  const js = jsEditor.getValue() // $js.value
  const css = cssEditor.getValue() // $css.value

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;
  window.history.replaceState(null, null, `/${hashedCode}`);

  const htmlForPreview = createHTML({html, js, css})
  $iframe.srcdoc = htmlForPreview;
  window.screen.width<768?$prevUniqIFrame.appendChild($iframe):$prevIFrame.appendChild($iframe);
}

window.addEventListener('DOMContentLoaded', () => {
  console.info(  window.screen.width  );
  window.screen.width<768?initSplit('horizontal'):initSplit();
  // initSplit()
  initEditors()

  htmlEditor.onDidChangeModelContent(update);
  // $html.addEventListener('input', update)
  jsEditor.onDidChangeModelContent(update);
  // $js.addEventListener('input', update)
  cssEditor.onDidChangeModelContent(update)
  // $css.addEventListener('input', update)
  
  if(htmlVal.trim()!=='' || cssVal.trim()!=='' || jsVal.trim()!==''){
    update();
  }

})



