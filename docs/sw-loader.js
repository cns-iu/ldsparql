const SPARQL_ENDPOINT = 'https://lod.humanatlas.io/sparql'; globalThis.global = globalThis; globalThis.window = globalThis;
var p=d(),_=new RegExp("^"+m(p));function d(){return self.registration?new URL(registration.scope).pathname.replace(/\/$/,""):location.pathname.replace(/\/[^\/]+$/,
"")}function m(e){if(typeof e=="string"){var t=/([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g;return e.replace(t,"\\$1")}}function h(e,t){e.addEventListener("message",async function(s){if(Object.keys(s.data).includes("method","id","args")){let{
method:o,id:i,args:l}=s.data;try{let r=await t[o](...l);e.postMessage({id:i,result:r})}catch(r){e.postMessage({id:i,error:r})}}})}var a={};async function c(e,t="oxigraph",n="application/sparql-results+json"){a[t]||(a[t]=new Worker(`./endpoint-worker.\
js?endpoint=${t}`,{type:"module"}));let s=a[t];return await new Promise((i,l)=>{let r=crypto.randomUUID(),u=f=>{f.data.id===
r&&(s.removeEventListener("message",u),i(f.data.results))};s.addEventListener("message",u),s.postMessage({type:"query",id:r,
query:e,mimetype:n})})}if("serviceWorker"in navigator){let e=location.pathname.replace(/\/[^\/]+$/,"/");navigator.serviceWorker.controller===null&&
location.reload(),navigator.serviceWorker.register("sw.js",{scope:e,type:"module"}).then(function(n){n.addEventListener(
"updatefound",function(){let s=n.installing;console.log("A new service worker is being installed:",s)}),console.log("Reg\
istration succeeded. Scope is "+n.scope)}).catch(function(n){console.log("Registration failed with "+n)});let t=new BroadcastChannel(
"ldsparql_requests");h(t,{sparql:async function(n,s,o){return c(n,s,o)}})}window.sparql=c;
//# sourceMappingURL=sw-loader.js.map
