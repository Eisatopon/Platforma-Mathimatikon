import React,{act} from "react";
import {createRoot} from "react-dom/client";
import {TrigIdentityExplorer} from "./TrigIdentityExplorer";
jest.mock("@/components/MathText",()=>jest.requireActual("../MathText"),{virtual:true});
global.IS_REACT_ACT_ENVIRONMENT=true;
describe("trig identity lesson presentation",()=>{
  let element,root;
  beforeEach(()=>{element=document.createElement("div");document.body.appendChild(element);root=createRoot(element);act(()=>root.render(<TrigIdentityExplorer/>));});
  afterEach(()=>{act(()=>root.unmount());element.remove();});
  const click=label=>{const b=Array.from(element.querySelectorAll("button")).find(x=>x.textContent===label);expect(b).toBeDefined();act(()=>b.dispatchEvent(new MouseEvent("click",{bubbles:true})));};
  test("shows both valid signs without missing angle information and typesets the identities",()=>{
    expect(element.querySelector('[role="status"]').textContent).toContain("Δύο δυνατές θέσεις");
    const tex=Array.from(element.querySelectorAll('annotation[encoding="application/x-tex"]')).map(n=>n.textContent);
    expect(tex).toContain("\\sin^2\\omega+\\cos^2\\omega=1");
    expect(tex).toContain("\\cos^2\\omega=1-\\left(\\frac{3}{5}\\right)^2=\\frac{16}{25}");
    expect(tex).toContain("\\tan\\omega=\\frac{\\sin\\omega}{\\cos\\omega}=-\\frac{3}{4}");
    expect(element.querySelector(".katex-error")).toBeNull();
  });
  test("filters by angle type and makes incompatible boundary data explicit",()=>{
    click("Η γωνία είναι αμβλεία");expect(element.querySelector('[role="status"]').textContent).toContain("Μία δυνατή θέση");
    click("ημω=1");expect(element.querySelector('[role="status"]').textContent).toContain("Τα δεδομένα δεν δίνουν τέτοια γωνία");
    click("Δεν δίνεται είδος γωνίας");expect(element.textContent).toContain("Η εφαπτομένη δεν ορίζεται: συνω=0.");
    click("Γνωρίζω το συνημίτονο");click("συνω=0");expect(element.textContent).toContain("Η εφαπτομένη δεν ορίζεται: συνω=0.");
    expect(element.querySelector(".katex-error")).toBeNull();
  });
});
