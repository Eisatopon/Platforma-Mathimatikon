import { AREA_SHAPES,buildSimilarAreasModel,lengthRatioFromAreas,polygonArea } from "./similarAreasModel";
const perimeter=points=>points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+Math.hypot(p.x-q.x,p.y-q.y);},0);
describe("area scales with the square of similarity",()=>{
  test("computed polygon areas agree with displayed formulas for every shape, size and ratio",()=>{
    for(const shape of AREA_SHAPES)for(let q=1;q<=12;q++)for(let w=2;w<=6;w++)for(let h=2;h<=6;h++){
      const m=buildSimilarAreasModel(shape.id,q,w,h);
      expect(polygonArea(m.first)).toBeCloseTo(m.firstArea,10);
      expect(polygonArea(m.second)).toBeCloseTo(m.secondArea,10);
      expect(m.secondArea/m.firstArea).toBeCloseTo((q/4)**2,10);
      expect(perimeter(m.second)/perimeter(m.first)).toBeCloseTo(q/4,10);
      expect(m.areas.second.numerator/m.areas.second.denominator).toBe(m.secondArea);
    }
  });
  test("a double scale makes four times the area and a half scale makes one quarter",()=>{
    const large=buildSimilarAreasModel("square",8,2,3),small=buildSimilarAreasModel("square",2,2,3);
    expect(large.secondArea).toBe(16);expect(large.firstArea).toBe(4);
    expect(small.secondArea).toBe(1);expect(small.factors.area).toEqual({numerator:1,denominator:4});
  });
  test("fractional dimensions and square area factors stay exact",()=>{
    const m=buildSimilarAreasModel("triangle",1,3,5);
    expect(m.secondWidth).toBe(0.75);expect(m.secondHeight).toBe(1.25);
    expect(m.secondArea).toBe(0.46875);
    expect(m.areas.second).toEqual({numerator:15,denominator:32});
    expect(m.factors.area).toEqual({numerator:1,denominator:16});
  });
  test("the inverse uses the positive square root and simplifies ratios",()=>{
    for(const [a,b,n,d] of [[4,1,2,1],[9,4,3,2],[1,9,1,3],[75,27,5,3]]){
      const m=lengthRatioFromAreas(a,b);expect(m.length).toEqual({numerator:n,denominator:d});expect(m.value*m.value).toBeCloseTo(a/b,12);
    }
    expect(lengthRatioFromAreas(2).length).toBeNull();expect(lengthRatioFromAreas(2).value).toBeCloseTo(Math.SQRT2,12);
  });
  test("150 percent of the lengths means 225 percent of the area",()=>{
    const m=buildSimilarAreasModel("rectangle",6,4,3);expect(m.lengthPercent).toBe(150);expect(m.areaPercent).toBe(225);expect(m.secondArea).toBe(27);
  });
  test("invalid and degenerate inputs are excluded",()=>{
    for(const q of [0,-1,13,2.5,NaN])expect(()=>buildSimilarAreasModel("square",q)).toThrow(RangeError);
    expect(()=>buildSimilarAreasModel("circle",4)).toThrow(RangeError);expect(()=>buildSimilarAreasModel("triangle",4,0,3)).toThrow(RangeError);
    expect(()=>lengthRatioFromAreas(0)).toThrow(RangeError);expect(()=>lengthRatioFromAreas(4,-1)).toThrow(RangeError);
  });
});
