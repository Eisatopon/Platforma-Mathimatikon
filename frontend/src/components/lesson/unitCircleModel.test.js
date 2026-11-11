import {buildUnitCircleModel,unitCircleAngleFromPoint,UNIT_CIRCLE_ANGLES} from "./unitCircleModel";
describe("unit circle from zero to 180 degrees",()=>{
  test("every angle lies on the upper unit semicircle with correct coordinate signs",()=>{
    for(let a=0;a<=180;a++){
      const m=buildUnitCircleModel(a);expect(m.x*m.x+m.y*m.y).toBeCloseTo(1,13);
      expect(m.y).toBeGreaterThanOrEqual(0);expect(m.y).toBeLessThanOrEqual(1);
      expect(m.x).toBeGreaterThanOrEqual(-1);expect(m.x).toBeLessThanOrEqual(1);
      expect(m.signs.sine).toBe(a===0||a===180?0:1);
      expect(m.signs.cosine).toBe(a<90?1:a===90?0:-1);
    }
  });
  test("axis values are exact and tangent is undefined only at 90 degrees",()=>{
    const a=buildUnitCircleModel(0),b=buildUnitCircleModel(90),c=buildUnitCircleModel(180);
    expect([a.x,a.y,a.tangent]).toEqual([1,0,0]);expect([b.x,b.y,b.tangent]).toEqual([0,1,null]);expect([c.x,c.y,c.tangent]).toEqual([-1,0,0]);
    for(let angle=0;angle<=180;angle++){
      const m=buildUnitCircleModel(angle);if(angle===90)expect(m.tangent).toBeNull();else {expect(Number.isFinite(m.tangent)).toBe(true);expect(m.tangent*m.cosine).toBeCloseTo(m.sine,13);}
    }
  });
  test("special angles match their exact fractions and radicals",()=>{
    expect(buildUnitCircleModel(30).sine).toBe(0.5);expect(buildUnitCircleModel(60).cosine).toBe(0.5);
    expect(buildUnitCircleModel(120).cosine).toBe(-0.5);expect(buildUnitCircleModel(150).sine).toBe(0.5);
    expect(buildUnitCircleModel(45).tangent).toBe(1);expect(buildUnitCircleModel(135).tangent).toBe(-1);
    for(const a of UNIT_CIRCLE_ANGLES)expect(buildUnitCircleModel(a).exact).not.toBeNull();
    expect(buildUnitCircleModel(120).exact.tan).toBe("-\\sqrt3");expect(buildUnitCircleModel(37).exact).toBeNull();
  });
  test("supplementary angles reflect coordinates and reverse the sign of tangent when defined",()=>{
    for(let a=0;a<=180;a++){
      const m=buildUnitCircleModel(a),n=buildUnitCircleModel(180-a);
      expect(m.sine).toBeCloseTo(n.sine,13);expect(m.cosine).toBeCloseTo(-n.cosine,13);
      if(a!==90)expect(m.tangent).toBeCloseTo(-n.tangent,10);
    }
  });
  test("cosine decreases across the semicircle and sine peaks at 90 degrees",()=>{
    for(let a=0;a<180;a++)expect(buildUnitCircleModel(a+1).cosine).toBeLessThan(buildUnitCircleModel(a).cosine);
    for(let a=0;a<90;a++)expect(buildUnitCircleModel(a+1).sine).toBeGreaterThan(buildUnitCircleModel(a).sine);
    for(let a=90;a<180;a++)expect(buildUnitCircleModel(a+1).sine).toBeLessThan(buildUnitCircleModel(a).sine);
  });
  test("dragging projects to the allowed semicircle and does not invent an angle at the centre",()=>{
    for(let a=0;a<=180;a++){const m=buildUnitCircleModel(a);expect(unitCircleAngleFromPoint({x:3*m.x,y:3*m.y})).toBe(a);}
    expect(unitCircleAngleFromPoint({x:-1,y:-1})).toBe(180);expect(unitCircleAngleFromPoint({x:1,y:-1})).toBe(0);expect(unitCircleAngleFromPoint({x:0,y:0})).toBeNull();
    for(const a of [-1,181,2.5,NaN,Infinity])expect(()=>buildUnitCircleModel(a)).toThrow(RangeError);
    expect(()=>unitCircleAngleFromPoint({x:Infinity,y:1})).toThrow(RangeError);
  });
});
