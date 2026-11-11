import React,{act} from "react";
import {createRoot} from "react-dom/client";
import {SupplementaryExplorer} from "./SupplementaryExplorer";
jest.mock("@/components/MathText",()=>jest.requireActual("../MathText"),{virtual:true});
global.IS_REACT_ACT_ENVIRONMENT=true;
describe("supplementary-angle lesson presentation",()=>{
  let element,root;
  beforeEach(()=>{element=document.createElement("div");document.body.appendChild(element);root=createRoot(element);act(()=>root.render(<SupplementaryExplorer/>));});
  afterEach(()=>{act(()=>root.unmount());element.remove();});
  const click=label=>{const b=Array.from(element.querySelectorAll("button")).find(x=>x.textContent===label);act(()=>b.dispatchEvent(new MouseEvent("click",{bubbles:true})));};
  test("renders all three identities as valid mathematics and preserves the tangent condition",()=>{
    const tex=Array.from(element.querySelectorAll('annotation[encoding="application/x-tex"]')).map(n=>n.textContent);
    expect(tex).toContain("\\sin(180^\\circ-\\omega)=\\sin\\omega");
    expect(tex).toContain("\\cos(180^\\circ-\\omega)=-\\cos\\omega");
    expect(tex).toContain("\\tan(180^\\circ-\\omega)=-\\tan\\omega\\quad(\\omega\\ne90^\\circ)");
    expect(element.querySelector(".katex-error")).toBeNull();
  });
  test("handles coincident 90-degree points and swaps the two angle labels",()=>{
    click("90° + 90°");expect(element.querySelector('[role="status"]').textContent).toContain("Οι δύο εφαπτομένες δεν ορίζονται");
    const row=Array.from(element.querySelectorAll("tr")).find(r=>r.textContent.includes("Εφαπτομένη"));expect(row.querySelectorAll("td")[0].textContent).toBe("Δεν ορίζεται");expect(row.querySelectorAll("td")[1].textContent).toBe("Δεν ορίζεται");
    click("60° + 120°");click("Αντάλλαξε τις γωνίες");expect(element.querySelector('[role="status"]').textContent).toContain("120° και 60°");
  });
});
