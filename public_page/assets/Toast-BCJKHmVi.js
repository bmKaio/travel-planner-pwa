import{c as t,j as r,r as i}from"./index-DVGrVhBO.js";import{X as d}from"./dexie-react-hooks-fvpRq-0-.js";/**
 * @license lucide-react v1.20.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],s=t("circle-alert",l);/**
 * @license lucide-react v1.20.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],m=t("circle-check-big",n);/**
 * @license lucide-react v1.20.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],x=t("circle-x",b);/**
 * @license lucide-react v1.20.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]],u=t("info",k),y={success:m,error:x,warning:s,info:u},p={success:"bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800",error:"bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-800",warning:"bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800",info:"bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800"};function N({toasts:e,onDismiss:a}){return r.jsx("div",{className:"fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2","aria-live":"polite","aria-atomic":"true",children:e.map(c=>r.jsx(h,{toast:c,onDismiss:a},c.id))})}function h({toast:e,onDismiss:a}){i.useEffect(()=>{const o=setTimeout(()=>{a(e.id)},4e3);return()=>clearTimeout(o)},[e.id,a]);const c=y[e.type];return r.jsxs("div",{className:`flex items-start gap-3 rounded-xl border p-3 shadow-lg transition-all ${p[e.type]}`,role:"status",children:[r.jsx(c,{className:"mt-0.5 h-5 w-5 shrink-0","aria-hidden":"true"}),r.jsx("p",{className:"flex-1 text-sm font-medium",children:e.message}),r.jsx("button",{onClick:()=>a(e.id),className:"rounded p-1 hover:bg-black/5 dark:hover:bg-white/10","aria-label":"Cerrar notificación",children:r.jsx(d,{className:"h-4 w-4","aria-hidden":"true"})})]})}export{s as C,N as T};
