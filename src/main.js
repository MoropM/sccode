import './style.css'
import Split from 'split-grid'
import { encode, decode } from 'js-base64';


const $ = selector => document.querySelector(selector)??null;

const $js = $('#js')
const $html = $('#html')
const $css = $('#css')
const $iframe = $('iframe')


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

const update = () => {
  const html = $html.value
  const js = $js.value
  const css = $css.value
  

  const hashedCode = `${encode(html)}|${encode(css)}|${encode(js)}`;
  window.history.replaceState(null, null, `/${hashedCode}`);

  const htmlForPreview = createHTML({html, js, css})
  $iframe.srcdoc = htmlForPreview;
}


const init = () => {
  const {pathname} = window.location;
  const [ rawHtml, rawCss, rawJs ] = pathname.slice(1).split('%7C');
  const html = rawHtml??'';
  const css = rawCss??'';
  const js = rawJs??'';
  if(html!=='' || css!=='' || js!==''){
    $html.value = decode(html);
    $css.value = decode(css);
    $js.value = decode(js);

    update();
  }
  else {
    console.clear();
  }
}

$js.addEventListener('input', update)
$html.addEventListener('input', update)
$css.addEventListener('input', update)

init()