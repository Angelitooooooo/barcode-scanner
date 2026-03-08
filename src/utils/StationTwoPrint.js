import QRCode from 'qrcode';

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}


export async function print(options = {}) {
	const qrBoxSizeMm =  41;
	const qrPaddingMm = 0.1;
	const qrOffsetXMm =  0;
	const qrOffsetYMm =  11.8;
	const qrPixelSize = Math.round(qrBoxSizeMm * 10);
	const qrMargin = options.qrMargin ?? 0;

	const data = {
		specification: options.specification ?? 'KBB1',
		quantityNumber: options.quantityNumber ?? '40(1)',
		model: options.model ?? '036J',
		manufacturingDate: options.manufacturingDate ?? '2026-02-07',
		shippingDate: options.shippingDate ?? '',
		containerNo: options.containerNo ?? 'TB08576',
		plant: options.plant ?? 'TBPC',
	};

	const qrValue =  `Spec:${data.specification};Qty:${data.quantityNumber};Model:${data.model};MfgDate:${data.manufacturingDate};ShipDate:${data.shippingDate};Container:${data.containerNo};Plant:${data.plant}`;
	const qrSvg = await QRCode.toString(qrValue, {
		type: 'svg',
		errorCorrectionLevel: 'H',
		margin: qrMargin,
		width: qrPixelSize,
		color: {
			dark: '#000000',
			light: '#FFFFFF',
		},
	});

	const printWindow = window.open('', '', 'width=900,height=900');
	if (!printWindow) {
		throw new Error('Unable to open print window.');
	}

	const safe = {
		specification: escapeHtml(data.specification),
		quantityNumber: escapeHtml(data.quantityNumber),
		model: escapeHtml(data.model),
		manufacturingDate: escapeHtml(data.manufacturingDate),
		shippingDate: escapeHtml(data.shippingDate),
		containerNo: escapeHtml(data.containerNo),
		plant: escapeHtml(data.plant),
	};

	printWindow.document.write(`
		<html>
		<head>
			<title>Station Two Label</title>
			<style>
				@page {
					size: 100mm 100mm;
					margin: 0;
				}

				html,
				body {
					width: 100mm;
					height: 100mm;
					margin: 0;
					padding: 0;
				}

				body {
					font-family: Arial, Helvetica, sans-serif;
					background: #e7e7e7;
					color: #111;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.label {
					width: 95mm;
					height: 95mm;
					padding: 4.6mm 4mm 4.2mm 4mm;
					box-sizing: border-box;
					display: grid;
					grid-template-columns: 1fr 44mm;
					grid-template-rows: auto 1fr;
					column-gap: 2.6mm;
					row-gap: 1.8mm;
				}

				.header {
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: auto auto;
					align-items: center;
					justify-content: center;
					column-gap: 4.4mm;
					margin-top: 1.4mm;
					padding-bottom: 6.8mm;
					text-align: center;
				}

				.header .title {
					font-size: 6.6mm;
					font-weight: 600;
					line-height: 1;
					white-space: nowrap;
				}

				.header .value {
					font-size: 16.5mm;
					font-weight: 700;
					line-height: 1;
					letter-spacing: 0.05mm;
				}

				.left {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: flex-start;
					gap: 2.2mm;
					padding-top: 0.2mm;
					font-family: 'Arial Narrow', 'Helvetica Neue', Arial, Helvetica, sans-serif;
					letter-spacing: -0.02mm;
				}

				.details-table {
					display: table;
					margin: 0 auto;
				}

				.details-row {
					display: table-row;
				}

				.details-label,
				.details-colon,
				.details-value {
					display: table-cell;
					white-space: nowrap;
					vertical-align: baseline;
					font-size: 5.85mm;
					font-weight: 500;
				}

				.details-label {
					text-align: right;
					padding-right: 0.5mm;
				}

				.details-colon {
					text-align: center;
					padding: 0 0.6mm;
				}

				.details-value {
					text-align: left;
				}

				.details-row:not(:last-child) .details-label,
				.details-row:not(:last-child) .details-colon,
				.details-row:not(:last-child) .details-value {
					padding-bottom: 3.6mm;
				}

				.details-row.qty .details-label {
					font-size: 5.85mm;
				}

				.details-row.qty .details-value {
					font-size: 10.2mm;
					font-weight: 700;
					line-height: 1;
				}

				.plant {
					margin-top: 4.4mm;
					font-size: 8.5mm;
					font-weight: 500;
					letter-spacing: 0.06mm;
				}

				.qr-box {
					align-self: start;
					justify-self: center;
					margin-left: ${qrOffsetXMm}mm;
					margin-top: ${qrOffsetYMm}mm;
					width: ${qrBoxSizeMm}mm;
					height: ${qrBoxSizeMm}mm;
					background: #dfdfdf;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: ${qrPaddingMm}mm;
					box-sizing: border-box;
				}

				.qr-box svg {
					width: 100% !important;
					height: 100% !important;
					display: block;
				}
			</style>
		</head>
		<body>
			<div class="label">
				<div class="header">
					<div class="title">Specification:</div>
					<div class="value">${safe.specification}</div>
				</div>

				<div class="left">
					<div class="details-table">
						<div class="details-row qty">
							<span class="details-label">Quantity/Number</span>
							<span class="details-colon">:</span>
							<span class="details-value">${safe.quantityNumber}</span>
						</div>
						<div class="details-row">
							<span class="details-label">Model</span>
							<span class="details-colon">:</span>
							<span class="details-value">${safe.model}</span>
						</div>
						<div class="details-row">
							<span class="details-label">Manufacturing Date</span>
							<span class="details-colon">:</span>
							<span class="details-value">${safe.manufacturingDate}</span>
						</div>
						<div class="details-row">
							<span class="details-label">Shipping Date</span>
							<span class="details-colon">:</span>
							<span class="details-value">${safe.shippingDate}</span>
						</div>
						<div class="details-row">
							<span class="details-label">Container No.</span>
							<span class="details-colon">:</span>
							<span class="details-value">${safe.containerNo}</span>
						</div>
					</div>
					<div class="plant">${safe.plant}</div>
				</div>

				<div class="qr-box">${qrSvg}</div>
			</div>

			<script>
				window.onload = function () {
					window.focus();
					window.print();
				};

				window.onafterprint = function () {
					window.close();
				};
			</script>
		</body>
		</html>
	`);

	printWindow.document.close();
}
