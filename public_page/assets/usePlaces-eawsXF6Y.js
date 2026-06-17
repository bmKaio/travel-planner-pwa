import{c as w,r as o,d as c}from"./index-DVGrVhBO.js";import{u as y}from"./dexie-react-hooks-fvpRq-0-.js";/**
 * @license lucide-react v1.20.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],m=w("navigation",g);function h(){const[l,a]=o.useState(null),n=y(()=>c.places.orderBy("name").toArray(),[]),i=o.useCallback(async e=>{try{a(null);const r=new Date,t=crypto.randomUUID();return await c.places.add({...e,id:t,createdAt:r,updatedAt:r}),t}catch(r){const t=r instanceof Error?r:new Error(String(r));throw a(t),t}},[]),p=o.useCallback(async(e,r)=>{try{a(null),await c.places.update(e,{...r,updatedAt:new Date})}catch(t){const s=t instanceof Error?t:new Error(String(t));throw a(s),s}},[]),u=o.useCallback(async e=>{try{a(null),await c.places.delete(e)}catch(r){const t=r instanceof Error?r:new Error(String(r));throw a(t),t}},[]),d=o.useCallback(e=>(n??[]).filter(r=>r.category===e),[n]);return{places:n??[],loading:n===void 0,error:l,create:i,update:p,remove:u,getByCategory:d}}export{m as N,h as u};
