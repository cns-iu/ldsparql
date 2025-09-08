const SPARQL_ENDPOINT = 'https://lod.humanatlas.io/sparql'; globalThis.global = globalThis; globalThis.window = globalThis;
var p=location.pathname.replace(/\/[^\/]+$/,""),m=new RegExp("^"+f(p));function f(t){if(typeof t=="string"){var e=/([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g;return t.replace(e,"\\$1")}}function d(t,e){t.addEventListener("message",async function(s){if(Object.keys(s.data).includes("method","id","args")){let{
method:o,id:i,args:u}=s.data;try{let r=await e[o](...u);t.postMessage({id:i,result:r})}catch(r){t.postMessage({id:i,error:r})}}})}var a={};async function c(t,e="oxigraph",n="application/sparql-results+json"){a[e]||(a[e]=new Worker(`./endpoint-worker.\
js?endpoint=${e}`,{type:"module"}));let s=a[e];return await new Promise((i,u)=>{let r=crypto.randomUUID(),l=h=>{h.data.id===
r&&(s.removeEventListener("message",l),i(h.data.results))};s.addEventListener("message",l),s.postMessage({type:"query",id:r,
query:t,mimetype:n})})}if("serviceWorker"in navigator){let t=location.pathname.replace(/\/[^\/]+$/,"/");navigator.serviceWorker.controller===null&&
location.reload(),navigator.serviceWorker.register("sw.js",{scope:t,type:"module"}).then(function(n){n.addEventListener(
"updatefound",function(){let s=n.installing;console.log("A new service worker is being installed:",s)}),console.log("Reg\
istration succeeded. Scope is "+n.scope)}).catch(function(n){console.log("Registration failed with "+n)});let e=new BroadcastChannel(
"ldsparql_requests");d(e,{sparql:async function(n,s,o){return c(n,s,o)}})}window.sparql=c;
//# sourceMappingURL=sw-loader.js.map
