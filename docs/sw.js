const SPARQL_ENDPOINT = 'https://lod.humanatlas.io/sparql'; globalThis.global = globalThis; globalThis.window = globalThis;
var C=location.pathname.replace(/\/[^\/]+$/,""),k=new RegExp("^"+c(C));function U(n){return n.replace(k,"")}function c(n){
if(typeof n=="string"){var t=/([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g;return n.replace(t,"\\$1")}}var b=class{constructor(t,e){this._resolve=t,this._reject=e}html(t,e){this.send(t,{type:"text/html",...e})}text(t,e){this.
send(t,e)}json(t,e){this.send(JSON.stringify(t),{type:"application/json",...e})}blob(t,e={}){this._resolve(new Response(
t,e))}send(t,{type:e="text/plain",...r}={}){[void 0,null].includes(t)||(t=new Blob([t],{type:e})),this.blob(t,r)}async fetch(t){
if(typeof t=="string"){let e=await fetch(t),r=e.headers.get("Content-Type")??"application/octet-stream";this.send(await e.
arrayBuffer(),{type:r})}else if(t instanceof Request)return fetch(t).then(this._resolve).catch(this._reject)}download(t,{
filename:e="download",type:r="text/plain",...s}={}){let o={"Content-Disposition":`attachment; filename="${e}"`};this.send(
t,{type:r,headers:o,...s})}redirect(t,e){e===void 0&&(e=t,t=302),e.match(/https?:\/\//)||(e=C+e),this._resolve(Response.
redirect(e,t))}sse({onClose:t}={}){let e,r,s,o;return s=new ReadableStream({cancel(){o=!0,W(t)},start:i=>{e=function(u){
if(!o){let l=A(u),h=new TextEncoder().encode(l);i.enqueue(h)}},r=function(){i.close(),s=null,W(t)}}}),this._resolve(new Response(
s,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Transfer-Encoding":"chunked",Connection:"keep-alive"}})),
{send:e,close:r}}};function D(){let n="[a-zA-Z_][a-zA-Z_0-9]*",t=this,e="{",r="}",s="*",o="\\d",i="?",u="(",l=")",h="+",
w=".";t.route_parser=function(a,m){let g={},d=new RegExp("("+c(a)+n+c(m)+")","g"),q=new RegExp(["(",c(a),n,c(m),"|",c(s),
"|",c(o),"|",c(w),"|",c(i),"|",c(u),"|",c(l),"|",c(h),")"].join(""),"g"),_=new RegExp(c(a)+"("+n+")"+c(m),"g");return function(y){
let E=[],v=0,x=0;if(y=y.split(q).map(function(p,j,F){return p===u?x++:p===l&&x--,[u,h,l,i,w,o].includes(p)?p:p===s?(E.push(
v++),"(.*?)"):p.match(d)?(E.push(p.replace(_,"$1")),"([^\\/]+)"):p}).join(""),x!==0)throw new Error(`Wayne: Unbalanced p\
arentheses in an expression: ${y}`);return{re:y,names:E}}};let f=t.route_parser(e,r);t.parse=f,t.pick=function(a,m){let g,
d;a instanceof Array?(g={},d=a,a.map(function(_){g[_]=_})):(d=Object.keys(a),g=a);let q=[];for(let _=d.length;_--;){let y=d[_],
E=f(y),v=m.match(new RegExp("^"+E.re+"$"));if(v){let x=v.slice(1),p={};x.length&&E.names.forEach((j,F)=>{p[j]=x[F]}),q.push(
{pattern:y,data:p})}}return q}}function O(n){return["<!DOCTYPE html>","<html>","<head>",'<meta charset="UTF-8">',"<title\
>Wayne Service Worker</title>","</head>","<body>",...n,"</body>","</html>"].join(`
`)}function P(n){var t=O(["<h1>Wayne: 500 Server Error</h1>","<p>Service worker give 500 error</p>",`<p>${n.message||n}<\
/p>`,`<pre>${n.stack||""}</pre>`]);return[t,{status:500,statusText:"500 Server Error"}]}function A({data:n,event:t,retry:e,id:r}){return Object.entries({event:t,id:r,data:n,retry:e}).filter(([,s])=>s).map(([s,
o])=>`${s}: ${o}`).join(`
`)+`

`}function W(n,...t){typeof n=="function"&&n(...t)}function R(n,t){if(n.length)return new Promise((e,r)=>{let s=0;(async function o(){
let i=n[s];if(!i)return e();try{await t(i,function(){s++,o()})}catch(u){r(u)}})()})}var T=class{constructor(){this._er_handlers=[],this._middlewares=[],this._routes={},this._timeout=5*60*1e3,this._parser=
new D,self.addEventListener("fetch",t=>{let e=new Promise(async(r,s)=>{let o=t.request;try{let i=new b(r,s);await R(this.
_middlewares,function(f,a){return f(o,i,a)});let u=o.method,l=new URL(o.url),h=U(l.pathname),w=this._routes[u];if(w){let f=this.
_parser.pick(w,h);if(f.length){let[a]=f,m=[...this._middlewares,...w[a.pattern]];o.params=a.data,setTimeout(function(){s(
"Timeout Error")},this._timeout),await R(m,(g,d)=>g(o,i,d));return}}if(t.request.cache==="only-if-cached"&&t.request.mode!==
"same-origin")return;fetch(t.request).then(r).catch(s)}catch(i){this._handle_error(r,o,i)}});t.respondWith(e.catch(()=>{}))}),
["GET","POST","DELETE","PATCH","PUT"].forEach(t=>{this[t.toLowerCase()]=this.method(t)})}_handle_error(t,e,r){let s=new b(
t);this._er_handlers.length?R(this._er_handlers,function(o,i){o(r,e,s,i)},function(o){s.html(...P(o))}):s.html(...P(r))}use(...t){
t.forEach(e=>{typeof e=="function"&&(e.length===4?this._er_handlers.push(e):e.length===3&&this._middlewares.push(e))})}method(t){
return function(e,r){this._routes[t]||(this._routes[t]={});let s=this._routes[t];return s[e]||(s[e]=[]),s[e].push(r),this}}};var N=0;function L(n,t,e){return new Promise((r,s)=>{let o=++N,i={id:o,method:t,args:e};n.addEventListener("message",function u(l){
if(o==l.data.id){let h=l.data;n.removeEventListener("message",u),h.error?s(h.error):r(l.data)}}),n.postMessage(i)})}var z=new BroadcastChannel("ldsparql_requests");function $(n){return async function(t,e){let r="application/sparql-resul\
ts+json",s=(await t.formData()).get("query"),o=await L(z,"sparql",[s,n,r]);e.json(o.result)}}function M(n){return n.post(
"/api/ld/sparql",$("oxigraph")).post("/api/ld/oxigraph/sparql",$("oxigraph")).post("/api/ld/n3/sparql",$("n3")).post("/a\
pi/ld/quadstore/sparql",$("quadstore")).post("/api/ld/remote/sparql",$("remote"))}var S=M;var B=new T;S(B);self.skipWaiting();self.addEventListener("activate",n=>{n.waitUntil(clients.claim())});
//# sourceMappingURL=sw.js.map
