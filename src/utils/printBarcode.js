import bwipjs from 'bwip-js';

// src/utils/printBarcode.js
export function printBarcodeSVG(printValue, value = 'LH') {
  const svg = bwipjs.toSVG({
    bcid: 'code39',
    text: printValue,
    includetext: true,
    textxalign: 'center',
    scaleX: 10,
    scaleY: 10,
    height: 40,
    paddingwidth: 0,
    paddingheight: 0,
  });

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
        .barcode-print-container { width: 100%; margin: 0; padding: 0 0.25rem; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; }
        .barcode-svg-wrapper { width: 100%; max-width: 100%; height: auto; padding: 0; box-sizing: border-box; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 0.4rem; overflow: visible; }
        .barcode-text-below { width: auto; max-width: 100%; display: block; font-size: 3rem; font-weight: 700; line-height: 1; margin-top: 0.15rem; font-family: 'Fira Mono', 'Consolas', monospace; box-sizing: border-box; overflow: hidden; white-space: nowrap; }
        .barcode-prefix { font-size: 2.5rem; font-weight: 700; line-height: 1; white-space: nowrap; flex: 0 0 auto; }
        svg { width: 100% !important; height: auto !important; max-width: 100%; max-height: 100vh; display: block; margin: 0; min-width: 0; }
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
