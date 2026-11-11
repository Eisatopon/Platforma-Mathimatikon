import {buildTrigIdentityModel as model,fractionTex} from "./trigIdentityModel";
describe("recovering trig values with domain and sign constraints",()=>{
  test("every rational sine gives all reflected upper-circle solutions",()=>{
    for(let d=1;d<=20;d++)for(let n=0;n<=d;n++){
      const m=model("sin",n,d);expect(m.solutions).toHaveLength(n===d?1:2);
      for(const p of m.solutions){expect(p.y).toBeCloseTo(n/d,14);expect(p.x*p.x+p.y*p.y).toBeCloseTo(1,14);expect(p.y).toBeGreaterThanOrEqual(0);if(p.x!==0)expect(p.tangent).toBeCloseTo(p.y/p.x,14);}
    }
  });
  test("every rational cosine determines a single nonnegative sine",()=>{
    for(let d=1;d<=20;d++)for(let n=-d;n<=d;n++){
      const {solutions:[p]}=model("cos",n,d);expect(p.x).toBeCloseTo(n/d,14);expect(p.y).toBeCloseTo(Math.sqrt(1-(n/d)**2),14);expect(p.x*p.x+p.y*p.y).toBeCloseTo(1,14);
    }
  });
  test("the angle type chooses a sign without inventing missing information",()=>{
    const both=model("sin",3,5);expect(both.solutions.map(p=>p.tex.cos)).toEqual(["\\frac{4}{5}","-\\frac{4}{5}"]);
    expect(model("sin",3,5,"acute").solutions[0].tangent).toBeCloseTo(0.75,14);
    expect(model("sin",3,5,"obtuse").solutions[0].tangent).toBeCloseTo(-0.75,14);
    expect(model("sin",1,1,"acute").solutions).toHaveLength(0);
    expect(model("sin",0,1,"obtuse").solutions).toHaveLength(0);
  });
  test("axis cases distinguish zero, undefined and two possible endpoints",()=>{
    const top=model("sin",1,1);expect(top.solutions[0].tangent).toBeNull();expect(top.solutions[0].tex.cos).toBe("0");
    const ends=model("sin",0,1);expect(ends.solutions.map(p=>p.x)).toEqual([1,-1]);expect(ends.solutions.map(p=>p.tangent)).toEqual([0,0]);
    expect(model("cos",0,1).solutions[0].tangent).toBeNull();
    expect(model("cos",-1,1).solutions[0].tex.sin).toBe("0");
  });
  test("exact fractions, squares and radicals preserve their mathematical meaning",()=>{
    const m=model("sin",5,13,"obtuse");expect(m.solutions[0].tex).toEqual({sin:"\\frac{5}{13}",cos:"-\\frac{12}{13}",tan:"-\\frac{5}{12}"});
    const c=model("cos",-12,13);expect(c.solutions[0].tex.sin).toBe("\\frac{5}{13}");
    expect(model("sin",1,2).rootTex).toBe("\\frac{\\sqrt{3}}{2}");
    expect(fractionTex(-6,10)).toBe("-\\frac{3}{5}");expect(fractionTex(0,10)).toBe("0");
  });
  test("rejects impossible given values and invalid model parameters",()=>{
    for(const args of [["sin",-1,2],["sin",2,1],["cos",2,1],["cos",1,0],["tan",1,2],["sin",0.5,1],["sin",1,2,"other"],["cos",1,101]])expect(()=>model(...args)).toThrow(RangeError);
  });
});
