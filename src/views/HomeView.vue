<template>
  <div class="scanner-container">
    <div class="scanner-columns">
      <div class="scanner-left">
        <div class="scanner-card">
          <div class="scanner-header">
            <span class="scanner-icon">&#128439;</span>
            <h1>Barcode Scanner</h1>
          </div>
          <!-- Hidden input for barcode scanner -->
          <input
            ref="barcodeInput"
            v-model="barcode"
            @keydown.enter="handleBarcode"
            @blur="focusInput"
            class="barcode-input"
            autocomplete="off"
          />
          <div v-if="lastScanned" class="result-card">
            <h2>Last Scanned Barcode</h2>
            <div class="barcode-value">{{ lastScanned }}</div>
            <div class="barcode-svg-wrapper">
              <svg ref="barcodeSvg"></svg>
            </div>
            <button class="print-btn" @click="printBarcode">Print Barcode</button>
          </div>
        </div>
      </div>
      <div class="scanner-right">
        <div class="history-table-wrapper">
          <h2>Scan History</h2>
          <table class="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Barcode</th>
                <th>Time</th>
              </tr>
            </thead>
              <tbody>
                <tr v-for="(item, idx) in paginatedHistory" :key="item.time">
                  <td>{{ scanHistory.length - ((currentPage-1)*pageSize + idx) }}</td>
                  <td>{{ item.value }}</td>
                  <td>{{ item.time }}</td>
                </tr>
                <tr v-for="n in emptyRows" :key="'empty-'+n">
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
          </table>
          <div class="pagination-wrapper" v-if="totalPages > 1">
            <button class="pagination-btn" :disabled="currentPage === 1" @click="prevPage">Prev</button>
            <span class="pagination-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="pagination-btn" :disabled="currentPage === totalPages" @click="nextPage">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode';
import { printBarcodeSVG } from '@/utils/printBarcode';

