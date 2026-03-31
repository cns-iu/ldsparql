const SPARQL_ENDPOINT = 'https://lod.humanatlas.io/sparql'; globalThis.global = globalThis; globalThis.window = globalThis;
var O=I(),N=new RegExp("^"+u(O));function G(n){return n===self.location.origin}function I(){return self.registration?new URL(
registration.scope).pathname.replace(/\/$/,""):location.pathname.replace(/\/[^\/]+$/,"")}function Z(n){return n.replace(
N,"")}function u(n){if(typeof n=="string"){var t=/([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g;return n.replace(t,"\\$1")}}var T=class{constructor(t,e){this._resolve=t,this._reject=e}html(t,e){this.send(t,{type:"text/html",...e})}text(t,e){this.
send(t,e)}json(t,e){this.send(JSON.stringify(t),{type:"application/json",...e})}respond(t){this._resolve(t)}blob(t,e={}){
this._resolve(new Response(t,e))}send(t,{type:e="text/plain",...o}={}){[void 0,null].includes(t)||(t=new Blob([t],{type:e})),
this.blob(t,o)}async fetch(t){if(typeof t=="string"){let e=await fetch(t),o=e.headers.get("Content-Type")??"application/\
octet-stream";this.send(await e.arrayBuffer(),{type:o})}else if(t instanceof Request)return fetch(t).then(this._resolve).
catch(this._reject)}download(t,{filename:e="download",type:o="text/plain",...s}={}){let r={"Content-Disposition":`attach\
ment; filename="${e}"`};this.send(t,{type:o,headers:r,...s})}redirect(t,e){e===void 0&&(e=t,t=302),e.match(/https?:\/\//)||
(e=O+e),this._resolve(Response.redirect(e,t))}sse({onClose:t}={}){let e,o,s,r;return s=new ReadableStream({cancel(){r=!0,
U(t)},start:i=>{e=function(a){if(!r){let f=H(a),h=new TextEncoder().encode(f);i.enqueue(h)}},o=function(){i.close(),s=null,
U(t)}}}),this._resolve(new Response(s,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Transfer-Encoding":"c\
hunked",Connection:"keep-alive"}})),{send:e,close:o}}};function J(){let n="[a-zA-Z_][a-zA-Z_0-9]*",t=this,e="{",o="}",s="\
*",r="(.*?)",i="\\d",a="?",f="(",h=")",b="+",q=".";t.route_parser=function(d,c){let _={},l=new RegExp("("+u(d)+n+u(c)+")",
"g"),y=new RegExp(["(",u(d),n,u(c),"|",u(s),"|",u(i),"|",u(q),"|",u(a),"|",u(f),"|",u(h),"|",u(b),")"].join(""),"g"),g=new RegExp(
u(d)+"("+n+")"+u(c),"g");return function(p){let w=[],C=0,x=0;if(p=p.split(y).map(function(m,E,F){return m===f?x++:m===h&&
x--,[f,b,h,a,q,i].includes(m)?m:m===s?(w.push(C++),r):m.match(l)?(w.push(m.replace(g,"$1")),"([^\\/]+)"):m}).join(""),x!==
0)throw new Error(`Wayne: Unbalanced parentheses in an expression: ${p}`);return{re:p,names:w}}};let v=t.route_parser(e,
o);t.parse=v,t.pick=function(d,c,_){let l,y;d instanceof Array?(l={},y=d,d.map(function(p){l[p]=p})):(y=Object.keys(d),l=
d);let g=[];for(let p=y.length;p--;){let w=y[p],C=l[w],x,m=/:\/\/([^\/]+)(\/.*)/,E=w.match(m);if(E){let R=E[1];if(R.match(
/\*/)){let j=new RegExp(R.replace(/\*/g,r));if(!_.match(j))continue}else if(new URL(w).origin!==_)continue;x=E[2]}else if(G(
_))x=w;else continue;let F=v(x);C.forEach(({handler:R,options:j})=>{let z=j.caseSensitive??!0;if(E=c.match(new RegExp("^"+
F.re+"$",z?"":"i")),E){let P=E.slice(1),S={};P.length&&F.names.forEach((B,M)=>{S[B]=P[M]}),g.push({pattern:w,handler:R,data:S})}})}
return g}}function Y(n){return["<!DOCTYPE html>","<html>","<head>",'<meta charset="UTF-8">',"<title>Wayne Service Worker\
</title>","</head>","<body>",...n,"</body>","</html>"].join(`
`)}function W(n){var t=Y(["<h1>Wayne: 500 Server Error</h1>","<p>Service worker give 500 error</p>",`<p>${n.message||n}<\
/p>`,`<pre>${n.stack||""}</pre>`]);return[t,{status:500,statusText:"500 Server Error"}]}function H({data:n,event:t,retry:e,id:o}){return Object.entries({event:t,id:o,data:n,retry:e}).filter(([,s])=>s).map(([s,
r])=>`${s}: ${r}`).join(`
`)+`

`}function U(n,...t){typeof n=="function"&&n(...t)}function L(n,t){if(n.length)return new Promise((e,o)=>{let s=0;(async function r(){
let i=n[s];if(!i)return e();try{await t(i,function(){s++,r()})}catch(a){o(a)}})()})}function K(n){return function(t){return t[n]}}function Q(n){return n.map(K("handler"))}var k=class{constructor({filter:t=()=>!0}={}){
this._er_handlers=[],this._middlewares=[],this._routes={},this._timeout=300*1e3,this._parser=new J,self.addEventListener(
"fetch",e=>{if(t(e.request)===!1)return;let o=new Promise(async(s,r)=>{let i=e.request;try{let a=new T(s,r);await L(this.
_middlewares,function(c,_){return c(i,a,_)});let f=i.method,h=new URL(i.url),b=Z(h.pathname),q=h.origin,v=this._routes[f];
if(v){let c=this._parser.pick(v,b,q),_=c.length>1&&c.find(l=>!!l.pattern.match(/\*/));if(c.length){let l;_&&(l=c.find(g=>!g.
pattern.match(/\*/))),_&&l||(l=c[0]);let y=[...this._middlewares,...Q(c)];i.params=l.data,setTimeout(function(){r("Timeo\
ut Error")},this._timeout),await L(y,(g,p)=>g(i,a,p));return}}if(e.request.cache==="only-if-cached"&&e.request.mode!=="s\
ame-origin")return;let d=await fetch(e.request);s(d)}catch(a){this._handle_error(s,i,a)}});e.respondWith(o.catch(()=>{}))}),
["GET","POST","DELETE","PATCH","PUT"].forEach(e=>{this[e.toLowerCase()]=this.method(e)})}_handle_error(t,e,o){let s=new T(
t);this._er_handlers.length?L(this._er_handlers,function(r,i){r(o,e,s,i)},function(r){s.html(...W(r))}):s.html(...W(o))}use(...t){
t.forEach(e=>{typeof e=="function"&&(e.length===4?this._er_handlers.push(e):e.length===3&&this._middlewares.push(e))})}method(t){
return function(e,o,s={}){this._routes[t]||(this._routes[t]={});let r=this._routes[t];return r[e]||(r[e]=[]),r[e].push({
handler:o,options:s}),this}}};var V=0;function A(n,t,e){return new Promise((o,s)=>{let r=++V,i={id:r,method:t,args:e};n.addEventListener("message",function a(f){
if(r==f.data.id){let h=f.data;n.removeEventListener("message",a),h.error?s(h.error):o(f.data)}}),n.postMessage(i)})}var X=new BroadcastChannel("ldsparql_requests");function $(n){return async function(t,e){let o="application/sparql-resul\
ts+json",s=(await t.formData()).get("query"),r=await A(X,"sparql",[s,n,o]);e.json(r.result)}}function tt(n){return n.post(
"/api/ld/sparql",$("oxigraph")).post("/api/ld/oxigraph/sparql",$("oxigraph")).post("/api/ld/n3/sparql",$("n3")).post("/a\
pi/ld/quadstore/sparql",$("quadstore")).post("/api/ld/remote/sparql",$("remote"))}var D=tt;var et=new k;D(et);self.skipWaiting();self.addEventListener("activate",n=>{n.waitUntil(clients.claim())});
//# sourceMappingURL=sw.js.map
