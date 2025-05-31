/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e,this[e]=h.fromAttribute(s,t.type)??this._$Ej?.get(e)??null,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$1=document,l=()=>r$1.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$1.createTreeWalker(r$1,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$1).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.0");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

class RuleEngine {
    constructor(rules) {
        this.rules = [];
        this.rules = rules;
        console.log('[RuleEngine] Initialized with', rules.length, 'rules');
    }
    evaluate(context) {
        // Debug: log available context
        console.log('[RuleEngine] Evaluating rules with context:', context);
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
                console.log(`[RuleEngine] Rule '${rule.id || rule.message_key}' (${rule.condition}) => ${hit}`);
            }
            catch (e) {
                console.warn(`[RuleEngine] Error evaluating rule '${rule.id || rule.message_key}':`, e);
                continue;
            }
            if (hit) {
                results.push({ message_key: rule.message_key, priority: rule.priority });
            }
        }
        console.log('[RuleEngine] Evaluation complete,', results.length, 'rules matched');
        return results;
    }
}

function filterSensorsByArea(states, areaId) {
    // Early return if states is not an array
    if (!Array.isArray(states)) {
        console.warn('[filterSensorsByArea] States is not an array:', states);
        return [];
    }
    // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
    const norm = (v) => (v || '').toLowerCase().trim();
    // Debug logging to check area_id matching
    console.log(`[filterSensorsByArea] Looking for area: '${areaId}'`);
    // First find any matching sensors
    const filtered = states.filter(st => {
        const stArea = norm(st.attributes?.area_id);
        const searchArea = norm(areaId);
        // Log each potential match attempt
        if (st.entity_id && st.attributes?.area_id) {
            console.log(`[filterSensorsByArea] Checking entity ${st.entity_id} with area '${st.attributes.area_id}' (normalized: '${stArea}') against '${searchArea}'`);
        }
        return stArea === searchArea;
    });
    // Log what we found
    console.log(`[filterSensorsByArea] Found ${filtered.length} sensors for area '${areaId}':`);
    filtered.forEach(s => console.log(`- ${s.entity_id}`));
    return filtered;
}

var coreRules = [
	{
		id: "debug",
		condition: "debug === true",
		message_key: "debug_rule_match",
		priority: "info"
	},
	{
		condition: "temp > target + 2",
		message_key: "temp_above_target",
		priority: "warn"
	},
	{
		condition: "temp < target - 2",
		message_key: "temp_below_target",
		priority: "warn"
	},
	{
		condition: "humidity < 35",
		message_key: "humidity_low",
		priority: "info"
	},
	{
		condition: "humidity > 70",
		message_key: "humidity_high",
		priority: "alert"
	},
	{
		condition: "co2 > 1000",
		message_key: "co2_high",
		priority: "warn"
	},
	{
		condition: "window == 'open' && heating == 'on'",
		message_key: "window_open_heating_on",
		priority: "alert"
	},
	{
		condition: "!occupied && temp > 21",
		message_key: "room_empty_warm",
		priority: "info"
	},
	{
		condition: "outside_temp > 15 && temp > 23",
		message_key: "outside_warm_inside_warm",
		priority: "info"
	},
	{
		condition: "forecast_temp > 18 && target > 21",
		message_key: "forecast_warmer_target_high",
		priority: "info"
	},
	{
		condition: "energy > high_threshold",
		message_key: "energy_high",
		priority: "warn"
	},
	{
		condition: "target == 0",
		message_key: "eco_mode",
		priority: "ok"
	},
	{
		condition: "temp_change_rate > 2",
		message_key: "temp_rising_fast",
		priority: "warn"
	},
	{
		condition: "motion == false && heating == 'on'",
		message_key: "no_motion_heating_on",
		priority: "info"
	},
	{
		condition: "outside_temp < temp - 3 && now % 86400000 < 9 * 3600000",
		message_key: "morning_cool_outside",
		priority: "info"
	},
	{
		condition: "outside_temp > temp && now % 86400000 > 11 * 3600000 && window == 'open'",
		message_key: "afternoon_window_open_hot_outside",
		priority: "warn"
	},
	{
		condition: "forecast_temp > 26 && temp < 23 && now % 86400000 < 8 * 3600000",
		message_key: "hot_day_morning_ventilate",
		priority: "info"
	},
	{
		condition: "forecast_temp > 28 && window == 'open' && now % 86400000 > 12 * 3600000",
		message_key: "very_hot_window_open",
		priority: "alert"
	},
	{
		condition: "outside_temp < 18 && temp > 24 && now % 86400000 < 7 * 3600000",
		message_key: "early_cool_outside_ventilate",
		priority: "info"
	},
	{
		condition: "window == 'closed' && outside_temp > temp && temp > 23 && now % 86400000 > 11 * 3600000",
		message_key: "keep_window_closed_cool_inside",
		priority: "info"
	},
	{
		condition: "(curtain == 'open' || blind == 'open') && outside_temp > 26 && now % 86400000 > 11 * 3600000",
		message_key: "close_curtains_to_keep_cool",
		priority: "info"
	},
	{
		condition: "window == 'open' && rain_soon == true",
		message_key: "rain_soon_close_window",
		priority: "alert"
	},
	{
		condition: "door == 'open' && heating == 'on' && adjacent_room_temp > temp + 1",
		message_key: "close_door_to_save_heat",
		priority: "info"
	},
	{
		condition: "air_quality == 'poor' && window == 'closed'",
		message_key: "ventilate_air_quality_poor",
		priority: "warn"
	},
	{
		condition: "humidity > 70 && window == 'closed'",
		message_key: "ventilate_high_humidity",
		priority: "info"
	},
	{
		condition: "forecast_sun == true && now % 86400000 > 7 * 3600000 && blind == 'closed' && temp < 21",
		message_key: "open_blinds_for_sun_warmth",
		priority: "info"
	},
	{
		condition: "window == 'open' && outside_temp < 10 && now % 86400000 > 22 * 3600000",
		message_key: "window_open_night_cold",
		priority: "alert"
	},
	{
		condition: "temp < 17 && window == 'open'",
		message_key: "room_too_cold_window_open",
		priority: "warn"
	},
	{
		condition: "humidity > 70 && temp - (outside_temp + (humidity/100)*(temp-outside_temp)) < 2",
		message_key: "mold_risk_dew_point",
		priority: "alert"
	}
];

