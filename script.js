// Land Calculator Lite — simplified script for web (premium units locked)
(() => {
  const basicLength = ["Meter","Centimeter","Foot","Inch"];
  const premiumLength = ["Nol","Haat"];
  const basicArea = ["Square Meter","Square Foot","Square Inch"];
  const premiumArea = ["Hectare","Acre","Bigha","Kear","Josti","Raak","Fon","Kear_Josti_Raak_Fon","Kata"];

  const $ = s => document.querySelector(s);

  function showToast(msg,time=1600){
    const t=document.getElementById('toast');
    if(!t)return;
    t.textContent=msg;
    t.classList.add('show');
    t.style.display='block';
    clearTimeout(t._to);
    t._to=setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.style.display='none',220);},time);
  }

  function lengthToMeters(v,unit){
    v=Number(v)||0;
    switch(unit){
      case 'Meter':return v;
      case 'Centimeter':return v*0.01;
      case 'Foot':return v*0.3048;
      case 'Inch':return v*0.0254;
      default:return v;
    }
  }

  function formatArea(m2,unit){
    switch(unit){
      case 'Square Meter':return `${m2.toFixed(2)} m²`;
      case 'Square Foot':return `${(m2*10.7639).toFixed(2)} ft²`;
      case 'Square Inch':return `${(m2*1550.0031).toFixed(1)} in²`;
      default:return `${m2.toFixed(2)} m²`;
    }
  }

  function calcAmount(m2,mult,rate,unit){
    const op=Number(mult)||1;
    const pr=Number(rate)||0;
    switch(unit){
      case 'Square Meter':return (op*pr*m2).toFixed(2);
      case 'Square Foot':return (op*pr*m2*10.7639).toFixed(2);
      case 'Square Inch':return (op*pr*m2*1550.0031).toFixed(2);
      default:return (op*pr*m2).toFixed(2);
    }
  }

  window.pageInit_index=function(){
    const fillSelect=(id,basics,premiums)=>{
      const el=document.getElementById(id);
      if(!el)return;
      el.innerHTML='';
      basics.forEach(u=>el.innerHTML+=`<option value="${u}">${u}</option>`);
      premiums.forEach(u=>el.innerHTML+=`<option disabled>${u} 🔒 (Premium)</option>`);
    };

    fillSelect('lengthAUnit',basicLength,premiumLength);
    fillSelect('lengthBUnit',basicLength,premiumLength);
    fillSelect('breadthAUnit',basicLength,premiumLength);
    fillSelect('breadthBUnit',basicLength,premiumLength);
    fillSelect('rateAreaUnit',basicArea,premiumArea);

    const calcBtn=$('#calculateBtn');
    const clearBtn=$('#clearBtn');
    const preview=$('#preview');

		calcBtn.addEventListener('click', () => {
  const la = $('#lengthA').value;
  const lb = $('#lengthB').value;
  const ba = $('#breadthA').value;
  const bb = $('#breadthB').value;
  const laU = $('#lengthAUnit').value;
  const lbU = $('#lengthBUnit').value;
  const baU = $('#breadthAUnit').value;
  const bbU = $('#breadthBUnit').value;
  const mult = $('#multiplier').value || 1;
  const rate = $('#rate').value || 0;
  const rateU = $('#rateAreaUnit').value;

  if ([la, lb, ba, bb].some(v => v === '' || isNaN(v))) {
    showToast('Please enter valid numeric inputs.');
    $('#preview').value = '⚠ Invalid input!';
    return;
  }

  const l = lengthToMeters(la, laU) + lengthToMeters(lb, lbU);
  const b = lengthToMeters(ba, baU) + lengthToMeters(bb, bbU);
  const area = l * b;
  const areaDisplay = formatArea(area, 'Square Meter');
  const amount = calcAmount(area, mult, rate, rateU);

  const result = {
    areaDisplay,
    rateU,
    amount,
    timestamp: new Date().toLocaleString()
  };

  // Show result directly
  $('#preview').value = `Area: ${areaDisplay}\nRate Unit: ${rateU}\nTotal: ₹${amount}`;

  // Enable save button
  $('#saveHistoryBtn').onclick = () => {
    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    history.push(result);
    localStorage.setItem('calcHistory', JSON.stringify(history));
    showToast('Saved to History 🔒 (App Only)');
  };

  showToast('Calculated!');
});
		
		clearBtn.addEventListener('click',()=>{
      ['lengthA','lengthB','breadthA','breadthB','multiplier','rate'].forEach(id=>{
        const el=document.getElementById(id);
        if(el)el.value='';
      });
      preview.value='';
      showToast('Cleared');
    });
  };
})();