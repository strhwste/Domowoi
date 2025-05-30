/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

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

var RuleEngine = /** @class */ (function () {
    function RuleEngine(rules) {
        this.rules = [];
        this.rules = rules;
    }
    RuleEngine.prototype.evaluate = function (context) {
        var results = [];
        for (var _i = 0, _a = this.rules; _i < _a.length; _i++) {
            var rule = _a[_i];
            var hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function.apply(void 0, __spreadArray(__spreadArray([], Object.keys(context), false), ["return (".concat(rule.condition, ");")], false)).apply(void 0, Object.values(context));
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
    };
    return RuleEngine;
}());

function filterSensorsByArea(states, areaId) {
    return states.filter(function (st) {
        return st.attributes.area_id === areaId &&
            ['humidity', 'co2', 'temperature'].includes(st.attributes.device_class);
    });
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
	}
];

function loadRules() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Core-Regeln
            return [2 /*return*/, coreRules];
        });
    });
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
	early_cool_outside_ventilate: early_cool_outside_ventilate$1
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
	early_cool_outside_ventilate: early_cool_outside_ventilate
};

var TRANSLATIONS = { de: de, en: en };
var HausgeistCard = function () {
    var _classDecorators = [t('hausgeist-card')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = i;
    var _hass_decorators;
    var _hass_initializers = [];
    var _hass_extraInitializers = [];
    var _config_decorators;
    var _config_initializers = [];
    var _config_extraInitializers = [];
    _classThis = /** @class */ (function (_super) {
        __extends(HausgeistCard_1, _super);
        function HausgeistCard_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.hass = __runInitializers(_this, _hass_initializers, void 0);
            _this.config = (__runInitializers(_this, _hass_extraInitializers), __runInitializers(_this, _config_initializers, void 0));
            _this.engine = __runInitializers(_this, _config_extraInitializers);
            _this.texts = {};
            return _this;
        }
        HausgeistCard_1.prototype.firstUpdated = function () {
            return __awaiter(this, void 0, void 0, function () {
                var rules;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, loadRules()];
                        case 1:
                            rules = _a.sent();
                            this.engine = new RuleEngine(rules);
                            return [2 /*return*/];
                    }
                });
            });
        };
        HausgeistCard_1.prototype.setConfig = function (config) {
            if (!config.area_id)
                throw new Error('area_id fehlt');
            this.config = config;
        };
        HausgeistCard_1.prototype.render = function () {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            var area = this.config.area_id;
            var lang = this.hass.selectedLanguage || 'de';
            if (!this.texts || Object.keys(this.texts).length === 0) {
                this.texts = TRANSLATIONS[lang] || TRANSLATIONS['de'];
            }
            // Kontext-Objekt für die RuleEngine bauen
            var states = Object.values(this.hass.states);
            var sensors = filterSensorsByArea(states, area);
            // Hilfsfunktion für Wert aus Sensor holen
            var get = function (cls) {
                var s = sensors.find(function (st) { return st.attributes.device_class === cls; });
                return s ? Number(s.state) : undefined;
            };
            // Kontextdaten extrahieren
            var context = {
                temp: get('temperature'),
                humidity: get('humidity'),
                co2: get('co2'),
                target: Number((_b = (_a = states.find(function (e) { return e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area; })) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : 21),
                window: (_c = states.find(function (e) { return e.entity_id.includes('window') && e.attributes.area_id === area; })) === null || _c === void 0 ? void 0 : _c.state,
                heating: (_d = states.find(function (e) { return e.entity_id.includes('heating') && e.attributes.area_id === area; })) === null || _d === void 0 ? void 0 : _d.state,
                motion: ((_e = states.find(function (e) { return e.entity_id.includes('motion') && e.attributes.area_id === area; })) === null || _e === void 0 ? void 0 : _e.state) === 'on',
                occupied: ((_f = states.find(function (e) { return e.entity_id.includes('occupancy') && e.attributes.area_id === area; })) === null || _f === void 0 ? void 0 : _f.state) === 'on',
                outside_temp: Number((_j = (_h = (_g = states.find(function (e) { return e.entity_id === 'weather.home'; })) === null || _g === void 0 ? void 0 : _g.attributes) === null || _h === void 0 ? void 0 : _h.temperature) !== null && _j !== void 0 ? _j : 15),
                forecast_temp: Number((_p = (_o = (_m = (_l = (_k = states.find(function (e) { return e.entity_id === 'weather.home'; })) === null || _k === void 0 ? void 0 : _k.attributes) === null || _l === void 0 ? void 0 : _l.forecast) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.temperature) !== null && _p !== void 0 ? _p : 15),
                energy: Number((_r = (_q = states.find(function (e) { return e.entity_id.includes('energy') && e.attributes.area_id === area; })) === null || _q === void 0 ? void 0 : _q.state) !== null && _r !== void 0 ? _r : 0),
                high_threshold: 2000,
                temp_change_rate: 0, // Hier ggf. Logik für Temperaturänderung einbauen
                now: Date.now(),
            };
            var evals = this.engine.evaluate(context);
            // Priorität sortieren und top 3
            var prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
            // evals enthält jetzt {message_key, priority}, daher RuleEngine anpassen!
            var top = evals.sort(function (a, b) { return (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0); }).slice(0, 3);
            return x(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      <h2>\uD83D\uDC7B Hausgeist sagt:</h2>\n      ", "\n    "], ["\n      <h2>\uD83D\uDC7B Hausgeist sagt:</h2>\n      ", "\n    "])), top.length === 0 ? x(templateObject_1 || (templateObject_1 = __makeTemplateObject(["<p class=\"ok\">", "</p>"], ["<p class=\"ok\">", "</p>"])), this.texts['all_ok'] || 'Alles in Ordnung!') :
                top.map(function (e) { return x(templateObject_2 || (templateObject_2 = __makeTemplateObject(["<p class=\"", "\">", "</p>"], ["<p class=\"", "\">", "</p>"])), e.priority, _this.texts[e.message_key] || e.message_key); }));
        };
        return HausgeistCard_1;
    }(_classSuper));
    __setFunctionName(_classThis, "HausgeistCard");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _hass_decorators = [n({ attribute: false })];
        _config_decorators = [n({ type: Object })];
        __esDecorate(null, null, _hass_decorators, { kind: "field", name: "hass", static: false, private: false, access: { has: function (obj) { return "hass" in obj; }, get: function (obj) { return obj.hass; }, set: function (obj, value) { obj.hass = value; } }, metadata: _metadata }, _hass_initializers, _hass_extraInitializers);
        __esDecorate(null, null, _config_decorators, { kind: "field", name: "config", static: false, private: false, access: { has: function (obj) { return "config" in obj; }, get: function (obj) { return obj.config; }, set: function (obj, value) { obj.config = value; } }, metadata: _metadata }, _config_initializers, _config_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.styles = i$3(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n    :host {\n      display: block;\n      background: var(--card-background-color, #fff);\n      border-radius: 1em;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.07);\n      padding: 1.5em;\n      font-family: inherit;\n    }\n    h2 {\n      margin-top: 0;\n      font-size: 1.3em;\n      color: #4a4a4a;\n    }\n    p.warning {\n      color: #b85c00;\n      background: #fff7e6;\n      border-left: 4px solid #ffb300;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n    p.info {\n      color: #00529b;\n      background: #e6f2ff;\n      border-left: 4px solid #2196f3;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n    p.ok {\n      color: #357a38;\n      background: #e6f9e6;\n      border-left: 4px solid #4caf50;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n  "], ["\n    :host {\n      display: block;\n      background: var(--card-background-color, #fff);\n      border-radius: 1em;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.07);\n      padding: 1.5em;\n      font-family: inherit;\n    }\n    h2 {\n      margin-top: 0;\n      font-size: 1.3em;\n      color: #4a4a4a;\n    }\n    p.warning {\n      color: #b85c00;\n      background: #fff7e6;\n      border-left: 4px solid #ffb300;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n    p.info {\n      color: #00529b;\n      background: #e6f2ff;\n      border-left: 4px solid #2196f3;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n    p.ok {\n      color: #357a38;\n      background: #e6f9e6;\n      border-left: 4px solid #4caf50;\n      padding: 0.5em 1em;\n      border-radius: 0.5em;\n      margin: 0.5em 0;\n    }\n  "])));
    (function () {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return _classThis;
}();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;

export { HausgeistCard };
//# sourceMappingURL=hausgeist-card.js.map