async function loadRules() {
    // Core-Regeln
    return coreRules;
}

var low_humidity$1 = "Humidity below 35% – please ventilate or humidify";
var high_co2$1 = "High CO₂ levels – please air out";
var cold_temp$1 = "Temperature below 18 °C – check heating or windows";
var all_ok$1 = "All good here 🎉";
var temp_above_target$1 = "⚠️ Temperature well above target – check heating curve.";
var temp_below_target$1 = "❄️ Room is undercooled – check heating or windows.";
var humidity_low$1 = "💧 Humidity too low – consider using a humidifier.";
var humidity_high$1 = "🌫️ Humidity too high – ventilation recommended (risk of mold).";
var co2_high$1 = "🌬️ CO₂ level too high – ventilate to improve air quality.";
var window_open_heating_on$1 = "🪟 Heating is on while window is open – avoid energy loss.";
var room_empty_warm$1 = "📉 Room is empty but warm – adjust heating profile?";
var outside_warm_inside_warm$1 = "☀️ It's warm outside – reduce heating demand.";
var forecast_warmer_target_high$1 = "📅 Tomorrow will be warmer – lower target temperature?";
var energy_high$1 = "💸 High energy consumption – check heating strategy.";
var eco_mode$1 = "🛌 Temperature reduction active – Eco mode detected.";
var temp_rising_fast$1 = "🔥 Temperature rising unusually fast – inefficient?";
var no_motion_heating_on$1 = "🚪 No motion detected – room may be heated unnecessarily.";
var morning_cool_outside$1 = "🌄 It's cooler outside in the morning – ventilate to cool down.";
var afternoon_window_open_hot_outside$1 = "🌞 Warmer outside than inside – better close the window.";
var hot_day_morning_ventilate$1 = "📊 Hot day ahead – ventilate well in the morning.";
var very_hot_window_open$1 = "🔥 Very hot outside – close windows to avoid heating up.";
var early_cool_outside_ventilate$1 = "🧊 Early cool outside – natural cooling by ventilation possible.";
var keep_window_closed_cool_inside$1 = "Keep windows closed to keep it cool inside.";
var close_curtains_to_keep_cool$1 = "Close curtains or blinds to keep the room cool.";
var rain_soon_close_window$1 = "Rain is expected soon – please close the windows.";
var close_door_to_save_heat$1 = "Close the door to prevent heat loss to other rooms.";
var ventilate_air_quality_poor$1 = "Air quality is poor – ventilate the room.";
var ventilate_high_humidity$1 = "Humidity is high – ventilate to reduce moisture.";
var open_blinds_for_sun_warmth$1 = "Sunny soon – open blinds to warm up the room.";
var window_open_night_cold$1 = "🌙 Window is open at night and it's cold outside – please close to avoid cooling down.";
var room_too_cold_window_open$1 = "❄️ Room is below 17°C and window is open – please close to avoid undercooling.";
var mold_risk_dew_point$1 = "⚠️ Mold risk: High humidity and dew point reached – please ventilate!";
var debug_rule_match$1 = "Debug rule matched - rule engine is working";
var en = {
	low_humidity: low_humidity$1,
	high_co2: high_co2$1,
	cold_temp: cold_temp$1,
	all_ok: all_ok$1,
	temp_above_target: temp_above_target$1,
	temp_below_target: temp_below_target$1,
	humidity_low: humidity_low$1,
	humidity_high: humidity_high$1,
	co2_high: co2_high$1,
	window_open_heating_on: window_open_heating_on$1,
	room_empty_warm: room_empty_warm$1,
	outside_warm_inside_warm: outside_warm_inside_warm$1,
	forecast_warmer_target_high: forecast_warmer_target_high$1,
	energy_high: energy_high$1,
	eco_mode: eco_mode$1,
	temp_rising_fast: temp_rising_fast$1,
	no_motion_heating_on: no_motion_heating_on$1,
	morning_cool_outside: morning_cool_outside$1,
	afternoon_window_open_hot_outside: afternoon_window_open_hot_outside$1,
	hot_day_morning_ventilate: hot_day_morning_ventilate$1,
	very_hot_window_open: very_hot_window_open$1,
	early_cool_outside_ventilate: early_cool_outside_ventilate$1,
	keep_window_closed_cool_inside: keep_window_closed_cool_inside$1,
	close_curtains_to_keep_cool: close_curtains_to_keep_cool$1,
	rain_soon_close_window: rain_soon_close_window$1,
	close_door_to_save_heat: close_door_to_save_heat$1,
	ventilate_air_quality_poor: ventilate_air_quality_poor$1,
	ventilate_high_humidity: ventilate_high_humidity$1,
	open_blinds_for_sun_warmth: open_blinds_for_sun_warmth$1,
	window_open_night_cold: window_open_night_cold$1,
	room_too_cold_window_open: room_too_cold_window_open$1,
	mold_risk_dew_point: mold_risk_dew_point$1,
	debug_rule_match: debug_rule_match$1
};

