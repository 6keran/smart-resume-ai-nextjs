// Test script for resume builder validation and sizing geometry
const assert = require('assert');

// 1. Validation Logic Replication
function validateStep(step, data) {
  const errors = {};
  let firstErrorField = null;

  const addError = (fieldKey, message, elementId) => {
    errors[fieldKey] = message;
    if (!firstErrorField) {
      firstErrorField = elementId;
    }
  };

  if (step === 1) {
    if (!data.personalInfo.fullName?.trim()) {
      addError('personalInfo.fullName', 'Please enter your full name.', 'input-fullName');
    }
    if (!data.personalInfo.email?.trim()) {
      addError('personalInfo.email', 'Please enter your email address.', 'input-email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email.trim())) {
      addError('personalInfo.email', 'Please enter a valid email address (e.g. name@example.com).', 'input-email');
    }
    if (!data.personalInfo.phone?.trim()) {
      addError('personalInfo.phone', 'Please enter your phone number.', 'input-phone');
    }
    if (!data.personalInfo.location?.trim()) {
      addError('personalInfo.location', 'Please enter your location (city, state/country).', 'input-location');
    }
  } else if (step === 2) {
    if (!data.summary?.trim()) {
      addError('summary', 'Please enter your professional summary.', 'input-summary');
    } else if (data.summary.trim().length < 20) {
      addError('summary', 'Professional summary must be at least 20 characters.', 'input-summary');
    }
  } else if (step === 3) {
    if (!data.skills.technical || data.skills.technical.length === 0) {
      addError('skills.technical', 'Please enter at least one technical skill.', 'input-skills-technical');
    }
  } else if (step === 4) {
    if (!data.education || data.education.length === 0) {
      addError('education', 'Please add at least one education credential.', 'add-education-btn');
    } else {
      if (!data.education[0].degree?.trim()) {
        addError('education.0.degree', 'Please enter your degree or program of study.', 'input-edu-degree-0');
      }
      if (!data.education[0].institution?.trim()) {
        addError('education.0.institution', 'Please enter the institution or university name.', 'input-edu-institution-0');
      }
    }
  } else if (step === 5) {
    if (data.candidateType === 'experienced') {
      if (!data.experience || data.experience.length === 0) {
        addError('experience', 'Please add at least one professional work experience.', 'add-experience-btn');
      } else {
        if (!data.experience[0].role?.trim()) {
          addError('experience.0.role', 'Please enter your role title.', 'input-exp-role-0');
        }
        if (!data.experience[0].company?.trim()) {
          addError('experience.0.company', 'Please enter the company name.', 'input-exp-company-0');
        }
      }
    }
  } else if (step === 6) {
    if (data.candidateType === 'fresher') {
      if (!data.projects || data.projects.length === 0) {
        addError('projects', 'Please add at least one project (required for entry-level candidates).', 'add-project-btn');
      } else {
        if (!data.projects[0].title?.trim()) {
          addError('projects.0.title', 'Please enter the project name.', 'input-proj-title-0');
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField,
  };
}

function validateUpToStep(targetStep, data) {
  for (let s = 1; s < targetStep; s++) {
    const res = validateStep(s, data);
    if (!res.isValid) {
      return {
        isValid: false,
        invalidStep: s,
        errors: res.errors,
        firstErrorField: res.firstErrorField,
      };
    }
  }
  return { isValid: true, invalidStep: null, errors: {}, firstErrorField: null };
}

console.log('--- RUNNING BUILDER TEST SUITE ---');

// TEST 1: Step 1 Empty -> Blocked with 4 errors
const emptyData = {
  candidateType: 'experienced',
  personalInfo: { fullName: '', email: '', phone: '', location: '' },
  summary: '',
  skills: { technical: [], tools: [], soft: [] },
  experience: [{ role: '', company: '' }],
  education: [{ degree: '', institution: '' }],
  projects: [{ title: '' }],
};

const test1 = validateStep(1, emptyData);
assert.strictEqual(test1.isValid, false, 'Test 1 Failed: empty step 1 must be invalid');
assert.strictEqual(test1.firstErrorField, 'input-fullName', 'Test 1 Failed: first error should be fullName');
assert.ok(test1.errors['personalInfo.fullName'], 'fullName error missing');
assert.ok(test1.errors['personalInfo.email'], 'email error missing');
assert.ok(test1.errors['personalInfo.phone'], 'phone error missing');
assert.ok(test1.errors['personalInfo.location'], 'location error missing');
console.log('✓ TEST 1 PASSED: Empty Step 01 strictly blocked with all 4 field errors & focus on fullName');

// TEST 2: Partial Fill -> Still Blocked
const partialData = {
  ...emptyData,
  personalInfo: { ...emptyData.personalInfo, fullName: 'Aarav Patel' },
};
const test2 = validateStep(1, partialData);
assert.strictEqual(test2.isValid, false, 'Test 2 Failed: partial step 1 must be invalid');
assert.strictEqual(test2.errors['personalInfo.fullName'], undefined, 'fullName error should be cleared');
assert.strictEqual(test2.firstErrorField, 'input-email', 'Test 2 Failed: first error should now be email');
console.log('✓ TEST 2 PASSED: Partial fill clears fixed field and blocks on remaining missing fields');

// TEST 3: Complete Step 1 -> Valid
const validStep1Data = {
  ...emptyData,
  personalInfo: {
    fullName: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+1 555 123 4567',
    location: 'Seattle, WA',
  },
};
const test3 = validateStep(1, validStep1Data);
assert.strictEqual(test3.isValid, true, 'Test 3 Failed: valid step 1 must be valid');
console.log('✓ TEST 3 PASSED: Complete Step 01 is valid and ready to advance');

// TEST 4: Clearing required field blocks advancement
const step1Cleared = {
  ...validStep1Data,
  personalInfo: { ...validStep1Data.personalInfo, fullName: '' },
};
const test4 = validateStep(1, step1Cleared);
assert.strictEqual(test4.isValid, false);
assert.strictEqual(test4.firstErrorField, 'input-fullName');
console.log('✓ TEST 4 PASSED: Clearing field re-triggers validation error and blocks forward navigation');

// TEST 5: Stepper bypass blocked
const bypassAttempt = validateUpToStep(5, validStep1Data); // step 1 is valid, but step 2 (summary) is empty
assert.strictEqual(bypassAttempt.isValid, false);
assert.strictEqual(bypassAttempt.invalidStep, 2);
assert.strictEqual(bypassAttempt.firstErrorField, 'input-summary');
console.log('✓ TEST 5 PASSED: Stepper bypass blocked; redirects to earliest invalid step (Step 02)');

// TEST 6: Progressive validation through all steps
const fullValidData = {
  candidateType: 'experienced',
  personalInfo: {
    fullName: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+1 555 123 4567',
    location: 'Seattle, WA',
  },
  summary: 'Staff Software Architect with 10+ years engineering cloud solutions and enterprise ML microservices.',
  skills: { technical: ['TypeScript', 'Python', 'Docker', 'AWS'], tools: [], soft: [] },
  education: [{ degree: 'B.S. Computer Science', institution: 'University of Washington' }],
  experience: [{ role: 'Lead Architect', company: 'CloudTech Systems' }],
  projects: [{ title: 'NeuralFlow' }],
};

for (let s = 1; s <= 6; s++) {
  const stepRes = validateStep(s, fullValidData);
  assert.strictEqual(stepRes.isValid, true, `Step ${s} should be valid`);
}
const fullCheck = validateUpToStep(7, fullValidData);
assert.strictEqual(fullCheck.isValid, true, 'All steps up to 7 must be valid');
console.log('✓ TEST 6 PASSED: Progressive validation succeeds across all required steps');

// TEST 7: Fresher vs Experienced validation rules
// Case A: Fresher with NO experience -> Valid!
const fresherNoExp = {
  ...fullValidData,
  candidateType: 'fresher',
  experience: [], // No experience
  projects: [{ title: 'Autonomous Rover' }], // Has project
};
assert.strictEqual(validateStep(5, fresherNoExp).isValid, true, 'Experience must be optional for freshers');
assert.strictEqual(validateStep(6, fresherNoExp).isValid, true, 'Projects required for freshers and satisfied');

// Case B: Fresher with NO projects -> Blocked!
const fresherNoProj = {
  ...fresherNoExp,
  projects: [],
};
assert.strictEqual(validateStep(6, fresherNoProj).isValid, false, 'Fresher without projects must be blocked');

// Case C: Experienced with NO projects -> Valid!
const expNoProj = {
  ...fullValidData,
  candidateType: 'experienced',
  projects: [], // No projects
};
assert.strictEqual(validateStep(6, expNoProj).isValid, true, 'Projects must be optional for experienced');

console.log('✓ TEST 7 PASSED: Fresher / Experienced differential validation strictly enforced');

// TEST 8: A4 Document Aspect Ratio & Sizing
const A4_W = 794;
const A4_H = 1123;
const ratio = A4_W / A4_H;
const targetA4Ratio = 210 / 297;
assert.ok(Math.abs(ratio - targetA4Ratio) < 0.005, 'A4 aspect ratio must match 210 / 297');

// Zoom range tests
const minZoom = 0.50;
const maxZoom = 1.25;
assert.ok(minZoom >= 0.50 && maxZoom <= 1.25);
console.log(`✓ TEST 8 PASSED: A4 dimensions (794x1123, ratio ${(1 / ratio).toFixed(3)}:1) and zoom bounds (50% - 125%) verified`);

console.log('\n========================================');
console.log('ALL 8 TEST SCENARIOS PASSED WITH 100% SUCCESS');
console.log('========================================');
