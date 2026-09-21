(() => {

  const form = document.getElementById('screeningForm');
  const steps = [...document.querySelectorAll('.step')];
  const nav = [...document.querySelectorAll('.stepnav button')];
  const progressBar = document.getElementById('progressBar');
  const success = document.getElementById('success');
  const submitBtn = document.getElementById('submitBtn');

  const FORM_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbzsjAvWrWcl_G3DNcbPeR1JKgvT99ajOBIcbKuZqvMDc8VNrk3K8gEmA26ikS9nKTH7/exec';

  let current = 1;


  /* -----------------------------
     SHOW STEP
  ----------------------------- */

  function showStep(number) {

    current = Math.max(1, Math.min(7, number));

    steps.forEach(step => {

      const stepNumber = Number(step.dataset.step);

      step.classList.toggle(
        'active',
        stepNumber === current
      );

    });


    nav.forEach((button, index) => {

      button.classList.toggle(
        'active',
        index + 1 === current
      );

    });


    progressBar.style.width =
      `${(current / 7) * 100}%`;


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }



  /* -----------------------------
     VALIDATE CURRENT STEP
  ----------------------------- */

  function validateCurrent() {

    const step = steps.find(
      s => Number(s.dataset.step) === current
    );

    if (!step) return false;


    const required =
      [...step.querySelectorAll('[required]')];


    const checkedRadioGroups = new Set();


    for (const el of required) {


      /* RADIO */

      if (el.type === 'radio') {

        if (checkedRadioGroups.has(el.name)) {
          continue;
        }

        checkedRadioGroups.add(el.name);

        const group =
          [...step.querySelectorAll(
            `input[type="radio"][name="${el.name}"]`
          )];

        if (!group.some(item => item.checked)) {

          alert(
            'Please complete the required question.'
          );

          return false;
        }

      }


      /* CHECKBOX */

      else if (el.type === 'checkbox') {

        if (!el.checked) {

          alert(
            'Please confirm the required item.'
          );

          return false;
        }

      }


      /* TEXT / SELECT / TEXTAREA */

      else {

        if (!String(el.value || '').trim()) {

          el.focus();

          alert(
            'Please complete the required field.'
          );

          return false;
        }

      }

    }



    /* AGE VERIFICATION */

    if (current === 1) {

      const av =
        form.querySelector(
          'input[name="av"]:checked'
        );

      if (av && av.value === 'No') {

        alert(
          'Age verification is required to continue this application.'
        );

        return false;
      }

    }


    return true;
  }



  /* -----------------------------
     NEXT BUTTONS
  ----------------------------- */

  document
    .querySelectorAll('.nextStep')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          if (!validateCurrent()) {
            return;
          }

          showStep(current + 1);

        }
      );

    });



  /* -----------------------------
     BACK BUTTONS
  ----------------------------- */

  document
    .querySelectorAll('.backStep')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          showStep(current - 1);

        }
      );

    });



  /* -----------------------------
     STEP NAVIGATION
  ----------------------------- */

  nav.forEach((button, index) => {

    button.addEventListener(
      'click',
      () => {

        const destination = index + 1;


        /* Always allow going backward */

        if (destination <= current) {

          showStep(destination);
          return;
        }


        /* Going forward requires validation */

        if (validateCurrent()) {

          showStep(destination);

        }

      }
    );

  });



  /* -----------------------------
     HELPERS
  ----------------------------- */

  function checkedValues(name) {

    return [
      ...form.querySelectorAll(
        `input[name="${name}"]:checked`
      )
    ].map(el => el.value);

  }


  function checkedYes(name) {

    const el =
      form.querySelector(
        `input[name="${name}"]`
      );

    return el && el.checked
      ? 'Yes'
      : '';

  }



  /* -----------------------------
     SUBMIT APPLICATION
  ----------------------------- */

  form.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      if (!validateCurrent()) {
        return;
      }


      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING…';


      const av =
        form.querySelector(
          'input[name="av"]:checked'
        );


      const payload = {

        name:
          form.elements['name']?.value || '',

        xhandle:
          form.elements['xhandle']?.value || '',

        age:
          form.elements['age']?.value || '',

        ageVerification:
          av?.value || '',


        experience:
          form.elements['experience']?.value || '',

        interests:
          checkedValues('interests'),

        lookingfor:
          form.elements['lookingfor']?.value || '',


        hardlimits:
          form.elements['hardlimits']?.value || '',

        softlimits:
          form.elements['softlimits']?.value || '',

        safeword:
          form.elements['safeword']?.value || '',

        consent:
          checkedYes('withdrawConsent'),


        monthlyBudget:
          form.elements['monthlyBudget']?.value || '',

        singleBudget:
          form.elements['singleBudget']?.value || '',


        frequency:
          form.elements['frequency']?.value || '',

        style:
          form.elements['style']?.value || '',

        communication:
          checkedValues('communication'),


        useful:
          form.elements['useful']?.value || '',

        respectBoundary:
          form.elements['respectBoundary']?.value || '',


        confirm18:
          checkedYes('agreeAge'),

        confirmAV:
          checkedYes('agreeAV'),

        confirmFindom:
          checkedYes('agreeConsent'),

        confirmFunds:
          checkedYes('agreeFunds'),

        confirmLimits:
          checkedYes('agreeLimits'),

        confirmTribute:
          checkedYes('agreeTribute'),

        confirmEnding:
          checkedYes('agreeEnd')

      };


      try {

        await fetch(
          FORM_ENDPOINT,
          {

            method: 'POST',

            mode: 'no-cors',

            headers: {
              'Content-Type':
                'text/plain;charset=utf-8'
            },

            body:
              JSON.stringify(payload)

          }
        );


        /* HIDE FORM */

        form.style.display = 'none';


        /* HIDE STEP NAVIGATION */

        const stepNavigation =
          document.querySelector('.stepnav');

        if (stepNavigation) {
          stepNavigation.style.display = 'none';
        }


        /* COMPLETE PROGRESS BAR */

        progressBar.style.width = '100%';


        /* SHOW SUCCESS */

        success.classList.add('show');


        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });


      }

      catch (error) {

        console.error(error);


        alert(
          'The application could not be sent. Please check your connection and try again.'
        );


        submitBtn.disabled = false;

        submitBtn.textContent =
          'SUBMIT TO LUNA 💋';

      }

    }
  );


  /* -----------------------------
     START
  ----------------------------- */

  showStep(1);

})();
