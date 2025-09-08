const SPARQL_ENDPOINT = 'https://lod.humanatlas.io/sparql'; globalThis.global = globalThis; globalThis.window = globalThis;
var p=location.pathname.replace(/\/[^\/]+$/,""),_=new RegExp("^"+f(p));function f(e){if(typeof e=="string"){var t=/([\^\$\[\]\(\)\{\}\+\*\.\|\?])/g;return e.replace(t,"\\$1")}}function h(e,t){e.addEventListener("message",async function(s){if(Object.keys(s.data).includes("method","id","args")){let{
method:a,id:o,args:c}=s.data;try{let r=await t[a](...c);e.postMessage({id:o,result:r})}catch(r){e.postMessage({id:o,error:r})}}})}if("serviceWorker"in navigator){let e=location.pathname.replace(/\/[^\/]+$/,"/");navigator.serviceWorker.controller===null&&
location.reload(),navigator.serviceWorker.register("sw.js",{scope:e,type:"module"}).then(function(t){t.addEventListener(
"updatefound",function(){let n=t.installing;console.log("A new service worker is being installed:",n)}),console.log("Reg\
istration succeeded. Scope is "+t.scope)}).catch(function(t){console.log("Registration failed with "+t)})}var m=new BroadcastChannel(
"ldsparql_requests");h(m,{sparql:async function(e,t,n){return d(e,t,n)}});var i={};async function d(e,t="oxigraph",n="ap\
plication/sparql-results+json"){i[t]||(i[t]=new Worker(`./endpoint-worker.js?endpoint=${t}`,{type:"module"}));let s=i[t];
return await new Promise((o,c)=>{let r=crypto.randomUUID(),u=l=>{l.data.id===r&&(s.removeEventListener("message",u),o(l.
data.results))};s.addEventListener("message",u),s.postMessage({type:"query",id:r,query:e,mimetype:n})})}window.sparql=d;
//# sourceMappingURL=sw-loader.js.map
