const gcd=(a,b)=>b?gcd(b,a%b):a;
export function fractionTex(n,d=1){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d<=0)throw new RangeError("Μη έγκυρο κλάσμα.");
  if(n===0)return "0";const g=gcd(Math.abs(n),d),a=Math.abs(n)/g,b=d/g;
  return `${n<0?"-":""}${b===1?a:`\\frac{${a}}{${b}}`}`;
}
const rootTex=n=>Number.isInteger(Math.sqrt(n))?String(Math.sqrt(n)):`\\sqrt{${n}}`;
const radicalFraction=(radicand,denominator,sign=1)=>{
  const root=Math.sqrt(radicand);if(Number.isInteger(root))return fractionTex(sign*root,denominator);
  return `${sign<0?"-":""}\\frac{${rootTex(radicand)}}{${denominator}}`;
};
export function buildTrigIdentityModel(kind="sin",numerator=3,denominator=5,region="all"){
  if(!["sin","cos"].includes(kind)||!["all","acute","obtuse"].includes(region)||!Number.isSafeInteger(numerator)||!Number.isSafeInteger(denominator)||denominator<1||denominator>100||Math.abs(numerator)>denominator||(kind==="sin"&&numerator<0))throw new RangeError("Μη έγκυρα δεδομένα για το επάνω ημικύκλιο.");
  const g=gcd(Math.abs(numerator),denominator),n=numerator/g,d=denominator/g,R=d*d-n*n,root=Math.sqrt(R),known=n/d;
  let candidates;
  if(kind==="sin")candidates=R===0?[{x:0,y:known}]:[{x:root/d,y:known},{x:-root/d,y:known}];
  else candidates=[{x:known,y:root/d}];
  candidates=candidates.map((p,index)=>{
    const location=p.y===0?"endpoint":p.x===0?"right":p.x>0?"acute":"obtuse";
    const tangent=p.x===0?null:p.y===0?0:p.y/p.x;
    const cos=kind==="cos"?fractionTex(n,d):radicalFraction(R,d,p.x<0?-1:1);
    const sin=kind==="sin"?fractionTex(n,d):radicalFraction(R,d);
    let tan=null;
    if(tangent!==null){
      if(tangent===0)tan="0";
      else if(Number.isInteger(root))tan=kind==="sin"?fractionTex((p.x<0?-1:1)*n,root):fractionTex((n<0?-1:1)*root,Math.abs(n));
      else tan=kind==="sin"?`${p.x<0?"-":""}\\frac{${n}}{${rootTex(R)}}`:`${n<0?"-":""}\\frac{${rootTex(R)}}{${Math.abs(n)}}`;
    }
    return {...p,index,location,tangent,tex:{sin,cos,tan},sineSquared:p.y*p.y,cosineSquared:p.x*p.x};
  });
  return {kind,numerator:n,denominator:d,known,region,radicand:R,knownTex:fractionTex(n,d),remainingSquaredTex:fractionTex(R,d*d),knownSquaredTex:fractionTex(n*n,d*d),rootTex:radicalFraction(R,d),candidates,
    solutions:candidates.filter(p=>region==="all"||p.location===region)};
}
