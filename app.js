(() => {
  const steps=[...document.querySelectorAll('.step')];
  const nav=[...document.querySelectorAll('.stepnav button')];
  const form=document.getElementById('screeningForm');
  const back=document.getElementById('backBtn');
  const next=document.getElementById('nextBtn');
  const submit=document.getElementById('submitBtn');
  const bar=document.getElementById('progressBar');

  const FORM_ENDPOINT='https://script.google.com/macros/s/AKfycbzsjAvWrWcl_G3DNcbPeR1JKgvT99ajOBIcbKuZqvMDc8VNrk3K8gEmA26ikS9nKTH7/exec';

  let current=1;

  function show(n){
    current=Math.max(1,Math.min(7,n));
    steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===current));
    nav.forEach((b,i)=>b.classList.toggle('active',i+1===current));

    back.style.visibility=current===1?'hidden':'visible';
    next.style.display=current===7?'none':'inline-flex';
    submit.style.display=current===7?'inline-flex':'none';

    bar.style.width=`${current/7*100}%`;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function validateCurrent(){
    const step=steps.find(s=>Number(s.dataset.step)===current);
    const req=[...step.querySelectorAll('[required]')];

    for(const el of req){

      if(el.type==='radio'){
        const group=[...step.querySelectorAll(`input[name="${el.name}"]`)];
        if(!group.some(x=>x.checked)){
          alert('Please complete the required question.');
          return false;
        }
      }

      else if(el.type==='checkbox'){
        if(!el.checked){
          alert('Please confirm the required item.');
          return false;
        }
      }

      else if(!el.value.trim()){
        el.focus();
        alert('Please complete the required field.');
        return false;
      }
    }

    if(current===1){
      const av=form.querySelector('input[name="av"]:checked');

      if(av && av.value==='No'){
        alert('Age verification is required to continue this application.');
        return false;
      }
    }

    return true;
  }

  function checkedValues(name){
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)]
      .map(el=>el.value);
  }

  function checkedYes(name){
    const el=form.querySelector(`input[name="${name}"]`);
    return el && el.checked ? 'Yes' : '';
  }

  next.addEventListener('click',()=>{
    if(validateCurrent()) show(current+1);
  });

  back.addEventListener('click',()=>{
    show(current-1);
  });

  nav.forEach((b,i)=>{
    b.addEventListener('click',()=>{
      if(i+1<=current || validateCurrent()){
        show(i+1);
      }
    });
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();

    if(!validateCurrent()) return;

    submit.disabled=true;
    submit.textContent='SENDING…';

    const av=form.querySelector('input[name="av"]:checked');

    const payload={
      name: form.elements['name']?.value || '',
      xhandle: form.elements['xhandle']?.value || '',
      age: form.elements['age']?.value || '',
      ageVerification: av?.value || '',

      experience: form.elements['experience']?.value || '',
      interests: checkedValues('interests'),
      lookingfor: form.elements['lookingfor']?.value || '',

      hardlimits: form.elements['hardlimits']?.value || '',
      softlimits: form.elements['softlimits']?.value || '',
      safeword: form.elements['safeword']?.value || '',
      consent: checkedYes('withdrawConsent'),

      monthlyBudget: form.elements['monthlyBudget']?.value || '',
      singleBudget: form.elements['singleBudget']?.value || '',

      frequency: form.elements['frequency']?.value || '',
      style: form.elements['style']?.value || '',
      communication: checkedValues('communication'),

      useful: form.elements['useful']?.value || '',
      respectBoundary: form.elements['respectBoundary']?.value || '',

      confirm18: checkedYes('agreeAge'),
      confirmAV: checkedYes('agreeAV'),
      confirmFindom: checkedYes('agreeConsent'),
      confirmFunds: checkedYes('agreeFunds'),
      confirmLimits: checkedYes('agreeLimits'),
      confirmTribute: checkedYes('agreeTribute'),
      confirmEnding: checkedYes('agreeEnd')
    };

    try{
      await fetch(FORM_ENDPOINT,{
        method:'POST',
        mode:'no-cors',
        headers:{
          'Content-Type':'text/plain;charset=utf-8'
        },
        body:JSON.stringify(payload)
      });

     steps.forEach(s => s.style.display='none');
document.getElementById('success').classList.add('show');

submit.style.display='none';
back.style.display='none';
next.style.display='none';

document.querySelector('.stepnav').style.display='none';

bar.style.width='100%';

window.scrollTo({
  top:0,
  behavior:'smooth'
});

    } catch(err){
      console.error(err);

      alert(
        'The application could not be sent. Please check your connection and try again.'
      );

      submit.disabled=false;
      submit.textContent='SUBMIT TO LUNA 💋';
    }
  });

  show(1);
})();
