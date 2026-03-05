import bwipjs from 'bwip-js';

// src/utils/printBarcode.js
export function printBarcodeSVG(printValue, value = 'LH') {
  const svg = bwipjs.toSVG({
    bcid: 'code39',
    text: printValue,
    linecolor: '000000',
    includetext: true,
    scaleX: 9,
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
        .barcode-print-container { width: 70mm; height: 20mm; margin: 0; padding: 0; display: grid; grid-template-columns: auto auto; justify-content: center; column-gap: 0.8mm; align-items: center; box-sizing: border-box; overflow: hidden; }
        .barcode-main-column { min-width: 0; width: 100%; display: inline-flex; flex-direction: column; align-items: flex-end; justify-content: center; }
        .barcode-svg-wrapper { width: 100%; max-width: 69mm; height: auto; padding: 0; margin-right: 0; box-sizing: border-box; display: block; overflow: hidden; }
        .barcode-prefix { font-size: 2.2rem; font-weight: 700; line-height: 0.9; white-space: nowrap; margin: 0; }
        svg { width: 100% !important; height: 9.5mm !important; max-width: 69mm; max-height: 9.5mm; display: block; margin: 0; min-width: 0; }
      </style>
    </head>
    <body>
      <div class="barcode-print-container">
        <div class="barcode-main-column">
          <div class="barcode-svg-wrapper">${svg}</div>
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
