import './style.css'
import Split from 'split-grid'
import { encode, decode } from 'js-base64';

import * as monaco from 'monaco-editor';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';


const $ = selector => document.querySelector(selector)??null;

const $js = $('#js')
const $html = $('#html')
const $css = $('#css')
const $iframe = $('iframe')


window.MonacoEnvironment = {
  getWorker(_, label) {
    if(label==='html') {
      return new HtmlWorker();
    }
  }
}

Split({
  columnGutters: [{
      track: 1,
      element: document.querySelector('.gutter-col-1'),
  }],
  rowGutters: [{
      track: 1,
      element: document.querySelector('.gutter-row-1'),
  }]
})

const {pathname} = window.location;
const [ rawHtml, rawCss, rawJs ] = pathname.slice(1).split('%7C');
let htmlVal = decode(rawHtml)??'';
let cssVal = decode(rawCss)??'';
let jsVal = decode(rawJs)??'';

const htmlEditor = monaco.editor.create($html, {
	value: htmlVal,
	language: 'html',
  theme: 'vs-dark',
  minimap: false,
});


// monaco.editor.create($html, {
// 	value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
// 	language: 'javascript'
// });

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
  const html = htmlEditor.getValue()
  const js = $js.value
  const css = $css.value

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;
  window.history.replaceState(null, null, `/${hashedCode}`);

  const htmlForPreview = createHTML({html, js, css})
  $iframe.srcdoc = htmlForPreview;
}


htmlEditor.onDidChangeModelContent(update);
// $html.addEventListener('input', update)
$js.addEventListener('input', update)
$css.addEventListener('input', update)

if(htmlVal.trim()!=='' || cssVal.trim()!=='' || jsVal.trim()!==''){
  $css.value = decode(cssVal);
  $js.value = decode(jsVal);
  update();
}



