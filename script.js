// script.js - shared logic (unchanged calculation logic, adapted for Ultra-Vibrant UI)
(() => {
  const lengthUnits = ["Meter","Centimeter","Foot","Inch","Nol","Haat"];
  const areaUnits = ["Square Meter","Square Centimeter","Square Foot","Square Inch","Hectare","Acre","Bigha","Kear","Josti","Raak","Fon","Kear_Josti_Raak_Fon","Kata"];

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  function showToast(msg, time=1600){
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    t.style.display = 'block';
    clearTimeout(t._to);
    t._to = setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.style.display='none',220); }, time);
  }

  function lengthToMeters(v, unit){
    v = Number(v) || 0;
    switch(unit){
      case 'Meter': return v;
      case 'Centimeter': return v * 0.01;
      case 'Foot': return v * 0.3048;
      case 'Inch': return v * 0.0254;
      case 'Nol': return v * 3.6576;
      case 'Haat': return v * 0.4572;
      default: return v;
    }
  }

  function formatArea(squareMeters, areaUnit){
    const m2 = squareMeters;
    switch(areaUnit){
      case 'Square Meter': return `${m2.toFixed(2)} m²`;
      case 'Square Centimeter': return `${(m2*10000).toFixed(1)} cm²`;
      case 'Square Foot': return `${(m2*10.7639).toFixed(2)} ft²`;
      case 'Square Inch': return `${(m2*1550.0031).toFixed(1)} in²`;
      case 'Hectare': return `${(m2/10000).toFixed(5)} ha`;
      case 'Acre': return `${(m2/4046.86).toFixed(5)} acre`;
      case 'Bigha': return `${(m2/1600).toFixed(5)} bigha`;
      case 'Kear': return `${(m2/(0.4572*0.4572*8*8*4*28)).toFixed(4)} kear`;
      case 'Josti': return `${(m2/(0.4572*0.4572*8*8*4)).toFixed(3)} josti`;
      case 'Raak': return `${(m2/(0.4572*0.4572*8*8)).toFixed(3)} raak`;
      case 'Fon': return `${(m2/(0.4572*0.4572)).toFixed(2)} fon`;
      case 'Kear_Josti_Raak_Fon': {
        const kearArea = (0.4572*0.4572*8*8*4*28);
        const jostiArea = (0.4572*0.4572*8*8*4);
        const raakArea = (0.4572*0.4572*8*8);
        const fonArea = (0.4572*0.4572);
        let remaining = m2;
        const k = Math.floor(remaining / kearArea); remaining -= k * kearArea;
        const j = Math.floor(remaining / jostiArea); remaining -= j * jostiArea;
        const r = Math.floor(remaining / raakArea); remaining -= r * raakArea;
        const f = (remaining / fonArea);
        return `${k} Kear, ${j} Josti, ${r} Raak, ${f.toFixed(2)} Fon`;
      }
      case 'Kata': return `${(m2/100).toFixed(3)} kata`;
      default: return `${m2.toFixed(2)} m²`;
    }
  }

  function calcAmount(squareMeters, multiplier, rate, rateAreaUnit){
    const op = Number(multiplier) || 0;
    const pr = Number(rate) || 0;
    switch(rateAreaUnit){
      case 'Square Meter': return `${(op * pr * squareMeters).toFixed(2)} (₹) for ${(op * squareMeters).toFixed(2)} m²`;
      case 'Square Centimeter': return `${(op * pr * squareMeters * 10000).toFixed(2)} (₹) for ${(op * squareMeters * 10000).toFixed(1)} cm²`;
      case 'Square Foot': return `${(op * pr * squareMeters * 10.7639).toFixed(2)} (₹) for ${(op * squareMeters * 10.7639).toFixed(2)} ft²`;
      case 'Square Inch': return `${(op * pr * squareMeters * 1550.0031).toFixed(2)} (₹) for ${(op * squareMeters * 1550.0031).toFixed(1)} in²`;
      case 'Hectare': return `${(op * pr * squareMeters / 10000).toFixed(2)} (₹) for ${(op * squareMeters / 10000).toFixed(5)} ha`;
      case 'Acre': return `${(op * pr * squareMeters / 4046.86).toFixed(2)} (₹) for ${(op * squareMeters / 4046.86).toFixed(5)} acre`;
      case 'Bigha': return `${(op * pr * squareMeters / 1600).toFixed(2)} (₹) for ${(op * squareMeters / 1600).toFixed(5)} bigha`;
      default: return `${(op * pr * squareMeters).toFixed(2)} (₹) for ${(op * squareMeters).toFixed(2)} m²`;
    }
  }

  const HISTORY_KEY = 'landCalculatorHistory_v1';
  const SPINNER_KEY = 'landCalculatorSpinner_v1';
  const LAST_RESULT = 'landCalculatorLastResult_v1';

  function saveSpinnerState(state){ localStorage.setItem(SPINNER_KEY, JSON.stringify(state)); }
  function loadSpinnerState(){ try{ return JSON.parse(localStorage.getItem(SPINNER_KEY) || '{}'); }catch(e){return {};} }
  function pushHistory(entry){ const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); arr.unshift(entry); localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }
  function readHistory(){ return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }

  // INDEX page
  window.pageInit_index = function(){
    const mapSel = (sel, arr) => {
      const el = document.getElementById(sel);
      if(!el) return;
      el.innerHTML = arr.map(x => `<option value="${x}">${x}</option>`).join('');
    };
    mapSel('lengthAUnit', lengthUnits);
    mapSel('lengthBUnit', lengthUnits);
    mapSel('breadthAUnit', lengthUnits);
    mapSel('breadthBUnit', lengthUnits);
    mapSel('rateAreaUnit', areaUnits);

    const st = loadSpinnerState();
    ['lengthAUnit','lengthBUnit','breadthAUnit','breadthBUnit','rateAreaUnit'].forEach(k=>{
      if(st[k]) {
        const el = document.getElementById(k);
        if(el) el.value = st[k];
      }
    });

    const calcBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const goHistory = document.getElementById('goHistory');
    const preview = document.getElementById('preview');
    const fabTop = document.getElementById('fabTop');

    calcBtn.addEventListener('click', ()=> {
      const lengthA = document.getElementById('lengthA').value;
      const lengthB = document.getElementById('lengthB').value;
      const breadthA = document.getElementById('breadthA').value;
      const breadthB = document.getElementById('breadthB').value;
      const lengthAUnit = document.getElementById('lengthAUnit').value;
      const lengthBUnit = document.getElementById('lengthBUnit').value;
      const breadthAUnit = document.getElementById('breadthAUnit').value;
      const breadthBUnit = document.getElementById('breadthBUnit').value;
      const multiplier = document.getElementById('multiplier').value || '1';
      const rate = document.getElementById('rate').value || '0';
      const rateAreaUnit = document.getElementById('rateAreaUnit').value;

      if([lengthA,lengthB,breadthA,breadthB].some(v => v === '' || isNaN(v))){
        showToast('Enter valid numbers for lengths and breadths.');
        preview.value = '⚠ Please fill numeric inputs for all length and breadth fields.';
        return;
      }

      const lMeters = lengthToMeters(lengthA, lengthAUnit) + lengthToMeters(lengthB, lengthBUnit);
      const bMeters = lengthToMeters(breadthA, breadthAUnit) + lengthToMeters(breadthB, breadthBUnit);
      const areaM2 = lMeters * bMeters;

      const areaFormatted = formatArea(areaM2, 'Square Meter');
      const areaInUnit = formatArea(areaM2, rateAreaUnit);
      const amountFormatted = calcAmount(areaM2, multiplier, rate, rateAreaUnit);
      const now = new Date().toLocaleString();

      const bundle = {
        length: {a: lengthA, aUnit: lengthAUnit, b: lengthB, bUnit: lengthBUnit},
        breadth: {a: breadthA, aUnit: breadthAUnit, b: breadthB, bUnit: breadthBUnit},
        multiplier, rate, rateAreaUnit,
        areaMeters: areaM2,
        areaDisplay: areaFormatted,
        areaInRateUnit: areaInUnit,
        amountDisplay: amountFormatted,
        computedAt: now
      };

      sessionStorage.setItem(LAST_RESULT, JSON.stringify(bundle));
      saveSpinnerState({
        lengthAUnit:lengthAUnit, lengthBUnit:lengthBUnit,
        breadthAUnit:breadthAUnit, breadthBUnit:breadthBUnit,
        rateAreaUnit:rateAreaUnit
      });

      preview.value = `Area (m²): ${areaM2.toFixed(3)}\nArea (${rateAreaUnit}): ${areaInUnit}\nAmount: ${amountFormatted}\n\nOpening result page...`;
      showToast('Calculated — opening result');
      setTimeout(()=> location.href = 'result.html', 650);
    });

    clearBtn.addEventListener('click', ()=> {
      ['lengthA','lengthB','breadthA','breadthB','multiplier','rate'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
      preview.value = '';
      showToast('Inputs cleared');
    });

    goHistory.addEventListener('click', ()=> location.href = 'history.html');
    if(fabTop){
      fabTop.addEventListener('click', ()=> {
        ['lengthA','lengthB','breadthA','breadthB','multiplier','rate'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
        preview.value = '';
        showToast('Ready for new calculation');
        window.scrollTo({top:0, behavior:'smooth'});
      });
    }
  };

  // RESULT page
  window.pageInit_result = function(){
    const container = document.getElementById('resultSummary');
    const saveBtn = document.getElementById('saveToHistory');
    const backBtn = document.getElementById('backToCalc');
    const openHistory = document.getElementById('openHistory');

    const raw = sessionStorage.getItem(LAST_RESULT);
    if(!raw){
      container.innerHTML = `<div class="muted">No recent calculation found. Go to Calculator and compute first.</div>`;
      if(saveBtn) saveBtn.disabled = true;
      return;
    }
    const bundle = JSON.parse(raw);

    function renderBundle(b){
      return `
        <div class="row" style="gap:18px;align-items:flex-start;">
          <div style="flex:1">
            <div class="muted">Computed at</div>
            <div style="font-weight:700;margin-bottom:8px;color:var(--text-1)">${b.computedAt}</div>

            <div class="muted">Length</div>
            <div style="margin-bottom:8px">${b.length.a} ${b.length.aUnit} + ${b.length.b} ${b.length.bUnit}</div>

            <div class="muted">Breadth</div>
            <div>${b.breadth.a} ${b.breadth.aUnit} + ${b.breadth.b} ${b.breadth.bUnit}</div>
          </div>
          <div style="width:300px">
            <div class="muted">Area (m²)</div>
            <div style="font-weight:800;font-size:20px;margin-bottom:8px;color:var(--text-1)">${b.areaMeters.toFixed(3)} m²</div>

            <div class="muted">Area (${b.rateAreaUnit})</div>
            <div style="font-weight:700;margin-bottom:8px">${b.areaInRateUnit}</div>

            <div class="muted">Amount</div>
            <div style="font-weight:700">${b.amountDisplay}</div>
          </div>
        </div>
      `;
    }

    container.innerHTML = renderBundle(bundle);

    if(saveBtn){
      saveBtn.addEventListener('click', ()=>{
        const historyEntry = {...bundle, savedAt: new Date().toLocaleString()};
        pushHistory(historyEntry);
        showToast('Saved to history');
      });
    }
    if(backBtn) backBtn.addEventListener('click', ()=> location.href = 'land_calculator_lite.html');
    if(openHistory) openHistory.addEventListener('click', ()=> location.href = 'history.html');
  };

  // HISTORY page
  window.pageInit_history = function(){
    const listEl = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearHistoryBtn');
    const exportBtn = document.getElementById('exportBtn');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    function render(){
      const arr = readHistory();
      listEl.innerHTML = '';
      if(arr.length === 0){ listEl.innerHTML = `<div class="muted">No saved calculations yet.</div>`; return; }
      arr.forEach((h, idx) => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
          <div style="flex:1">
            <div style="font-weight:700;color:var(--text-1)">${h.computedAt} • ${h.savedAt || 'saved'}</div>
            <div class="meta">L: ${h.length.a} ${h.length.aUnit} + ${h.length.b} ${h.length.bUnit}</div>
            <div class="meta">B: ${h.breadth.a} ${h.breadth.aUnit} + ${h.breadth.b} ${h.breadth.bUnit}</div>
            <div class="meta">Area: ${formatArea(h.areaMeters, 'Square Meter')} • Price unit: ${h.rateAreaUnit}</div>
          </div>
          <div class="actions">
            <button class="btn btn--outline view" data-idx="${idx}">View</button>
            <button class="btn btn--ghost del" data-idx="${idx}">Delete</button>
          </div>
        `;
        listEl.appendChild(el);
      });

      $$('.history-item .view').forEach(btn => btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        const arr = readHistory();
        const item = arr[idx];
        if(!item) return;
        modalBody.textContent = JSON.stringify(item, null, 2);
        modal.style.display = 'flex';
      }));

      $$('.history-item .del').forEach(btn => btn.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        const arr = readHistory();
        arr.splice(idx,1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
        render();
        showToast('Deleted entry');
      }));
    }

    render();

    if(clearBtn) clearBtn.addEventListener('click', ()=>{
      if(confirm('Clear all history?')){
        localStorage.removeItem(HISTORY_KEY);
        render();
        showToast('History cleared');
      }
    });

    if(exportBtn) exportBtn.addEventListener('click', ()=>{
      const arr = readHistory();
      const blob = new Blob([JSON.stringify(arr, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'land_history.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Exported JSON');
    });

    if(closeModal){
      closeModal.addEventListener('click', ()=> modal.style.display = 'none');
      modal.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });
    }
  };

  // expose helpers globally
  window.formatArea = formatArea;
  window.calcAmount = calcAmount;
  window.pushHistory = pushHistory;
  window.readHistory = readHistory;
})();