var low_humidity = "Luftfeuchtigkeit unter 35 % – lüften oder befeuchten empfohlen";
var high_co2 = "CO₂-Wert hoch – bitte Stoßlüften";
var cold_temp = "Temperatur unter 18 °C – Heizung prüfen bzw. Fenster schließen";
var all_ok = "Alles im grünen Bereich 🎉";
var temp_above_target = "⚠️ Temperatur deutlich über dem Sollwert – Heizkurve prüfen.";
var temp_below_target = "❄️ Raum ist unterkühlt – Heizung oder Fenster prüfen.";
var humidity_low = "💧 Luftfeuchtigkeit zu niedrig – ggf. Luftbefeuchter nutzen.";
var humidity_high = "🌫️ Luftfeuchtigkeit zu hoch – Lüften empfohlen (Schimmelgefahr).";
var co2_high = "🌬️ CO₂-Wert zu hoch – Lüften verbessert Luftqualität.";
var window_open_heating_on = "🪟 Heizung läuft bei offenem Fenster – Energieverlust vermeiden.";
var room_empty_warm = "📉 Raum ist leer, aber warm – Heizprofil anpassen?";
var outside_warm_inside_warm = "☀️ Draußen ist es warm – Heizbedarf reduzieren.";
var forecast_warmer_target_high = "📅 Morgen wird’s wärmer – Zieltemperatur senken?";
var energy_high = "💸 Hoher Energieverbrauch – Heizstrategie prüfen.";
var eco_mode = "🛌 Temperaturabsenkung aktiv – Eco-Modus erkannt.";
var temp_rising_fast = "🔥 Temperaturanstieg ungewöhnlich schnell – ineffizient?";
var no_motion_heating_on = "🚪 Keine Bewegung erkannt – Raum evtl. unnötig beheizt.";
var morning_cool_outside = "🌄 Morgens ist es draußen kühler – jetzt lüften zum Abkühlen.";
var afternoon_window_open_hot_outside = "🌞 Draußen wärmer als drinnen – Fenster besser schließen.";
var hot_day_morning_ventilate = "📊 Heute wird’s heiß – jetzt morgens gut durchlüften.";
var very_hot_window_open = "🔥 Hitze draußen – Fenster schließen, um Aufheizen zu vermeiden.";
var early_cool_outside_ventilate = "🧊 Früh kühl draußen – natürliche Kühlung durch Lüften möglich.";
var keep_window_closed_cool_inside = "Fenster geschlossen halten, um es innen kühl zu halten.";
var close_curtains_to_keep_cool = "Vorhänge oder Jalousien schließen, um den Raum kühl zu halten.";
var rain_soon_close_window = "Bald Regen erwartet – Fenster besser schließen.";
var close_door_to_save_heat = "Tür schließen, um Wärmeverlust in andere Räume zu vermeiden.";
var ventilate_air_quality_poor = "Luftqualität schlecht – bitte lüften.";
var ventilate_high_humidity = "Luftfeuchtigkeit hoch – lüften empfohlen.";
var open_blinds_for_sun_warmth = "Bald sonnig – Jalousien öffnen, um Raum zu erwärmen.";
var window_open_night_cold = "🌙 Fenster ist nachts offen und es ist draußen kalt – bitte schließen, um Auskühlung zu vermeiden.";
var room_too_cold_window_open = "❄️ Raum ist unter 17 °C und das Fenster ist offen – bitte schließen, um Unterkühlung zu vermeiden.";
var mold_risk_dew_point = "⚠️ Schimmelgefahr: Hohe Luftfeuchtigkeit und Taupunkt erreicht – bitte lüften!";
var debug_rule_match = "Debug-Regel aktiv - Regelwerk funktioniert";
var de = {
	low_humidity: low_humidity,
	high_co2: high_co2,
	cold_temp: cold_temp,
	all_ok: all_ok,
	temp_above_target: temp_above_target,
	temp_below_target: temp_below_target,
	humidity_low: humidity_low,
	humidity_high: humidity_high,
	co2_high: co2_high,
	window_open_heating_on: window_open_heating_on,
	room_empty_warm: room_empty_warm,
	outside_warm_inside_warm: outside_warm_inside_warm,
	forecast_warmer_target_high: forecast_warmer_target_high,
	energy_high: energy_high,
	eco_mode: eco_mode,
	temp_rising_fast: temp_rising_fast,
	no_motion_heating_on: no_motion_heating_on,
	morning_cool_outside: morning_cool_outside,
	afternoon_window_open_hot_outside: afternoon_window_open_hot_outside,
	hot_day_morning_ventilate: hot_day_morning_ventilate,
	very_hot_window_open: very_hot_window_open,
	early_cool_outside_ventilate: early_cool_outside_ventilate,
	keep_window_closed_cool_inside: keep_window_closed_cool_inside,
	close_curtains_to_keep_cool: close_curtains_to_keep_cool,
	rain_soon_close_window: rain_soon_close_window,
	close_door_to_save_heat: close_door_to_save_heat,
	ventilate_air_quality_poor: ventilate_air_quality_poor,
	ventilate_high_humidity: ventilate_high_humidity,
	open_blinds_for_sun_warmth: open_blinds_for_sun_warmth,
	window_open_night_cold: window_open_night_cold,
	room_too_cold_window_open: room_too_cold_window_open,
	mold_risk_dew_point: mold_risk_dew_point,
	debug_rule_match: debug_rule_match
};

const SENSOR_KEYWORDS = {
    temperature: [
        'temperature', 'temperatur', 'température', 'temperatura', 'temperatuur', 'температура', '温度', '온도'
    ],
    heating: [
        'heating', 'heizung', 'climate', 'heat', 'thermostat', 'chauffage', 'riscaldamento', 'verwarming', 'calefacción', 'отопление', '난방'
    ],
    heating_level: [
        'heating_level', 'heizungsstufe', 'heat_level', 'level', 'stufe', 'power', 'leistung'
    ],
    humidity: [
        'humidity', 'feuchtigkeit', 'humidité', 'umidità', 'vochtigheid', 'humedad', 'влажность', '湿度', '습도'
    ],
    co2: [
        'co2', 'kohlendioxid', 'dioxyde de carbone', 'anidride carbonica', 'kooldioxide', 'dióxido de carbono', 'углекислый газ', '二氧化碳', '이산화탄소'
    ],
    window: [
        'window', 'fenster', 'fenêtre', 'finestra', 'raam', 'ventana', 'окно', '窗', '창문'
    ],
    door: [
        'door', 'tür', 'porte', 'porta', 'deur', 'puerta', 'дверь', '문'
    ],
    curtain: [
        'curtain', 'vorhang', 'rideau', 'tenda', 'gordijn', 'cortina', 'занавеска', '커튼'
    ],
    blind: [
        'blind', 'jalousie', 'store', 'persiana', 'jaloezie', 'persiana', 'жалюзи', '블라인드'
    ],
    energy: [
        'energy', 'energie', 'énergie', 'energia', 'energía', 'энергия', '에너지'
    ],
    motion: [
        'motion', 'bewegung', 'mouvement', 'movimento', 'beweging', 'movimiento', 'движение', '움직임'
    ],
    occupancy: [
        'occupancy', 'belegung', 'occupation', 'occupazione', 'bezetting', 'ocupación', 'занятость', '점유'
    ],
    air_quality: [
        'air_quality', 'luftqualität', "qualité de l'air", "qualità dell'aria", 'luchtkwaliteit', 'calidad del aire', 'качество воздуха', '공기질'
    ],
    rain: [
        'rain', 'regen', 'pluie', 'pioggia', 'lluvia', 'дождь', '비'
    ],
    sun: [
        'sun', 'sonne', 'soleil', 'sole', 'zon', 'sol', 'солнце', '태양'
    ],
    adjacent: [
        'adjacent', 'benachbart', 'adjacent', 'adiacente', 'aangrenzend', 'adyacente', 'смежный', '인접'
    ],
    forecast: [
        'forecast', 'vorhersage', 'prévision', 'previsione', 'voorspelling', 'pronóstico', 'прогноз', '예보'
    ],
    target: [
        'target', 'temperature_target', 'target_temp', 'soll', 'sollwert', 'ziel', 'zieltemperatur',
        'setpoint', 'set_temperature', 'climate', 'thermostat', 'target_heating',
        'target_temperature', 'solltemperatur', 'heating_target'
    ]
};

