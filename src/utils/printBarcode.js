import bwipjs from 'bwip-js';

// src/utils/printBarcode.js
export function printBarcodeSVG(printValue, value = 'LH') {
  const svg = bwipjs.toSVG({
    bcid: 'code39',
    text: printValue,
    linecolor: '000000',
    includetext: false,
    scaleX: 7,
    scaleY: 5,
    height: 26,
    paddingwidth: 0,
    paddingheight: 0,
  });

  const printWindow = window.open('', '', 'width=1200,height=800');
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        @page { size: 70mm 20mm; margin: 0; }
        html, body { width: 70mm; height: 20mm; margin: 0; padding: 0; overflow: hidden; }
        body { font-family: Arial, sans-serif; }
        .barcode-print-container { width: 70mm; height: 20mm; margin: 0; padding: 0 2mm; display: flex; flex-direction: row; align-items: flex-end; justify-content: center; gap: 0.25rem; box-sizing: border-box; overflow: hidden; }
        .barcode-main-column { display: inline-flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        .barcode-svg-wrapper { width: auto; max-width: 100%; height: auto; padding: 0; box-sizing: border-box; display: block; overflow: hidden; }
        .barcode-text-below { width: max-content; max-width: 100%; display: block; margin-top: 0.2rem; margin-left: auto; margin-right: auto; align-self: center; text-align: center; font-size: 1rem; font-weight: 900; line-height: 1; letter-spacing: 0.28em; font-family: 'Fira Mono', 'Consolas', monospace; white-space: nowrap; }
        .barcode-prefix { font-size: 3rem; font-weight: 700; line-height: 0.9; white-space: nowrap; flex: 0 0 auto; margin-bottom: 0.5rem; margin-right: 0; }
        svg { width: 220px !important; height: 45px !important; max-width: 220px; max-height: 45px; display: block; margin: 0; min-width: 0; }
      </style>
    </head>
    <body>
      <div class="barcode-print-container">
        <div class="barcode-main-column">
          <div class="barcode-svg-wrapper">${svg}</div>
          <span class="barcode-text-below">*${printValue}*</span>
        </div>
        <span class="barcode-prefix">${value}</span>
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
