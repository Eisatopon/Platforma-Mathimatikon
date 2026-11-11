import {buildUnitCircleModel} from "./unitCircleModel";
export function buildSupplementaryModel(degrees=60){
  const first=buildUnitCircleModel(degrees),base=buildUnitCircleModel(180-degrees);
  const x=first.x===0?0:-first.x,y=first.y,tangent=first.tangent===null?null:first.tangent===0?0:-first.tangent;
  const second={...base,x,y,cosine:x,sine:y,tangent,signs:{cosine:Math.sign(x),sine:Math.sign(y),tangent:tangent===null?null:Math.sign(tangent)}};
  return {first,second,sum:first.degrees+second.degrees,coincident:degrees===90,tangentDefined:degrees!==90};
}
