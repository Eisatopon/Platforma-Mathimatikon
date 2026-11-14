import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import { PolynomialExplorer } from './PolynomialExplorer';
import content from '../../data/content.json';
jest.mock('@/components/MathText', () => jest.requireActual('../MathText'), { virtual: true });
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('polynomial explorer', () => {
  let element, root;
  beforeEach(() => { element = document.createElement('div'); document.body.appendChild(element); root = createRoot(element); act(() => root.render(<PolynomialExplorer />)); });
  afterEach(() => { act(() => root.unmount()); element.remove(); });
  const button = label => Array.from(element.querySelectorAll('button')).find(b => b.textContent === label);
  const click = label => { expect(button(label)).toBeDefined(); act(() => button(label).dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
  const slide = (label, value) => {
    const slider = element.querySelector(`[aria-label="${label}"]`);
    expect(slider).not.toBeNull();
    act(() => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(slider, String(value)); slider.dispatchEvent(new Event('input', { bubbles: true })); slider.dispatchEvent(new Event('change', { bubbles: true })); });
  };
  const annotation = () => Array.from(element.querySelectorAll('annotation')).map(node => node.textContent);
  const noErrors = () => { expect(element.querySelector('.katex-error')).toBeNull(); expect(element.textContent).not.toMatch(/undefined|NaN|null/); };

  test('anatomy reports terms, degree and value, including the special cases', () => {
    expect(annotation()).toContain('P(x)=2x^{3}-3x^{2}+5');
    expect(annotation()).toContain('P(-1)=2\\cdot(-1)^{3}-3\\cdot(-1)^{2}+5=-2-3+5=0');
    expect(element.querySelector('dl').textContent).toBe('Πλήθος όρων3Βαθμός3Σταθερός όρος5');
    expect(element.textContent).toContain('Όταν λείπει ένας όρος, ο συντελεστής του είναι 0.');
    expect(element.textContent).toContain('Η αρνητική τιμή μπαίνει σε παρένθεση');
    slide('Τιμή του x', 2);
    expect(annotation()).toContain('P(2)=2\\cdot2^{3}-3\\cdot2^{2}+5=16-12+5=9');
    click('Ο βαθμός πέφτει');
    expect(annotation()).toContain('P(x)=2x^{2}-3x+1');
    expect(element.textContent).toContain('ο βαθμός πέφτει');
    expect(element.querySelector('dl').textContent).toContain('Βαθμός2');
    click('Σταθερό πολυώνυμο');
    expect(element.textContent).toContain('σταθερό πολυώνυμο, με βαθμό 0');
    click('Μηδενικό πολυώνυμο');
    expect(element.querySelector('dl').textContent).toBe('Πλήθος όρων0ΒαθμόςΔεν ορίζεταιΣταθερός όρος0');
    expect(annotation()).toContain('P(2)=0');
    slide('Σταθερός όρος', -4); slide('Συντελεστής του x', -1);
    expect(annotation()).toContain('P(x)=-x-4');
    expect(element.querySelector('dl').textContent).toContain('Σταθερός όρος−4');
    noErrors();
  });

  test('reduction reveals one step at a time and resets on a new example', () => {
    click('Αναγωγή και διάταξη');
    expect(annotation()).toContain('3x^{2}-2x+5+x-4x^{2}+x^{3}-1');
    expect(element.querySelectorAll('ol li')).toHaveLength(0);
    click('Εμφάνισε επόμενο βήμα');
    expect(element.querySelectorAll('ol li')).toHaveLength(1);
    expect(annotation()).toContain('x^{3}+\\left(3x^{2}-4x^{2}\\right)+\\left(-2x+x\\right)+\\left(5-1\\right)');
    click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα');
    expect(annotation()).toContain('x^{3}-x^{2}-x+4');
    expect(annotation()).toContain('x^{3}+\\left(3-4\\right)x^{2}+\\left(-2+1\\right)x+\\left(5-1\\right)');
    expect(element.textContent).toContain('ο βαθμός του είναι 3.');
    expect(button('Εμφάνισε επόμενο βήμα').disabled).toBe(true);
    click('Ο βαθμός πέφτει');
    expect(element.querySelectorAll('ol li')).toHaveLength(0);
    click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα');
    expect(annotation()).toContain('5x+4');
    expect(element.textContent).toContain('ο βαθμός του είναι 1.');
    click('Όλα απαλείφονται');
    click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα');
    expect(element.textContent).toContain('Έμεινε το μηδενικό πολυώνυμο');
    click('Δοκίμασε ξανά');
    expect(element.querySelectorAll('ol li')).toHaveLength(0);
    for (const label of ['Ανακατεμένοι όροι', 'Τέσσερις ομάδες']) { click(label); click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα'); noErrors(); }
  });

  test('subtraction changes every sign and is shown only after the prediction', () => {
    click('Πρόσθεση και αφαίρεση');
    expect(button('Δείξε το αποτέλεσμα').getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('table')).toBeNull();
    click('Δείξε το αποτέλεσμα');
    expect(annotation()).toContain('3x^{2}-2x+5-x^{2}-3x+2=2x^{2}-5x+7');
    const rows = Array.from(element.querySelectorAll('tbody tr')).map(tr => tr.querySelector('th').textContent);
    expect(rows).toEqual(['P(x)', '−Q(x)', 'Διαφορά']);
    const negated = element.querySelectorAll('tbody tr')[1];
    expect(Array.from(negated.querySelectorAll('annotation')).map(node => node.textContent)).toEqual(['-x^{2}', '-3x']);
    expect(negated.querySelector('td:last-child').textContent).toBe('2');
    expect(element.textContent).toContain('P(2) = 13 και Q(2) = 8, άρα P−Q = 5. Το αποτέλεσμα δίνει 5: οι δύο τιμές συμφωνούν.');
    expect(element.textContent).toContain('Συχνό λάθος');
    expect(annotation()).toContain('2x^{2}+x+3');
    expect(element.textContent).toContain('Εδώ δίνει 13 αντί για 5.');
    click('x=−1');
    expect(element.textContent).toContain('P(−1) = 10 και Q(−1) = −4, άρα P−Q = 14.');
    click('Πρόσθεση');
    expect(element.querySelector('table')).toBeNull();
    click('Δείξε το αποτέλεσμα');
    expect(annotation()).toContain('3x^{2}-2x+5+x^{2}+3x-2=4x^{2}+x+3');
    expect(element.textContent).not.toContain('Συχνό λάθος');
    slide('Συντελεστής του x² στο Q', -3);
    expect(element.querySelector('table')).toBeNull();
    click('Δείξε το αποτέλεσμα');
    expect(element.textContent).toContain('ο βαθμός έπεσε σε 1');
    click('Αντίθετα πολυώνυμα');
    click('Δείξε το αποτέλεσμα');
    expect(element.textContent).toContain('το αποτέλεσμα είναι το μηδενικό πολυώνυμο');
    click('Αρχικά δεδομένα');
    click('Δείξε το αποτέλεσμα');
    expect(annotation()).toContain('3x^{2}-2x+5-x^{2}-3x+2=2x^{2}-5x+7');
    noErrors();
  });

  test('extreme slider positions render without typesetting errors', () => {
    click('Πρόσθεση και αφαίρεση');
    for (const operation of ['Πρόσθεση', 'Αφαίρεση']) {
      for (const [p2, p1, p0, q2, q1, q0] of [[-5, -5, -5, 5, 5, 5], [0, 0, 0, 0, 0, 0], [0, 0, 3, 0, -1, 0], [1, -1, 1, -1, 1, -1], [5, 0, 0, 0, 0, -5]]) {
        slide('Συντελεστής του x² στο P', p2); slide('Συντελεστής του x στο P', p1); slide('Σταθερός όρος στο P', p0);
        slide('Συντελεστής του x² στο Q', q2); slide('Συντελεστής του x στο Q', q1); slide('Σταθερός όρος στο Q', q0);
        click(operation);
        click('Δείξε το αποτέλεσμα');
        for (const value of ['x=2', 'x=−1', 'x=3']) { click(value); noErrors(); }
      }
    }
  });

  test('lesson formulae typeset; activity ids, answers and timing are valid', () => {
    const visit = value => {
      if (typeof value === 'string') for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g)) expect(() => katex.renderToString(match[1] || match[2], { throwOnError: true })).not.toThrow();
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    const lesson = content.lessonDetails['g9-a1-3']; visit(lesson);
    expect(lesson.experienceVersion).toBe(2); expect(lesson.practiceQuestions).toHaveLength(12);
    expect(new Set(lesson.practiceQuestions.map(q => q.id)).size).toBe(12);
    expect(new Set(lesson.practiceQuestions.map(q => q.skill)).size).toBe(12);
    const choices = [...lesson.diagnostic.questions, ...lesson.questions, ...lesson.assessment.questions, ...lesson.practiceQuestions].filter(q => q.options);
    for (const q of choices) { expect(q.options).toHaveLength(4); expect(q.correct).toBeGreaterThanOrEqual(0); expect(q.correct).toBeLessThan(4); expect(new Set(q.options).size).toBe(4); }
    for (const q of lesson.practiceQuestions.filter(q => q.optionFeedback)) {
      expect(q.optionFeedback).toHaveLength(4);
      q.optionFeedback.forEach((feedback, i) => expect(Boolean(feedback)).toBe(i !== q.correct));
    }
    const positions = lesson.assessment.questions.map(q => q.correct);
    expect(Math.max(...[0, 1, 2, 3].map(i => positions.filter(p => p === i).length))).toBeLessThanOrEqual(2);
    for (const q of lesson.practiceQuestions.filter(q => q.type === 'matching')) expect(new Set(q.pairs.map(pair => pair.right)).size).toBe(q.pairs.length);
    expect(lesson.plan.phases.reduce((n, p) => n + p.minutes, 0)).toBe(lesson.minutes);
    expect(lesson.recap.nextLessonIds).toEqual(['g9-a1-4']);
  });
});
