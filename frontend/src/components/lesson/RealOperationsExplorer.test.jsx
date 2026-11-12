import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import katex from 'katex';
import { RealOperationsExplorer } from './RealOperationsExplorer';
import { PRIORITY_EXAMPLES } from './realOperationsModel';
import content from '../../data/content.json';
jest.mock('@/components/MathText', () => jest.requireActual('../MathText'), { virtual: true });
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('real-number explorer', () => {
  let element, root;
  beforeEach(() => { element = document.createElement('div'); document.body.appendChild(element); root = createRoot(element); act(() => root.render(<RealOperationsExplorer/>)); });
  afterEach(() => { act(() => root.unmount()); element.remove(); });
  const click = label => { const button = Array.from(element.querySelectorAll('button')).find(b => b.textContent === label); expect(button).toBeDefined(); act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
  test('fraction signs, division by zero and reset update explanation and diagram', () => {
    expect(element.querySelector('svg[role=img]').getAttribute('aria-label')).toContain('μετατόπιση 2,5');
    click('Αφαίρεση αρνητικού'); expect(element.textContent).toContain('προς τα δεξιά');
    expect(element.querySelector('[role=status]').textContent).toContain('−1');
    click('Διαίρεση με μηδέν'); expect(element.textContent).toContain('δεν ορίζεται'); expect(element.querySelector('svg[role=img]')).toBeNull();
    click('Αρχικά δεδομένα'); expect(element.querySelector('svg[role=img]')).not.toBeNull();
    expect(element.querySelector('.katex-error')).toBeNull();
  });
  test('power slider changes even/odd interpretation with no stale result', () => {
    click('Δυνάμεις και παρενθέσεις'); expect(element.textContent).toContain('Οι δύο τιμές διαφέρουν');
    const slider = element.querySelector('[aria-label="Θετικός ακέραιος εκθέτης ν"]');
    act(() => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(slider, '3'); slider.dispatchEvent(new Event('input', { bubbles: true })); slider.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(element.textContent).toContain('οι δύο τιμές είναι αρνητικές');
    expect(element.querySelector('.katex-error')).toBeNull();
  });
  test('reveals one dependency step at a time and resets on case change', () => {
    click('Σειρά πράξεων'); expect(element.querySelectorAll('ol li')).toHaveLength(0);
    click('Εμφάνισε επόμενο βήμα'); expect(element.querySelectorAll('ol li')).toHaveLength(1);
    click('Ίδια προτεραιότητα'); expect(element.querySelectorAll('ol li')).toHaveLength(0);
    click('Εμφάνισε επόμενο βήμα'); click('Εμφάνισε επόμενο βήμα');
    expect(element.querySelector('ol').textContent).toContain('8');
    expect(Array.from(element.querySelectorAll('button')).find(b => b.textContent === 'Εμφάνισε επόμενο βήμα').disabled).toBe(true);
    click('Δοκίμασε ξανά'); expect(element.querySelectorAll('ol li')).toHaveLength(0);
  });
  test('all lesson and worked-example formulae typeset; activity ids and answers are valid', () => {
    const visit = value => {
      if (typeof value === 'string') for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g)) expect(() => katex.renderToString(match[1] || match[2], { throwOnError: true })).not.toThrow();
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    const lesson = content.lessonDetails['g9-a1-1']; visit(lesson);
    PRIORITY_EXAMPLES.forEach(item => [item.expression, ...item.steps.map(s => s[1])].forEach(expr => expect(() => katex.renderToString(expr, { throwOnError: true })).not.toThrow()));
    expect(lesson.experienceVersion).toBe(2); expect(lesson.practiceQuestions).toHaveLength(12);
    expect(new Set(lesson.practiceQuestions.map(q => q.id)).size).toBe(12);
    for (const q of [...lesson.diagnostic.questions, ...lesson.assessment.questions, ...lesson.practiceQuestions].filter(q => q.options)) { expect(q.correct).toBeGreaterThanOrEqual(0); expect(q.correct).toBeLessThan(q.options.length); expect(new Set(q.options).size).toBe(q.options.length); }
    expect(lesson.plan.phases.reduce((n, p) => n + p.minutes, 0)).toBe(lesson.minutes);
  });
});
