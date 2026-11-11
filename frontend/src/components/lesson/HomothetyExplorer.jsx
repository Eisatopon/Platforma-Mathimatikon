import { useId, useMemo, useState } from "react";
import { Move, RotateCcw, Sparkles } from "lucide-react";
import { MathText } from "@/components/MathText";
import { segmentFractionLatex } from "./segmentRatioModel";
import { buildHomothetyModel, homothetyImage, homothetyQuartersFromIndex, homothetyIndexFromQuarters, constrainHomothetyCentre, HOMOTHETY_VERTICES } from "./homothetyModel";

const number = (value) => String(Object.is(value,-0) ? 0 : value).replace(".",",");
const latexNumber = (value) => number(value).replace(",","{,}");
function HomothetyDrawing({ model, changeCentre }) {
  const titleId = useId();
  // Bounds include every permitted centre for the current ratio: dragging does not rescale the drawing.
  const limits=[{x:-4,y:-2},{x:-4,y:3},{x:0,y:-2},{x:0,y:3}];
  const all=[...limits,...HOMOTHETY_VERTICES,...limits.flatMap((k)=>HOMOTHETY_VERTICES.map((p)=>homothetyImage(p,k,model.ratio)))];
  const xmin=Math.min(...all.map(p=>p.x)), xmax=Math.max(...all.map(p=>p.x));
  const ymin=Math.min(...all.map(p=>p.y)), ymax=Math.max(...all.map(p=>p.y));
  const scale=Math.min(600/(xmax-xmin),330/(ymax-ymin));
  const centreX=(xmin+xmax)/2, centreY=(ymin+ymax)/2;
  const project=(p)=>({x:360+(p.x-centreX)*scale,y:215-(p.y-centreY)*scale});
  const source=model.vertices.map(project), target=model.images.map(project), K=project(model.centre);
  const points=(vertices)=>vertices.map(p=>`${p.x},${p.y}`).join(" ");
  const move=(event)=>{
    const svg=event.currentTarget.ownerSVGElement, matrix=svg?.getScreenCTM(); if(!matrix)return;
    const point=svg.createSVGPoint(); point.x=event.clientX; point.y=event.clientY;
    const p=point.matrixTransform(matrix.inverse());
    changeCentre(constrainHomothetyCentre({x:(p.x-360)/scale+centreX,y:centreY-(p.y-215)/scale}));
  };
  const release=(e)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
  const keyMove=(event)=>{
    const delta={ArrowLeft:[-0.5,0],ArrowRight:[0.5,0],ArrowUp:[0,0.5],ArrowDown:[0,-0.5]}[event.key];
    if(delta){event.preventDefault();changeCentre(constrainHomothetyCentre({x:model.centre.x+delta[0],y:model.centre.y+delta[1]}));}
  };
  const identity=model.ratio===1;
  return <div className="overflow-x-auto rounded-xl border border-violet-200 bg-white p-2 [--hom-source:#1f4e7b] [--hom-image:#7c3aed] [--hom-centre:#b45309] dark:border-violet-500/30 dark:bg-slate-950 dark:[--hom-source:#7dd3fc] dark:[--hom-image:#c4b5fd] dark:[--hom-centre:#fbbf24]">
    <svg viewBox="0 0 720 440" className="min-w-[520px] w-full" role="group" aria-labelledby={titleId}>
      <title id={titleId}>Ομοιοθεσία τριγώνου ΑΒΓ με κέντρο Κ και λόγο {number(model.ratio)}. {model.direction==="same"?"Τα αντίστοιχα σημεία είναι στην ίδια ημιευθεία από το Κ.":"Τα αντίστοιχα σημεία είναι σε αντίθετες ημιευθείες από το Κ."}</title>
      {source.map((p,i)=><g key={i} stroke="currentColor" opacity=".3" strokeDasharray="5 5"><line x1={K.x} y1={K.y} x2={p.x} y2={p.y}/><line x1={K.x} y1={K.y} x2={target[i].x} y2={target[i].y}/></g>)}
      <polygon points={points(source)} fill="var(--hom-source)" fillOpacity=".07" stroke="var(--hom-source)" strokeWidth="4"/>
      <polygon points={points(target)} fill="var(--hom-image)" fillOpacity=".1" stroke="var(--hom-image)" strokeWidth="3" strokeDasharray="8 4"/>
      {source.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill="var(--hom-source)"/><text x={p.x+[-18,14,-16][i]} y={p.y+[22,22,-14][i]} fontSize="18" fontWeight="800" textAnchor={i===1?"start":"end"} fill="var(--hom-source)">{["Α","Β","Γ"][i]}{identity?` ≡ ${["Α′","Β′","Γ′"][i]}`:""}</text></g>)}
      {!identity&&target.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r="4" fill="var(--hom-image)"/><text x={p.x+[10,12,12][i]} y={p.y+[-12,20,-12][i]} fontSize="18" fontWeight="800" fill="var(--hom-image)">{["Α′","Β′","Γ′"][i]}</text></g>)}
      <g role="button" aria-label="Μετακίνηση του κέντρου Κ με τα βέλη" tabIndex="0" onKeyDown={keyMove} onPointerDown={(e)=>{e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={(e)=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e);}} onPointerUp={release} onPointerCancel={release} className="group cursor-move touch-none outline-none">
        <circle cx={K.x} cy={K.y} r="22" fill="transparent"/><circle cx={K.x} cy={K.y} r="8" fill="var(--hom-centre)" strokeWidth="2.5" className="stroke-white group-focus:stroke-violet-500 dark:stroke-slate-100"/>
        <text x={K.x-13} y={K.y-13} fontSize="19" fontWeight="800" textAnchor="end" fill="var(--hom-centre)">Κ</text>
      </g>
      <text x="360" y="426" textAnchor="middle" fontSize="15" fill="currentColor">Κ({number(model.centre.x)}, {number(model.centre.y)}) · κ = {number(model.ratio)}</text>
    </svg>
  </div>;
}

