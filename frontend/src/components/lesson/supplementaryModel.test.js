import {buildSupplementaryModel} from "./supplementaryModel";
describe("supplementary angles as reflection in the vertical axis",()=>{
  test("all 181 pairs sum to 180 and have reflected unit-circle coordinates",()=>{
    for(let angle=0;angle<=180;angle++){
      const {first:a,second:b,sum}=buildSupplementaryModel(angle);
      expect(sum).toBe(180);expect(b.x).toBe(a.x===0?0:-a.x);expect(b.y).toBe(a.y);
      expect(b.x*b.x+b.y*b.y).toBeCloseTo(1,13);
      expect(b.x).toBeCloseTo(Math.cos((180-angle)*Math.PI/180),13);
      expect(b.y).toBeCloseTo(Math.sin((180-angle)*Math.PI/180),13);
    }
  });
  test("tangents are both undefined only for the 90/90 pair; other values are opposite",()=>{
    for(let angle=0;angle<=180;angle++){
      const m=buildSupplementaryModel(angle);
      if(angle===90){expect(m.first.tangent).toBeNull();expect(m.second.tangent).toBeNull();expect(m.tangentDefined).toBe(false);}
      else {expect(m.first.tangent+m.second.tangent).toBe(0);expect(Number.isFinite(m.second.tangent)).toBe(true);expect(m.tangentDefined).toBe(true);}
    }
  });
  test("axis cases preserve zero correctly and the 90-degree points coincide",()=>{
    const a=buildSupplementaryModel(0),b=buildSupplementaryModel(180),c=buildSupplementaryModel(90);
    expect([a.first.x,a.first.y,a.second.x,a.second.y]).toEqual([1,0,-1,0]);
    expect([b.first.x,b.first.y,b.second.x,b.second.y]).toEqual([-1,0,1,0]);
    expect(Object.is(a.second.tangent,-0)).toBe(false);
    expect(c.coincident).toBe(true);expect([c.first.x,c.first.y,c.second.x,c.second.y]).toEqual([0,1,0,1]);
  });
  test("swapping angles restores the first pair and keeps exact fractions and radicals",()=>{
    for(const angle of [0,30,45,60,75,90,120,150,180]){
      const a=buildSupplementaryModel(angle),b=buildSupplementaryModel(a.second.degrees);
      expect(b.second.x).toBeCloseTo(a.first.x,13);expect(b.second.y).toBeCloseTo(a.first.y,13);
    }
    const m=buildSupplementaryModel(60);expect(m.first.exact.sin).toBe(m.second.exact.sin);expect(m.second.exact.cos).toBe("-\\frac12");expect(m.second.exact.tan).toBe("-\\sqrt3");
  });
  test("invalid angles stay outside the permitted lesson domain",()=>{
    for(const angle of [-1,181,2.5,NaN,Infinity])expect(()=>buildSupplementaryModel(angle)).toThrow(RangeError);
  });
});
