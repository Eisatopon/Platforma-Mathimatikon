import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import { MonomialExplorer } from './MonomialExplorer';
import content from '../../data/content.json';
jest.mock('@/components/MathText', () => jest.requireActual('../MathText'), { virtual: true });
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('monomial explorer', () => {
  let element, root;
  beforeEach(() => { element = document.createElement('div'); document.body.appendChild(element); root = createRoot(element); act(() => root.render(<MonomialExplorer />)); });
  afterEach(() => { act(() => root.unmount()); element.remove(); });
  const button = label => Array.from(element.querySelectorAll('button')).find(b => b.textContent === label);
  const click = label => { expect(button(label)).toBeDefined(); act(() => button(label).dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
  const slide = (label, value) => {
    const slider = element.querySelector(`[aria-label="${label}"]`);
    expect(slider).not.toBeNull();
    act(() => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(slider, String(value)); slider.dispatchEvent(new Event('input', { bubbles: true })); slider.dispatchEvent(new Event('change', { bubbles: true })); });
  };
  const annotation = () => Array.from(element.querySelectorAll('annotation')).map(node => node.textContent);
  const noErrors = () => expect(element.querySelector('.katex-error')).toBeNull();

  test('anatomy shows coefficient, main part and degree, including the special cases', () => {
    expect(annotation()).toContain('-\\frac{3}{2}x^{2}y');
    expect(element.textContent).toContain('2+1=3');
    click('Κρυφός συντελεστής');
    expect(annotation()).toContain('-x^{2}y');
    expect(element.textContent).toContain('Ο συντελεστής −1 δεν γράφεται');
    click('Σταθερό μονώνυμο');
    expect(element.textContent).toContain('σταθερό μονώνυμο');
    expect(element.querySelector('dl').textContent).toContain('Δεν υπάρχει');
    click('Μηδενικό μονώνυμο');
    expect(element.textContent).toContain('δεν έχει βαθμό');
    expect(element.querySelector('dl').textContent.match(/Δεν ορίζεται/g)).toHaveLength(3);
    slide('Αριθμητής συντελεστή', 4); slide('Παρονομαστής συντελεστή', 2); slide('Εκθέτης του x', 0); slide('Εκθέτης του y', 3);
    expect(annotation()).toContain('2y^{3}');
    noErrors();
  });

  test('like monomials are reduced only after the prediction step', () => {
    click('Όμοια; Πρόσθεση και αφαίρεση');
    expect(element.textContent).toContain('Είναι όμοια');
    expect(button('Δείξε το αποτέλεσμα').getAttribute('aria-expanded')).toBe('false');
    expect(element.textContent).not.toContain('Έλεγχος με αριθμητική τιμή');
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=5x^{2}y'))).toBe(true);
    expect(element.textContent).toContain('οι δύο τιμές συμφωνούν');
    expect(element.textContent).toContain('Συχνό λάθος');
    expect(annotation()).toContain('5x^{4}y^{2}');
    slide('Εκθέτης του y στο Β', 2);
    expect(button('Δείξε το αποτέλεσμα')).toBeDefined();
    expect(element.textContent).toContain('δεν είναι όμοια');
    expect(element.querySelector('tbody').textContent).toContain('διαφορετικός');
    click('Δείξε το αποτέλεσμα');
    expect(element.textContent).toContain('δεν γίνεται αναγωγή');
    expect(element.textContent).not.toContain('Συχνό λάθος');
    click('Αντίθετα');
    expect(element.textContent).toContain('Είναι αντίθετα');
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=0'))).toBe(true);
    click('Αφαίρεση');
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=6x^{2}y'))).toBe(true);
    noErrors();
  });

  test('product and quotient show their steps, the area model and the undefined case', () => {
    click('Πολλαπλασιασμός και διαίρεση');
    expect(element.querySelector('svg[role=img]')).toBeNull();
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=6x^{4}y^{2}'))).toBe(true);
    expect(element.querySelector('svg[role=img]').getAttribute('aria-label')).toContain('6 κελιά x⁴y²');
    expect(element.querySelectorAll('svg[role=img] rect')).toHaveLength(6);
    expect(element.textContent).toContain('Οι εκθέτες προστίθενται');
    click('Πηλίκο που είναι μονώνυμο');
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=3x^{2}y'))).toBe(true);
    expect(element.textContent).toContain('Το πηλίκο είναι μονώνυμο. Προϋπόθεση: x≠0 και y≠0.');
    expect(element.querySelector('svg[role=img]')).toBeNull();
    click('Πηλίκο που δεν είναι μονώνυμο');
    click('Δείξε το αποτέλεσμα');
    expect(annotation().some(text => text.endsWith('=\\frac{2}{x}'))).toBe(true);
    expect(element.textContent).toContain('Το πηλίκο δεν είναι μονώνυμο');
    click('Διαιρέτης το 0');
    click('Δείξε το αποτέλεσμα');
    expect(element.textContent).toContain('Η διαίρεση δεν ορίζεται');
    expect(element.textContent).not.toContain('Έλεγχος με αριθμητική τιμή');
    click('Αρχικά δεδομένα');
    click('Δείξε το αποτέλεσμα');
    click('x=−1, y=2');
    expect(element.textContent).toContain('οι δύο τιμές συμφωνούν');
    noErrors();
  });

  test('every slider position renders without typesetting errors', () => {
    for (const mode of ['Όμοια; Πρόσθεση και αφαίρεση', 'Πολλαπλασιασμός και διαίρεση']) {
      click(mode);
      for (const operation of mode.startsWith('Όμοια') ? ['Πρόσθεση', 'Αφαίρεση'] : ['Πολλαπλασιασμός', 'Διαίρεση']) {
        for (const [ca, ax, ay, cb, bx, by] of [[-6, 0, 0, 6, 4, 4], [0, 2, 1, -1, 1, 0], [1, 4, 0, -1, 4, 0], [-1, 0, 3, 0, 0, 0], [5, 1, 1, -4, 0, 2], [2, 2, 2, 2, 2, 2]]) {
          slide('Συντελεστής του Α', ca); slide('Εκθέτης του x στο Α', ax); slide('Εκθέτης του y στο Α', ay);
          slide('Συντελεστής του Β', cb); slide('Εκθέτης του x στο Β', bx); slide('Εκθέτης του y στο Β', by);
          click(operation);
          click('Δείξε το αποτέλεσμα');
          noErrors();
          expect(element.textContent).not.toMatch(/undefined|NaN|null/);
        }
      }
    }
  });

  test('lesson formulae typeset; activity ids, answers and timing are valid', () => {
    const visit = value => {
      if (typeof value === 'string') for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g)) expect(() => katex.renderToString(match[1] || match[2], { throwOnError: true })).not.toThrow();
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    const lesson = content.lessonDetails['g9-a1-2']; visit(lesson);
    expect(lesson.experienceVersion).toBe(2); expect(lesson.practiceQuestions).toHaveLength(12);
    expect(new Set(lesson.practiceQuestions.map(q => q.id)).size).toBe(12);
    expect(new Set(lesson.practiceQuestions.map(q => q.skill)).size).toBe(12);
    const choices = [...lesson.diagnostic.questions, ...lesson.questions, ...lesson.assessment.questions, ...lesson.practiceQuestions].filter(q => q.options);
    for (const q of choices) { expect(q.options).toHaveLength(4); expect(q.correct).toBeGreaterThanOrEqual(0); expect(q.correct).toBeLessThan(4); expect(new Set(q.options).size).toBe(4); }
    for (const q of lesson.practiceQuestions.filter(q => q.optionFeedback)) {
      expect(q.optionFeedback).toHaveLength(4);
      q.optionFeedback.forEach((feedback, i) => expect(Boolean(feedback)).toBe(i !== q.correct));
    }
    expect(lesson.plan.phases.reduce((n, p) => n + p.minutes, 0)).toBe(lesson.minutes);
    expect(lesson.recap.nextLessonIds).toEqual(['g9-a1-3']);
  });
});
