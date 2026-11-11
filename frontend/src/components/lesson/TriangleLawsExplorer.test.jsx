import React, { act } from "react";
import { createRoot } from "react-dom/client";
import katex from "katex";
import { TriangleLawsExplorer } from "./TriangleLawsExplorer";
import content from "../../data/content.json";
jest.mock("@/components/MathText", () => jest.requireActual("../MathText"), { virtual: true });
global.IS_REACT_ACT_ENVIRONMENT = true;

describe("triangle-law lesson presentation", () => {
  let element, root;
  beforeEach(() => { element = document.createElement("div"); document.body.appendChild(element); root = createRoot(element); act(() => root.render(<TriangleLawsExplorer/>)); });
  afterEach(() => { act(() => root.unmount()); element.remove(); });
  const click = label => {
    const button = Array.from(element.querySelectorAll("button")).find(x => x.textContent === label);
    expect(button).toBeDefined(); act(() => button.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  };
  const status = () => element.querySelector('[role="status"]').textContent;

  test("switches data cases, typesets both laws and explains the obtuse correction", () => {
    click("Α=120°"); expect(element.textContent).toContain("α²>β²+γ²");
    click("Α=90°"); expect(element.textContent).toContain("Επιστρέφουμε στο Πυθαγόρειο");
    click("2 γωνίες + πλευρά"); expect(status()).toContain("Ένα τρίγωνο");
    expect(element.textContent).toContain("14,142");
    expect(element.querySelector(".katex-error")).toBeNull();
  });

  test("removes the diagram for invalid lengths and restores it after reset", () => {
    click("3 πλευρές"); click("2–3–5: γίνεται;");
    expect(status()).toContain("Δεν υπάρχει τρίγωνο"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(0);
    click("Αρχική περίπτωση"); expect(status()).toContain("Ένα τρίγωνο"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(1);
  });

  test("SSA shows both solutions, deduplicates a right angle and reports impossible sine", () => {
    click("Μη περιεχόμενη γωνία"); expect(status()).toContain("Δύο διαφορετικά τρίγωνα"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(2);
    click("Μία ορθή Β"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(1);
    click("Κανένα τρίγωνο"); expect(status()).toContain("ημΒ>1"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(0);
    click("Ένα τρίγωνο"); expect(element.querySelectorAll("svg[role=img]")).toHaveLength(1);
    expect(element.querySelector(".katex-error")).toBeNull();
  });

  test("every mathematical expression in the published lesson parses as KaTeX", () => {
    const visit = value => {
      if (typeof value === "string") for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]+)\$/g)) {
        expect(() => katex.renderToString(match[1] || match[2], { throwOnError: true })).not.toThrow();
      }
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(content.lessonDetails["g9-b2-4"]);
  });
});
