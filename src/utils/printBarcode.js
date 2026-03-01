import JsBarcode from 'jsbarcode';

// src/utils/printBarcode.js
export function printBarcodeSVG(printValue, value = 'LH') {
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svgElement, printValue, {
    format: 'CODE39',
    lineColor: '#000',
    width: 10,
    height: 400,
    margin: 0,
    displayValue: true,
    fontSize: 140,
    fontOptions: 'bold',
    textMargin: 20,
  });

  const textElement = svgElement.querySelector('text');
  if (textElement) {
    const svgWidth = svgElement.viewBox?.baseVal?.width || parseFloat(svgElement.getAttribute('width')) || 0;
    if (svgWidth > 0) {
      const stretchWidth = svgWidth * 0.96;
      const startX = (svgWidth - stretchWidth) / 2;
      textElement.setAttribute('x', String(startX));
      textElement.setAttribute('text-anchor', 'start');
      textElement.setAttribute('textLength', String(stretchWidth));
      textElement.setAttribute('lengthAdjust', 'spacing');
    }
  }


  let svg = svgElement.outerHTML;
  const printWindow = window.open('', '', 'width=1200,height=800');
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        @page { margin: 0; }
        html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif; }
        .barcode-value { font-size: 1.1rem; margin: 0 0 0.2rem 0; font-family: 'Fira Mono', 'Consolas', monospace; text-align: center; width: 100%; }
        .barcode-print-container { width: 100%; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; }
        .barcode-svg-wrapper { width: 100%; max-width: 100%; height: auto; padding: 0 0.5rem; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 0.4rem; overflow: visible; }
        .barcode-text-below { width: auto; max-width: 100%; display: block; font-size: 3rem; font-weight: 700; line-height: 1; margin-top: 0.15rem; font-family: 'Fira Mono', 'Consolas', monospace; box-sizing: border-box; overflow: hidden; white-space: nowrap; }
        .barcode-prefix { font-size: 5rem; font-weight: 700; line-height: 1; white-space: nowrap; flex: 0 0 auto; }
        svg { width: calc(100% - 4.5rem) !important; height: auto !important; max-width: calc(100% - 4.5rem); max-height: 100vh; display: block; margin: 0; flex: 1 1 auto; min-width: 0; }
      </style>
    </head>
    <body>
      <div class="barcode-print-container">
        <div class="barcode-svg-wrapper">${svg}<span class="barcode-prefix">${value}</span></div>
      </div>
      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
        window.onafterprint = function() {
            window.close();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
