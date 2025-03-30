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
const $btnCopyUrl = $('#btnCopyUrl')
const $viewEditors = $('#viewEditors')

let htmlEditor = null, jsEditor = null, cssEditor = null;
const OPTIONS_EDITORS = {
  fontSize: 14,
  lineNumbers: 'on',
  lineNumbersMinChars: 2,
  tabSize: 4,
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
    top: 19
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
const [ rawHtml, rawCss, rawJs ] = pathname.includes('%7C')?pathname.slice(1).split('%7C'):pathname.slice(1).split('|');
let htmlVal = rawHtml??'';
htmlVal =  htmlVal.trim()!=''?decode(htmlVal):'';
let cssVal = rawCss??''; 
cssVal =  cssVal.trim()!=''?decode(cssVal):'';
let jsVal = rawJs??'';
jsVal =  jsVal.trim()!=''?decode(jsVal):'';


const fechingAsync = async (uriData) => {
  let headersList = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  let bodyContent = JSON.stringify({
    "url": uriData
  });
  const response = await fetch("https://api-shorturi.moropm.com/api/shorten-url", { 
    method: "POST",
    body: bodyContent,
    headers: headersList
  });
  const data = await response.json();
  return data;
}

const initSplit = (typeSplit = 'grid', numCols = 3) => {
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

const initEditors = (especificEditor='') => {
  if(especificEditor===''){
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
  }
  else {
    const editors = document.querySelectorAll('.editor')??null;
    editors.forEach(el=>{
      if(htmlEditor!==null)htmlEditor.dispose(); // Elimina la instancia y libera recursos
      if(jsEditor!==null)jsEditor.dispose(); // Elimina la instancia y libera recursos
      if(cssEditor!==null)cssEditor.dispose(); // Elimina la instancia y libera recursos

      if(el.id!=especificEditor) {
        const newElementSelector = document.querySelector(`#${el.id}`);
        const newEditorEl = monaco.editor.create(newElementSelector, {
          value: el.id=='html'?htmlVal:el.id=='js'?jsVal:cssVal,
          language: el.id=='js'?'javascript':el.id,
          ...OPTIONS_EDITORS,
        });
        if(el.id==='html') htmlEditor = newEditorEl;
        if(el.id==='js') jsEditor = newEditorEl;
        if(el.id==='css') cssEditor = newEditorEl;
      }
    });
  }
  
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
  console.clear();
}

const newAlert = (element, msg = `Link copiado al portapapeles`, typeAlert = 'success') => {
  const alert = document.createElement('div');
  alert.classList.add('alert', 'show', typeAlert);
  alert.innerHTML = msg;
  element.parentNode.appendChild(alert);
  element.classList.add('active');
  setTimeout(()=>element.classList.remove('active'), 600);
  setTimeout(()=>alert.classList.remove('show'), 1500);
  setTimeout(()=>alert.remove(), 1900);
}
window.addEventListener('DOMContentLoaded', () => {
  if(window.screen.width>=768){initSplit();}
  if(window.screen.width<768 && window.screen.width>=550){
    initSplit('horizontal')
  }
  if(window.screen.width<550){
    document.querySelector('.split').classList.add('split_vertical');
    document.querySelector('#app').classList.add('vertical');
    $prevUniqIFrame.classList.add('vertical');
    initSplit('vertical')
  }
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

  if($btnCopyUrl!==null){
    $btnCopyUrl.addEventListener('click', ()=>{
      const promNewUri = new Promise( (resolve, reject) => {
        fechingAsync(window.location.href).then(result=>resolve(result)).catch(error=>reject(error));
      })
      promNewUri.then(response=>{
        const { status, message, description, data } = response;
        if(status && 'url' in data ) {
          navigator.clipboard.writeText(data.url);
          newAlert($btnCopyUrl);
        }
        else {
          navigator.clipboard.writeText(window.location.href);
          newAlert($btnCopyUrl, message, 'warning');
        }
      }).catch(error=>{
        console.log(error);
        navigator.clipboard.writeText(window.location.href);
        newAlert($btnCopyUrl, 'La url no se pude acortar', 'error');
      });
    });
  }
  // if($viewEditors!==null){
  //   $viewEditors.addEventListener('change', (e)=>{
  //     const val = e.target.value;
  //     const editors = document.querySelectorAll('.editor')??null;
  //     if(val===''){
  //       editors.forEach(el=>el.parentNode.style.display = 'block');
  //       // return;
  //     }
  //     else {
  //       editors.forEach(el=>{
  //         const editorToHide = el.id == val ? el : null;
  //         el.parentNode.style.display = 'inherit';
  //         if(editorToHide!==null){
  //           el.parentNode.style.display = 'none';
  //           initEditors(el.id)
  //         }
  //       });
  //     }
  //   });
  // }
})



