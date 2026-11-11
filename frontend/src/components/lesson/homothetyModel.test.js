import { buildHomothetyModel, homothetyImage, homothetyIndexFromQuarters, homothetyQuartersFromIndex, constrainHomothetyCentre } from "./homothetyModel";
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const area = ([a, b, c]) => ((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))/2;

describe("homothety with signed ratios and positive geometric measures", () => {
  test("fixes the centre and puts images on the correct side of it", () => {
    for (let i=0; i<24; i+=1) for (const centre of [{x:0,y:0},{x:-4,y:-2},{x:-1.5,y:3}]) {
      const m=buildHomothetyModel(homothetyQuartersFromIndex(i),centre);
      expect(homothetyImage(centre,centre,m.ratio)).toEqual(centre);
      m.vertices.forEach((p,j)=>{
        const v={x:p.x-centre.x,y:p.y-centre.y}, w={x:m.images[j].x-centre.x,y:m.images[j].y-centre.y};
        expect(v.x*w.y-v.y*w.x).toBeCloseTo(0,12);
        expect(Math.sign(v.x*w.x+v.y*w.y)).toBe(Math.sign(m.ratio));
        expect(distance(centre,m.images[j])/distance(centre,p)).toBeCloseTo(Math.abs(m.ratio),12);
      });
    }
  });
  test("scales every side and perimeter by absolute ratio, and area by its square", () => {
    for (let i=0; i<24; i+=1) {
      const m=buildHomothetyModel(homothetyQuartersFromIndex(i),{x:-2,y:1});
      const sides=m.images.map((p,j)=>distance(p,m.images[(j+1)%3]));
      sides.forEach((s,j)=>expect(s).toBeCloseTo(m.transformed.sides[j],12));
      expect(sides.reduce((s,x)=>s+x,0)).toBeCloseTo(m.transformed.perimeter,12);
      expect(area(m.images)).toBeCloseTo(m.transformed.area,12);
      expect(Math.sign(area(m.images))).toBe(Math.sign(area(m.vertices)));
      const [a,b,c]=m.images;
      expect((b.x-a.x)*(c.x-a.x)+(b.y-a.y)*(c.y-a.y)).toBeCloseTo(0,12);
    }
  });
  test("distinguishes identity, central symmetry and negative reduction", () => {
    const identity=buildHomothetyModel(4); expect(identity.images).toEqual(identity.vertices);
    const symmetry=buildHomothetyModel(-4,{x:-2,y:1});
    symmetry.images.forEach((p,i)=>expect({x:(p.x+symmetry.vertices[i].x)/2,y:(p.y+symmetry.vertices[i].y)/2}).toEqual(symmetry.centre));
    const reduced=buildHomothetyModel(-2); expect(reduced.size).toBe("reduction"); expect(reduced.direction).toBe("opposite"); expect(reduced.transformed.area).toBe(1.5);
  });
  test("recovers the original point with reciprocal ratio and the same centre", () => {
    const p={x:3,y:-2}, k={x:1,y:4};
    for(const ratio of [-3,-0.5,0.25,1,2]) {
      const recovered=homothetyImage(homothetyImage(p,k,ratio),k,1/ratio);
      expect(recovered.x).toBeCloseTo(p.x,12); expect(recovered.y).toBeCloseTo(p.y,12);
    }
  });
  test("moving the centre recomputes the image without moving the original", () => {
    const a=buildHomothetyModel(8,{x:0,y:0}), b=buildHomothetyModel(8,{x:-2,y:1});
    expect(b.vertices).toEqual(a.vertices);
    b.images.forEach((p,i)=>expect(p).toEqual({x:a.images[i].x+2,y:a.images[i].y-1}));
  });
  test("all slider positions exclude zero and dragging stays within the displayed area", () => {
    for(let i=0;i<24;i+=1){const q=homothetyQuartersFromIndex(i);expect(q).not.toBe(0);expect(homothetyIndexFromQuarters(q)).toBe(i);}
    expect(constrainHomothetyCentre({x:9,y:-9})).toEqual({x:0,y:-2});
    expect(constrainHomothetyCentre({x:-1.7,y:2.2})).toEqual({x:-1.5,y:2});
    expect(()=>buildHomothetyModel(0)).toThrow(RangeError);
    expect(()=>homothetyImage({x:1,y:1},{x:0,y:0},0)).toThrow(RangeError);
  });
});
