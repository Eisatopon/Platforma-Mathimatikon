const SPECIALS={
  0:{x:1,y:0,cos:"1",sin:"0",tan:"0"},
  30:{x:Math.sqrt(3)/2,y:0.5,cos:"\\frac{\\sqrt3}{2}",sin:"\\frac12",tan:"\\frac{\\sqrt3}{3}"},
  45:{x:Math.SQRT1_2,y:Math.SQRT1_2,cos:"\\frac{\\sqrt2}{2}",sin:"\\frac{\\sqrt2}{2}",tan:"1"},
  60:{x:0.5,y:Math.sqrt(3)/2,cos:"\\frac12",sin:"\\frac{\\sqrt3}{2}",tan:"\\sqrt3"},
  90:{x:0,y:1,cos:"0",sin:"1",tan:null},
  120:{x:-0.5,y:Math.sqrt(3)/2,cos:"-\\frac12",sin:"\\frac{\\sqrt3}{2}",tan:"-\\sqrt3"},
  135:{x:-Math.SQRT1_2,y:Math.SQRT1_2,cos:"-\\frac{\\sqrt2}{2}",sin:"\\frac{\\sqrt2}{2}",tan:"-1"},
  150:{x:-Math.sqrt(3)/2,y:0.5,cos:"-\\frac{\\sqrt3}{2}",sin:"\\frac12",tan:"-\\frac{\\sqrt3}{3}"},
  180:{x:-1,y:0,cos:"-1",sin:"0",tan:"0"},
};
export const UNIT_CIRCLE_ANGLES=[0,30,45,60,90,120,135,150,180];
export function buildUnitCircleModel(degrees=120){
  if(!Number.isInteger(degrees)||degrees<0||degrees>180) throw new RangeError("Η γωνία πρέπει να είναι ακέραιος αριθμός από 0° έως 180°.");
  const exact=SPECIALS[degrees]||null,radians=degrees*Math.PI/180;
  const x=exact?exact.x:Math.cos(radians),y=exact?exact.y:Math.sin(radians);
  const tangent=degrees===90?null:y===0?0:y/x;
  return {degrees,x,y,cosine:x,sine:y,tangent,exact,
    location:degrees===0||degrees===180?"x-axis":degrees===90?"y-axis":degrees<90?"first":"second",
    signs:{cosine:Math.sign(x),sine:Math.sign(y),tangent:tangent===null?null:Math.sign(tangent)},
  };
}
export function unitCircleAngleFromPoint(point){
  if(!point||![point.x,point.y].every(Number.isFinite))throw new RangeError("Μη έγκυρο σημείο.");
  if(point.x===0&&point.y===0)return null;
  return Math.max(0,Math.min(180,Math.round(Math.atan2(Math.max(0,point.y),point.x)*180/Math.PI)));
}
