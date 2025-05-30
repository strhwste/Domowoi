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
    }
    evaluate(context) {
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
            }
            catch (e) {
                // Fehlerhafte Regel ignorieren
                continue;
            }
            if (hit) {
                results.push({ message_key: rule.message_key, priority: rule.priority });
            }
        }
        return results;
    }
}

function filterSensorsByArea(states, areaId) {
    // Return all entities for the area, not just those with specific device_class
    return states.filter(st => st.attributes.area_id === areaId);
}

var coreRules = [
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
	mold_risk_dew_point: mold_risk_dew_point$1
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
	mold_risk_dew_point: mold_risk_dew_point
};

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let HausgeistCardEditor = class HausgeistCardEditor extends i {
    constructor() {
        super(...arguments);
        this.config = {};
        this.hass = undefined;
        this.testValues = {};
        this.rulesJson = '';
        this.notify = false;
        this.highThreshold = 2000;
        // Use arrow function to auto-bind 'this'
        this._onDebugChange = (e) => {
            const debug = e.target.checked;
            this.config = { ...this.config, debug };
            this._configChanged();
        };
    }
    setConfig(config) {
        this.config = config;
    }
    set hassInstance(hass) {
        this.hass = hass;
        this.requestUpdate();
    }
    _onAreaSensorChange(areaId, type, e) {
        const entity_id = e.target.value;
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: entity_id };
        this.config = { ...this.config, overrides };
        this._configChanged();
    }
    _configChanged() {
        const event = new CustomEvent('config-changed', {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
    handleTestValueChange(areaId, type, e) {
        const value = e.target.value;
        this.testValues = { ...this.testValues, [areaId + '_' + type]: value };
        this.requestUpdate();
    }
    handleRulesChange(e) {
        this.rulesJson = e.target.value;
        this._configChanged();
    }
    handleNotifyChange(e) {
        this.notify = e.target.checked;
        this._configChanged();
    }
    handleThresholdChange(e) {
        this.highThreshold = Number(e.target.value);
        this._configChanged();
    }
    render() {
        const hass = this.hass;
        const areas = hass?.areas
            ? Object.values(hass.areas)
            : Array.from(new Set(Object.values(hass?.states || {}).map((e) => e.attributes?.area_id).filter(Boolean))).map((area_id) => ({ area_id, name: area_id }));
        const states = Object.values(hass?.states || {});
        const sensorTypes = [
            'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target' // heating/target neu
        ];
        // Helper: Autodetect sensor for area/type
        function autodetect(areaId, type) {
            // 1. device_class
            let s = states.find((st) => st.attributes?.area_id === areaId && st.attributes?.device_class === type);
            if (s && s.entity_id)
                return s.entity_id;
            // 2. keywords
            const keywords = {
                temperature: ['temperature', 'temperatur', 'température'],
                humidity: ['humidity', 'feuchtigkeit', 'humidité'],
                co2: ['co2'],
                window: ['window', 'fenster'],
                door: ['door', 'tür'],
                curtain: ['curtain', 'vorhang'],
                blind: ['blind', 'jalousie'],
                heating: ['heating', 'heizung', 'thermostat'],
                target: ['target', 'soll', 'setpoint']
            };
            const kw = keywords[type] || [type];
            s = states.find((st) => st.attributes?.area_id === areaId && kw.some(k => st.entity_id.toLowerCase().includes(k) || (st.attributes.friendly_name || '').toLowerCase().includes(k)));
            if (s && s.entity_id)
                return s.entity_id;
            // 3. fallback: area name
            const areaName = (hass.areas && hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
            s = states.find((st) => (st.entity_id.toLowerCase().includes(areaName) || (st.attributes.friendly_name || '').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k)));
            return s && s.entity_id ? s.entity_id : undefined;
        }
        // Felder, für die oft ein Helper/Template-Sensor benötigt wird
        const helperFields = [
            {
                key: 'rain_soon',
                name: 'Rain soon',
                yaml: `template:\n  - sensor:\n      - name: "Rain Soon"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].condition == 'rain' }}\n        unique_id: rain_soon`
            },
            {
                key: 'adjacent_room_temp',
                name: 'Adjacent room temperature',
                yaml: `template:\n  - sensor:\n      - name: "Adjacent Room Temperature"\n        state: >\n          {{ states('sensor.adjacent_room_temperature') }}\n        unique_id: adjacent_room_temp`
            },
            {
                key: 'air_quality',
                name: 'Air quality',
                yaml: `template:\n  - sensor:\n      - name: "Air Quality"\n        state: >\n          {{ states('sensor.air_quality') }}\n        unique_id: air_quality`
            },
            {
                key: 'forecast_sun',
                name: 'Forecast sun',
                yaml: `template:\n  - sensor:\n      - name: "Forecast Sun"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].condition == 'sunny' }}\n        unique_id: forecast_sun`
            },
        ];
        // Prüfen, ob Helper fehlen
        const missingHelpers = helperFields.filter(hf => !states.some((s) => s.entity_id.includes(hf.key)));
        // Feature 1: Automatische Erkennung und Anzeige von fehlenden Standard-Sensoren pro Bereich
        const requiredSensorTypes = [
            'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
        ];
        const missingSensorsPerArea = areas.map(area => {
            const missing = requiredSensorTypes.filter(type => {
                const found = states.some((e) => e.attributes?.area_id === area.area_id && (type === 'heating'
                    ? ['heating', 'heizung', 'thermostat'].some(k => e.entity_id.toLowerCase().includes(k))
                    : e.attributes?.device_class === type || (e.entity_id.toLowerCase().includes(type))));
                return !found;
            });
            return { area, missing };
        });
        // Feature 2: Link zur Helper-Verwaltung
        const helperLink = '/config/helpers';
        // Feature 4: Mehrsprachigkeit im Editor (Sprache aus hass übernehmen)
        hass?.selectedLanguage || 'de';
        // Feature 5: Erweiterte Debug-Ansicht
        // (Debug-Ausgabe ist bereits vorhanden, kann aber um Kontextdaten erweitert werden)
        // Feature 6: Regel-Editor (JSON-Textfeld, editierbar)
        if (!this.rulesJson && hass?.rules)
            this.rulesJson = JSON.stringify(hass.rules, null, 2);
        // Feature 8: Benachrichtigungsoptionen (Checkbox für Notification)
        // Feature 9: Konfigurierbare Schwellenwerte im Editor
        return x `
      <style>
        select { max-width: 260px; font-size: 1em; }
        .card-config { font-family: inherit; }
        ul { margin: 0 0 0 1em; padding: 0; }
        li { margin: 0.2em 0; }
        .auto-sensor-info { color: #888; font-size: 0.95em; margin-left: 0.5em; }
      </style>
      <div class="card-config">
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>
        <hr />
        <b>Sensor Overrides:</b>
        ${areas.map(area => x `
          <div style="margin-bottom: 1em;">
            <b>${area.name}</b>
            <ul>
              ${sensorTypes.map(type => {
            // Alle passenden Sensoren für diesen Bereich/Typ
            const sensors = states.filter((e) => e.attributes?.area_id === area.area_id &&
                (type === 'heating' ? ['heating', 'heizung', 'thermostat'].some(k => e.entity_id.toLowerCase().includes(k)) : true));
            const autoId = autodetect(area.area_id, type);
            const selected = this.config.overrides?.[area.area_id]?.[type] || '';
            return x `<li>${type}:
                  <select style="max-width: 260px;" @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)} .value=${selected}>
                    <option value="" disabled hidden>(auto${autoId ? ': ' + autoId : ': none'})</option>
                    ${sensors.map((s) => x `<option value="${s.entity_id}">${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
                  </select>
                  <span style="color: #888; font-size: 0.95em; margin-left: 0.5em;">${autoId ? `Auto: ${autoId}` : 'Auto: none gefunden'}</span>
                </li>`;
        })}
            </ul>
          </div>
        `)}
      </div>
      ${missingHelpers.length > 0 ? x `
        <div style="margin-top:2em; padding:1em; background:#fffbe6; border:1px solid #ffe58f; border-radius:0.5em;">
          <b>⚠️ Zusätzliche Sensoren/Helper benötigt:</b>
          <ul>
            ${missingHelpers.map(hf => x `<li>
              <b>${hf.name}</b>:<br/>
              <span style="font-size:0.95em; color:#888;">Sensor nicht gefunden. Füge folgenden YAML-Code in deine <b>configuration.yaml</b> oder nutze die Helper-Verwaltung:</span>
              <pre style="background:#f5f5f5; border-radius:0.3em; padding:0.5em; margin:0.5em 0;">${hf.yaml}</pre>
            </li>`)}
          </ul>
        </div>
      ` : ''}
      <!-- Feature 1: Fehlende Sensoren pro Bereich anzeigen -->
      <div style="margin-top:1em;">
        <b>Fehlende Sensoren pro Bereich:</b>
        <ul>
          ${missingSensorsPerArea.map(a => x `<li><b>${a.area.name}</b>: ${a.missing.length === 0 ? 'Alle gefunden' : a.missing.join(', ')}</li>`)}
        </ul>
      </div>
      <!-- Feature 2: Link zur Helper-Verwaltung -->
      <div style="margin-top:1em;">
        <a href="${helperLink}" target="_blank" rel="noopener" style="color:#00529b; text-decoration:underline;">Home Assistant Helper-Verwaltung öffnen</a>
      </div>
      <!-- Feature 3: Testmodus/Simulation -->
      <div style="margin-top:1em;">
        <b>Testmodus / Simulation:</b>
        <ul>
          ${areas.map(area => x `
            <li><b>${area.name}</b>:
              <ul>
                ${requiredSensorTypes.map(type => x `
                  <li>${type}: <input type="text" .value=${this.testValues[area.area_id + '_' + type] || ''} @input=${(e) => this.handleTestValueChange(area.area_id, type, e)} /></li>
                `)}
              </ul>
            </li>
          `)}
        </ul>
        <span style="font-size:0.95em; color:#888;">(Gib Testwerte ein, um die Regeln zu simulieren. Diese Werte überschreiben die echten Sensordaten temporär.)</span>
      </div>
      <!-- Feature 6: Regel-Editor (JSON) -->
      <div style="margin-top:1em;">
        <b>Regeln bearbeiten (JSON):</b><br/>
        <textarea style="width:100%; min-height:120px; font-family:monospace;" @input=${this.handleRulesChange} .value=${this.rulesJson}></textarea>
        <span style="font-size:0.95em; color:#888;">(Bearbeite die Regeln als JSON. Änderungen werden übernommen.)</span>
      </div>
      <!-- Feature 8: Benachrichtigungsoptionen -->
      <div style="margin-top:1em;">
        <label><input type="checkbox" .checked=${this.notify} @change=${this.handleNotifyChange} /> Regel-Treffer als Home Assistant Notification anzeigen</label>
      </div>
      <!-- Feature 9: Schwellenwert -->
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
], HausgeistCardEditor.prototype, "hass", void 0);
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

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const TRANSLATIONS = { de, en };
let HausgeistCard = class HausgeistCard extends i {
    constructor() {
        super(...arguments);
        this.debug = false;
        this.texts = TRANSLATIONS['de'];
        this.ready = false;
    }
    async firstUpdated() {
        try {
            const rules = await loadRules();
            this.engine = new RuleEngine(rules);
            this.ready = true;
        }
        catch (error) {
            console.error('Failed to load rules:', error);
            this.ready = false;
        }
        this.requestUpdate();
    }
    setConfig(config) {
        this.config = config;
        this.debug = !!config?.debug; // update debug property from config
    }
    static getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
    static getStubConfig() {
        return { debug: false };
    }
    render() {
        if (!this.ready || !this.engine) {
            return x `<p>Loading…</p>`;
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        const states = Object.values(this.hass.states);
        // Fix: add type annotations and correct scoping
        const areaIds = states.reduce((uniqueAreas, e) => {
            const areaId = e.attributes?.area_id;
            if (areaId && !uniqueAreas.includes(areaId)) {
                uniqueAreas.push(areaId);
            }
            return uniqueAreas;
        }, []);
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        const defaultTarget = this.config?.overrides?.default_target || 21;
        let debugOut = [];
        const areaMessages = areaIds.map((area) => {
            const sensors = filterSensorsByArea(states, area);
            const usedSensors = [];
            // Multilingual sensor keywords for fallback
            const SENSOR_KEYWORDS = {
                temperature: [
                    'temperature', 'temperatur', 'température', 'temperatura', 'temperatuur', 'температура', '温度', '온도'
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
                ]
            };
            // Inline findSensor logic (since _findSensor is not a method)
            const findSensor = (cls) => {
                // 1. Check for manual override in config
                const overrideId = this.config?.overrides?.[area]?.[cls];
                if (overrideId) {
                    const s = sensors.find((st) => st.entity_id === overrideId);
                    if (s) {
                        usedSensors.push({ type: cls + ' (override)', entity_id: s.entity_id, value: s.state });
                        return s;
                    }
                }
                // 2. Autodetect by device_class
                let s = sensors.find((st) => st.attributes.device_class === cls);
                if (s) {
                    usedSensors.push({ type: cls, entity_id: s.entity_id, value: s.state });
                    return s;
                }
                // 3. Fallback: search by friendly_name or entity_id for keywords
                const keywords = SENSOR_KEYWORDS[cls] || [];
                let found = sensors.find((st) => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return keywords.some((k) => name.includes(k) || eid.includes(k));
                });
                if (found) {
                    usedSensors.push({ type: cls, entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // 4. Extra fallback: look for sensors whose entity_id or friendly_name contains the area name
                const areaName = (this.hass.areas && this.hass.areas[area]?.name?.toLowerCase()) || area.toLowerCase();
                found = sensors.find((st) => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return name.includes(areaName) || eid.includes(areaName);
                });
                if (found) {
                    usedSensors.push({ type: cls + ' (area-fallback)', entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // If still not found, log a warning in debug
                if (this.debug) {
                    usedSensors.push({ type: cls, entity_id: '[NOT FOUND]', value: 'No matching sensor found' });
                }
                return undefined;
            };
            const get = (cls) => {
                const s = findSensor(cls);
                return s ? Number(s.state) : undefined;
            };
            // Helper to always cast to 'any' for state lookups
            const findState = (fn) => {
                const found = states.find(fn);
                return found ? found : undefined;
            };
            const context = {
                target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
                humidity: get('humidity'),
                co2: get('co2'),
                window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                outside_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
                forecast_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
                energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: 2000,
                temp_change_rate: 0,
                now: Date.now(),
                curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
                // Ergänzungen für Regeln
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
            // Attach usedSensors to area for later display
            return { area, evals, usedSensors };
        });
        // Top messages: only areas with at least one rule hit
        const topMessages = areaMessages.filter((a) => a.evals.length > 0)
            .map((a) => {
            // Pick highest prio message for each area
            const top = a.evals.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0))[0];
            return { area: a.area, ...top, usedSensors: a.usedSensors };
        });
        const anySensorsUsed = areaMessages.some((areaMsg) => areaMsg.usedSensors && areaMsg.usedSensors.length > 0 && areaMsg.usedSensors.some((s) => s.entity_id !== '[NOT FOUND]'));
        const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);
        return x `
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed ? x `<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>` :
            (!anyRulesApplied ? x `<p class="warning">⚠️ No rules applied (no comparisons made for any area).</p>` :
                topMessages.map(e => x `<p class="${e.priority}"><b>${e.area}:</b> ${this.texts?.[e.message_key] || `Missing translation: ${e.message_key}`}</p>`))}
      ${this.debug ? x `
        <div class="sensors-used">
          <b>Sensors used:</b>
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
        <div class="debug">${debugOut.join('\n\n')}</div>
      ` : ''}
    `;
    }
};
HausgeistCard.styles = i$3 `
    :host {
      display: block;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 1em);
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.07));
      padding: 1.5em;
      font-family: var(--primary-font-family, inherit);
      color: var(--primary-text-color, #222);
    }
  
    private _findSensor(
      sensors: any[],
      area: string,
      usedSensors: Array<{ type: string; entity_id: string; value: any }>,
      cls: keyof typeof SENSOR_KEYWORDS
    ) {
      // 1. Check for manual override in config
      const overrideId = this.config?.overrides?.[area]?.[cls];
      if (overrideId) {
        const s = sensors.find((st) => (st as any).entity_id === overrideId);
        if (s) {
          usedSensors.push({
            type: cls + ' (override)',
            entity_id: (s as any).entity_id,
            value: (s as any).state,
          });
          return s;
        }
      }
      // 2. Autodetect by device_class
      let s = sensors.find((st) => (st as any).attributes.device_class === cls);
      if (s) {
        usedSensors.push({
          type: cls,
          entity_id: (s as any).entity_id,
          value: (s as any).state,
        });
        return s;
      }
      // 3. Fallback: search by friendly_name or entity_id for keywords
      const keywords = SENSOR_KEYWORDS[cls] || [];
      let found = sensors.find((st) => {
        const name = ((st as any).attributes.friendly_name || '').toLowerCase();
        const eid = (st as any).entity_id.toLowerCase();
        return keywords.some((k: string) => name.includes(k) || eid.includes(k));
      });
      if (found) {
        usedSensors.push({
          type: cls,
          entity_id: (found as any).entity_id,
          value: (found as any).state,
        });
        return found;
      }
      // 4. Extra fallback: look for sensors whose entity_id or friendly_name contains the area name
      const areaName =
        (this.hass.areas && this.hass.areas[area]?.name?.toLowerCase()) ||
        area.toLowerCase();
      found = sensors.find((st) => {
        const name = ((st as any).attributes.friendly_name || '').toLowerCase();
        const eid = (st as any).entity_id.toLowerCase();
        return name.includes(areaName) || eid.includes(areaName);
      });
      if (found) {
        usedSensors.push({
          type: cls + ' (area-fallback)',
          entity_id: (found as any).entity_id,
          value: (found as any).state,
        });
        return found;
      }
      // If still not found, log a warning in debug
      if (this.debug) {
        usedSensors.push({
          type: cls,
          entity_id: '[NOT FOUND]',
          value: 'No matching sensor found',
        });
      }
      return undefined;
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
    let debugOut: string[] = [];
    const areaMessages = areaIds.map(area => {
      const sensors = filterSensorsByArea(states, area);
      if (this.debug) {
        debugOut = []; // Initialize debug output only if debug is true
      }
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
    }
  `;
__decorate([
    n({ attribute: false })
], HausgeistCard.prototype, "hass", void 0);
__decorate([
    n({ type: Object })
], HausgeistCard.prototype, "config", void 0);
__decorate([
    n({ type: Boolean })
], HausgeistCard.prototype, "debug", void 0);
HausgeistCard = __decorate([
    t('hausgeist-card')
], HausgeistCard);

export { HausgeistCard };
//# sourceMappingURL=hausgeist-card.js.map
