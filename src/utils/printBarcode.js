import JsBarcode from 'jsbarcode';

// src/utils/printBarcode.js
export function printBarcodeSVG(printValue, value = 'LH') {
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svgElement, printValue, {
    format: 'CODE39',
    lineColor: '#000',
    width: 5,
    height: 85,
    displayValue: true,
    fontSize: 35,
    fontOptions: 'bold'
  });

  const textElement = svgElement.querySelector('text');
  if (textElement) {
    const svgWidth = svgElement.viewBox?.baseVal?.width || parseFloat(svgElement.getAttribute('width'));
    if (svgWidth) {
      const stretchRatio = 0.9;
      const textWidth = svgWidth * stretchRatio;
      const offsetX = (svgWidth - textWidth) / 2;
      textElement.setAttribute('x', String(offsetX));
      textElement.setAttribute('text-anchor', 'start');
      textElement.setAttribute('textLength', String(textWidth));
      textElement.setAttribute('lengthAdjust', 'spacing');
    }
  }

  let svg = svgElement.outerHTML;
  const printWindow = window.open('', '', 'width=400,height=300');
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        @page { margin: 0; }
        html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif; }
        .barcode-value { font-size: 1.1rem; margin: 0 0 0.2rem 0; font-family: 'Fira Mono', 'Consolas', monospace; text-align: center; width: 100%; }
        .barcode-svg-wrapper { width: 100vw; height: 100vh; padding: 0 0.5rem; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 0.2rem; overflow: hidden; }
        .barcode-prefix { font-size: 5rem; font-weight: 700; line-height: 1; white-space: nowrap; }
        svg { width: auto !important; height: auto !important; max-width: calc(100vw - 2.5rem); max-height: 100vh; display: block; margin: 0; }
      </style>
    </head>
    <body>
      <div class="barcode-svg-wrapper" style="margin-top: -1rem;">${svg}<span class="barcode-prefix">${value}</span></div>
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
