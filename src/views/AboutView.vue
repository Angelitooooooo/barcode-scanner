<template>
  <div class="about">
    <h1>Station Two Label</h1>
    <button class="print-btn" @click="printStationTwoLabel">
      Print Station Two Label
    </button>
  </div>
</template>

<script>
import { print } from '@/utils/StationTwoPrint';

export default {
  name: 'AboutView',
  methods: {
    printStationTwoLabel() {
      // Do not pass qrValue so the utility builds QR payload from field data.
      print({
        specification: 'KBA1',
        quantityNumber: '40(1)',
        model: '036J',
        manufacturingDate: '2026-03-20',
        shippingDate: '',
        containerNo: '',
        plant: 'TBPC',
        });
    },
  },
};
</script>

<style scoped>
.about {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.print-btn {
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: #1f5eff;
  color: #fff;
}

.print-btn:hover {
  background: #174ad0;
}
</style>
