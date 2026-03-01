// src/utils/printBarcode.js
export function printBarcodeSVG(svgElement) {
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
        .barcode-svg-wrapper { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        svg { width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%; display: block; margin: 0 auto; }
      </style>
    </head>
    <body>
      <div class="barcode-svg-wrapper">${svg}</div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
