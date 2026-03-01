// src/utils/printBarcode.js
export function printBarcodeSVG(svgElement) {
  let svg = svgElement.outerHTML;
  // Set SVG size to 70x40mm
  // Remove any existing width/height and set correct viewBox and size
  svg = svg.replace(/<svg[^>]+/, '<svg width="70mm" height="40mm" viewBox="0 0 700 400" preserveAspectRatio="xMidYMid meet"');
  const printWindow = window.open('', '', 'width=400,height=300');
  printWindow.document.write(`
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        @page { size: 70mm 40mm; margin: 0; }
        html, body { width: 70mm; height: 40mm; margin: 0; padding: 0; }
        body { display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Arial, sans-serif; }
        .barcode-value { font-size: 1.1rem; margin: 0 0 0.2rem 0; font-family: 'Fira Mono', 'Consolas', monospace; text-align: center; width: 100%; }
        .barcode-svg-wrapper { width: 70mm; height: 32mm; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        svg { width: 68mm !important; height: 30mm !important; display: block; margin: 0 auto; }
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
