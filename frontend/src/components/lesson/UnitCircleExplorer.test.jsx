import React,{act} from "react";
import {createRoot} from "react-dom/client";
import {UnitCircleExplorer} from "./UnitCircleExplorer";
jest.mock("@/components/MathText",()=>jest.requireActual("../MathText"),{virtual:true});

global.IS_REACT_ACT_ENVIRONMENT=true;
describe("unit circle renders mathematical definitions correctly",()=>{
  let container,root;
  beforeEach(()=>{container=document.createElement("div");document.body.appendChild(container);root=createRoot(container);act(()=>root.render(<UnitCircleExplorer/>));});
  afterEach(()=>{act(()=>root.unmount());container.remove();});
  const annotations=element=>Array.from(element.querySelectorAll('annotation[encoding="application/x-tex"]')).map(x=>x.textContent);
  const clickAngle=(element,label)=>{const button=Array.from(element.querySelectorAll("button")).find(b=>b.textContent===label);act(()=>button.dispatchEvent(new MouseEvent("click",{bubbles:true})));};
  const tangentCard=element=>Array.from(element.querySelectorAll("div")).find(d=>d.textContent==="Εφαπτομένη · y/x").parentElement;
  test("the identity and tangent definition render as one valid formula, not escaped line breaks",()=>{
    const formula=annotations(container).find(x=>x.startsWith("\\cos^2\\omega+\\sin^2\\omega=1"));
    expect(formula).toBeDefined();expect(formula).toContain("\\tan\\omega=\\frac{\\sin\\omega}{\\cos\\omega}");
    expect(container.querySelector(".katex-error")).toBeNull();
  });
  test("the 90-degree tangent card is undefined while the 180-degree tangent is exactly zero",()=>{
    clickAngle(container,"90°");expect(tangentCard(container).textContent).toContain("Δεν ορίζεται");expect(tangentCard(container).querySelector(".katex")).toBeNull();
    clickAngle(container,"180°");expect(annotations(tangentCard(container))).toContain("\\tan 180^\\circ = 0");
  });
});
