import { reduceSegmentFraction } from "./segmentRatioModel";
export const AREA_SHAPES = [{id:"square",label:"Τετράγωνο"},{id:"rectangle",label:"Ορθογώνιο"},{id:"triangle",label:"Τρίγωνο"}];
export function polygonArea(points){
  return Math.abs(points.reduce((sum,p,i)=>{const next=points[(i+1)%points.length];return sum+p.x*next.y-next.x*p.y;},0))/2;
}
export function buildSimilarAreasModel(shape="square",quarters=8,width=2,height=3){
  if(!AREA_SHAPES.some(s=>s.id===shape)||!Number.isInteger(quarters)||quarters<1||quarters>12||![width,height].every(x=>Number.isInteger(x)&&x>=2&&x<=6)) throw new RangeError("Χρειάζονται έγκυρο σχήμα, θετικός λόγος και ακέραιες διαστάσεις 2–6.");
  const h=shape==="square"?width:height,ratio=quarters/4;
  const first=[{x:0,y:0},{x:width,y:0},...(shape==="triangle"?[]:[{x:width,y:h}]),{x:0,y:h}];
  const second=first.map(p=>({x:p.x*ratio,y:p.y*ratio}));
  const areaNumerator=width*h,areaDenominator=shape==="triangle"?2:1;
  const firstArea=areaNumerator/areaDenominator,secondArea=firstArea*ratio*ratio;
  return {shape,quarters,ratio,first,second,width,height:h,secondWidth:width*ratio,secondHeight:h*ratio,firstArea,secondArea,
    factors:{length:reduceSegmentFraction(quarters,4),area:reduceSegmentFraction(quarters*quarters,16)},
    areas:{first:reduceSegmentFraction(areaNumerator,areaDenominator),second:reduceSegmentFraction(areaNumerator*quarters*quarters,areaDenominator*16)},
    lengthPercent:100*ratio,areaPercent:100*ratio*ratio,
  };
}
export function lengthRatioFromAreas(numerator,denominator=1){
  if(![numerator,denominator].every(x=>Number.isSafeInteger(x)&&x>0)) throw new RangeError("Ο λόγος εμβαδών πρέπει να είναι θετικός.");
  const area=reduceSegmentFraction(numerator,denominator),a=Math.sqrt(area.numerator),b=Math.sqrt(area.denominator);
  return {area,length:Number.isInteger(a)&&Number.isInteger(b)?reduceSegmentFraction(a,b):null,value:Math.sqrt(numerator/denominator)};
}