export function HomothetyExplorer(){
  const headingId=useId();const [quarters,setQuarters]=useState(8);const [centre,setCentre]=useState({x:0,y:0});
  const model=useMemo(()=>buildHomothetyModel(quarters,centre),[quarters,centre]);
  const fraction=segmentFractionLatex;
  const identity=quarters===4, symmetry=quarters===-4;
  const reset=()=>{setQuarters(8);setCentre({x:0,y:0});};
  const sizeText={enlargement:"Μεγέθυνση",reduction:"Σμίκρυνση",equal:"Ίσα μεγέθη"}[model.size];
  return <section aria-labelledby={headingId} className="overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 shadow-[0_14px_35px_rgba(76,29,149,0.08)] dark:border-violet-500/30 dark:from-violet-500/10 dark:via-card dark:to-sky-500/10">
    <div className="flex items-start gap-3 border-b border-violet-200/80 p-4 sm:p-5 dark:border-violet-500/25"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1f4e7b] text-white"><Sparkles className="h-5 w-5"/></span><div><div className="text-xs font-extrabold uppercase tracking-widest text-violet-800 dark:text-violet-300">Δυναμικό εργαστήριο</div><h3 id={headingId} className="mt-1 text-xl font-black">Ένα κέντρο, ένας λόγος, ολόκληρο το σχήμα</h3><p className="mt-2 text-base leading-relaxed text-muted-foreground">Άλλαξε το κ και το Κ. Σύγκρινε τη θέση των κορυφών, τα μήκη και το εμβαδόν. Το αρχικό τρίγωνο μένει σταθερό.</p></div></div>
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">{[[8,"κ=2"],[2,"κ=0,5"],[4,"κ=1"],[-4,"κ=−1"],[-8,"κ=−2"]].map(([q,label])=><button type="button" key={q} aria-pressed={quarters===q} onClick={()=>setQuarters(q)} className={`rounded-xl border px-4 py-2.5 text-base font-bold ${quarters===q?"border-violet-700 bg-violet-700 text-white":"border-border bg-background"}`}>{label}</button>)}<button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-base font-bold"><RotateCcw className="h-4 w-4"/> Αρχική θέση</button></div>
      <div className="grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"><label className="text-base font-bold sm:col-span-2"><span>Λόγος ομοιοθεσίας: κ={number(model.ratio)}</span><input type="range" min="0" max="23" step="1" value={homothetyIndexFromQuarters(quarters)} aria-label="Λόγος ομοιοθεσίας κ" aria-valuetext={`κ=${number(model.ratio)}`} onChange={e=>setQuarters(homothetyQuartersFromIndex(Number(e.target.value)))} className="mt-3 block w-full accent-violet-700"/><span className="mt-2 block text-sm font-normal text-muted-foreground">Από −3 έως 3, ανά 0,25. Το μηδέν παραλείπεται, επειδή εδώ μελετάμε ομοιοθεσίες με κ≠0.</span></label>
      <label className="text-base font-bold">Οριζόντια θέση Κ: {number(centre.x)}<input type="range" min="-4" max="0" step="0.5" value={centre.x} aria-label="Οριζόντια θέση του Κ" onChange={e=>setCentre({...centre,x:Number(e.target.value)})} className="mt-3 block w-full accent-amber-700"/></label><label className="text-base font-bold">Κατακόρυφη θέση Κ: {number(centre.y)}<input type="range" min="-2" max="3" step="0.5" value={centre.y} aria-label="Κατακόρυφη θέση του Κ" onChange={e=>setCentre({...centre,y:Number(e.target.value)})} className="mt-3 block w-full accent-amber-700"/></label></div>
      <div className="flex flex-wrap gap-4 text-base font-bold"><span className="text-[#1f4e7b] dark:text-sky-300">━━ Αρχικό ΑΒΓ</span><span className="text-violet-700 dark:text-violet-300">┄┄ Είδωλο Α′Β′Γ′</span><span className="text-amber-800 dark:text-amber-300">● Κέντρο Κ</span></div>
      <HomothetyDrawing model={model} changeCentre={setCentre}/>
      <p className="flex items-start gap-2 text-base leading-relaxed text-muted-foreground"><Move className="mt-1 h-4 w-4 shrink-0"/> Σύρε το Κ ή εστίασέ το με Tab και χρησιμοποίησε τα βέλη. Στο εργαστήριο το κέντρο κινείται αριστερά από το αρχικό τρίγωνο. Οι διακεκομμένες γραμμές ενώνουν το Κ με τα αντίστοιχα σημεία.</p>
      <div role="status" className="rounded-xl border border-violet-300 bg-violet-50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10"><h4 className="text-lg font-black">{identity?"κ=1 — Κάθε σημείο μένει στη θέση του":symmetry?"κ=−1 — Κεντρική συμμετρία":`${sizeText} · ${model.direction==="same"?"ίδια ημιευθεία":"αντίθετες ημιευθείες"}`}</h4><p className="mt-2 text-base leading-relaxed">{identity?"Α′=Α, Β′=Β και Γ′=Γ. Τα δύο τρίγωνα συμπίπτουν για οποιαδήποτε θέση του Κ.":symmetry?"Το Κ είναι μέσο κάθε τμήματος που ενώνει μία κορυφή με το είδωλό της. Τα μήκη και το εμβαδόν διατηρούνται. Πρόκειται για περιστροφή 180° γύρω από το Κ.":model.direction==="opposite"?"Το αρνητικό πρόσημο αλλάζει την ημιευθεία. Η απόσταση από το Κ και κάθε πλευρά πολλαπλασιάζονται με |κ|· το αρνητικό πρόσημο δεν δημιουργεί αρνητικά μήκη.":"Κάθε κορυφή και το είδωλό της ανήκουν στην ίδια ημιευθεία από το Κ. Οι αποστάσεις από το κέντρο και οι πλευρές αλλάζουν με τον ίδιο συντελεστή |κ|."}</p></div>
      <div className="grid gap-3 sm:grid-cols-3">{[["Πρόσημο και λόγος",`$\\kappa=${fraction(model.factors.signed)}$`],["Συντελεστής μηκών",`$|\\kappa|=${fraction(model.factors.length)}$`],["Συντελεστής εμβαδών",`$\\kappa^2=${fraction(model.factors.area)}$`]].map(([label,text])=><div key={label} className="rounded-xl border border-border bg-background p-4 text-center"><div className="mb-2 text-base font-bold text-muted-foreground">{label}</div><MathText className="text-xl font-extrabold" text={text}/></div>)}</div>
      <div className="overflow-x-auto rounded-xl border border-border bg-background"><table className="w-full min-w-[460px] text-left text-base"><caption className="p-4 text-left text-lg font-black">Σύγκρινε τα μεγέθη στην ίδια μονάδα</caption><thead className="border-b border-border bg-secondary/50"><tr><th className="px-4 py-3">Μέγεθος</th><th className="px-4 py-3">Αρχικό</th><th className="px-4 py-3">Είδωλο</th></tr></thead><tbody>{[["Πλευρά ΑΒ",4,model.transformed.sides[0]],["Περίμετρος",12,model.transformed.perimeter],["Εμβαδόν",6,model.transformed.area]].map(([label,a,b])=><tr key={label} className="border-b border-border last:border-0"><th className="px-4 py-3 font-bold">{label}</th><td className="px-4 py-3">{number(a)}</td><td className="px-4 py-3 font-extrabold">{number(b)}</td></tr>)}</tbody></table></div>
      <div className="rounded-xl border border-sky-200 bg-background p-4 text-base leading-relaxed dark:border-sky-500/30"><p className="mb-2 font-bold">Παρακολούθησε την κορυφή Α</p><MathText text={`$Α=(2,1),\\quad Α'=(${latexNumber(model.images[0].x)},${latexNumber(model.images[0].y)})$`}/><p className="mt-3 text-muted-foreground">Οι συντεταγμένες υπολογίζονται ως Κ + κ·(Α−Κ), σε καθεμία από τις δύο διευθύνσεις. Η μετακίνηση του κέντρου αλλάζει το είδωλο, ενώ οι συντελεστές μηκών και εμβαδών εξαρτώνται μόνο από το κ.</p></div>
    </div>
  </section>;
}
