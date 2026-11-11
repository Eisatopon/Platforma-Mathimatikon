import { buildSimilarityModel, SIMILARITY_MODES, SIMILARITY_EDGES, similarityNames } from "./similarityModel";
import { measureTriangle } from "./congruenceModel";
const closeArray = (a,b) => a.forEach((x,i)=>expect(x).toBeCloseTo(b[i],9));
describe("similarity with consistent vertex correspondence",()=>{
  test("all criteria preserve angles and scale every side at every supported ratio",()=>{
    for(const mode of SIMILARITY_MODES.filter(m=>m.id!=="ssa")) for(let q=1;q<=12;q++) {
      for(const parameter of [mode.min,mode.initial,mode.max]) {
        const m=buildSimilarityModel(mode.id,q,parameter);
        expect(m.similar).toBe(true);
        closeArray(m.ratios,[q/4,q/4,q/4]);
        closeArray(m.firstMeasures.angles,m.secondMeasures.angles);
        expect(m.secondPerimeter/m.firstPerimeter).toBeCloseTo(q/4,9);
        expect(m.firstMeasures.angles.reduce((s,x)=>s+x,0)).toBeCloseTo(180,9);
      }
    }
  });
  test("rotation and reflection preserve measurements and keep correspondence attached to vertices",()=>{
    for(const mode of SIMILARITY_MODES) for(const rotation of [0,45,135,270]) for(const reflected of [false,true]){
      const a=buildSimilarityModel(mode.id,8),b=buildSimilarityModel(mode.id,8,undefined,rotation,reflected);
      closeArray(a.secondMeasures.sides,b.secondMeasures.sides);closeArray(a.secondMeasures.angles,b.secondMeasures.angles);
      expect(a.similar).toBe(b.similar);
    }
  });
  test("AA fixes two angles, SAS fixes the included angle, and SSS fixes three sides",()=>{
    const aa=buildSimilarityModel("aa",6,35);closeArray(aa.firstMeasures.angles,[35,40,105]);
    const sas=buildSimilarityModel("sas",6,110);expect(sas.firstMeasures.angles[0]).toBeCloseTo(110,9);expect(sas.givenAngleIndices).toEqual([0]);
    const sss=buildSimilarityModel("sss",6,7);closeArray(sss.firstMeasures.sides,[6,5,7]);
  });
  test("the nonincluded-angle example is not similar under any correspondence",()=>{
    const m=buildSimilarityModel("ssa",8);
    closeArray(m.ratios.slice(0,2),[2,2]);expect(m.firstMeasures.angles[1]).toBeCloseTo(30,9);expect(m.secondMeasures.angles[1]).toBeCloseTo(30,9);
    expect(m.similar).toBe(false);expect(m.ratios[2]).not.toBeCloseTo(2,6);
    const sorted=a=>[...a].sort((x,y)=>x-y);
    const a=sorted(m.firstMeasures.sides),b=sorted(m.secondMeasures.sides);
    expect(b[0]/a[0]).not.toBeCloseTo(b[2]/a[2],6);
  });
  test("a scale of one gives congruence; reversing the comparison gives the reciprocal",()=>{
    const m=buildSimilarityModel("sas",4);closeArray(m.firstMeasures.sides,m.secondMeasures.sides);
    const enlarged=buildSimilarityModel("sss",10);
    enlarged.firstMeasures.sides.forEach((s,i)=>expect(s/enlarged.secondMeasures.sides[i]).toBeCloseTo(0.4,9));
  });
  test("renaming changes the correspondence statement while preserving one-to-one side pairing",()=>{
    const names=similarityNames(true);expect(names).toEqual(["Ε","Ζ","Δ"]);expect(new Set(names).size).toBe(3);
    expect(SIMILARITY_EDGES.map(([a,b])=>names[a]+names[b])).toEqual(["ΕΖ","ΕΔ","ΖΔ"]);
    expect(()=>buildSimilarityModel("aa",0)).toThrow(RangeError);expect(()=>buildSimilarityModel("aa",-4)).toThrow(RangeError);expect(()=>buildSimilarityModel("aa",13)).toThrow(RangeError);
    expect(()=>buildSimilarityModel("aa",4,90)).toThrow(RangeError);
    expect(measureTriangle(buildSimilarityModel("sss",2).second).sides[0]).toBeCloseTo(3,9);
  });
});