export default {
  name: 'HomeView',
data() {
    return {
      barcode: '',
      lastScanned: '',
      scanHistory: [],
      midnightCleanupTimeoutId: null,
      midnightCleanupIntervalId: null,
      currentPage: 1,
      pageSize: 5
    };
},
  mounted() {
    this.focusInput();
    this.clearStorageIfNewDay();
    this.scheduleMidnightCleanup();
    // Load scan history from localStorage
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      try {
        this.scanHistory = JSON.parse(saved);
        if (this.scanHistory.length > 0) {
          this.lastScanned = this.scanHistory[0].value;
        }
      } catch (e) {
        this.scanHistory = [];
      }
    }
  },
  beforeUnmount() {
    if (this.midnightCleanupTimeoutId) {
      clearTimeout(this.midnightCleanupTimeoutId);
      this.midnightCleanupTimeoutId = null;
    }
    if (this.midnightCleanupIntervalId) {
      clearInterval(this.midnightCleanupIntervalId);
      this.midnightCleanupIntervalId = null;
    }
  },
  updated() {
    this.renderBarcode();
  },
  methods: {
    clearStorageIfNewDay() {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const lastCleanupDate = localStorage.getItem('lastCleanupDate');

      if (lastCleanupDate !== todayKey) {
        localStorage.removeItem('scanHistory');
        localStorage.removeItem('printSequenceCounter');
        this.scanHistory = [];
        this.lastScanned = '';
        this.currentPage = 1;
      }

      localStorage.setItem('lastCleanupDate', todayKey);
    },
    scheduleMidnightCleanup() {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();

      this.midnightCleanupTimeoutId = setTimeout(() => {
        this.clearStorageIfNewDay();
        this.midnightCleanupIntervalId = setInterval(() => {
          this.clearStorageIfNewDay();
        }, 24 * 60 * 60 * 1000);
      }, delay);
    },
    printBarcode() {
      const latestHistory = this.scanHistory[0];
      const printValue = latestHistory && latestHistory.value === this.lastScanned
        ? latestHistory.barcode
        : this.buildPrintValue(this.lastScanned, this.getNextSequencePrefix(this.lastScanned));
      let position = this.lastScanned.slice(4,6)

      printBarcodeSVG(printValue, position);
    },
    getNextSequencePrefix(scannedValue) {
      const relatedRecords = this.scanHistory.filter(item => item.value === scannedValue);
      if (relatedRecords.length === 0) {
        return 'C0001';
      }

      const maxSequence = relatedRecords.reduce((max, item) => {
        const match = /^C(\d{4})/.exec(item.barcode || '');
        const parsed = match ? Number(match[1]) : 0;
        return parsed > max ? parsed : max;
      }, 0);

      const nextSequence = maxSequence >= 9999 ? 1 : maxSequence + 1;
      return `C${String(nextSequence).padStart(4, '0')}`;
    },
    buildPrintValue(currentScanned, codePrefix) {
      const value = currentScanned.slice(4,5)
      const date = new Date();
      const year = date.getFullYear().toString().replace('202', '');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${codePrefix}${year}${month}${day}31${value}`
    },
    focusInput() {
      this.$refs.barcodeInput && this.$refs.barcodeInput.focus();
    },
    handleBarcode() {
      if (this.barcode) {
        this.lastScanned = this.barcode;
        let printValue = this.buildPrintValue(this.lastScanned, this.getNextSequencePrefix(this.barcode))

        this.scanHistory.unshift({
          value: this.barcode,
          barcode: printValue,
          time: new Date().toLocaleString()
        });
        // Save to localStorage
        localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
        // Print after scan
        this.$nextTick(() => {
          this.printBarcode();
        });
        this.barcode = '';
        // If new record on first page, stay on first page
        if (this.currentPage !== 1) this.currentPage = 1;
      }
      this.focusInput();
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    renderBarcode() {
      if (this.lastScanned && this.$refs.barcodeSvg) {
        const latestHistory = this.scanHistory[0];
        const printValue = latestHistory && latestHistory.value === this.lastScanned
          ? latestHistory.barcode
          : this.buildPrintValue(this.lastScanned, 'C0001');
        JsBarcode(this.$refs.barcodeSvg, printValue, {
          format: 'CODE39',
          lineColor: '#000',
          width: 2,
          height: 60,
          displayValue: true
        });
      } else if (this.$refs.barcodeSvg) {
        this.$refs.barcodeSvg.innerHTML = '';
      }
    }
  },
computed: {
  paginatedHistory() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.scanHistory.slice(start, start + this.pageSize);
  },
  totalPages() {
    return Math.ceil(this.scanHistory.length / this.pageSize) || 1;
  },
  emptyRows() {
    return this.pageSize - this.paginatedHistory.length;
  }
}
}
</script>
<style>

body {
  background: #f4f6fb;
}



.scanner-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #f4f6fb 100%);
  padding: 2rem 0 0 0;
  margin-top: 0;
}

.scanner-columns {
  display: flex;
  flex-direction: row;
  gap: 15rem;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
  align-items: stretch;
  background: rgba(255,255,255,0.01);
}

.scanner-left {
  flex: 1 1 400px;
  max-width: 440px;
  min-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.scanner-right {
  flex: 1 1 500px;
  min-width: 340px;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.scanner-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04);
  padding: 2.8rem 2.8rem 2.2rem 2.8rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 260px;
  justify-content: center;
}

.scanner-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.scanner-icon {
  font-size: 2.5rem;
  color: #6366f1;
}

.result-card {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1.5rem 1.7rem;
  margin-top: 1.2rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.result-card h2 {
  margin: 0 0 0.7rem 0;
  font-size: 1.15rem;
  color: #64748b;
  font-weight: 600;
}
.barcode-value {
  font-size: 1.5rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  color: #0f172a;
  letter-spacing: 0.04em;
  background: #e0e7ff;
  border-radius: 7px;
  padding: 0.6rem 1.2rem;
  display: inline-block;
}
.barcode-svg-wrapper {
  margin-top: 1.3rem;
  display: flex;
  justify-content: center;
}
.print-btn {
  margin-top: 1.2rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(79,70,229,0.08);
  transition: background 0.18s;
}
.print-btn:hover {
  background: #3730a3;
}
.history-table-wrapper {
  margin-top: 2.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.7);
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.history-table-wrapper h2 {
  font-size: 1.13rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.7rem;
  align-self: flex-start;
}
.history-table {
  width: 100%;
  max-width: 600px;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  margin-bottom: 1.5rem;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
  min-height: 340px;
}
.history-table th, .history-table td {
  padding: 0.95rem 1.3rem;
  text-align: left;
}
.history-table th {
  background: linear-gradient(90deg, #e0e7ff 0%, #f1f5f9 100%);
  color: #3730a3;
  font-weight: 700;
  font-size: 1.08rem;
  border-bottom: 2px solid #e0e7ff;
  letter-spacing: 0.02em;
}
.history-table tr {
  transition: background 0.18s;
}
.history-table tr:nth-child(even) {
  background: #f8fafc;
}
.history-table tr:nth-child(odd) {
  background: #fff;
}
.history-table tr:hover {
  background: #e0e7ff44;
}
.history-table td {
  font-size: 1.03rem;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;
}
.history-table td:first-child {
  font-weight: 600;
  color: #4f46e5;
}
.history-table tr:last-child td {
  border-bottom: none;
}
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.2rem;
}
.pagination-btn {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(79,70,229,0.08);
}
.pagination-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 1rem;
  color: #475569;
  font-weight: 500;
}

.scanner-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scanner-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.scanner-icon {
  font-size: 2.2rem;
  color: #4f46e5;
}

.barcode-input {
  opacity: 0;
  position: absolute;
  left: -9999px;
}

.focus-btn {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79,70,229,0.08);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.focus-btn:hover {
  background: #3730a3;
}
.btn-icon {
  font-size: 1.2rem;
}

.result-card {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin-top: 1rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.result-card h2 {
  margin: 0 0 0.7rem 0;
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 600;
}
.barcode-value {
  font-size: 1.4rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  color: #0f172a;
  letter-spacing: 0.04em;
  background: #e0e7ff;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  display: inline-block;
}
.barcode-svg-wrapper {
  margin-top: 1.2rem;
  display: flex;
  justify-content: center;
}
.history-table-wrapper {
  margin-top: 2.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-top: 1.2rem;
}
.pagination-btn {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s;
  box-shadow: 0 1px 4px rgba(79,70,229,0.08);
}
.pagination-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 1rem;
  color: #475569;
  font-weight: 500;
}
.history-table-wrapper h2 {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.7rem;
  align-self: flex-start;
}
.history-table {
  width: 100%;
  max-width: 600px;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  margin-bottom: 1.5rem;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
}
.history-table th, .history-table td {
  padding: 0.85rem 1.2rem;
  text-align: left;
}
.history-table th {
  background: linear-gradient(90deg, #e0e7ff 0%, #f1f5f9 100%);
  color: #3730a3;
  font-weight: 700;
  font-size: 1.05rem;
  border-bottom: 2px solid #e0e7ff;
  letter-spacing: 0.02em;
}
.history-table tr {
  transition: background 0.18s;
}
.history-table tr:nth-child(even) {
  background: #f8fafc;
}
.history-table tr:nth-child(odd) {
  background: #fff;
}
.history-table tr:hover {
  background: #e0e7ff44;
}
.history-table td {
  font-size: 1rem;
  color: #334155;
  border-bottom: 1px solid #e5e7eb;
}
.history-table td:first-child {
  font-weight: 600;
  color: #4f46e5;
}
.history-table tr:last-child td {
  border-bottom: none;
}
</style>