var __decorate$1 = (window && window.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let HausgeistCardEditor = class HausgeistCardEditor extends i {
    constructor() {
        super(...arguments);
        this.config = {};
        this._hass = undefined;
        this.testValues = {};
        this.rulesJson = '';
        this.notify = false;
        this.highThreshold = 2000;
        this._lastAreas = [];
        // Use arrow function to auto-bind 'this'
        this._onDebugChange = (e) => {
            const debug = e.target.checked;
            this.config = { ...this.config, debug };
            this._configChanged();
        };
    }
    _autodetect(areaId, type) {
        const states = Object.values(this.hass?.states || {});
        // 1. device_class
        let s = states.find((st) => st.attributes?.area_id === areaId && st.attributes?.device_class === type);
        if (s && s.entity_id)
            return s.entity_id;
        // 2. keywords from centralized list
        const kw = SENSOR_KEYWORDS[type] || [type];
        s = states.find((st) => st.attributes?.area_id === areaId && kw.some(k => st.entity_id.toLowerCase().includes(k) ||
            (st.attributes.friendly_name || '').toLowerCase().includes(k)));
        if (s && s.entity_id)
            return s.entity_id;
        // 3. fallback: area name
        const areaName = (this.hass?.areas && this.hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
        s = states.find((st) => (st.entity_id.toLowerCase().includes(areaName) ||
            (st.attributes.friendly_name || '').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k)));
        return s && s.entity_id ? s.entity_id : undefined;
    }
    setConfig(config) {
        this.config = config;
    }
    // Getter and setter for hass
    get hass() {
        return this._hass;
    }
    set hass(hass) {
        this._hass = hass;
        this.requestUpdate();
    }
    // Handle sensor selection change for a specific area and type
    _onAreaSensorChange(areaId, type, e) {
        const entity_id = e.target.value;
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: entity_id };
        this.config = { ...this.config, overrides };
        this._configChanged();
    }
    // Handle "Use Auto-Detected" button click
    _onUseAutoDetected(areaId, type) {
        const autoId = this._autodetect(areaId, type);
        if (!autoId)
            return;
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: autoId };
        this.config = { ...this.config, overrides };
        this._configChanged();
    }
    // Dispatch a custom event to notify that the config has changed
    _configChanged() {
        // Always include the current areas in the config
        if (this._lastAreas && Array.isArray(this._lastAreas)) {
            // Build auto-mapping: auto[area_id][type] = entity_id (wie im Editor angezeigt)
            const auto = {};
            const areas = this._lastAreas;
            const sensorTypes = [
                'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
            ];
            // Debug: Show all states with their area_ids
            if (this.config.debug) {
                const states = Object.values(this.hass?.states || {});
                console.log('All states with area_ids:', states.filter((s) => s.attributes?.area_id)
                    .map((s) => `${s.entity_id} (${s.attributes.area_id})`));
            }
            for (const area of areas) {
                auto[area.area_id] = {};
                for (const type of sensorTypes) {
                    const autoId = this._autodetect(area.area_id, type);
                    if (autoId)
                        auto[area.area_id][type] = autoId;
                    // Debug: Log each detected sensor
                    if (this.config.debug) {
                        console.log(`Auto-detected for ${area.area_id} - ${type}: ${autoId || 'none'}`);
                    }
                }
            }
            // Debug: Log the final auto config
            if (this.config.debug) {
                console.log('Final auto config:', JSON.stringify(auto, null, 2));
            }
            this.config = { ...this.config, areas: this._lastAreas, auto };
        }
        const event = new CustomEvent('config-changed', {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
    // Handle test value changes for a specific area and type
    handleTestValueChange(areaId, type, e) {
        const value = e.target.value;
        this.testValues = { ...this.testValues, [areaId + '_' + type]: value };
        this.requestUpdate();
    }
    // Handle changes in the rules JSON text area
    handleRulesChange(e) {
        this.rulesJson = e.target.value;
        this._configChanged();
    }
    // Handle changes in the notification checkbox
    handleNotifyChange(e) {
        this.notify = e.target.checked;
        this._configChanged();
    }
    // Handle changes in the high threshold input
    handleThresholdChange(e) {
        this.highThreshold = Number(e.target.value);
        this._configChanged();
    }
    // Handle area enable/disable
    _onAreaEnabledChange(areaId, e) {
        const checked = e.target.checked;
        const areas = [...(this.config.areas || this._lastAreas.map(a => ({ ...a })))];
        const areaIndex = areas.findIndex(a => a.area_id === areaId);
        if (areaIndex >= 0) {
            areas[areaIndex] = { ...areas[areaIndex], enabled: checked };
        }
        else {
            areas.push({ area_id: areaId, name: areaId, enabled: checked });
        }
        this.config = { ...this.config, areas };
        this._configChanged();
    }
    // Render the editor UI
    render() {
        const hass = this.hass;
        // Find all Weather Entities
        const weatherEntities = Object.entries(hass?.states || {})
            .filter(([entity_id, state]) => entity_id.startsWith('weather.'))
            .map(([entity_id, state]) => ({
            entity_id,
            name: state.attributes?.friendly_name || entity_id
        }));
        const areas = hass?.areas
            ? Object.values(hass.areas)
            : Array.from(new Set(Object.values(hass?.states || {}).map((e) => e.attributes?.area_id).filter(Boolean))).map((area_id) => ({ area_id, name: area_id }));
        this._lastAreas = areas;
        const states = Object.values(hass?.states || {});
        // Nur die Sensoren die wir pro Raum brauchen
        const requiredSensorTypes = [
            'temperature', // Raumtemperatur
            'humidity', // Luftfeuchtigkeit
            'co2', // CO2-Gehalt
            'window', // Fenster-Status
            'door', // Tür-Status
            'curtain', // Vorhang-Status
            'blind', // Rolladen-Status
            'heating', // Heizungs-Status (an/aus)
            'heating_level', // Heizungs-Level (0-100%)
            'target' // Zieltemperatur
        ];
        const missingSensorsPerArea = areas.map(area => {
            const missing = requiredSensorTypes.filter(type => {
                const found = states.some((e) => e.attributes?.area_id === area.area_id && (type === 'heating' || type === 'heating_level'
                    ? ['heating', 'heizung', 'thermostat', 'climate'].some(k => e.entity_id.toLowerCase().includes(k))
                    : e.attributes?.device_class === type || (e.entity_id.toLowerCase().includes(type))));
                return !found;
            });
            return { area, missing };
        });
        // Styles einbinden
        return x `
      <style>
        .card-config {
          padding: 1em;
        }
        hr { margin: 1em 0; border: none; border-top: 1px solid #ddd; }
        select { min-width: 200px; }
        li { margin: 0.2em 0; }
        .sensor-row {
          display: flex;
          align-items: center;
          gap: 0.5em;
          margin-bottom: 0.5em;
        }
        .target-row {
          margin-bottom: 1em;
        }
        .sensor-label {
          min-width: 120px;
          font-weight: bold;
        }
        .sensor-select {
          flex-grow: 1;
        }
        .help-text {
          color: #666;
          font-size: 0.9em;
          margin-top: 0.3em;
        }
      </style>
      <div class="card-config">
        <!-- Debug Mode -->
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>

        <!-- Weather Entity Selection -->
        <div style="margin-top:1em;">
          <b>Weather Entity:</b>
          <select @change=${(e) => {
            this.config = {
                ...this.config,
                weather_entity: e.target.value
            };
            this._configChanged();
        }} .value=${this.config.weather_entity || 'weather.home'}>
            ${weatherEntities.map(entity => x `
              <option value="${entity.entity_id}">${entity.name} (${entity.entity_id})</option>
            `)}
          </select>
        </div>

        <!-- Default Target Temperature -->
        <div style="margin-top:1em;">
          <b>Default Target Temperature:</b>
          <input 
            type="number" 
            min="15" 
            max="30" 
            step="0.5"
            .value=${this.config.default_target || "21"} 
            @change=${(e) => {
            this.config = {
                ...this.config,
                default_target: Number(e.target.value)
            };
            this._configChanged();
        }}
          />°C
        </div>

        <hr />
        <b>Areas and Sensors:</b>
        ${areas.map(area => {
            const isEnabled = this.config.areas?.find(a => a.area_id === area.area_id)?.enabled !== false;
            return x `
          <div class="${isEnabled ? '' : 'disabled-area'}">
            <div class="area-header">
              <input 
                type="checkbox" 
                .checked=${isEnabled} 
                @change=${(e) => this._onAreaEnabledChange(area.area_id, e)}
              />
              <b>${area.name || area.area_id}</b>
            </div>
            <ul>
              ${requiredSensorTypes.map(type => {
                const areaSensors = states.filter((e) => e.attributes?.area_id === area.area_id);
                const matchingByClass = areaSensors.filter((e) => e.attributes?.device_class === type);
                const matchingByKeyword = areaSensors.filter((e) => {
                    const keywords = SENSOR_KEYWORDS[type] || [type];
                    return keywords.some(k => e.entity_id.toLowerCase().includes(k) ||
                        (e.attributes.friendly_name || '').toLowerCase().includes(k)) && !matchingByClass.includes(e);
                });
                const otherSensors = areaSensors.filter(s => !matchingByClass.includes(s) && !matchingByKeyword.includes(s));
                const autoId = this._autodetect(area.area_id, type);
                const selected = this.config.overrides?.[area.area_id]?.[type] || '';
                return x `
                <li>
                  <div class="sensor-row ${type === 'target' ? 'target-row' : ''}">
                    <span class="sensor-label">
                      ${type === 'target' ? 'Zieltemperatur' :
                    type === 'heating' ? 'Heizung' :
                        type === 'heating_level' ? 'Heizleistung' :
                            type}:
                    </span>
                    <div class="sensor-select">
                      <select @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)} .value=${selected || ''}>
                        ${type === 'target' ? x `
                          <option value="">(Standard: ${this.config.default_target || 21}°C)</option>
                          <option value="none">Keine automatische Anpassung</option>
                        ` : x `
                          <option value="">(auto${autoId ? ': ' + autoId : ': none'})</option>
                          <option value="none">Kein Sensor</option>
                        `}
                        
                        ${matchingByClass.length > 0 ? x `
                          <optgroup label="Passende Sensoren (nach Device Class)">
                            ${matchingByClass.map((s) => x `
                              <option value="${s.entity_id}" ?selected=${selected === s.entity_id}>
                                ${s.attributes.friendly_name || s.entity_id} 
                                [${s.state}${type === 'target' || type === 'temperature' ? '°C' :
                    type === 'heating_level' ? '%' :
                        s.attributes.unit_of_measurement || ''}]
                              </option>
                            `)}
                          </optgroup>
                        ` : ''}
                        
                        ${matchingByKeyword.length > 0 ? x `
                          <optgroup label="Passende Sensoren (nach Name)">
                            ${matchingByKeyword.map((s) => x `
                              <option value="${s.entity_id}" ?selected=${selected === s.entity_id}>
                                ${s.attributes.friendly_name || s.entity_id} 
                                [${s.state}${s.attributes.unit_of_measurement || ''}]
                              </option>
                            `)}
                          </optgroup>
                        ` : ''}
                        
                        ${otherSensors.length > 0 ? x `
                          <optgroup label="Andere Sensoren">
                            ${otherSensors.map((s) => x `
                              <option value="${s.entity_id}" ?selected=${selected === s.entity_id}>
                                ${s.attributes.friendly_name || s.entity_id} 
                                [${s.state}${s.attributes.unit_of_measurement || ''}]
                                ${s.attributes.device_class ? ` (${s.attributes.device_class})` : ''}
                              </option>
                            `)}
                          </optgroup>
                        ` : ''}
                      </select>
                      ${type === 'target' ? x `
                        <div class="help-text">
                          Wählen Sie einen Sensor für die Zieltemperatur aus oder lassen Sie es leer, 
                          um den Standard-Wert von ${this.config.default_target || 21}°C zu verwenden.
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </li>
                `;
            })}
            </ul>
          </div>
        `;
        })}
      </div>

      <!-- Missing Sensors per Area -->
      <div style="margin-top:1em;">
        <b>Fehlende Sensoren pro Bereich:</b>
        <ul>
          ${missingSensorsPerArea.map(a => x `<li><b>${a.area.name}</b>: ${a.missing.length === 0 ? 'Alle gefunden' : a.missing.join(', ')}</li>`)}
        </ul>
      </div>

      <!-- Notifications & High Threshold -->
      <div style="margin-top:1em;">
        <label><input type="checkbox" .checked=${this.notify} @change=${this.handleNotifyChange} /> Regel-Treffer als Home Assistant Notification anzeigen</label>
      </div>
      <div style="margin-top:1em;">
        <label>High Threshold: <input type="number" .value=${this.highThreshold} @input=${this.handleThresholdChange} /></label>
      </div>
    `;
    }
};
__decorate$1([
    n({ type: Object })
], HausgeistCardEditor.prototype, "config", void 0);
__decorate$1([
    n({ type: Object })
], HausgeistCardEditor.prototype, "testValues", void 0);
__decorate$1([
    n({ type: String })
], HausgeistCardEditor.prototype, "rulesJson", void 0);
__decorate$1([
    n({ type: Boolean })
], HausgeistCardEditor.prototype, "notify", void 0);
__decorate$1([
    n({ type: Number })
], HausgeistCardEditor.prototype, "highThreshold", void 0);
HausgeistCardEditor = __decorate$1([
    t('hausgeist-card-editor')
], HausgeistCardEditor);

const styles = i$3 `
:host {
  display: block;
  background: var(--ha-card-background, var(--card-background-color, #fff));
  border-radius: var(--ha-card-border-radius, 1em);
  box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.07));
  padding: 1.5em;
  font-family: var(--primary-font-family, inherit);
  color: var(--primary-text-color, #222);
}

h2 {
  margin-top: 0;
  font-size: 1.3em;
  color: var(--primary-text-color, #4a4a4a);
}

p.warning {
  color: var(--warning-color, #b85c00);
  background: var(--warning-bg, #fff7e6);
  border-left: 4px solid var(--warning-border, #ffb300);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.info {
  color: var(--info-color, #0288d1);
  background: var(--info-bg, #e6f4ff);
  border-left: 4px solid var(--info-border, #2196f3);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.ok {
  color: var(--success-color, #357a38);
  background: var(--success-bg, #e6f9e6);
  border-left: 4px solid var(--success-border, #4caf50);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

.debug {
  font-size: 0.9em;
  color: var(--secondary-text-color, #888);
  background: var(--secondary-background-color, #f5f5f5);
  border-radius: 0.5em;
  padding: 0.5em 1em;
  margin: 0.5em 0;
  white-space: pre-wrap;
}`;

var __decorate = (window && window.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const TRANSLATIONS = { de, en };
let HausgeistCard = class HausgeistCard extends i {
    constructor() {
        super(...arguments);
        this.config = {};
        this.debug = false;
        this.notify = false;
        this.highThreshold = 2000;
        this.rulesJson = '';
        this.texts = TRANSLATIONS['de'];
        this.ready = false;
    }
    // Support the editor UI
    static async getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
    // Provide default configuration
    static getStubConfig() {
        return {
            debug: false,
            notify: false,
            highThreshold: 2000,
            weather_entity: 'weather.home',
            default_target: 21
        };
    }
    // Add required setConfig method for custom cards
    setConfig(config) {
        // Store the configuration
        this.config = config;
        // Set debug flag from config
        this.debug = config.debug ?? false;
        // Set notification preference from config
        this.notify = config.notify ?? false;
        // Set high threshold from config
        this.highThreshold = config.highThreshold ?? 2000;
        // Set rules JSON if provided
        if (config.rulesJson) {
            this.rulesJson = config.rulesJson;
        }
    }
    async connectedCallback() {
        super.connectedCallback();
        try {
            if (this.debug) {
                console.log('[Hausgeist] Connected callback starting...');
            }
            let rules;
            if (this.rulesJson) {
                if (this.debug) {
                    console.log('[Hausgeist] Using provided rulesJson');
                }
                rules = JSON.parse(this.rulesJson);
            }
            else {
                if (this.debug) {
                    console.log('[Hausgeist] Loading rules from plugin-loader');
                }
                rules = await loadRules();
            }
            if (!rules || !Array.isArray(rules)) {
                console.error('[Hausgeist] Invalid rules format:', rules);
                this.ready = false;
                return;
            }
            if (this.debug) {
                console.log('[Hausgeist] Loaded rules:', rules);
            }
            this.engine = new RuleEngine(rules);
            this.ready = true;
            if (this.debug) {
                console.log('[Hausgeist] Initialization complete, requesting update');
            }
            this.requestUpdate();
        }
        catch (error) {
            console.error('[Hausgeist] Error initializing card:', error);
            this.ready = false;
        }
    }
    // Find sensor by type in area, with overrides and auto-detection
    _findSensor(sensors, area, usedSensors, sensorType) {
        if (this.debug) {
            console.log(`[_findSensor] Looking for ${sensorType} in area ${area}`);
            console.log(`[_findSensor] config.overrides[${area}]:`, this.config?.overrides?.[area]);
            console.log(`[_findSensor] config.auto[${area}]:`, this.config?.auto?.[area]);
        }
        // 1. Check for manual override in config
        const overrideId = this.config?.overrides?.[area]?.[sensorType];
        if (overrideId) {
            const sensor = sensors.find((s) => s.entity_id === overrideId);
            if (sensor) {
                usedSensors.push({
                    type: `${sensorType} (override)`,
                    entity_id: sensor.entity_id,
                    value: sensor.state
                });
                return sensor;
            }
            if (this.debug)
                console.log(`[_findSensor] Override sensor ${overrideId} not found`);
        }
        // 2. Check auto-detected sensor from config
        const autoId = this.config?.auto?.[area]?.[sensorType];
        if (autoId) {
            const sensor = sensors.find((s) => s.entity_id === autoId);
            if (sensor) {
                usedSensors.push({
                    type: `${sensorType} (auto)`,
                    entity_id: sensor.entity_id,
                    value: sensor.state
                });
                return sensor;
            }
            if (this.debug)
                console.log(`[_findSensor] Auto sensor ${autoId} not found`);
        }
        // 3. Not found
        if (this.debug) {
            usedSensors.push({
                type: sensorType,
                entity_id: '[NOT FOUND]',
                value: 'No matching sensor found'
            });
        }
        return undefined;
    }
    render() {
        if (!this.config) {
            return x `<ha-card>
        <div class="card-content">
          <p>Invalid configuration</p>
        </div>
      </ha-card>`;
        }
        if (!this.hass) {
            return x `<ha-card>
        <div class="card-content">
          <p>Home Assistant not available</p>
        </div>
      </ha-card>`;
        }
        if (!this.engine || !this.ready) {
            return x `<ha-card>
        <div class="card-content">
          <p>Loading...</p>
        </div>
      </ha-card>`;
        }
        const debugBanner = this.debug ? x `<p class="debug-banner">🛠️ Debug mode active</p>` : '';
        const debugOut = [];
        const { states } = this.hass;
        // Ensure states is always an array for downstream logic
        const statesArray = Array.isArray(states) ? states : Object.values(states || {});
        // If no areas are configured, use all areas from Home Assistant
        let areas = this.config.areas || [];
        if (areas.length === 0 && this.hass.areas) {
            areas = Object.entries(this.hass.areas).map(([id, area]) => ({
                area_id: id,
                name: area.name || id,
                enabled: true
            }));
        }
        // Filter enabled areas
        areas = areas.filter(a => a.enabled !== false);
        // If no areas are enabled, show a message
        if (areas.length === 0) {
            return x `<ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <p>No areas enabled. Please enable at least one area in the card configuration.</p>
        </div>
      </ha-card>`;
        }
        const areaIds = areas.map(a => a.area_id);
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        const defaultTarget = this.config?.overrides?.default_target || 21;
        const weatherEntity = this.config.weather_entity || 'weather.home';
        if (this.debug) {
            debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
            debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        // Mapping areaId -> Klartextname (aus config.areas)
        const areaIdToName = {};
        areas.forEach(a => { areaIdToName[a.area_id] = a.name; });
        const areaMessages = areaIds.map((area) => {
            const sensors = filterSensorsByArea(statesArray, area);
            const usedSensors = [];
            if (this.debug) {
                debugOut.push(`Processing area: ${area}`);
                debugOut.push(`Available sensors: ${sensors.map((s) => s.entity_id).join(', ')}`);
                debugOut.push(`Configured overrides: ${JSON.stringify(this.config?.overrides?.[area])}`);
                debugOut.push(`Auto-detected sensors: ${JSON.stringify(this.config?.auto?.[area])}`);
            }
            // Use imported SENSOR_KEYWORDS from sensor-keywords.ts
            const findSensor = (cls) => {
                return this._findSensor(statesArray, area, usedSensors, cls);
            };
            // Ensure all required sensor types are checked for sensor presence (for usedSensors and warning logic)
            const requiredSensorTypes = [
                'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'energy', 'motion', 'occupancy', 'air_quality', 'rain', 'sun', 'adjacent', 'forecast'
            ];
            // Call findSensor for all required types to populate usedSensors, even if not used in context
            requiredSensorTypes.forEach(type => { findSensor(type); });
            const get = (cls) => {
                const s = findSensor(cls);
                return s ? Number(s.state) : undefined;
            };
            // Helper to always cast to 'any' for state lookups
            const findState = (fn) => {
                const found = statesArray.find(fn);
                return found ? found : undefined;
            };
            // Get target temperature, default to config override or 21°C
            const context = {
                target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
                temp: get('temperature'),
                humidity: get('humidity'),
                co2: get('co2'),
                window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                outside_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
                forecast_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
                energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: this.highThreshold,
                temp_change_rate: this._calculateTempChangeRate(area, states),
                now: Date.now(),
                curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
                rain_soon: findState((e) => e.entity_id.includes('rain') && e.attributes.area_id === area)?.state === 'on' || false,
                adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
                air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
                forecast_sun: findState((e) => e.entity_id.includes('forecast') && e.entity_id.includes('sun') && e.attributes.area_id === area)?.state === 'on' || false,
            };
            const evals = this.engine ? this.engine.evaluate(context) : [];
            if (this.debug) {
                debugOut.push(`--- ${area} ---\n` +
                    'Sensors used:\n' +
                    usedSensors.map((s) => `  [${s.type}] ${s.entity_id}: ${s.value}`).join('\n') +
                    `\nRules checked: ${this.engine ? this.engine['rules'].length : 0}\n` +
                    `Rules matched: ${evals.length}\n` +
                    evals.map((ev) => `${ev.priority}: ${ev.message_key}`).join("\n"));
            }
            return { area: areaIdToName[area] || area, evals, usedSensors };
        });
        // Only show areas with rule matches
        const topMessages = areaMessages
            .filter((a) => a.evals.length > 0)
            .map((a) => {
            // Pick highest priority message for each area
            const top = a.evals.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0))[0];
            if (!top || !top.message_key) {
                return undefined; // Skip if no valid message
            }
            if (this.debug) {
                debugOut.push(`Top message for ${a.area}: ${top.priority} - ${top.message_key}`);
            }
            return { area: a.area, ...top, usedSensors: a.usedSensors };
        })
            .filter((e) => !!e);
        const anySensorsUsed = areaMessages.some((areaMsg) => areaMsg.usedSensors?.some((s) => s.entity_id !== '[NOT FOUND]'));
        const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);
        return x `
      ${debugBanner}
      <ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist sagt:</h2>
          ${!anySensorsUsed
            ? x `<p class="warning">⚠️ Keine Sensoren in den aktivierten Bereichen gefunden!<br>Bitte überprüfen Sie die Sensor-Konfiguration oder weisen Sie den Sensoren die entsprechenden Bereiche zu.</p>`
            : !anyRulesApplied
                ? x `<p class="info">ℹ️ Alle Bereiche in Ordnung - keine Handlungsempfehlungen.</p>`
                : x `
                ${topMessages.map(e => x `
                  <p class="${e.priority}">
                    <b>${e.area}:</b> ${this.texts?.[e.message_key] || `Fehlende Übersetzung: ${e.message_key}`}
                  </p>
                `)}
              `}
          ${this.debug ? x `
            <div class="debug">${debugOut.join('\n\n')}</div>
            <div class="sensors-used">
              <b>Verwendete Sensoren:</b>
              <ul>
                ${areaMessages.map(areaMsg => x `
                  <li><b>${areaMsg.area}:</b>
                    <ul>
                      ${areaMsg.usedSensors.map(s => x `<li>[${s.type}] ${s.entity_id}: ${s.value}</li>`)}
                    </ul>
                  </li>
                `)}
              </ul>
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
    }
    // Build evaluation context for rules with weather data and sensor values
    _buildContext(area, usedSensors, states, weatherEntity, defaultTarget) {
        // Use the passed-in states array everywhere
        const findSensor = (type) => {
            return this._findSensor(states, area, usedSensors, type);
        };
        const get = (type) => {
            const s = findSensor(type);
            return s ? Number(s.state) : undefined;
        };
        const findState = (fn) => {
            const found = states.find(fn);
            return found ? found : undefined;
        };
        // Get weather data
        const weather = findState((e) => e.entity_id === weatherEntity);
        const weatherAttributes = weather?.attributes || {};
        const forecast = weatherAttributes.forecast?.[0] || {};
        const target = this._getTargetTemperature(area, states, defaultTarget);
        return {
            debug: this.debug,
            target,
            temp: get('temperature'),
            heating_level: get('heating_level'),
            humidity: get('humidity'),
            co2: get('co2'),
            window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
            heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
            motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
            occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
            energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
            high_threshold: this.highThreshold,
            temp_change_rate: 0,
            now: Date.now(),
            curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
            blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
            // Weather data directly from weather entity
            outside_temp: Number(weatherAttributes.temperature ?? 15),
            forecast_temp: Number(forecast.temperature ?? 15),
            rain_soon: (forecast.precipitation ?? 0) > 0,
            forecast_sun: forecast.condition === 'sunny',
            // Additional sensor data
            adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
            air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
        };
    }
    _calculateTempChangeRate(area, states) {
        try {
            const tempSensor = states.find(s => s.attributes?.area_id === area && s.entity_id.includes('temperature'));
            if (tempSensor) {
                const history = tempSensor.attributes?.history || [];
                if (history.length >= 2) {
                    const [latest, previous] = history.slice(-2);
                    const timeDiff = (latest.timestamp - previous.timestamp) / 3600000; // Convert ms to hours
                    if (timeDiff > 0) {
                        return (latest.value - previous.value) / timeDiff;
                    }
                }
            }
        }
        catch (error) {
            console.error('Error calculating temperature change rate:', error);
        }
        return 0; // Default to 0 if calculation fails
    }
    _getTargetTemperature(area, states, defaultTarget) {
        try {
            // 1. Prüfe auf Override in den Einstellungen
            const override = this.config?.overrides?.[area]?.target;
            if (override) {
                const overrideSensor = states.find(s => s.entity_id === override);
                if (overrideSensor) {
                    const value = Number(overrideSensor.state);
                    if (!isNaN(value)) {
                        return value;
                    }
                }
            }
            // 2. Suche nach einem Zieltemperatur-Sensor im Raum
            const targetSensor = states.find(s => s.attributes?.area_id === area && (
            // Prüfe auf climate.* Entities
            (s.entity_id.startsWith('climate.') && s.attributes?.temperature !== undefined) ||
                // Prüfe auf dedizierte Zieltemperatur-Sensoren
                s.entity_id.includes('target_temp') ||
                s.entity_id.includes('temperature_target') ||
                s.entity_id.includes('setpoint')));
            if (targetSensor) {
                // Bei climate Entities nehmen wir temperature aus den Attributen
                if (targetSensor.entity_id.startsWith('climate.')) {
                    const value = Number(targetSensor.attributes.temperature);
                    if (!isNaN(value)) {
                        return value;
                    }
                }
                // Sonst den State
                const value = Number(targetSensor.state);
                if (!isNaN(value)) {
                    return value;
                }
            }
        }
        catch (error) {
            console.error('Error getting target temperature:', error);
        }
        // 3. Fallback auf den Default-Wert
        return this.config.default_target || defaultTarget;
    }
};
HausgeistCard.styles = styles;
__decorate([
    n({ type: Object })
], HausgeistCard.prototype, "hass", void 0);
__decorate([
    n({ type: Object })
], HausgeistCard.prototype, "config", void 0);
__decorate([
    n({ type: Boolean })
], HausgeistCard.prototype, "debug", void 0);
__decorate([
    n({ type: Boolean })
], HausgeistCard.prototype, "notify", void 0);
__decorate([
    n({ type: Number })
], HausgeistCard.prototype, "highThreshold", void 0);
__decorate([
    n({ type: String })
], HausgeistCard.prototype, "rulesJson", void 0);
HausgeistCard = __decorate([
    t('hausgeist-card')
], HausgeistCard);

export { HausgeistCard };
//# sourceMappingURL=hausgeist-card.js.map
