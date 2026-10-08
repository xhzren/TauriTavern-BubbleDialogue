//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
/* @__NO_SIDE_EFFECTS__ */
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = {}, n = [], r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", w = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, T = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), E = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, D = /-\w/g, O = E((e) => e.replace(D, (e) => e.slice(1).toUpperCase())), ee = /\B([A-Z])/g, k = E((e) => e.replace(ee, "-$1").toLowerCase()), A = E((e) => e.charAt(0).toUpperCase() + e.slice(1)), j = E((e) => e ? `on${A(e)}` : ""), M = (e, t) => !Object.is(e, t), N = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, P = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, te = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, F = (e) => {
	let t = g(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, ne, I = () => ne ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function L(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? ae(r) : L(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	} else if (g(e) || v(e)) return e;
}
var R = /;(?![^(]*\))/g, re = /:([^]+)/, ie = /\/\*[^]*?\*\//g;
function ae(e) {
	let t = {};
	return e.replace(ie, "").split(R).forEach((e) => {
		if (e) {
			let n = e.split(re);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function z(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = z(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var oe = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", se = /* @__PURE__ */ e(oe);
oe + "";
function ce(e) {
	return !!e || e === "";
}
function le(e, t) {
	if (e.length !== t.length) return !1;
	let n = !0;
	for (let r = 0; n && r < e.length; r++) n = ue(e[r], t[r]);
	return n;
}
function ue(e, t) {
	if (e === t) return !0;
	let n = m(e), r = m(t);
	if (n || r) return n && r ? e.getTime() === t.getTime() : !1;
	if (n = _(e), r = _(t), n || r) return e === t;
	if (n = d(e), r = d(t), n || r) return n && r ? le(e, t) : !1;
	if (n = v(e), r = v(t), n || r) {
		if (!n || !r || Object.keys(e).length !== Object.keys(t).length) return !1;
		for (let n in e) {
			let r = e.hasOwnProperty(n), i = t.hasOwnProperty(n);
			if (r && !i || !r && i || !ue(e[n], t[n])) return !1;
		}
	}
	return String(e) === String(t);
}
function de(e, t) {
	return e.findIndex((e) => ue(e, t));
}
var fe = (e) => !!(e && e.__v_isRef === !0), B = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? fe(e) ? B(e.value) : JSON.stringify(e, pe, 2) : String(e), pe = (e, t) => fe(t) ? pe(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[me(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => me(e)) } : _(t) ? me(t) : v(t) && !d(t) && !C(t) ? String(t) : t, me = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, he, ge = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.__v_skip = !0, this.parent = he, !e && he && (this.index = (he.scopes ||= []).push(this) - 1);
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].pause();
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) for (e = 0, t = this.scopes.length; e < t; e++) this.scopes[e].resume();
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = he;
			try {
				return he = this, e();
			} finally {
				he = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = he, he = this);
	}
	off() {
		this._on > 0 && --this._on === 0 && (he = this.prevScope, this.prevScope = void 0);
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				for (t = 0, n = this.scopes.length; t < n; t++) this.scopes[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function _e() {
	return he;
}
var V, ve = /* @__PURE__ */ new WeakSet(), ye = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, he && he.active && he.effects.push(this);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, ve.has(this) && (ve.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ce(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ie(this), Ee(this);
		let e = V, t = Me;
		V = this, Me = !0;
		try {
			return this.fn();
		} finally {
			De(this), V = e, Me = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Ae(e);
			this.deps = this.depsTail = void 0, Ie(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? ve.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Oe(this) && this.run();
	}
	get dirty() {
		return Oe(this);
	}
}, be = 0, xe, Se;
function Ce(e, t = !1) {
	if (e.flags |= 8, t) {
		e.next = Se, Se = e;
		return;
	}
	e.next = xe, xe = e;
}
function we() {
	be++;
}
function Te() {
	if (--be > 0) return;
	if (Se) {
		let e = Se;
		for (Se = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; xe;) {
		let t = xe;
		for (xe = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function Ee(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function De(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Ae(r), je(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Oe(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (ke(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function ke(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Le) || (e.globalVersion = Le, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Oe(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = V, r = Me;
	V = e, Me = !0;
	try {
		Ee(e);
		let n = e.fn(e._value);
		(t.version === 0 || M(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		V = n, Me = r, De(e), e.flags &= -3;
	}
}
function Ae(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Ae(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function je(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Me = !0, Ne = [];
function Pe() {
	Ne.push(Me), Me = !1;
}
function Fe() {
	let e = Ne.pop();
	Me = e === void 0 ? !0 : e;
}
function Ie(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = V;
		V = void 0;
		try {
			t();
		} finally {
			V = e;
		}
	}
}
var Le = 0, Re = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, ze = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!V || !Me || V === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== V) t = this.activeLink = new Re(V, this), V.deps ? (t.prevDep = V.depsTail, V.depsTail.nextDep = t, V.depsTail = t) : V.deps = V.depsTail = t, Be(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = V.depsTail, t.nextDep = void 0, V.depsTail.nextDep = t, V.depsTail = t, V.deps === t && (V.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Le++, this.notify(e);
	}
	notify(e) {
		we();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Te();
		}
	}
};
function Be(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Be(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Ve = /* @__PURE__ */ new WeakMap(), He = /* @__PURE__ */ Symbol(""), Ue = /* @__PURE__ */ Symbol(""), We = /* @__PURE__ */ Symbol("");
function Ge(e, t, n) {
	if (Me && V) {
		let t = Ve.get(e);
		t || Ve.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new ze()), r.map = t, r.key = n), r.track();
	}
}
function Ke(e, t, n, r, i, a) {
	let o = Ve.get(e);
	if (!o) {
		Le++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (we(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === We || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(We)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(He)), f(e) && s(o.get(Ue)));
				break;
			case "delete":
				i || (s(o.get(He)), f(e) && s(o.get(Ue)));
				break;
			case "set":
				f(e) && s(o.get(He));
				break;
		}
	}
	Te();
}
function qe(e) {
	let t = /* @__PURE__ */ H(e);
	return t === e ? t : (Ge(t, "iterate", We), /* @__PURE__ */ Nt(e) ? t : t.map(It));
}
function Je(e) {
	return Ge(e = /* @__PURE__ */ H(e), "iterate", We), e;
}
function Ye(e, t) {
	return /* @__PURE__ */ Mt(e) ? Lt(/* @__PURE__ */ jt(e) ? It(t) : t) : It(t);
}
var Xe = {
	__proto__: null,
	[Symbol.iterator]() {
		return Ze(this, Symbol.iterator, (e) => Ye(this, e));
	},
	concat(...e) {
		return qe(this).concat(...e.map((e) => d(e) ? qe(e) : e));
	},
	entries() {
		return Ze(this, "entries", (e) => (e[1] = Ye(this, e[1]), e));
	},
	every(e, t) {
		return $e(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return $e(this, "filter", e, t, (e) => e.map((e) => Ye(this, e)), arguments);
	},
	find(e, t) {
		return $e(this, "find", e, t, (e) => Ye(this, e), arguments);
	},
	findIndex(e, t) {
		return $e(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return $e(this, "findLast", e, t, (e) => Ye(this, e), arguments);
	},
	findLastIndex(e, t) {
		return $e(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return $e(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return tt(this, "includes", e);
	},
	indexOf(...e) {
		return tt(this, "indexOf", e);
	},
	join(e) {
		return qe(this).join(e);
	},
	lastIndexOf(...e) {
		return tt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return $e(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return nt(this, "pop");
	},
	push(...e) {
		return nt(this, "push", e);
	},
	reduce(e, ...t) {
		return et(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return et(this, "reduceRight", e, t);
	},
	shift() {
		return nt(this, "shift");
	},
	some(e, t) {
		return $e(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return nt(this, "splice", e);
	},
	toReversed() {
		return qe(this).toReversed();
	},
	toSorted(e) {
		return qe(this).toSorted(e);
	},
	toSpliced(...e) {
		return qe(this).toSpliced(...e);
	},
	unshift(...e) {
		return nt(this, "unshift", e);
	},
	values() {
		return Ze(this, "values", (e) => Ye(this, e));
	}
};
function Ze(e, t, n) {
	let r = Je(e), i = r[t]();
	return r !== e && !/* @__PURE__ */ Nt(e) && (i._next = i.next, i.next = () => {
		let e = i._next();
		return e.done || (e.value = n(e.value)), e;
	}), i;
}
var Qe = Array.prototype;
function $e(e, t, n, r, i, a) {
	let o = Je(e), s = o !== e && !/* @__PURE__ */ Nt(e), c = o[t];
	if (c !== Qe[t]) {
		let t = c.apply(e, a);
		return s ? It(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, Ye(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function et(e, t, n, r) {
	let i = Je(e), a = i !== e && !/* @__PURE__ */ Nt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = Ye(e, t)), n.call(this, t, Ye(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? Ye(e, c) : c;
}
function tt(e, t, n) {
	let r = /* @__PURE__ */ H(e);
	Ge(r, "iterate", We);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Pt(n[0]) ? (n[0] = /* @__PURE__ */ H(n[0]), r[t](...n)) : i;
}
function nt(e, t, n = []) {
	Pe(), we();
	let r = (/* @__PURE__ */ H(e))[t].apply(e, n);
	return Te(), Fe(), r;
}
var rt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), it = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function at(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ H(this);
	return Ge(t, "has", e), t.hasOwnProperty(e);
}
var ot = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? wt : Ct : i ? St : xt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = Xe[t])) return e;
			if (t === "hasOwnProperty") return at;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Rt(e) ? e : n);
		if ((_(t) ? it.has(t) : rt(t)) || (r || Ge(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Rt(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ kt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ kt(o) : /* @__PURE__ */ Dt(o) : o;
	}
}, st = class extends ot {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Mt(i);
			if (!/* @__PURE__ */ Nt(n) && !/* @__PURE__ */ Mt(n) && (i = /* @__PURE__ */ H(i), n = /* @__PURE__ */ H(n)), !a && /* @__PURE__ */ Rt(i) && !/* @__PURE__ */ Rt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Rt(e) ? e : r);
		return e === /* @__PURE__ */ H(r) && (o ? M(n, i) && Ke(e, "set", t, n, i) : Ke(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && Ke(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !it.has(t)) && Ge(e, "has", t), n;
	}
	ownKeys(e) {
		return Ge(e, "iterate", d(e) ? "length" : He), Reflect.ownKeys(e);
	}
}, ct = class extends ot {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, lt = /* @__PURE__ */ new st(), ut = /* @__PURE__ */ new ct(), dt = /* @__PURE__ */ new st(!0), ft = (e) => e, pt = (e) => Reflect.getPrototypeOf(e);
function mt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ H(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? ft : t ? Lt : It;
		return !t && Ge(a, "iterate", l ? Ue : He), s(Object.create(u), { next() {
			let { value: e, done: t } = u.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: c ? [d(e[0]), d(e[1])] : d(e),
				done: t
			};
		} });
	};
}
function ht(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function gt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ H(r), a = /* @__PURE__ */ H(n);
			e || (M(n, a) && Ge(i, "get", n), Ge(i, "get", a));
			let { has: o } = pt(i), s = t ? ft : e ? Lt : It;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && Ge(/* @__PURE__ */ H(t), "iterate", He), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ H(n), i = /* @__PURE__ */ H(t);
			return e || (M(t, i) && Ge(r, "has", t), Ge(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ H(a), s = t ? ft : e ? Lt : It;
			return !e && Ge(o, "iterate", He), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: ht("add"),
		set: ht("set"),
		delete: ht("delete"),
		clear: ht("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ H(this), r = pt(n), i = /* @__PURE__ */ H(e), a = !t && !/* @__PURE__ */ Nt(e) && !/* @__PURE__ */ Mt(e) ? i : e;
			return r.has.call(n, a) || M(e, a) && r.has.call(n, e) || M(i, a) && r.has.call(n, i) || (n.add(a), Ke(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Nt(n) && !/* @__PURE__ */ Mt(n) && (n = /* @__PURE__ */ H(n));
			let r = /* @__PURE__ */ H(this), { has: i, get: a } = pt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ H(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? M(n, s) && Ke(r, "set", e, n, s) : Ke(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ H(this), { has: n, get: r } = pt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ H(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && Ke(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ H(this), t = e.size !== 0, n = e.clear();
			return t && Ke(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = mt(r, e, t);
	}), n;
}
function _t(e, t) {
	let n = gt(e, t);
	return (t, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? t : Reflect.get(u(n, r) && r in t ? n : t, r, i);
}
var vt = { get: /* @__PURE__ */ _t(!1, !1) }, yt = { get: /* @__PURE__ */ _t(!1, !0) }, bt = { get: /* @__PURE__ */ _t(!0, !1) }, xt = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ new WeakMap(), Ct = /* @__PURE__ */ new WeakMap(), wt = /* @__PURE__ */ new WeakMap();
function Tt(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
function Et(e) {
	return e.__v_skip || !Object.isExtensible(e) ? 0 : Tt(S(e));
}
/* @__NO_SIDE_EFFECTS__ */
function Dt(e) {
	return /* @__PURE__ */ Mt(e) ? e : At(e, !1, lt, vt, xt);
}
/* @__NO_SIDE_EFFECTS__ */
function Ot(e) {
	return At(e, !1, dt, yt, St);
}
/* @__NO_SIDE_EFFECTS__ */
function kt(e) {
	return At(e, !0, ut, bt, Ct);
}
function At(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive)) return e;
	let a = Et(e);
	if (a === 0) return e;
	let o = i.get(e);
	if (o) return o;
	let s = new Proxy(e, a === 2 ? r : n);
	return i.set(e, s), s;
}
/* @__NO_SIDE_EFFECTS__ */
function jt(e) {
	return /* @__PURE__ */ Mt(e) ? /* @__PURE__ */ jt(e.__v_raw) : !!(e && e.__v_isReactive);
}
/* @__NO_SIDE_EFFECTS__ */
function Mt(e) {
	return !!(e && e.__v_isReadonly);
}
/* @__NO_SIDE_EFFECTS__ */
function Nt(e) {
	return !!(e && e.__v_isShallow);
}
/* @__NO_SIDE_EFFECTS__ */
function Pt(e) {
	return e ? !!e.__v_raw : !1;
}
/* @__NO_SIDE_EFFECTS__ */
function H(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ H(t) : e;
}
function Ft(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && P(e, "__v_skip", !0), e;
}
var It = (e) => v(e) ? /* @__PURE__ */ Dt(e) : e, Lt = (e) => v(e) ? /* @__PURE__ */ kt(e) : e;
/* @__NO_SIDE_EFFECTS__ */
function Rt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
/* @__NO_SIDE_EFFECTS__ */
function U(e) {
	return zt(e, !1);
}
function zt(e, t) {
	return /* @__PURE__ */ Rt(e) ? e : new Bt(e, t);
}
var Bt = class {
	constructor(e, t) {
		this.dep = new ze(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ H(e), this._value = t ? e : It(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Nt(e) || /* @__PURE__ */ Mt(e);
		e = n ? e : /* @__PURE__ */ H(e), M(e, t) && (this._rawValue = e, this._value = n ? e : It(e), this.dep.trigger());
	}
};
function W(e) {
	return /* @__PURE__ */ Rt(e) ? e.value : e;
}
var Vt = {
	get: (e, t, n) => t === "__v_raw" ? e : W(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Rt(i) && !/* @__PURE__ */ Rt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Ht(e) {
	return /* @__PURE__ */ jt(e) ? e : new Proxy(e, Vt);
}
var Ut = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new ze(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Le - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && V !== this) return Ce(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return ke(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
/* @__NO_SIDE_EFFECTS__ */
function Wt(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new Ut(r, i, n);
}
var Gt = {}, Kt = /* @__PURE__ */ new WeakMap(), qt = void 0;
function Jt(e, t = !1, n = qt) {
	if (n) {
		let t = Kt.get(n);
		t || Kt.set(n, t = []), t.push(e);
	}
}
function Yt(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Nt(e) || o === !1 || o === 0 ? Xt(e, 1) : Xt(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Rt(e) ? (g = () => e.value, y = /* @__PURE__ */ Nt(e)) : /* @__PURE__ */ jt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ jt(e) || /* @__PURE__ */ Nt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Rt(e)) return e.value;
		if (/* @__PURE__ */ jt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Pe();
			try {
				_();
			} finally {
				Fe();
			}
		}
		let t = qt;
		qt = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			qt = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => Xt(e(), t);
	}
	let x = _e(), S = () => {
		m.stop(), x && x.active && c(x.effects, m);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			e(...t), S();
		};
	}
	let C = b ? Array(e.length).fill(Gt) : Gt, w = (e) => {
		if (!(!(m.flags & 1) || !m.dirty && !e)) if (n) {
			let e = m.run();
			if (o || y || (b ? e.some((e, t) => M(e, C[t])) : M(e, C))) {
				_ && _();
				let t = qt;
				qt = m;
				try {
					let t = [
						e,
						C === Gt ? void 0 : b && C[0] === Gt ? [] : C,
						v
					];
					C = e, f ? f(n, 3, t) : n(...t);
				} finally {
					qt = t;
				}
			}
		} else m.run();
	};
	return u && u(w), m = new ye(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => Jt(e, !1, m), _ = m.onStop = () => {
		let e = Kt.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			Kt.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function Xt(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Rt(e)) Xt(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) Xt(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		Xt(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) Xt(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Xt(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function Zt(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		$t(e, t, n);
	}
}
function Qt(e, t, n, r) {
	if (h(e)) {
		let i = Zt(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			$t(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(Qt(e[a], t, n, r));
		return i;
	}
}
function $t(e, n, r, i = !0) {
	let a = n ? n.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, a = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
			}
			t = t.parent;
		}
		if (o) {
			Pe(), Zt(o, null, 10, [
				e,
				i,
				a
			]), Fe();
			return;
		}
	}
	en(e, r, a, i, s);
}
function en(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var tn = [], nn = -1, rn = [], an = null, on = 0, sn = /* @__PURE__ */ Promise.resolve(), cn = null;
function ln(e) {
	let t = cn || sn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function un(e) {
	let t = nn + 1, n = tn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = tn[r], a = gn(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function dn(e) {
	if (!(e.flags & 1)) {
		let t = gn(e), n = tn[tn.length - 1];
		!n || !(e.flags & 2) && t >= gn(n) ? tn.push(e) : tn.splice(un(t), 0, e), e.flags |= 1, fn();
	}
}
function fn() {
	cn ||= sn.then(_n);
}
function pn(e) {
	d(e) ? rn.push(...e) : an && e.id === -1 ? an.splice(on + 1, 0, e) : e.flags & 1 || (rn.push(e), e.flags |= 1), fn();
}
function mn(e, t, n = nn + 1) {
	for (; n < tn.length; n++) {
		let t = tn[n];
		if (t && t.flags & 2) {
			if (e && t.id !== e.uid) continue;
			tn.splice(n, 1), n--, t.flags & 4 && (t.flags &= -2), t(), t.flags & 4 || (t.flags &= -2);
		}
	}
}
function hn(e) {
	if (rn.length) {
		let e = [...new Set(rn)].sort((e, t) => gn(e) - gn(t));
		if (rn.length = 0, an) {
			an.push(...e);
			return;
		}
		for (an = e, on = 0; on < an.length; on++) {
			let e = an[on];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		an = null, on = 0;
	}
}
var gn = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function _n(e) {
	try {
		for (nn = 0; nn < tn.length; nn++) {
			let e = tn[nn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), Zt(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; nn < tn.length; nn++) {
			let e = tn[nn];
			e && (e.flags &= -2);
		}
		nn = -1, tn.length = 0, hn(e), cn = null, (tn.length || rn.length) && _n(e);
	}
}
var vn = null, yn = null;
function bn(e) {
	let t = vn;
	return vn = e, yn = e && e.type.__scopeId || null, t;
}
function xn(e, t = vn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && ta(-1);
		let i = bn(t), a;
		try {
			a = e(...n);
		} finally {
			bn(i), r._d && ta(1);
		}
		return a;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Sn(e, n) {
	if (vn === null) return e;
	let r = Ia(vn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && Xt(o), i.push({
			dir: a,
			instance: r,
			value: o,
			oldValue: void 0,
			arg: s,
			modifiers: c
		}));
	}
	return e;
}
function Cn(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Pe(), Qt(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), Fe());
	}
}
function wn(e, t) {
	if (ba) {
		let n = ba.provides, r = ba.parent && ba.parent.provides;
		r === n && (n = ba.provides = Object.create(r)), n[e] = t;
	}
}
function Tn(e, t, n = !1) {
	let r = xa();
	if (r || ii) {
		let i = ii ? ii._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var En = /* @__PURE__ */ Symbol.for("v-scx"), Dn = () => Tn(En);
function On(e, t, n) {
	return kn(e, t, n);
}
function kn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Da) {
		if (c === "sync") {
			let e = Dn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = ba;
	u.call = (e, t, n) => Qt(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		Fi(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : dn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = Yt(e, n, u);
	return Da && (f ? f.push(h) : d && h()), h;
}
function An(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? jn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = wa(this), s = kn(i, a.bind(r), n);
	return o(), s;
}
function jn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Mn = /* @__PURE__ */ Symbol("_vte"), Nn = (e) => e.__isTeleport, Pn = (e) => e && (e.disabled || e.disabled === ""), Fn = (e) => e && (e.defer || e.defer === ""), In = (e) => typeof SVGElement < "u" && e instanceof SVGElement, Ln = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Rn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, zn = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g } } = l, _ = Pn(t.props), { shapeFlag: v, children: y, dynamicChildren: b } = t;
		if (e == null) {
			let e = t.el = h(""), l = t.anchor = h("");
			p(e, n, r), p(l, n, r);
			let d = (e, t) => {
				v & 16 && u(y, e, t, i, a, o, s, c);
			}, f = () => {
				let e = t.target = Rn(t.props, m), n = Wn(e, t, h, p);
				e && (o !== "svg" && In(e) ? o = "svg" : o !== "mathml" && Ln(e) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(e), _ || (d(e, n), Un(t, !1)));
			};
			_ && (d(n, l), Un(t, !0)), Fn(t.props) || a && a.pendingBranch ? (t.el.__isMounted = !1, Fi(() => {
				t.el.__isMounted === !1 && (f(), delete t.el.__isMounted);
			}, a)) : f();
		} else {
			t.el = e.el, t.targetStart = e.targetStart;
			let u = t.anchor = e.anchor, p = t.target = e.target, h = t.targetAnchor = e.targetAnchor;
			if (e.el.__isMounted === !1) {
				Fi(() => {
					zn.process(e, t, n, r, i, a, o, s, c, l);
				}, a);
				return;
			}
			let g = Pn(e.props), v = g ? n : p, y = g ? u : h;
			if (o === "svg" || In(p) ? o = "svg" : (o === "mathml" || Ln(p)) && (o = "mathml"), b ? (f(e.dynamicChildren, b, v, i, a, o, s), Vi(e, t, !0)) : c || d(e, t, v, y, i, a, o, s, !1), _) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Bn(t, n, u, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = t.target = Rn(t.props, m);
				e && Bn(t, e, null, l, 0);
			} else g && Bn(t, p, h, l, 1);
			Un(t, _);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e;
		if (d && (i(l), i(u)), a && i(c), o & 16) {
			let e = a || !Pn(f);
			for (let i = 0; i < s.length; i++) {
				let a = s[i];
				r(a, t, n, e, !!a.dynamicChildren);
			}
		}
	},
	move: Bn,
	hydrate: Vn
};
function Bn(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && r(e.targetAnchor, t, n);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), (!d || Pn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function Vn(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, n) {
		let r = n;
		for (; r;) {
			if (r && r.nodeType === 8) {
				if (r.data === "teleport start anchor") t.targetStart = r;
				else if (r.data === "teleport anchor") {
					t.targetAnchor = r, e._lpa = t.targetAnchor && o(t.targetAnchor);
					break;
				}
			}
			r = o(r);
		}
	}
	function p(e, t) {
		t.anchor = d(o(e), t, s(e), n, r, i, a);
	}
	let m = t.target = Rn(t.props, c), h = Pn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || Wn(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || Wn(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), Un(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var Hn = zn;
function Un(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function Wn(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Mn] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var Gn = /* @__PURE__ */ Symbol("_leaveCb"), Kn = /* @__PURE__ */ Symbol("_enterCb");
function qn() {
	let e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: /* @__PURE__ */ new Map()
	};
	return xr(() => {
		e.isMounted = !0;
	}), wr(() => {
		e.isUnmounting = !0;
	}), e;
}
var Jn = [Function, Array], Yn = {
	mode: String,
	appear: Boolean,
	persisted: Boolean,
	onBeforeEnter: Jn,
	onEnter: Jn,
	onAfterEnter: Jn,
	onEnterCancelled: Jn,
	onBeforeLeave: Jn,
	onLeave: Jn,
	onAfterLeave: Jn,
	onLeaveCancelled: Jn,
	onBeforeAppear: Jn,
	onAppear: Jn,
	onAfterAppear: Jn,
	onAppearCancelled: Jn
}, Xn = (e) => {
	let t = e.subTree;
	return t.component ? Xn(t.component) : t;
}, Zn = {
	name: "BaseTransition",
	props: Yn,
	setup(e, { slots: t }) {
		let n = xa(), r = qn();
		return () => {
			let i = t.default && ar(t.default(), !0);
			if (!i || !i.length) return;
			let a = Qn(i), o = /* @__PURE__ */ H(e), { mode: s } = o;
			if (r.isLeaving) return nr(a);
			let c = rr(a);
			if (!c) return nr(a);
			let l = tr(c, o, r, n, (e) => l = e);
			c.type !== Yi && ir(c, l);
			let u = n.subTree && rr(n.subTree);
			if (u && u.type !== Yi && !aa(u, c) && Xn(n).type !== Yi) {
				let e = tr(u, o, r, n);
				if (ir(u, e), s === "out-in" && c.type !== Yi) return r.isLeaving = !0, e.afterLeave = () => {
					r.isLeaving = !1, n.job.flags & 8 || n.update(), delete e.afterLeave, u = void 0;
				}, nr(a);
				s === "in-out" && c.type !== Yi ? e.delayLeave = (e, t, n) => {
					let i = er(r, u);
					i[String(u.key)] = u, e[Gn] = () => {
						t(), e[Gn] = void 0, delete l.delayedLeave, u = void 0;
					}, l.delayedLeave = () => {
						n(), delete l.delayedLeave, u = void 0;
					};
				} : u = void 0;
			} else u &&= void 0;
			return a;
		};
	}
};
function Qn(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Yi) {
			t = n;
			break;
		}
	}
	return t;
}
var $n = Zn;
function er(e, t) {
	let { leavingVNodes: n } = e, r = n.get(t.type);
	return r || (r = /* @__PURE__ */ Object.create(null), n.set(t.type, r)), r;
}
function tr(e, t, n, r, i) {
	let { appear: a, mode: o, persisted: s = !1, onBeforeEnter: c, onEnter: l, onAfterEnter: u, onEnterCancelled: f, onBeforeLeave: p, onLeave: m, onAfterLeave: h, onLeaveCancelled: g, onBeforeAppear: _, onAppear: v, onAfterAppear: y, onAppearCancelled: b } = t, x = String(e.key), S = er(n, e), C = (e, t) => {
		e && Qt(e, r, 9, t);
	}, w = (e, t) => {
		let n = t[1];
		C(e, t), d(e) ? e.every((e) => e.length <= 1) && n() : e.length <= 1 && n();
	}, T = {
		mode: o,
		persisted: s,
		beforeEnter(t) {
			let r = c;
			if (!n.isMounted) if (a) r = _ || c;
			else return;
			t[Gn] && t[Gn](!0);
			let i = S[x];
			i && aa(e, i) && i.el[Gn] && i.el[Gn](), C(r, [t]);
		},
		enter(t) {
			if (S[x] === e) return;
			let r = l, i = u, o = f;
			if (!n.isMounted) if (a) r = v || l, i = y || u, o = b || f;
			else return;
			let s = !1;
			t[Kn] = (e) => {
				s || (s = !0, C(e ? o : i, [t]), T.delayedLeave && T.delayedLeave(), t[Kn] = void 0);
			};
			let c = t[Kn].bind(null, !1);
			r ? w(r, [t, c]) : c();
		},
		leave(t, r) {
			let i = String(e.key);
			if (t[Kn] && t[Kn](!0), n.isUnmounting) return r();
			C(p, [t]);
			let a = !1;
			t[Gn] = (n) => {
				a || (a = !0, r(), C(n ? g : h, [t]), t[Gn] = void 0, S[i] === e && delete S[i]);
			};
			let o = t[Gn].bind(null, !1);
			S[i] = e, m ? w(m, [t, o]) : o();
		},
		clone(e) {
			let a = tr(e, t, n, r, i);
			return i && i(a), a;
		}
	};
	return T;
}
function nr(e) {
	if (pr(e)) return e = ua(e), e.children = null, e;
}
function rr(e) {
	if (!pr(e)) return Nn(e.type) && e.children ? Qn(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function ir(e, t) {
	e.shapeFlag & 6 && e.component ? (e.transition = t, ir(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function ar(e, t = !1, n) {
	let r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a], s = n == null ? o.key : String(n) + String(o.key == null ? a : o.key);
		o.type === K ? (o.patchFlag & 128 && i++, r = r.concat(ar(o.children, t, s))) : (t || o.type !== Yi) && r.push(s == null ? o : ua(o, { key: s }));
	}
	if (i > 1) for (let e = 0; e < r.length; e++) r[e].patchFlag = -2;
	return r;
}
/* @__NO_SIDE_EFFECTS__ */
function or(e, t) {
	return h(e) ? s({ name: e.name }, t, { setup: e }) : e;
}
function sr(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function cr(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var lr = /* @__PURE__ */ new WeakMap();
function ur(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => ur(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (fr(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && ur(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? Ia(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ H(v), b = v === t ? i : (e) => cr(_, e) ? !1 : u(y, e), x = (e, t) => !(t && cr(_, t));
	if (m != null && m !== p) {
		if (dr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Rt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) Zt(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Rt(p);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? b(p) ? v[p] : _[p] : x(p) || !e.k ? p.value : _[e.k];
					if (o) d(n) && c(n, s);
					else if (d(n)) n.includes(s) || n.push(s);
					else if (t) _[p] = [s], b(p) && (v[p] = _[p]);
					else {
						let t = [s];
						x(p, e.k) && (p.value = t), e.k && (_[e.k] = t);
					}
				} else t ? (_[p] = l, b(p) && (v[p] = l)) : n && (x(p, e.k) && (p.value = l), e.k && (_[e.k] = l));
			};
			if (l) {
				let t = () => {
					i(), lr.delete(e);
				};
				t.id = -1, lr.set(e, t), Fi(t, r);
			} else dr(e), i();
		}
	}
}
function dr(e) {
	let t = lr.get(e);
	t && (t.flags |= 8, lr.delete(e));
}
I().requestIdleCallback, I().cancelIdleCallback;
var fr = (e) => !!e.type.__asyncLoader, pr = (e) => e.type.__isKeepAlive;
function mr(e, t) {
	gr(e, "a", t);
}
function hr(e, t) {
	gr(e, "da", t);
}
function gr(e, t, n = ba) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (vr(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) pr(e.parent.vnode) && _r(r, t, n, e), e = e.parent;
	}
}
function _r(e, t, n, r) {
	let i = vr(t, e, r, !0);
	Tr(() => {
		c(r[t], i);
	}, n);
}
function vr(e, t, n = ba, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Pe();
			let i = wa(n), a = Qt(t, n, e, r);
			return i(), Fe(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var yr = (e) => (t, n = ba) => {
	(!Da || e === "sp") && vr(e, (...e) => t(...e), n);
}, br = yr("bm"), xr = yr("m"), Sr = yr("bu"), Cr = yr("u"), wr = yr("bum"), Tr = yr("um"), Er = yr("sp"), Dr = yr("rtg"), Or = yr("rtc");
function kr(e, t = ba) {
	vr("ec", e, t);
}
var Ar = "components", jr = /* @__PURE__ */ Symbol.for("v-ndc");
function Mr(e) {
	return g(e) ? Nr(Ar, e, !1) || e : e || jr;
}
function Nr(e, t, n = !0, r = !1) {
	let i = vn || ba;
	if (i) {
		let n = i.type;
		if (e === Ar) {
			let e = La(n, !1);
			if (e && (e === t || e === O(t) || e === A(O(t)))) return n;
		}
		let a = Pr(i[e] || n[e], t) || Pr(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Pr(e, t) {
	return e && (e[t] || e[O(t)] || e[A(O(t))]);
}
function G(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ jt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Nt(e), s = /* @__PURE__ */ Mt(e), e = Je(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Lt(It(e[n])) : It(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		i = Array(e);
		for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
	} else if (v(e)) if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
	else {
		let n = Object.keys(e);
		i = Array(n.length);
		for (let r = 0, o = n.length; r < o; r++) {
			let o = n[r];
			i[r] = t(e[o], o, r, a && a[r]);
		}
	}
	else i = [];
	return n && (n[r] = i), i;
}
var Fr = (e) => e ? Ea(e) ? Ia(e) : Fr(e.parent) : null, Ir = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Fr(e.parent),
	$root: (e) => Fr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Gr(e),
	$forceUpdate: (e) => e.f ||= () => {
		dn(e.update);
	},
	$nextTick: (e) => e.n ||= ln.bind(e.proxy),
	$watch: (e) => An.bind(e)
}), Lr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Rr = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (Lr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Br && (s[n] = 0);
		}
		let d = Ir[n], f, p;
		if (d) return n === "$attrs" && Ge(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Lr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Lr(n, c) || u(o, c) || u(i, c) || u(Ir, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function zr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
var Br = !0;
function Vr(e) {
	let t = Gr(e), n = e.proxy, i = e.ctx;
	Br = !1, t.beforeCreate && Ur(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: E, renderTriggered: D, errorCaptured: O, serverPrefetch: ee, expose: k, inheritAttrs: A, components: j, directives: M, filters: N } = t;
	if (u && Hr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Dt(t));
	}
	if (Br = !0, o) for (let e in o) {
		let t = o[e], a = Q({
			get: h(t) ? t.bind(n, n) : h(t.get) ? t.get.bind(n, n) : r,
			set: !h(t) && h(t.set) ? t.set.bind(n) : r
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		});
	}
	if (c) for (let e in c) Wr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			wn(t, e[t]);
		});
	}
	f && Ur(f, e, "c");
	function P(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (P(br, p), P(xr, m), P(Sr, g), P(Cr, _), P(mr, y), P(hr, b), P(kr, O), P(Or, E), P(Dr, D), P(wr, S), P(Tr, w), P(Er, ee), d(k)) if (k.length) {
		let t = e.exposed ||= {};
		k.forEach((e) => {
			Object.defineProperty(t, e, {
				get: () => n[e],
				set: (t) => n[e] = t,
				enumerable: !0
			});
		});
	} else e.exposed ||= {};
	T && e.render === r && (e.render = T), A != null && (e.inheritAttrs = A), j && (e.components = j), M && (e.directives = M), ee && sr(e);
}
function Hr(e, t, n = r) {
	d(e) && (e = Xr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Tn(r.from || n, r.default, !0) : Tn(r.from || n) : Tn(r), /* @__PURE__ */ Rt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Ur(e, t, n) {
	Qt(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Wr(e, t, n, r) {
	let i = r.includes(".") ? jn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && On(i, n);
	} else if (h(e)) On(i, e.bind(n));
	else if (v(e)) if (d(e)) e.forEach((e) => Wr(e, t, n, r));
	else {
		let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
		h(r) && On(i, r, e);
	}
}
function Gr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Kr(c, e, o, !0)), Kr(c, t, o)), v(t) && a.set(t, c), c;
}
function Kr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Kr(e, a, n, !0), i && i.forEach((t) => Kr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = qr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var qr = {
	data: Jr,
	props: $r,
	emits: $r,
	methods: Qr,
	computed: Qr,
	beforeCreate: Zr,
	created: Zr,
	beforeMount: Zr,
	mounted: Zr,
	beforeUpdate: Zr,
	updated: Zr,
	beforeDestroy: Zr,
	beforeUnmount: Zr,
	destroyed: Zr,
	unmounted: Zr,
	activated: Zr,
	deactivated: Zr,
	errorCaptured: Zr,
	serverPrefetch: Zr,
	components: Qr,
	directives: Qr,
	watch: ei,
	provide: Jr,
	inject: Yr
};
function Jr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Yr(e, t) {
	return Qr(Xr(e), Xr(t));
}
function Xr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Zr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Qr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function $r(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), zr(e), zr(t ?? {})) : t;
}
function ei(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Zr(e[r], t[r]);
	return n;
}
function ti() {
	return {
		app: null,
		config: {
			isNativeTag: i,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var ni = 0;
function ri(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = ti(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ni++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Ba,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && h(e.install) ? (a.add(e), e.install(l, ...t)) : h(e) && (a.add(e), e(l, ...t))), l;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), l;
			},
			component(e, t) {
				return t ? (i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let u = l._ceVNode || X(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Ia(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (Qt(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = ii;
				ii = l;
				try {
					return e();
				} finally {
					ii = t;
				}
			}
		};
		return l;
	};
}
var ii = null, ai = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${O(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function oi(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ai(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = r.map(te)));
	let c, l = i[c = j(n)] || i[c = j(O(n))];
	!l && o && (l = i[c = j(k(n))]), l && Qt(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, Qt(u, e, 6, a);
	}
}
var si = /* @__PURE__ */ new WeakMap();
function ci(e, t, n = !1) {
	let r = n ? si : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ci(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function li(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function ui(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = bn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = fa(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = fa(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : di(c);
		}
	} catch (t) {
		Zi.length = 0, $t(t, e, 1), v = X(Yi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = fi(y, a)), b = ua(b, y, !1, !0));
	}
	return n.dirs && (b = ua(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && ir(b, n.transition), v = b, bn(_), v;
}
var di = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, fi = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function pi(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? mi(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (hi(o, r, n) && !li(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? o ? mi(r, o, l) : !0 : !!o;
	return !1;
}
function mi(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (hi(t, e, a) && !li(n, a)) return !0;
	}
	return !1;
}
function hi(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !ue(r, i) : r !== i;
}
function gi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var _i = {}, vi = () => Object.create(_i), yi = (e) => Object.getPrototypeOf(e) === _i;
function bi(e, t, n, r = !1) {
	let i = {}, a = vi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), Si(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	n ? e.props = r ? i : /* @__PURE__ */ Ot(i) : e.type.props ? e.props = i : e.props = a, e.attrs = a;
}
function xi(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ H(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (li(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
				else {
					let t = O(o);
					i[t] = Ci(c, s, t, d, e, !1);
				}
				else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		Si(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = k(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ci(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && Ke(e.attrs, "set", "");
}
function Si(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = O(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : li(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ H(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = Ci(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function Ci(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = wa(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var wi = /* @__PURE__ */ new WeakMap();
function Ti(e, r, i = !1) {
	let a = i ? wi : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Ti(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = O(c[e]);
		Ei(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = O(e);
		if (Ei(t)) {
			let n = c[e], r = l[t] = d(n) || h(n) ? { type: n } : s({}, n), i = r.type, a = !1, o = !0;
			if (d(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = h(t) && t.name;
				if (n === "Boolean") {
					a = !0;
					break;
				} else n === "String" && (o = !1);
			}
			else a = h(i) && i.name === "Boolean";
			r[0] = a, r[1] = o, (a || u(r, "default")) && f.push(t);
		}
	}
	let m = [l, f];
	return v(e) && a.set(e, m), m;
}
function Ei(e) {
	return e[0] !== "$" && !T(e);
}
var Di = (e) => e === "_" || e === "_ctx" || e === "$stable", Oi = (e) => d(e) ? e.map(fa) : [fa(e)], ki = (e, t, n) => {
	if (t._n) return t;
	let r = xn((...e) => Oi(t(...e)), n);
	return r._c = !1, r;
}, Ai = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Di(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = ki(n, i, r);
		else if (i != null) {
			let e = Oi(i);
			t[n] = () => e;
		}
	}
}, ji = (e, t) => {
	let n = Oi(t);
	e.slots.default = () => n;
}, Mi = (e, t, n) => {
	for (let r in t) (n || !Di(r)) && (e[r] = t[r]);
}, Ni = (e, t, n) => {
	let r = e.slots = vi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Mi(r, t, n), n && P(r, "_", e, !0)) : Ai(t, r);
	} else t && ji(e, t);
}, Pi = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Mi(a, n, r) : (o = !n.$stable, Ai(n, a)), s = n;
	} else n && (ji(e, n), s = { default: 1 });
	if (o) for (let e in a) !Di(e) && s[e] == null && delete a[e];
}, Fi = qi;
function Ii(e) {
	return Li(e);
}
function Li(e, i) {
	let a = I();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !aa(e, t) && (r = le(e), ae(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Ji:
				y(e, t, n, r);
				break;
			case Yi:
				b(e, t, n, r);
				break;
			case Xi:
				e ?? x(t, n, r, o);
				break;
			case K:
				j(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? w(e, t, n, r, i, a, o, s, c) : d & 6 ? M(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, fe);
		}
		u != null && i ? ur(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && ur(e.ref, null, a, e, !0);
	}, y = (e, t, n, r) => {
		if (e == null) o(t.el = u(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && f(n, t.children);
		}
	}, b = (e, t, n, r) => {
		e == null ? o(t.el = d(t.children || ""), n, r) : t.el = e.el;
	}, x = (e, t, n, r) => {
		[e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
	}, S = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = h(e), o(e, n, r), e = i;
		o(t, n, r);
	}, C = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, w = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) E(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), ee(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, E = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && O(e.children, d, null, r, i, Ri(e, a), s, u), _ && Cn(e, null, r, "created"), D(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && ga(f, r, e);
		}
		_ && Cn(e, null, r, "beforeMount");
		let v = Bi(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && Fi(() => {
			try {
				f && ga(f, r, e), v && g.enter(d), _ && Cn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, D = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Ki(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				D(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, O = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) v(null, e[l] = s ? pa(e[l]) : fa(e[l]), t, n, r, i, a, o, s);
	}, ee = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && zi(r, !1), (g = h.onVnodeBeforeUpdate) && ga(g, r, n, e), f && Cn(n, e, r, "beforeUpdate"), r && zi(r, !0), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? k(e.dynamicChildren, d, l, r, i, Ri(n, a), o) : s || L(e, n, l, null, r, i, Ri(n, a), o, !1), u > 0) {
			if (u & 16) A(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && A(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && Fi(() => {
			g && ga(g, r, n, e), f && Cn(n, e, r, "updated");
		}, i);
	}, k = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s];
			v(c, l, c.el && (c.type === K || !aa(c, l) || c.shapeFlag & 198) ? m(c.el) : n, null, r, i, a, o, !0);
		}
	}, A = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !T(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (T(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, j = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), O(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (k(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Vi(e, t, !0)) : L(e, t, n, f, i, a, s, c, l);
	}, M = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : P(t, n, r, i, a, o, c) : te(e, t, c);
	}, P = (e, t, n, r, i, a, o) => {
		let s = e.component = ya(e, r, i);
		if (pr(e) && (s.ctx.renderer = fe), Oa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, F, o), !e.el) {
				let r = s.subTree = X(Yi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else F(s, e, t, n, i, a, o);
	}, te = (e, t, n) => {
		let r = t.component = e.component;
		if (pi(e, t, n)) if (r.asyncDep && !r.asyncResolved) {
			ne(r, t, n);
			return;
		} else r.next = t, r.update();
		else t.el = e.el, r.vnode = t;
	}, F = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = Ui(e);
					if (n) {
						t && (t.el = c.el, ne(e, t, o)), n.asyncDep.then(() => {
							Fi(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				zi(e, !1), t ? (t.el = c.el, ne(e, t, o)) : t = c, n && N(n), (d = t.props && t.props.onVnodeBeforeUpdate) && ga(d, s, t, c), zi(e, !0);
				let f = ui(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), le(p), e, i, a), t.el = f.el, u === null && gi(e, f.el), r && Fi(r, i), (d = t.props && t.props.onVnodeUpdated) && Fi(() => ga(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = fr(t);
				if (zi(e, !1), l && N(l), !m && (o = c && c.onVnodeBeforeMount) && ga(o, d, t), zi(e, !0), s && pe) {
					let t = () => {
						e.subTree = ui(e), pe(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = ui(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && Fi(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					Fi(() => ga(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && fr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && Fi(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new ye(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => dn(u), zi(e, !0), l();
	}, ne = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, xi(e, t.props, r, n), Pi(e, t.children, n), Pe(), mn(e), Fe();
	}, L = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				re(l, d, n, r, i, a, o, s, c);
				return;
			} else if (f & 256) {
				R(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && ce(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? re(l, d, n, r, i, a, o, s, c) : ce(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && O(d, n, r, i, a, o, s, c));
	}, R = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p;
		for (p = 0; p < f; p++) {
			let n = t[p] = l ? pa(t[p]) : fa(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? ce(e, a, o, !0, !1, f) : O(t, r, i, a, o, s, c, l, f);
	}, re = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? pa(t[u]) : fa(t[u]);
			if (aa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? pa(t[p]) : fa(t[p]);
			if (aa(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? pa(t[u]) : fa(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) ae(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? pa(t[u]) : fa(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					ae(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && aa(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? ae(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Hi(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Gi(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? ie(n, r, p, 2) : _--);
			}
		}
	}, ie = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) {
			ie(e.component.subTree, t, n, r);
			return;
		}
		if (d & 128) {
			e.suspense.move(t, n, r);
			return;
		}
		if (d & 64) {
			c.move(e, t, n, fe);
			return;
		}
		if (c === K) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) ie(u[e], t, n, r);
			o(e.anchor, t, n);
			return;
		}
		if (c === Xi) {
			S(e, t, n);
			return;
		}
		if (r !== 2 && d & 1 && l) if (r === 0) l.beforeEnter(a), o(a, t, n), Fi(() => l.enter(a), i);
		else {
			let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
				e.ctx.isUnmounted ? s(a) : o(a, t, n);
			}, d = () => {
				a._isLeaving && a[Gn](!0), r(a, () => {
					u(), c && c();
				});
			};
			i ? i(a, u, d) : d();
		}
		else o(a, t, n);
	}, ae = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if (d === -2 && (i = !1), s != null && (Pe(), ur(s, null, n, e, !0), Fe()), p != null && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !fr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && ga(_, t, e), u & 6) se(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Cn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, fe, r) : l && !l.hasOnce && (a !== K || d > 0 && d & 64) ? ce(l, t, n, !1, !0) : (a === K && d & 384 || !i && u & 16) && ce(c, t, n), r && z(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && Fi(() => {
			_ && ga(_, t, e), h && Cn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, z = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e;
		if (t === K) {
			oe(n, r);
			return;
		}
		if (t === Xi) {
			C(e);
			return;
		}
		let a = () => {
			s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (e.shapeFlag & 1 && i && !i.persisted) {
			let { leave: t, delayLeave: r } = i, o = () => t(n, a);
			r ? r(e.el, a, o) : o();
		} else a();
	}, oe = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, se = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Wi(c), Wi(l), r && N(r), i.stop(), a && (a.flags |= 8, ae(o, e, t, n)), s && Fi(s, t), Fi(() => {
			e.isUnmounted = !0;
		}, t);
	}, ce = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) ae(e[o], t, n, r, i);
	}, le = (e) => {
		if (e.shapeFlag & 6) return le(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Mn];
		return n ? h(n) : t;
	}, ue = !1, de = (e, t, n) => {
		let r;
		e == null ? t._vnode && (ae(t._vnode, null, null, !0), r = t._vnode.component) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e, ue ||= (ue = !0, mn(r), hn(), !1);
	}, fe = {
		p: v,
		um: ae,
		m: ie,
		r: z,
		mt: P,
		mc: O,
		pc: L,
		pbc: k,
		n: le,
		o: e
	}, B, pe;
	return i && ([B, pe] = i(fe)), {
		render: de,
		hydrate: B,
		createApp: ri(de, B)
	};
}
function Ri({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function zi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Bi(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Vi(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = pa(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Vi(t, a)), a.type === Ji && (a.patchFlag === -1 && (a = i[e] = pa(a)), a.el = t.el), a.type === Yi && !a.el && (a.el = t.el);
	}
}
function Hi(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function Ui(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : Ui(t);
}
function Wi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Gi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Gi(t.subTree) : null;
}
var Ki = (e) => e.__isSuspense;
function qi(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : pn(e);
}
var K = /* @__PURE__ */ Symbol.for("v-fgt"), Ji = /* @__PURE__ */ Symbol.for("v-txt"), Yi = /* @__PURE__ */ Symbol.for("v-cmt"), Xi = /* @__PURE__ */ Symbol.for("v-stc"), Zi = [], Qi = null;
function q(e = !1) {
	Zi.push(Qi = e ? null : []);
}
function $i() {
	Zi.pop(), Qi = Zi[Zi.length - 1] || null;
}
var ea = 1;
function ta(e, t = !1) {
	ea += e, e < 0 && Qi && t && (Qi.hasOnce = !0);
}
function na(e) {
	return e.dynamicChildren = ea > 0 ? Qi || n : null, $i(), ea > 0 && Qi && Qi.push(e), e;
}
function J(e, t, n, r, i, a) {
	return na(Y(e, t, n, r, i, a, !0));
}
function ra(e, t, n, r, i) {
	return na(X(e, t, n, r, i, !0));
}
function ia(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function aa(e, t) {
	return e.type === t.type && e.key === t.key;
}
var oa = ({ key: e }) => e ?? null, sa = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Rt(e) || h(e) ? {
	i: vn,
	r: e,
	k: t,
	f: !!n
} : e);
function Y(e, t = null, n = null, r = 0, i = null, a = e === K ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && oa(t),
		ref: t && sa(t),
		scopeId: yn,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: vn
	};
	return s ? (ma(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), ea > 0 && !o && Qi && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Qi.push(c), c;
}
var X = ca;
function ca(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === jr) && (e = Yi), ia(e)) {
		let r = ua(e, t, !0);
		return n && ma(r, n), ea > 0 && !a && Qi && (r.shapeFlag & 6 ? Qi[Qi.indexOf(e)] = r : Qi.push(r)), r.patchFlag = -2, r;
	}
	if (Ra(e) && (e = e.__vccOpts), t) {
		t = la(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = z(e)), v(n) && (/* @__PURE__ */ Pt(n) && !d(n) && (n = s({}, n)), t.style = L(n));
	}
	let o = g(e) ? 1 : Ki(e) ? 128 : Nn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return Y(e, t, n, r, i, o, a, !0);
}
function la(e) {
	return e ? /* @__PURE__ */ Pt(e) || yi(e) ? s({}, e) : e : null;
}
function ua(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? ha(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && oa(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(sa(t)) : [a, sa(t)] : sa(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== K ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && ua(e.ssContent),
		ssFallback: e.ssFallback && ua(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce
	};
	return c && r && ir(u, c.clone(u)), u;
}
function da(e = " ", t = 0) {
	return X(Ji, null, e, t);
}
function Z(e = "", t = !1) {
	return t ? (q(), ra(Yi, null, e)) : X(Yi, null, e);
}
function fa(e) {
	return e == null || typeof e == "boolean" ? X(Yi) : d(e) ? X(K, null, e.slice()) : ia(e) ? pa(e) : X(Ji, null, String(e));
}
function pa(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : ua(e);
}
function ma(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") if (r & 65) {
		let n = t.default;
		n && (n._c && (n._d = !1), ma(e, n()), n._c && (n._d = !0));
		return;
	} else {
		n = 32;
		let r = t._;
		!r && !yi(t) ? t._ctx = vn : r === 3 && vn && (vn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
	}
	else h(t) ? (t = {
		default: t,
		_ctx: vn
	}, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [da(t)]) : n = 8);
	e.children = t, e.shapeFlag |= n;
}
function ha(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = z([t.class, r.class]));
		else if (e === "style") t.style = L([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function ga(e, t, n, r = null) {
	Qt(e, t, 7, [n, r]);
}
var _a = ti(), va = 0;
function ya(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || _a, o = {
		uid: va++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new ge(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: Ti(i, a),
		emitsOptions: ci(i, a),
		emit: null,
		emitted: null,
		propsDefaults: t,
		inheritAttrs: i.inheritAttrs,
		ctx: t,
		data: t,
		props: t,
		attrs: t,
		slots: t,
		refs: t,
		setupState: t,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = oi.bind(null, o), e.ce && e.ce(o), o;
}
var ba = null, xa = () => ba || vn, Sa, Ca;
{
	let e = I(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Sa = t("__VUE_INSTANCE_SETTERS__", (e) => ba = e), Ca = t("__VUE_SSR_SETTERS__", (e) => Da = e);
}
var wa = (e) => {
	let t = ba;
	return Sa(e), e.scope.on(), () => {
		e.scope.off(), Sa(t);
	};
}, Ta = () => {
	ba && ba.scope.off(), Sa(null);
};
function Ea(e) {
	return e.vnode.shapeFlag & 4;
}
var Da = !1;
function Oa(e, t = !1, n = !1) {
	t && Ca(t);
	let { props: r, children: i } = e.vnode, a = Ea(e);
	bi(e, r, a, t), Ni(e, i, n || t);
	let o = a ? ka(e, t) : void 0;
	return t && Ca(!1), o;
}
function ka(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Rr);
	let { setup: r } = n;
	if (r) {
		Pe();
		let n = e.setupContext = r.length > 1 ? Fa(e) : null, i = wa(e), a = Zt(r, e, 0, [e.props, n]), o = y(a);
		if (Fe(), i(), (o || e.sp) && !fr(e) && sr(e), o) {
			if (a.then(Ta, Ta), t) return a.then((n) => {
				Aa(e, n, t);
			}).catch((t) => {
				$t(t, e, 0);
			});
			e.asyncDep = a;
		} else Aa(e, a, t);
	} else Na(e, t);
}
function Aa(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Ht(t)), Na(e, n);
}
var ja, Ma;
function Na(e, t, n) {
	let i = e.type;
	if (!e.render) {
		if (!t && ja && !i.render) {
			let t = i.template || Gr(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: r } = e.appContext.config, { delimiters: a, compilerOptions: o } = i;
				i.render = ja(t, s(s({
					isCustomElement: n,
					delimiters: a
				}, r), o));
			}
		}
		e.render = i.render || r, Ma && Ma(e);
	}
	{
		let t = wa(e);
		Pe();
		try {
			Vr(e);
		} finally {
			Fe(), t();
		}
	}
}
var Pa = { get(e, t) {
	return Ge(e, "get", ""), e[t];
} };
function Fa(e) {
	return {
		attrs: new Proxy(e.attrs, Pa),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Ia(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Ht(Ft(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Ir) return Ir[n](e);
		},
		has(e, t) {
			return t in e || t in Ir;
		}
	}) : e.proxy;
}
function La(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Ra(e) {
	return h(e) && "__vccOpts" in e;
}
var Q = (e, t) => /* @__PURE__ */ Wt(e, t, Da);
function za(e, t, n) {
	try {
		ta(-1);
		let r = arguments.length;
		return r === 2 ? v(t) && !d(t) ? ia(t) ? X(e, null, [t]) : X(e, t) : X(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && ia(n) && (n = [n]), X(e, t, n));
	} finally {
		ta(1);
	}
}
var Ba = "3.5.31", Va = void 0, Ha = typeof window < "u" && window.trustedTypes;
if (Ha) try {
	Va = /* @__PURE__ */ Ha.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ua = Va ? (e) => Va.createHTML(e) : (e) => e, Wa = "http://www.w3.org/2000/svg", Ga = "http://www.w3.org/1998/Math/MathML", Ka = typeof document < "u" ? document : null, qa = Ka && /* @__PURE__ */ Ka.createElement("template"), Ja = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ka.createElementNS(Wa, e) : t === "mathml" ? Ka.createElementNS(Ga, e) : n ? Ka.createElement(e, { is: n }) : Ka.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ka.createTextNode(e),
	createComment: (e) => Ka.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ka.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), !(i === a || !(i = i.nextSibling)););
		else {
			qa.innerHTML = Ua(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = qa.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ya = "transition", Xa = "animation", Za = /* @__PURE__ */ Symbol("_vtc"), Qa = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: !0
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
}, $a = /* @__PURE__ */ s({}, Yn, Qa), eo = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = $a, e))((e, { slots: t }) => za($n, ro(e), t)), to = (e, t = []) => {
	d(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, no = (e) => e ? d(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function ro(e) {
	let t = {};
	for (let n in e) n in Qa || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: c = `${n}-enter-to`, appearFromClass: l = a, appearActiveClass: u = o, appearToClass: d = c, leaveFromClass: f = `${n}-leave-from`, leaveActiveClass: p = `${n}-leave-active`, leaveToClass: m = `${n}-leave-to` } = e, h = io(i), g = h && h[0], _ = h && h[1], { onBeforeEnter: v, onEnter: y, onEnterCancelled: b, onLeave: x, onLeaveCancelled: S, onBeforeAppear: C = v, onAppear: w = y, onAppearCancelled: T = b } = t, E = (e, t, n, r) => {
		e._enterCancelled = r, so(e, t ? d : c), so(e, t ? u : o), n && n();
	}, D = (e, t) => {
		e._isLeaving = !1, so(e, f), so(e, m), so(e, p), t && t();
	}, O = (e) => (t, n) => {
		let i = e ? w : y, o = () => E(t, e, n);
		to(i, [t, o]), co(() => {
			so(t, e ? l : a), oo(t, e ? d : c), no(i) || uo(t, r, g, o);
		});
	};
	return s(t, {
		onBeforeEnter(e) {
			to(v, [e]), oo(e, a), oo(e, o);
		},
		onBeforeAppear(e) {
			to(C, [e]), oo(e, l), oo(e, u);
		},
		onEnter: O(!1),
		onAppear: O(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => D(e, t);
			oo(e, f), e._enterCancelled ? (oo(e, p), ho(e)) : (ho(e), oo(e, p)), co(() => {
				e._isLeaving && (so(e, f), oo(e, m), no(x) || uo(e, r, _, n));
			}), to(x, [e, n]);
		},
		onEnterCancelled(e) {
			E(e, !1, void 0, !0), to(b, [e]);
		},
		onAppearCancelled(e) {
			E(e, !0, void 0, !0), to(T, [e]);
		},
		onLeaveCancelled(e) {
			D(e), to(S, [e]);
		}
	});
}
function io(e) {
	if (e == null) return null;
	if (v(e)) return [ao(e.enter), ao(e.leave)];
	{
		let t = ao(e);
		return [t, t];
	}
}
function ao(e) {
	return F(e);
}
function oo(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[Za] || (e[Za] = /* @__PURE__ */ new Set())).add(t);
}
function so(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[Za];
	n && (n.delete(t), n.size || (e[Za] = void 0));
}
function co(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var lo = 0;
function uo(e, t, n, r) {
	let i = e._endId = ++lo, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = fo(e, t);
	if (!o) return r();
	let l = o + "end", u = 0, d = () => {
		e.removeEventListener(l, f), a();
	}, f = (t) => {
		t.target === e && ++u >= c && d();
	};
	setTimeout(() => {
		u < c && d();
	}, s + 1), e.addEventListener(l, f);
}
function fo(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${Ya}Delay`), a = r(`${Ya}Duration`), o = po(i, a), s = r(`${Xa}Delay`), c = r(`${Xa}Duration`), l = po(s, c), u = null, d = 0, f = 0;
	t === Ya ? o > 0 && (u = Ya, d = o, f = a.length) : t === Xa ? l > 0 && (u = Xa, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? Ya : Xa : null, f = u ? u === Ya ? a.length : c.length : 0);
	let p = u === Ya && /\b(?:transform|all)(?:,|$)/.test(r(`${Ya}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function po(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => mo(t) + mo(e[n])));
}
function mo(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function ho(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function go(e, t, n) {
	let r = e[Za];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var _o = /* @__PURE__ */ Symbol("_vod"), vo = /* @__PURE__ */ Symbol("_vsh"), yo = /* @__PURE__ */ Symbol(""), bo = /(?:^|;)\s*display\s*:/;
function xo(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) if (g(t)) for (let e of t.split(";")) {
			let t = e.slice(0, e.indexOf(":")).trim();
			n[t] ?? Co(r, t, "");
		}
		else for (let e in t) n[e] ?? Co(r, e, "");
		for (let e in n) e === "display" && (a = !0), Co(r, e, n[e]);
	} else if (i) {
		if (t !== n) {
			let e = r[yo];
			e && (n += ";" + e), r.cssText = n, a = bo.test(n);
		}
	} else t && e.removeAttribute("style");
	_o in e && (e[_o] = a ? r.display : "", e[vo] && (r.display = "none"));
}
var So = /\s*!important$/;
function Co(e, t, n) {
	if (d(n)) n.forEach((n) => Co(e, t, n));
	else if (n ??= "", t.startsWith("--")) e.setProperty(t, n);
	else {
		let r = Eo(e, t);
		So.test(n) ? e.setProperty(k(r), n.replace(So, ""), "important") : e[r] = n;
	}
}
var wo = [
	"Webkit",
	"Moz",
	"ms"
], To = {};
function Eo(e, t) {
	let n = To[t];
	if (n) return n;
	let r = O(t);
	if (r !== "filter" && r in e) return To[t] = r;
	r = A(r);
	for (let n = 0; n < wo.length; n++) {
		let i = wo[n] + r;
		if (i in e) return To[t] = i;
	}
	return t;
}
var Do = "http://www.w3.org/1999/xlink";
function Oo(e, t, n, r, i, a = se(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Do, t.slice(6, t.length)) : e.setAttributeNS(Do, t, n) : n == null || a && !ce(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function ko(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ua(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		(r !== i || !("_value" in e)) && (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = ce(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function Ao(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function jo(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Mo = /* @__PURE__ */ Symbol("_vei");
function No(e, t, n, r, i = null) {
	let a = e[Mo] || (e[Mo] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = Fo(t);
		r ? Ao(e, n, a[t] = zo(r, i), s) : o && (jo(e, n, o, s), a[t] = void 0);
	}
}
var Po = /(?:Once|Passive|Capture)$/;
function Fo(e) {
	let t;
	if (Po.test(e)) {
		t = {};
		let n;
		for (; n = e.match(Po);) e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
	}
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var Io = 0, Lo = /* @__PURE__ */ Promise.resolve(), Ro = () => Io ||= (Lo.then(() => Io = 0), Date.now());
function zo(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		Qt(Bo(e, n.value), t, 5, [e]);
	};
	return n.value = e, n.attached = Ro(), n;
}
function Bo(e, t) {
	if (d(t)) {
		let n = e.stopImmediatePropagation;
		return e.stopImmediatePropagation = () => {
			n.call(e), e._stopped = !0;
		}, t.map((e) => (t) => !t._stopped && e && e(t));
	} else return t;
}
var Vo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Ho = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? go(e, r, c) : t === "style" ? xo(e, n, r) : a(t) ? o(t) || No(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Uo(e, t, r, c)) ? (ko(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Oo(e, t, r, c, s, t !== "value")) : e._isVueCE && (Wo(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? ko(e, O(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), Oo(e, t, r, c));
};
function Uo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Vo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Vo(t) && g(n) ? !1 : t in e;
}
function Wo(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = O(t);
	return Array.isArray(n) ? n.some((e) => O(e) === r) : Object.keys(n).some((e) => O(e) === r);
}
var Go = /* @__PURE__ */ new WeakMap(), Ko = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ Symbol("_moveCb"), Jo = /* @__PURE__ */ Symbol("_enterCb"), Yo = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ s({}, $a, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = xa(), r = qn(), i, a;
		return Cr(() => {
			if (!i.length) return;
			let t = e.moveClass || `${e.name || "v"}-move`;
			if (!es(i[0].el, n.vnode.el, t)) {
				i = [];
				return;
			}
			i.forEach(Xo), i.forEach(Zo);
			let r = i.filter(Qo);
			ho(n.vnode.el), r.forEach((e) => {
				let n = e.el, r = n.style;
				oo(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[qo] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[qo] = null, so(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let o = /* @__PURE__ */ H(e), s = ro(o), c = o.tag || K;
			if (i = [], a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && (i.push(t), ir(t, tr(t, s, r, n)), Go.set(t, $o(t.el)));
			}
			a = t.default ? ar(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && ir(t, tr(t, s, r, n));
			}
			return X(c, null, a);
		};
	}
});
function Xo(e) {
	let t = e.el;
	t[qo] && t[qo](), t[Jo] && t[Jo]();
}
function Zo(e) {
	Ko.set(e, $o(e.el));
}
function Qo(e) {
	let t = Go.get(e), n = Ko.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), (!Number.isFinite(o) || o === 0) && (o = 1), (!Number.isFinite(s) || s === 0) && (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function $o(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top
	};
}
function es(e, t, n) {
	let r = e.cloneNode(), i = e[Za];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = fo(r);
	return a.removeChild(r), o;
}
var ts = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => N(t, e) : t;
};
function ns(e) {
	e.target.composing = !0;
}
function rs(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var is = /* @__PURE__ */ Symbol("_assign");
function as(e, t, n) {
	return t && (e = e.trim()), n && (e = te(e)), e;
}
var os = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e[is] = ts(i);
		let a = r || i.props && i.props.type === "number";
		Ao(e, t ? "change" : "input", (t) => {
			t.target.composing || e[is](as(e.value, n, a));
		}), (n || a) && Ao(e, "change", () => {
			e.value = as(e.value, n, a);
		}), t || (Ao(e, "compositionstart", ns), Ao(e, "compositionend", rs), Ao(e, "change", rs));
	},
	mounted(e, { value: t }) {
		e.value = t ?? "";
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[is] = ts(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? te(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, ss = {
	deep: !0,
	created(e, t, n) {
		e[is] = ts(n), Ao(e, "change", () => {
			let t = e._modelValue, n = us(e), r = e.checked, i = e[is];
			if (d(t)) {
				let e = de(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(ds(e, r));
		});
	},
	mounted: cs,
	beforeUpdate(e, t, n) {
		e[is] = ts(n), cs(e, t, n);
	}
};
function cs(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = de(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ue(t, ds(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var ls = {
	created(e, { value: t }, n) {
		e.checked = ue(t, n.props.value), e[is] = ts(n), Ao(e, "change", () => {
			e[is](us(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[is] = ts(r), t !== n && (e.checked = ue(t, r.props.value));
	}
};
function us(e) {
	return "_value" in e ? e._value : e.value;
}
function ds(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var fs = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], ps = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => fs.some((n) => e[`${n}Key`] && !t.includes(n))
}, ms = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = ps[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, hs = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, gs = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = k(n.key);
		if (t.some((e) => e === r || hs[e] === r)) return e(n);
	}));
}, _s = /* @__PURE__ */ s({ patchProp: Ho }, Ja), vs;
function ys() {
	return vs ||= Ii(_s);
}
var bs = ((...e) => {
	let t = ys().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Ss(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, xs(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function xs(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Ss(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region src/app/context.ts
var Cs = Symbol("creator-app");
function ws() {
	let e = Tn(Cs);
	if (!e) throw Error("Creator app context is unavailable.");
	return e;
}
//#endregion
//#region src/shell/bubble/bubble-feed-bus.ts
var Ts = 3e3;
function Es() {
	let e = /* @__PURE__ */ Dt({
		queue: [],
		unreadCount: 0
	}), t = 0, n = /* @__PURE__ */ new Map(), r = (e) => {
		let t = n.get(e);
		t !== void 0 && clearTimeout(t);
		let r = setTimeout(() => i(e), Ts);
		n.set(e, r);
	}, i = (t) => {
		let r = n.get(t);
		r !== void 0 && (clearTimeout(r), n.delete(t));
		let i = e.queue.findIndex((e) => e.id === t);
		i !== -1 && e.queue.splice(i, 1);
	}, a = (e, t) => e === t ? !0 : !e || !t || e.length !== t.length ? !1 : e.every((e, n) => {
		let r = t[n];
		return e.label === r.label && e.tone === r.tone;
	}), o = (t) => {
		for (let n = e.queue.length - 1; n >= 0; --n) {
			let r = e.queue[n];
			if (r.source === t.source && r.level === t.level && r.title === t.title && r.message === t.message && r.panelTabId === t.panelTabId && a(r.chips, t.chips)) return n;
		}
		return -1;
	};
	return {
		state: e,
		push(n) {
			let i = o(n);
			if (i !== -1) {
				let [t] = e.queue.splice(i, 1);
				t.repeatCount += 1, t.timestampMs = Date.now(), e.queue.push(t), e.unreadCount += 1, r(t.id);
				return;
			}
			let a = {
				...n,
				id: `feed_${Date.now()}_${t}`,
				timestampMs: Date.now(),
				repeatCount: 1
			};
			t += 1, e.queue.push(a), e.unreadCount += 1, r(a.id);
		},
		remove: i,
		markAllRead() {
			e.unreadCount = 0;
		}
	};
}
//#endregion
//#region src/shell/bubble/FloatingBubble.vue?vue&type=script&setup=true&lang.ts
var Ds = ["onClick"], Os = { class: "feed-text" }, ks = { class: "feed-title-row" }, As = { class: "feed-title" }, js = {
	key: 0,
	class: "feed-repeat"
}, Ms = {
	key: 0,
	class: "feed-message"
}, Ns = {
	key: 1,
	class: "feed-chips"
}, Ps = {
	key: 0,
	class: "bubble-code-icon"
}, Fs = {
	key: 1,
	class: "bubble-badge"
}, Is = 12, Ls = 12, Rs = 360, zs = 1e3, Bs = 15, Vs = 1, Hs = /* @__PURE__ */ or({
	__name: "FloatingBubble",
	setup(e) {
		let { bubbleBus: t, layout: n, settings: r, shell: i } = ws(), a = "ontouchstart" in window || navigator.maxTouchPoints > 0, o = a ? 44 : 48, s = () => {
			let e = n.state.safeFrame, t = (o + Is) * Vs;
			return {
				x: Math.max(e.left + Is, e.right - o - Is),
				y: Math.max(e.top + Is, e.bottom - o - Is - t)
			};
		}, c = r.state.bubblePosition ?? s(), l = /* @__PURE__ */ U(c.x), u = /* @__PURE__ */ U(c.y), d = /* @__PURE__ */ U(!1), f = /* @__PURE__ */ U(!1), p = Q(() => t.state.unreadCount), m = l.value, h = u.value, g = 0, _ = 0, v = 0, y = 0, b = null, x = () => {
			b &&= (clearTimeout(b), null);
		}, S = () => {
			let e = n.state.safeFrame, t = e.left + Is, r = Math.max(t, e.right - o - Is), i = e.top + Is, a = Math.max(i, e.bottom - o - Is);
			l.value = Math.max(t, Math.min(l.value, r)), u.value = Math.max(i, Math.min(u.value, a));
		}, C = () => {
			r.setBubblePosition({
				x: m,
				y: h
			});
		}, w = (e = zs) => {
			a && (x(), !(d.value || i.state.panelOpen) && (b = setTimeout(() => {
				!d.value && !i.state.panelOpen && E();
			}, e)));
		}, T = "right", E = () => {
			if (f.value) return;
			let e = n.state.safeFrame;
			if (e.width <= 0) return;
			m = l.value, h = u.value;
			let t = m + o / 2;
			t - e.left <= e.right - t ? (l.value = e.left - o + Bs, T = "left") : (l.value = e.right - Bs, T = "right"), f.value = !0;
		}, D = (e = !0) => {
			if (!f.value) return;
			let t = n.state.safeFrame;
			T === "left" ? l.value = t.left + Is : l.value = t.right - o - Is, f.value = !1, e && w();
		}, O = () => {
			!a || i.state.panelOpen || (f.value && D(!1), w(Ts));
		};
		On(() => [
			n.state.safeFrame.left,
			n.state.safeFrame.top,
			n.state.safeFrame.right,
			n.state.safeFrame.bottom
		], () => {
			if (!r.state.bubblePosition) {
				let e = s();
				l.value = e.x, u.value = e.y, m = l.value, h = u.value;
				return;
			}
			f.value || (S(), m = l.value, h = u.value);
		}, { immediate: !0 }), On(() => i.state.panelOpen, (e) => {
			e ? (f.value && D(!1), x()) : w();
		}), On(() => t.state.unreadCount, (e, t) => {
			e > (t ?? 0) && O();
		}), xr(() => {
			w();
		}), Tr(() => {
			x();
		});
		let ee = (e) => {
			e && i.openPanel(e);
		}, k = Q(() => {
			let e = n.state.viewportFrame, t = n.state.safeFrame, r = Math.min(Rs, Math.max(0, t.width - Is * 2)), i = t.left + Is, a = Math.max(i, t.right - r - Is), s = Math.min(Math.max(l.value - r + o - 6, i), a), c = Math.max(u.value - Ls - (t.top + Is), 0), d = Math.max(t.bottom - (u.value + o + Ls + Is), 0), f = c >= 140 || c >= d;
			return r <= 0 ? {
				className: "below",
				style: { display: "none" }
			} : {
				className: f ? "above" : "below",
				style: f ? {
					left: `${s}px`,
					bottom: `${Math.max(0, e.bottom - u.value + Ls)}px`,
					maxWidth: `${r}px`,
					maxHeight: `${c}px`
				} : {
					left: `${s}px`,
					top: `${u.value + o + Ls}px`,
					maxWidth: `${r}px`,
					maxHeight: `${d}px`
				}
			};
		}), A = (e) => {
			f.value && D(!1), d.value = !0, g = e.clientX, _ = e.clientY, v = l.value, y = u.value, e.currentTarget.setPointerCapture(e.pointerId);
		}, j = (e) => {
			d.value && (l.value = v + (e.clientX - g), u.value = y + (e.clientY - _), S());
		}, M = (e) => {
			d.value && (d.value = !1, e.currentTarget.releasePointerCapture(e.pointerId), m = l.value, h = u.value, C(), w(), Math.abs(e.clientX - g) < 5 && Math.abs(e.clientY - _) < 5 && i.togglePanel());
		}, N = () => {
			f.value ? D() : w();
		}, P = () => {
			w();
		}, te = Q(() => {
			let e = r.state.customBubbleIcon;
			return e ? {
				backgroundImage: `url(${e})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat"
			} : {};
		});
		return (e, n) => (q(), J("div", {
			class: z(["floating-bubble-container", {
				"is-docked": f.value,
				"is-dragging": d.value,
				"is-mobile": W(a)
			}]),
			style: L({
				left: `${l.value}px`,
				top: `${u.value}px`
			})
		}, [Y("div", {
			class: z(["feed-stream", k.value.className]),
			style: L(k.value.style)
		}, [X(Yo, { name: "feed-slide" }, {
			default: xn(() => [(q(!0), J(K, null, G(W(t).state.queue, (e) => (q(), J("div", {
				key: e.id,
				class: z(["feed-item", [e.level, {
					clickable: !!e.panelTabId,
					"with-chips": !!e.chips?.length
				}]]),
				onClick: (t) => ee(e.panelTabId)
			}, [Y("div", { class: z(["feed-indicator", e.source]) }, null, 2), Y("div", Os, [
				Y("div", ks, [Y("span", As, B(e.title), 1), e.repeatCount > 1 ? (q(), J("span", js, "x" + B(e.repeatCount), 1)) : Z("", !0)]),
				e.message ? (q(), J("span", Ms, B(e.message), 1)) : Z("", !0),
				e.chips?.length ? (q(), J("div", Ns, [(q(!0), J(K, null, G(e.chips, (t, n) => (q(), J("span", {
					key: `${e.id}-${n}-${t.tone}-${t.label}`,
					class: "feed-chip"
				}, [Y("span", { class: z(["feed-chip-dot", t.tone]) }, null, 2), Y("span", null, B(t.label), 1)]))), 128))])) : Z("", !0)
			])], 10, Ds))), 128))]),
			_: 1
		})], 6), Y("div", {
			class: z(["bubble-btn", { "is-transparent": W(r).state.customBubbleBgTransparent && W(r).state.customBubbleIcon }]),
			style: L(te.value),
			onPointerdown: ms(A, ["stop", "prevent"]),
			onPointermove: j,
			onPointerup: M,
			onMouseenter: N,
			onMouseleave: P
		}, [W(r).state.customBubbleIcon ? Z("", !0) : (q(), J("span", Ps, "</>")), p.value > 0 ? (q(), J("span", Fs, B(p.value), 1)) : Z("", !0)], 38)], 6));
	}
}), Us = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, Ws = /* @__PURE__ */ Us(Hs, [["__scopeId", "data-v-70bf7475"]]), Gs = { class: "cropper-root" }, Ks = ["data-ttbd-appearance"], qs = { class: "cropper-header" }, Js = { class: "canvas-container" }, Ys = { class: "controls" }, Xs = [
	"min",
	"max",
	"value"
], Zs = { class: "cropper-footer" }, Qs = 300, $s = 240, ec = 128, tc = 10, nc = 10, rc = .05, ic = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "ImageCropper",
	props: {
		imageUrl: {},
		i18n: {},
		appearanceMode: {}
	},
	emits: ["crop", "cancel"],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ U(null), a = new Image(), o = /* @__PURE__ */ U(1), s = /* @__PURE__ */ U(1), c = /* @__PURE__ */ U({
			x: 0,
			y: 0
		}), l = !1, u = {
			x: 0,
			y: 0
		}, d = 0, f = 0, p = null, m = Q(() => Math.max(s.value, nc)), h = (e, t, n) => Math.min(n, Math.max(t, e)), g = () => {
			if (!d || !f) return;
			o.value = h(o.value, s.value, m.value);
			let e = Math.max(0, (d * o.value - $s) / 2), t = Math.max(0, (f * o.value - $s) / 2);
			c.value = {
				x: h(c.value.x, -e, e),
				y: h(c.value.y, -t, t)
			};
		}, _ = (e) => {
			o.value = e, g(), b();
		}, v = (e, t) => {
			c.value = {
				x: c.value.x + e,
				y: c.value.y + t
			}, g(), b();
		}, y = (e) => {
			if (!p) {
				let t = document.createElement("canvas");
				t.width = tc * 2, t.height = tc * 2;
				let n = t.getContext("2d");
				if (!n) throw Error("Canvas 2D context is unavailable.");
				if (n.fillStyle = "#ffffff", n.fillRect(0, 0, t.width, t.height), n.fillStyle = "#cccccc", n.fillRect(0, 0, tc, tc), n.fillRect(tc, tc, tc, tc), p = e.createPattern(t, "repeat"), !p) throw Error("Canvas checker pattern is unavailable.");
			}
			return p;
		}, b = () => {
			let e = i.value;
			if (!e) return;
			let t = e.getContext("2d");
			if (!t) throw Error("Canvas 2D context is unavailable.");
			t.clearRect(0, 0, Qs, Qs), t.fillStyle = y(t), t.fillRect(0, 0, Qs, Qs), t.save(), t.translate(Qs / 2, Qs / 2), t.translate(c.value.x, c.value.y), t.scale(o.value, o.value), t.drawImage(a, -d / 2, -f / 2, d, f), t.restore(), t.fillStyle = "rgba(0, 0, 0, 0.6)", t.beginPath(), t.rect(0, 0, Qs, Qs), t.arc(Qs / 2, Qs / 2, $s / 2, 0, Math.PI * 2, !0), t.fill(), t.strokeStyle = "#fff", t.lineWidth = 2, t.beginPath(), t.arc(Qs / 2, Qs / 2, $s / 2, 0, Math.PI * 2), t.stroke();
		}, x = () => {
			a.src = n.imageUrl, a.onload = () => {
				d = a.naturalWidth, f = a.naturalHeight;
				let e = $s / d, t = $s / f;
				s.value = Math.max(e, t), o.value = s.value, c.value = {
					x: 0,
					y: 0
				}, b();
			};
		};
		On(() => n.imageUrl, x), xr(() => {
			x();
		});
		let S = /* @__PURE__ */ new Map(), C = 0, w = 1, T = () => {
			let e = Array.from(S.values());
			if (e.length < 2) return 0;
			let t = e[0].x - e[1].x, n = e[0].y - e[1].y;
			return Math.sqrt(t * t + n * n);
		}, E = (e) => {
			S.set(e.pointerId, {
				x: e.clientX,
				y: e.clientY
			}), S.size === 1 ? (l = !0, u = {
				x: e.clientX,
				y: e.clientY
			}) : S.size === 2 && (l = !1, C = T(), w = o.value), e.target.setPointerCapture(e.pointerId);
		}, D = (e) => {
			if (S.has(e.pointerId)) {
				if (S.set(e.pointerId, {
					x: e.clientX,
					y: e.clientY
				}), S.size === 1 && l) {
					let t = e.clientX - u.x, n = e.clientY - u.y;
					u = {
						x: e.clientX,
						y: e.clientY
					};
					let r = e.currentTarget?.getBoundingClientRect(), i = r && r.width > 0 ? Qs / r.width : 1;
					v(t * i, n * i);
				} else if (S.size === 2) {
					let e = T();
					C > 0 && _(e / C * w);
				}
			}
		}, O = (e) => {
			if (S.delete(e.pointerId), S.size < 2 && (C = 0), S.size === 1) {
				l = !0;
				let e = Array.from(S.values())[0];
				u = {
					x: e.x,
					y: e.y
				};
			} else S.size === 0 && (l = !1);
			e.target.releasePointerCapture(e.pointerId);
		}, ee = (e) => {
			let t = e.deltaY < 0 ? 1 + rc : 1 / (1 + rc);
			_(o.value * t);
		}, k = (e) => {
			_(Number(e.target.value));
		}, A = () => {
			let e = document.createElement("canvas");
			e.width = ec, e.height = ec;
			let t = e.getContext("2d");
			if (!t) throw Error("Canvas 2D context is unavailable.");
			t.save(), t.translate(e.width / 2, e.height / 2);
			let n = e.width / $s;
			t.translate(c.value.x * n, c.value.y * n), t.scale(o.value * n, o.value * n), t.drawImage(a, -d / 2, -f / 2, d, f), t.restore(), r("crop", e.toDataURL("image/png"));
		};
		return (e, t) => (q(), ra(Hn, { to: "body" }, [Y("div", Gs, [Y("div", {
			class: "cropper-overlay",
			onClick: t[0] ||= (e) => r("cancel")
		}), Y("div", {
			class: "cropper-modal ttbd-theme-root",
			"data-ttbd-appearance": n.appearanceMode
		}, [
			Y("header", qs, [Y("h3", null, B(n.i18n.t("settings.uploadIcon")), 1), Y("button", {
				class: "btn-close",
				onClick: t[1] ||= (e) => r("cancel")
			}, "×")]),
			Y("div", Js, [Y("canvas", {
				ref_key: "canvasRef",
				ref: i,
				width: Qs,
				height: Qs,
				onPointerdown: E,
				onPointermove: D,
				onPointerup: O,
				onPointercancel: O,
				onWheel: ms(ee, ["prevent"])
			}, null, 544)]),
			Y("div", Ys, [
				t[3] ||= Y("span", { class: "icon" }, "🔍-", -1),
				Y("input", {
					type: "range",
					min: s.value,
					max: m.value,
					step: "0.01",
					value: o.value,
					class: "scale-slider",
					onInput: k
				}, null, 40, Xs),
				t[4] ||= Y("span", { class: "icon" }, "🔍+", -1)
			]),
			Y("footer", Zs, [Y("button", {
				class: "btn-cancel",
				onClick: t[2] ||= (e) => r("cancel")
			}, B(n.i18n.t("common.close")), 1), Y("button", {
				class: "btn-confirm",
				onClick: A
			}, B(n.i18n.t("common.apply")), 1)])
		], 8, Ks)])]));
	}
}), [["__scopeId", "data-v-13175fb9"]]), ac = ["night", "day"], oc = "night", sc = { class: "settings-pane" }, cc = { class: "settings-header" }, lc = { class: "settings-title" }, uc = { class: "settings-description" }, dc = { class: "settings-card settings-card-master" }, fc = { class: "settings-card-copy" }, pc = ["checked"], mc = { class: "settings-group" }, hc = { class: "settings-group-header" }, gc = { class: "settings-card appearance-card" }, _c = { class: "settings-card-copy" }, vc = ["aria-label"], yc = ["onClick"], bc = { class: "settings-card appearance-card" }, xc = { class: "settings-card-copy" }, Sc = { class: "custom-icon-actions appearance-toggle" }, Cc = {
	key: 0,
	class: "settings-card"
}, wc = { class: "settings-card-copy" }, Tc = ["checked"], Ec = { class: "settings-groups" }, Dc = { class: "settings-group-header" }, Oc = { class: "settings-list" }, kc = { class: "settings-card-copy" }, Ac = ["checked", "onChange"], jc = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "CreatorSettingsPane",
	props: {
		title: {},
		description: {},
		extensionEnabled: { type: Boolean },
		appearanceMode: {},
		customBubbleIcon: {},
		customBubbleBgTransparent: { type: Boolean },
		features: {},
		i18n: {}
	},
	emits: [
		"toggle-extension",
		"set-appearance",
		"toggle-feature",
		"set-custom-icon",
		"set-custom-icon-transparent"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = Q(() => n.i18n.t.bind(n.i18n)), a = [
			"bubble-dialogue",
			"character-tools",
			"extension-dev",
			"memory-dev"
		], o = {
			"bubble-dialogue": "settings.area.bubbleDialogue",
			"character-tools": "settings.area.characterTools",
			"extension-dev": "settings.area.extensionDev",
			"memory-dev": "settings.area.memoryDev"
		}, s = {
			night: "settings.appearanceNight",
			day: "settings.appearanceDay"
		}, c = Q(() => a.map((e) => ({
			area: e,
			label: i.value(o[e]),
			features: n.features.filter((t) => t.area === e)
		})).filter((e) => e.features.length > 0)), l = Q(() => ac.map((e) => ({
			value: e,
			labelKey: s[e]
		}))), u = (e) => {
			r("toggle-extension", e.target.checked);
		}, d = (e) => {
			r("set-appearance", e);
		}, f = (e, t) => {
			r("toggle-feature", {
				id: e,
				enabled: t.target.checked
			});
		}, p = /* @__PURE__ */ U(null), m = /* @__PURE__ */ U(!1), h = /* @__PURE__ */ U(""), g = (e) => {
			let t = e.target.files?.[0];
			if (t) {
				if (t.type === "image/gif") {
					let e = new FileReader();
					e.onload = (e) => {
						r("set-custom-icon", e.target?.result);
					}, e.readAsDataURL(t);
				} else h.value = URL.createObjectURL(t), m.value = !0;
				p.value && (p.value.value = "");
			}
		}, _ = (e) => {
			r("set-custom-icon", e), m.value = !1, URL.revokeObjectURL(h.value);
		}, v = () => {
			m.value = !1, URL.revokeObjectURL(h.value);
		}, y = (e) => {
			r("set-custom-icon-transparent", e.target.checked);
		}, b = () => {
			p.value?.click();
		}, x = () => {
			r("set-custom-icon", null);
		};
		return (e, t) => (q(), J("div", sc, [
			Y("div", cc, [Y("h2", lc, B(n.title), 1), Y("p", uc, B(n.description), 1)]),
			Y("label", dc, [Y("div", fc, [Y("strong", null, B(i.value("settings.enableRuntime")), 1), Y("span", null, B(i.value("settings.enableRuntimeDesc")), 1)]), Y("input", {
				type: "checkbox",
				class: "settings-toggle",
				checked: n.extensionEnabled,
				onChange: u
			}, null, 40, pc)]),
			Y("section", mc, [
				Y("header", hc, [Y("h3", null, B(i.value("settings.appearance")), 1)]),
				Y("div", gc, [Y("div", _c, [Y("strong", null, B(i.value("settings.appearance")), 1), Y("span", null, B(i.value("settings.appearanceDesc")), 1)]), Y("div", {
					class: "appearance-toggle",
					role: "group",
					"aria-label": i.value("settings.appearance")
				}, [(q(!0), J(K, null, G(l.value, (e) => (q(), J("button", {
					key: e.value,
					type: "button",
					class: z(["appearance-option", { active: n.appearanceMode === e.value }]),
					onClick: (t) => d(e.value)
				}, B(i.value(e.labelKey)), 11, yc))), 128))], 8, vc)]),
				Y("div", bc, [Y("div", xc, [Y("strong", null, B(i.value("settings.customIcon")), 1), Y("span", null, B(i.value("settings.customIconDesc")), 1)]), Y("div", Sc, [
					Y("button", {
						type: "button",
						class: "appearance-option active",
						onClick: b
					}, B(i.value("settings.uploadIcon")), 1),
					n.customBubbleIcon ? (q(), J("button", {
						key: 0,
						type: "button",
						class: "appearance-option",
						onClick: x
					}, B(i.value("settings.removeIcon")), 1)) : Z("", !0),
					Y("input", {
						type: "file",
						ref_key: "fileInputRef",
						ref: p,
						accept: "image/*",
						style: { display: "none" },
						onChange: g
					}, null, 544)
				])]),
				n.customBubbleIcon ? (q(), J("label", Cc, [Y("div", wc, [Y("strong", null, B(i.value("settings.transparentBg")), 1), Y("span", null, B(i.value("settings.transparentBgDesc")), 1)]), Y("input", {
					type: "checkbox",
					class: "settings-toggle",
					checked: n.customBubbleBgTransparent,
					onChange: y
				}, null, 40, Tc)])) : Z("", !0)
			]),
			Y("div", Ec, [(q(!0), J(K, null, G(c.value, (e) => (q(), J("section", {
				key: e.area,
				class: "settings-group"
			}, [Y("header", Dc, [Y("h3", null, B(e.label), 1), Y("span", null, B(i.value("settings.featureCount", { n: e.features.length })), 1)]), Y("div", Oc, [(q(!0), J(K, null, G(e.features, (e) => (q(), J("label", {
				key: e.id,
				class: "settings-card"
			}, [Y("div", kc, [Y("strong", null, B(i.value(e.titleKey)), 1), Y("span", null, B(i.value(e.descriptionKey)), 1)]), Y("input", {
				type: "checkbox",
				class: "settings-toggle",
				checked: e.enabled,
				onChange: (t) => f(e.id, t)
			}, null, 40, Ac)]))), 128))])]))), 128))]),
			m.value ? (q(), ra(ic, {
				key: 0,
				"image-url": h.value,
				i18n: n.i18n,
				"appearance-mode": n.appearanceMode,
				onCrop: _,
				onCancel: v
			}, null, 8, [
				"image-url",
				"i18n",
				"appearance-mode"
			])) : Z("", !0)
		]));
	}
}), [["__scopeId", "data-v-233515f1"]]), Mc = /* @__PURE__ */ or({
	__name: "ExtensionSettings",
	setup(e) {
		let { registry: t, settings: n, i18n: r } = ws(), i = r.t.bind(r), a = Q(() => t.features.map((e) => ({
			id: e.id,
			area: e.area,
			titleKey: e.titleKey,
			descriptionKey: e.descriptionKey,
			enabled: e.enabled
		}))), o = (e) => {
			n.setEnabled(e);
		}, s = (e) => {
			n.setAppearanceMode(e);
		}, c = (e) => {
			n.setCustomBubbleIcon(e);
		}, l = (e) => {
			n.setCustomBubbleBgTransparent(e);
		}, u = async ({ id: e, enabled: n }) => {
			await t.setFeatureEnabled(e, n);
		};
		return (e, t) => (q(), ra(jc, {
			title: W(i)("settings.title"),
			description: W(i)("settings.description"),
			"extension-enabled": W(n).state.enabled,
			"appearance-mode": W(n).state.appearanceMode,
			"custom-bubble-icon": W(n).state.customBubbleIcon,
			"custom-bubble-bg-transparent": W(n).state.customBubbleBgTransparent,
			features: a.value,
			i18n: W(r),
			onToggleExtension: o,
			onSetAppearance: s,
			onToggleFeature: t[0] ||= (e) => void u(e),
			onSetCustomIcon: c,
			onSetCustomIconTransparent: l
		}, null, 8, [
			"title",
			"description",
			"extension-enabled",
			"appearance-mode",
			"custom-bubble-icon",
			"custom-bubble-bg-transparent",
			"features",
			"i18n"
		]));
	}
}), Nc = { class: "panel-sidebar" }, Pc = { class: "sidebar-header" }, Fc = { class: "sidebar-nav desktop-nav" }, Ic = {
	key: 0,
	class: "category-title"
}, Lc = ["onClick"], Rc = { class: "mobile-nav" }, zc = ["onClick"], Bc = { class: "panel-content" }, Vc = { class: "content-header" }, Hc = { class: "content-body" }, Uc = {
	key: 0,
	class: "feature-host settings-host"
}, Wc = {
	key: 1,
	class: "feature-host"
}, Gc = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "MainPanel",
	setup(e) {
		let { registry: t, shell: n, i18n: r } = ws(), i = r.t.bind(r), a = {
			"bubble-dialogue": "settings.area.bubbleDialogue",
			"character-tools": "settings.area.characterTools",
			"extension-dev": "settings.area.extensionDev",
			"memory-dev": "settings.area.memoryDev"
		}, o = [
			"bubble-dialogue",
			"character-tools",
			"extension-dev",
			"memory-dev"
		], s = Q(() => n.state.activeTab), c = Q(() => t.resolveTab(s.value)), l = Q(() => t.getActiveFeatures().find((e) => e.id === c.value) ?? null), u = Q(() => [{
			id: "settings",
			label: i("panel.globalSettings")
		}, ...t.getActiveFeatures().map((e) => ({
			id: e.id,
			label: i(e.titleKey)
		}))]), d = (e) => t.getFeaturesByArea(e), f = (e) => {
			n.setActiveTab(e);
		};
		return (e, t) => (q(), J("div", {
			class: "main-panel-backdrop",
			"data-tt-mobile-surface": "backdrop",
			onClick: t[3] ||= (e) => W(n).closePanel()
		}, [Y("div", {
			class: "main-panel-window",
			"data-tt-mobile-surface": "fullscreen-window",
			onClick: t[2] ||= ms(() => {}, ["stop"])
		}, [Y("div", Nc, [
			Y("div", Pc, [Y("h3", null, B(W(i)("panel.sidebarTitle")), 1)]),
			Y("div", Fc, [Y("div", {
				class: z(["nav-item", { active: c.value === "settings" }]),
				onClick: t[0] ||= (e) => f("settings")
			}, B(W(i)("panel.globalSettings")), 3), (q(), J(K, null, G(o, (e) => Y("div", {
				key: e,
				class: "nav-category"
			}, [d(e).length > 0 ? (q(), J("div", Ic, B(W(i)(a[e])), 1)) : Z("", !0), (q(!0), J(K, null, G(d(e), (e) => (q(), J("div", {
				key: e.id,
				class: z(["nav-item sub-item", { active: c.value === e.id }]),
				onClick: (t) => f(e.id)
			}, B(W(i)(e.titleKey)), 11, Lc))), 128))])), 64))]),
			Y("div", Rc, [(q(!0), J(K, null, G(u.value, (e) => (q(), J("button", {
				key: e.id,
				class: z(["mobile-tab", { active: c.value === e.id }]),
				onClick: (t) => f(e.id)
			}, B(e.label), 11, zc))), 128))])
		]), Y("div", Bc, [Y("div", Vc, [Y("button", {
			class: "close-btn",
			onClick: t[1] ||= (e) => W(n).closePanel()
		}, "✕")]), Y("div", Hc, [c.value === "settings" ? (q(), J("div", Uc, [X(Mc)])) : l.value ? (q(), J("div", Wc, [(q(), ra(Mr(l.value.component), { controller: l.value.controller }, null, 8, ["controller"]))])) : Z("", !0)])])])]));
	}
}), [["__scopeId", "data-v-ebf1e8e1"]]), Kc = /* @__PURE__ */ or({
	__name: "App",
	setup(e) {
		let { layout: t, shell: n } = ws(), r = Q(() => n.state.panelOpen), i = Q(() => ({
			"--ttbd-viewport-left": `${t.state.viewportFrame.left}px`,
			"--ttbd-viewport-top": `${t.state.viewportFrame.top}px`,
			"--ttbd-viewport-width": `${t.state.viewportFrame.width}px`,
			"--ttbd-viewport-height": `${t.state.viewportFrame.height}px`,
			"--ttbd-safe-inset-top": `${t.state.safeInsets.top}px`,
			"--ttbd-safe-inset-right": `${t.state.safeInsets.right}px`,
			"--ttbd-safe-inset-bottom": `${t.state.safeInsets.bottom}px`,
			"--ttbd-safe-inset-left": `${t.state.safeInsets.left}px`
		}));
		return (e, t) => (q(), J("div", {
			class: "ttbd-shell-root",
			style: L(i.value)
		}, [X(Ws), X(eo, { name: "fade" }, {
			default: xn(() => [r.value ? (q(), ra(Gc, { key: 0 })) : Z("", !0)]),
			_: 1
		})], 4));
	}
});
//#endregion
//#region src/features/resolve-tab.ts
function qc(e, t) {
	return e === "settings" ? "settings" : t.includes(e) ? e : t[0] ?? "settings";
}
//#endregion
//#region src/features/bubble-render/constants.ts
var Jc = [
	{
		id: "mood-joy",
		label: "喜悦",
		color: "#f59e0b"
	},
	{
		id: "mood-anger",
		label: "愤怒",
		color: "#ef4444"
	},
	{
		id: "mood-sad",
		label: "悲伤",
		color: "#3b82f6"
	},
	{
		id: "mood-anxious",
		label: "紧张",
		color: "#eab308"
	},
	{
		id: "mood-calm",
		label: "平和",
		color: "#22c55e"
	},
	{
		id: "mood-shy",
		label: "害羞",
		color: "#06b6d4"
	},
	{
		id: "mood-disgust",
		label: "嫌弃",
		color: "#8b5cf6"
	},
	{
		id: "mood-love",
		label: "爱恋",
		color: "#ec4899"
	}
], Yc = [
	{
		id: "mood-joy",
		label: "喜悦",
		color: "#f59e0b",
		words: [
			"开心",
			"欢喜",
			"欣喜",
			"愉悦",
			"满足",
			"幸福",
			"期待",
			"惊喜",
			"甜蜜",
			"狂喜",
			"兴奋",
			"雀跃",
			"畅快",
			"陶醉",
			"得意",
			"骄傲",
			"自豪",
			"自信"
		]
	},
	{
		id: "mood-anger",
		label: "愤怒",
		color: "#ef4444",
		words: [
			"愤怒",
			"暴怒",
			"气愤",
			"愤慨",
			"暴躁",
			"怨恨",
			"敌意",
			"恼火",
			"窝火",
			"生气",
			"烦躁",
			"烦闷"
		]
	},
	{
		id: "mood-sad",
		label: "悲伤",
		color: "#3b82f6",
		words: [
			"难过",
			"伤心",
			"心酸",
			"忧伤",
			"惆怅",
			"失落",
			"低落",
			"沮丧",
			"悲伤",
			"心痛",
			"悲痛",
			"痛苦",
			"委屈",
			"不甘",
			"失望",
			"受伤",
			"孤独",
			"寂寞",
			"落寞"
		]
	},
	{
		id: "mood-anxious",
		label: "紧张",
		color: "#eab308",
		words: [
			"焦虑",
			"紧张",
			"不安",
			"忐忑",
			"担忧",
			"慌张",
			"焦躁",
			"害怕",
			"恐惧",
			"惊恐",
			"畏惧",
			"胆怯",
			"心慌",
			"警惕",
			"戒备"
		]
	},
	{
		id: "mood-calm",
		label: "平和",
		color: "#22c55e",
		words: [
			"平静",
			"淡然",
			"冷静",
			"沉稳",
			"从容",
			"坦然",
			"淡定",
			"温馨",
			"舒畅",
			"惬意",
			"温暖",
			"欣慰",
			"释然",
			"感动",
			"感恩"
		]
	},
	{
		id: "mood-shy",
		label: "害羞",
		color: "#06b6d4",
		words: [
			"害羞",
			"尴尬",
			"窘迫",
			"难堪",
			"困惑",
			"迷茫",
			"疑惑",
			"纠结",
			"犹豫",
			"无奈",
			"无语"
		]
	},
	{
		id: "mood-disgust",
		label: "嫌弃",
		color: "#8b5cf6",
		words: [
			"厌恶",
			"嫌弃",
			"鄙视",
			"反感",
			"排斥",
			"抗拒",
			"不屑",
			"冷淡",
			"冷漠",
			"疏离",
			"麻木"
		]
	},
	{
		id: "mood-love",
		label: "爱恋",
		color: "#ec4899",
		words: [
			"喜欢",
			"爱慕",
			"迷恋",
			"倾慕",
			"宠溺",
			"依恋",
			"心动",
			"认真"
		]
	}
], Xc = "[对话渲染格式规范]\r\n角色对白、内心活动、突发反应、莫名声音都必须用以下格式（整行内，固定5段，缺一不可）：\r\n@bubble:角色名|情绪|[对白]|服装|动作\r\n\r\n通用规则：\r\n- @bubble: 前缀固定不可改；各字段用 | 分隔，整行不换行\r\n- 🔴 5段全部必填：角色名、情绪、[对白]、服装、动作 —— 每个 @bubble 都必须写满5段，严禁只写3段（只有情绪没有服装动作会导致头像无法匹配，只能显示基础头像）\r\n- 角色名必须每次都写完整全名且前后一致（\"城崎诺亚\"不简写\"诺亚\"），对所有角色生效（含新NPC/任务对象/论坛网友）；只有名的写名（如\"云儿\"），名字未知用 ？？？\r\n- 台词用 [ ] 包裹，内不能含 | [ ] 符号；旁白正常写不加标记\r\n- 每次说话/心理都必须带完整5段 @bubble，不可省略任何字段；多角色各用自己的名（含系统声音）\r\n- 内心活动写 @bubble:角色名|情绪|[*想的内容*]|服装|动作，星号成对包裹整段心理，服装动作照常填满\r\n- 路人/同学/同事用 @bubble:男路人X|情绪|[对白]|服装|动作（女路人/男同学等同理）\r\n- 敌人：怪物用 @bubble:夜魔A|生气|[你！]|outfit-casual|act-sfw，人型敌人同路人规则\r\n\r\n[字段取值·标签锁死]\r\n※ 服装/动作/情绪三个字段都是\"标签锁死\"：只能从下列固定值选，严禁自造/翻译/改写。服装动作必须原样输出英文标签，情绪只写中文词。写错会被系统忽略或兜底。\r\n\r\n服装（第4段，必填）：outfit-casual 常服/默认服 | outfit-formal 正装/礼服 | outfit-sleep 睡衣/休息 | outfit-lingerie 内衣/泳装(仅女) | outfit-naked 裸体 | outfit-hoodie 连帽衫 | outfit-leather 紧身皮甲 | outfit-maid 女仆装 | outfit-kimono 和风礼装 | outfit-steampunk 蒸汽朋克战斗裙 | outfit-slip 吊带裙 | outfit-ice 冰雪仙装\r\n  · 拿不准就填 outfit-casual（常服），绝不能不写\r\n动作（第5段，必填）—— 🔴 先看这一段正文在发生什么，再机械对应，**不要习惯性填 act-sfw**：\r\n  act-oral 口交(含住/吞吐/舔) | act-handjob 手淫(手/撸动/握住柱身) | act-paizuri 乳交(夹在胸间) | act-footjob 足交(用脚) | act-vaginal 性交(插入/结合) | act-sfw 日常(确实没有性行为)\r\n  · 判定规则：正文段落里出现了哪种性行为，第5段就写对应的 act-* 标签；只有确实没有任何性行为（日常对话、拥抱、亲吻、睡觉、调情）才写 act-sfw。\r\n  · 🔴 最常见的错误：正文在写性行为、第5段却写 act-sfw —— 头像会停在日常差分，跟剧情完全对不上。写 act-sfw 之前，先确认这一段真的没有性行为。\r\n  · 男女都正常填服装+动作；NSFW 动作只有女性有差分图，男性照实际写即可（系统会自动回落，不需要你手动降级成 act-sfw）。\r\n  · 对照示例（左边是正文在写什么 → 右边第5段写什么）：\"她张开嘴含了进去\" → act-oral；\"她用手握住柱身上下套弄\" → act-handjob；\"两人结合在一起\" → act-vaginal；\"只是抱着亲吻、闲聊、睡觉\" → act-sfw。\r\n情绪（第2段，必填，8选1，挑最贴近的）：喜悦(开心/兴奋/期待/满足) | 愤怒(生气/恼火/烦躁) | 悲伤(难过/委屈/失落) | 紧张(焦虑/害怕/慌张) | 平和(平静/温柔/从容/欣慰) | 害羞(尴尬/疑惑/好奇/惊讶/无奈/犹豫) | 嫌弃(厌恶/反感/冷漠) | 爱恋(喜欢/迷恋/宠溺/心动)\r\n  · 只有这8种差分头像；写8类外的词兜底到\"平和\"可能与剧情不符\r\n\r\n[输出规则]\r\n- 🔴 每个 @bubble 必须写满5段：日常场景用 |outfit-casual|act-sfw，NSFW场景必须按上面的动作判定规则换成对应的 act-*（不要因为习惯就写 act-sfw）；严禁只写3段\r\n- 若漏写第4/5段，渲染器会按日常SFW处理（outfit-casual + act-sfw），不会自动从NSFW图池猜测；想命中口交/手交/性交等差分，必须显式写对应 act\r\n- 正文直出markdown，不要包 <now_plot>/<content>/<xmp> 等标签\r\n- image###prompt### 放旁白段之间任意位置，但不要写进 @bubble 行\r\n- @bubble 必须独占整行（前后换行），不与旁白/image### 同行\r\n- @bubble 行末尾严禁任何 XML/HTML 尾巴（/> 、> 、</bubble> 、<br> 等），以\"动作字段\"自然结束后直接换行\r\n\r\n示例（每条都写满5段）：\r\n@bubble:城崎诺亚|喜悦|[咦？真的吗？]|outfit-casual|act-sfw\r\n@bubble:城崎诺亚|紧张|[*我真的能做好吗？*]|outfit-casual|act-sfw\r\n@bubble:林知意|爱恋|[嗯...再深一点...]|outfit-naked|act-vaginal\r\n@bubble:？？？|紧张|[是……是清野同学，我们该撤了]|outfit-casual|act-sfw", Zc = "[情绪词约束·标签锁死]\r\n情绪字段（@bubble 第 2 段）只能从下面 8 大情绪分类中选 1 个。每类列出了可用的同义词，写哪个都会归到该类的差分头像：\r\n{{mood_groups}}\r\n规则：\r\n- 必须从上面 8 类（含同义词）里挑最贴近当前剧情的一个，严禁自造分类外的新情绪词。\r\n- 不要机械地每个气泡都写同一个情绪词：按**这一句**的语气细节来选，同一场戏里 害羞 / 紧张 / 爱恋 / 喜悦 / 平和 都可以随台词内容切换；只有情绪确实没变化时才重复。\r\n- 生图只做了这 8 种情绪差分；写分类外的词系统会兜底到\"平和\"，可能与剧情不符。\r\n- 情绪字段不能省略，必须填写。不要写英文，不要写 mood-xxx 标签。\r\n- 🔴 重要：情绪之后的服装段、动作段同样必填，每个 @bubble 必须写满5段（角色名|情绪|[对白]|服装|动作）；日常场景服装填 outfit-casual、动作填 act-sfw，绝不能只写到对白就结束。（这一段在写性行为时，动作段必须按判定规则写对应的 act-*。）", Qc = {
	style_dialogueFontSize: 14.5,
	style_narrationFontSize: 14,
	style_dialogueSpacing: 10,
	style_textColorMode: "global",
	style_globalTextColor: "#d9d9d9",
	style_markdownMode: "basic",
	style_dialogueFontWeight: 400,
	style_narrationFontWeight: 400,
	style_nameFontWeight: 800,
	style_narrationBgColor: "#ffffff",
	style_narrationBgOpacity: .04,
	style_avatarSize: 52,
	style_narrationIndent: 76,
	style_narrationFontFamily: "Noto Sans SC",
	style_dialogueFontFamily: "Noto Serif SC",
	style_nameFontFamily: "Noto Serif SC",
	style_fontConfigUrl: "",
	style_narrationBorderRadius: 0,
	style_avatarShape: "rounded",
	style_thoughtSuffixGap: 6,
	style_thoughtSuffixOffsetY: 5,
	style_narrationTextIndent: 0,
	style_narrationLineHeight: 1.75,
	style_narrationPaddingRight: 16,
	style_imageCompressEnabled: !0,
	style_imageCompressQuality: .82
}, $c = "_global_", el = "outfit-casual", tl = "act-sfw", nl = 300;
function rl(e) {
	return String(e ?? "").trim().toLowerCase();
}
function il(e) {
	return String(e ?? "").trim() || el;
}
function al(e, t) {
	let n = String(e ?? "").trim();
	return n && t.has(n) ? n : tl;
}
function ol(e) {
	return function(t) {
		let n = String(t ?? "").trim();
		if (!n) return "";
		let r = e() ?? [];
		for (let e of r) if (e.id === n || e.label === n) return e.id;
		for (let e of r) if (e.words.includes(n)) return e.id;
		for (let e of r) if (n.includes(e.label)) return e.id;
		return n;
	};
}
function sl(e) {
	let t = String(e ?? ""), n = 2166136261;
	for (let e = 0; e < t.length; e += 1) n ^= t.charCodeAt(e), n = Math.imul(n, 16777619);
	return n >>> 0;
}
function cl(e) {
	return String(e.moodId ?? "").split("__");
}
function ll(e, t = {}) {
	let n = t.getMoodGroups ?? (() => Yc), r = t.resolveMoodId ?? ol(n), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set(), s = null;
	function c() {
		return s ||= (async () => {
			try {
				let t = await e.listMoodAvatars();
				for (let e of t) {
					let t = rl(String(e.alias ?? ""));
					if (!t) continue;
					let n = cl(e);
					n[2] && o.add(n[2]);
					let r = a.get(t);
					r ? r.push(e) : a.set(t, [e]);
				}
			} catch {}
		})(), s;
	}
	function l(e) {
		let t = rl(e.name), n = r(e.mood), i = il(e.outfit), a = String(e.act ?? "").trim() || tl, o = "";
		return n && i && a ? o = [
			t,
			n,
			i,
			a
		].join("__") : n && i ? o = [
			t,
			n,
			i
		].join("__") : n && (o = [t, n].join("__")), (o || t + "::main") + "::seed::" + sl(e.seed ?? "");
	}
	function u(e, t) {
		if (!i.has(e) && i.size >= nl) {
			let e = i.keys().next().value;
			if (e !== void 0) {
				let t = i.get(e);
				if (t && t.startsWith("blob:")) try {
					URL.revokeObjectURL(t);
				} catch {}
				i.delete(e);
			}
		}
		i.set(e, t);
	}
	function d(e) {
		if (!e) return null;
		try {
			return URL.createObjectURL(e);
		} catch {
			return null;
		}
	}
	async function f(t, n) {
		if (!t) return null;
		if (t.imageBlob) return d(t.imageBlob);
		let r = String(t.moodId ?? "");
		if (!r) return null;
		let i = String(t.alias ?? t.name ?? n);
		try {
			return d((await e.getMoodAvatar(i, r))?.imageBlob);
		} catch {
			return null;
		}
	}
	function p(e, t) {
		return e.length === 1 ? e[0] : e[sl(t) % e.length] ?? e[0];
	}
	function m(e, t, n, r, i) {
		let o = a.get(e);
		if (!o || !o.length) return null;
		let s = o.filter((e) => {
			let i = cl(e);
			return i[0] === t && i[1] === n && i[2] === r;
		});
		if (s.length) return p(s, i);
		let c = o.filter((e) => {
			let r = cl(e);
			return r[0] === t && r[1] === n;
		});
		if (c.length) return p(c, i);
		let l = o.filter((e) => {
			let n = cl(e);
			return n[0] === t && n.includes(r);
		});
		if (l.length) return p(l, i);
		let u = o.filter((e) => cl(e)[0] === t);
		return u.length ? p(u, i) : null;
	}
	return {
		async resolve(t) {
			let n = l(t), a = i.get(n);
			if (a) return a;
			let s = rl(t.name), p = r(t.mood), h = il(t.outfit), g = t.seed ?? n;
			if (p) {
				await c();
				let e = await f(m(s, p, h, al(t.act, o), g), s);
				if (e) return u(n, e), e;
			}
			try {
				let t = d((await e.getAvatar(s))?.imageBlob);
				if (t) return u(n, t), t;
			} catch {}
			return null;
		},
		resolveCached(e) {
			return i.get(l(e)) ?? null;
		},
		clearCache() {
			for (let e of i.values()) if (e.startsWith("blob:")) try {
				URL.revokeObjectURL(e);
			} catch {}
			i.clear(), a.clear(), o.clear(), s = null;
		}
	};
}
//#endregion
//#region src/features/bubble-render/style-injector.ts
var ul = "yq-bubble-lite-style", dl = {
	avatarBorderRadius: 12,
	nameSizeEm: .95,
	moodSizeEm: .78,
	quoteSizeEm: 1.2,
	lineHeight: 1.6,
	nameFontWeight: 700,
	dialogueFontWeight: 400,
	bubbleBg: "rgba(255,255,255,0.04)",
	bubbleBorderLeftWidth: 3,
	bubbleGap: 10,
	bubblePaddingX: 14,
	dialogueTextColor: "#f0933d",
	thoughtColor: "#ff8fc4",
	thoughtObliqueDeg: 18
}, fl = 32, pl = 96, ml = 12, hl = 22, gl = 100, _l = 900;
function vl(e, t) {
	let n = Number(e);
	return Number.isFinite(n) ? n : t;
}
function yl(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function bl(e, t) {
	let n = String(e ?? "").trim();
	return /^#[0-9a-f]{3,8}$/i.test(n) ? n : t;
}
function xl(e, t) {
	let n = String(e ?? "").trim();
	return n ? "\"" + n + "\", " + t : "inherit";
}
function Sl(e, t) {
	return vl(Qc[e], t);
}
function Cl(e) {
	let t = yl(vl(e.style_avatarSize, Sl("style_avatarSize", 52)), fl, pl) + "px", n = String(e.style_avatarShape ?? ""), r = n === "circle" ? "50%" : n === "square" ? "0px" : n === "rounded" ? "8px" : dl.avatarBorderRadius + "px", i = yl(vl(e.style_dialogueFontSize, Sl("style_dialogueFontSize", 14.5)), ml, hl), a = "calc(" + i + "px * " + dl.nameSizeEm + ")", o = "calc(" + i + "px * " + dl.moodSizeEm + ")", s = "calc(" + i + "px * " + dl.quoteSizeEm + ")", c = i + "px", l = xl(String(e.style_dialogueFontFamily ?? ""), "\"Source Han Serif SC\", serif"), u = xl(String(e.style_nameFontFamily ?? ""), "\"Source Han Serif SC\", serif"), d = yl(vl(e.style_nameFontWeight, dl.nameFontWeight), gl, _l), f = yl(vl(e.style_dialogueFontWeight, dl.dialogueFontWeight), gl, _l), p = bl(e.style_globalTextColor, dl.dialogueTextColor), m = dl.thoughtColor, h = "oblique " + dl.thoughtObliqueDeg + "deg", g = Math.max(6, vl(e.style_dialogueSpacing, Sl("style_dialogueSpacing", 10))) + "px", _ = dl.bubblePaddingX + "px", v = dl.bubbleGap + "px", y = dl.bubbleBorderLeftWidth + "px";
	return [
		".yq-bubble,.custom-yq-bubble{display:flex;gap:" + v + ";margin:10px 0;padding:" + g + " " + _ + ";background:" + dl.bubbleBg + ";border-left:" + y + " solid var(--yq-mood-color,rgba(255,255,255,0.3));border-radius:8px;align-items:flex-start;transition:border-color 0.2s}",
		".yq-bubble-avatar,.custom-yq-bubble-avatar{width:" + t + ";height:" + t + ";border-radius:" + r + ";flex-shrink:0;object-fit:cover;background:rgba(255,255,255,0.06);border:2px solid var(--yq-mood-color,rgba(255,255,255,0.2));cursor:zoom-in;display:block}",
		".yq-bubble-avatar-fallback,.custom-yq-bubble-avatar-fallback{width:" + t + ";height:" + t + ";border-radius:" + r + ";flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:calc(" + t + " * 0.42);font-weight:700;color:#fff;background:var(--yq-mood-color,rgba(255,255,255,0.18));border:2px solid var(--yq-mood-color,rgba(255,255,255,0.2));font-family:" + u + ";cursor:default;user-select:none}",
		".yq-bubble-body,.custom-yq-bubble-body{flex:1;min-width:0}",
		".yq-bubble-header,.custom-yq-bubble-header{display:flex;gap:8px;align-items:baseline;margin-bottom:4px}",
		".yq-bubble-name,.custom-yq-bubble-name{font-weight:" + d + ";font-size:" + a + ";color:var(--yq-mood-color,rgba(255,255,255,0.95));font-family:" + u + "}",
		".yq-bubble-mood,.custom-yq-bubble-mood{font-size:" + o + ";color:#fff;padding:1px 6px;background:var(--yq-mood-color,rgba(255,255,255,0.15));border-radius:4px;opacity:0.85}",
		".yq-bubble-text,.custom-yq-bubble-text{color:var(--yq-text-color," + p + ");line-height:" + dl.lineHeight + ";word-break:break-word;position:relative;padding:0 2px;font-size:" + c + ";font-family:" + l + ";font-weight:" + f + "}",
		".yq-bubble-text.yq-bubble-text-dialogue::before,.custom-yq-bubble-text.custom-yq-bubble-text-dialogue::before{content:'\\201C';color:var(--yq-mood-color,rgba(255,255,255,0.4));font-size:" + s + ";font-weight:700;margin-right:2px}",
		".yq-bubble-text.yq-bubble-text-dialogue::after,.custom-yq-bubble-text.custom-yq-bubble-text-dialogue::after{content:'\\201D';color:var(--yq-mood-color,rgba(255,255,255,0.4));font-size:" + s + ";font-weight:700;margin-left:2px}",
		".yq-bubble-text em,.yq-bubble-text i,.custom-yq-bubble-text em,.custom-yq-bubble-text i{font-style:" + h + ";color:" + m + ";font-weight:normal}",
		".yq-bubble-text-thought,.custom-yq-bubble-text-thought{font-style:" + h + ";color:" + m + "}",
		".yq-avatar-zoom-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:yq-zoom-fade 0.15s ease-out}",
		".yq-avatar-zoom-overlay img{max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6)}",
		"@keyframes yq-zoom-fade{from{opacity:0}to{opacity:1}}"
	].join("\n");
}
function wl(e) {
	let { documentRef: t, readStyle: n } = e;
	return {
		apply() {
			let e;
			try {
				e = t();
			} catch {
				return;
			}
			let r = Cl(n() ?? {}), i = e.getElementById(ul);
			if (i) {
				i.textContent !== r && (i.textContent = r);
				return;
			}
			let a = e.createElement("style");
			a.id = ul, a.textContent = r, (e.head ?? e.body ?? e.documentElement)?.appendChild(a);
		},
		dispose() {
			try {
				t().getElementById(ul)?.remove();
			} catch {}
		}
	};
}
//#endregion
//#region src/features/bubble-render/avatar-zoom.ts
var Tl = "yq-avatar-zoom";
function El(e) {
	let { documentRef: t } = e, n = null;
	function r() {
		try {
			return t() ?? null;
		} catch {
			return null;
		}
	}
	function i() {
		let e = r();
		e && (e.getElementById(Tl)?.remove(), n &&= (e.removeEventListener("keydown", n), null));
	}
	return {
		show(e, t = "") {
			if (!e) return;
			let a = r();
			if (!a) return;
			i();
			let o = a.createElement("div");
			o.id = Tl, o.className = "yq-avatar-zoom-overlay";
			let s = a.createElement("img");
			s.src = e, s.alt = t, o.appendChild(s), o.addEventListener("click", i), n = (e) => {
				e.key === "Escape" && i();
			}, a.addEventListener("keydown", n), (a.body ?? a.documentElement).appendChild(o);
		},
		dispose() {
			i();
		}
	};
}
//#endregion
//#region src/features/bubble-render/async-utils.ts
async function Dl(e, t, n) {
	let r = Array(e.length);
	if (e.length === 0) return r;
	let i = 0, a = Math.max(1, Math.min(t, e.length)), o = Array.from({ length: a }, async () => {
		for (;;) {
			let t = i;
			if (i += 1, t >= e.length) return;
			r[t] = await n(e[t], t);
		}
	});
	return await Promise.all(o), r;
}
//#endregion
//#region src/features/bubble-render/bubble-hydrator.ts
var Ol = ".yq-bubble, .custom-yq-bubble", kl = ".yq-bubble-avatar, .custom-yq-bubble-avatar", Al = ".yq-bubble-avatar[data-lazy-mood], .custom-yq-bubble-avatar[data-lazy-mood]", jl = ".yq-bubble-avatar:not([data-lazy-mood]), .custom-yq-bubble-avatar:not([data-lazy-mood])", Ml = ".yq-bubble-avatar-fallback, .custom-yq-bubble-avatar-fallback", Nl = ".yq-bubble-text, .custom-yq-bubble-text", Pl = "yqHydrated";
function Fl(e) {
	let { documentRef: t, resolveAvatar: n, resolveCachedAvatar: r, resolveMoodGroup: i, resolveTextColor: a, onZoom: o } = e, s = [], c = 0, l = /* @__PURE__ */ new WeakSet();
	function u() {
		for (; c < 8 && s.length > 0;) {
			let e = s.shift();
			if (!e) return;
			c += 1, e().catch(() => {}).finally(() => {
				--c, u();
			});
		}
	}
	function d(e) {
		s.push(e), u();
	}
	function f(e) {
		let t = String(e ?? "").trim();
		return t ? Array.from(t)[0] : "?";
	}
	function p(e) {
		if (e.dataset.yqThoughtDone) return !1;
		let t = e.innerHTML, n = !1, r = t.replace(/\*([^*\n]+)\*/g, (e, t) => (n = !0, "<em>" + t + "</em>"));
		return r !== t && (e.innerHTML = r), e.dataset.yqThoughtDone = "1", n;
	}
	function m(e, t) {
		let n = (e.textContent ?? "").trim(), r = t && e.children.length === 1 && e.children[0].tagName === "EM" && (e.children[0].textContent ?? "").trim() === n;
		e.classList.remove("yq-bubble-text-thought", "custom-yq-bubble-text-thought", "yq-bubble-text-dialogue", "custom-yq-bubble-text-dialogue"), r ? e.classList.add("yq-bubble-text-thought", "custom-yq-bubble-text-thought") : e.classList.add("yq-bubble-text-dialogue", "custom-yq-bubble-text-dialogue");
	}
	function h(e) {
		let t = e.querySelector(Nl);
		return {
			name: e.getAttribute("data-name") ?? "",
			mood: e.getAttribute("data-mood") ?? "",
			outfit: e.getAttribute("data-outfit")?.trim() || null,
			act: e.getAttribute("data-act")?.trim() || null,
			seed: [
				e.getAttribute("data-name") ?? "",
				e.getAttribute("data-mood") ?? "",
				e.getAttribute("data-outfit") ?? "",
				e.getAttribute("data-act") ?? "",
				t?.textContent?.trim() ?? "",
				e.getAttribute("data-yq-seed") ?? "",
				e.textContent ?? ""
			].join("|")
		};
	}
	function g(e) {
		if (e.dataset.yqHydrated) {
			let t = e.querySelector(jl), n = e.querySelector(Al);
			if (t && !n || !n && e.querySelector(Ml)) return;
		}
		if (!(e.getAttribute("data-name") ?? "").trim() || !e.querySelector(Al)) return;
		e.dataset[Pl] = "1";
		let s = h(e), c = i(s.mood);
		c && c.color && e.style.setProperty("--yq-mood-color", c.color);
		let u = a?.(s.name) ?? null;
		u ? e.style.setProperty("--yq-text-color", u) : e.style.removeProperty("--yq-text-color");
		let g = e.querySelector(Nl);
		g && m(g, p(g));
		let _ = e.querySelector(Al);
		if (!_) return;
		let v = [
			s.name,
			s.mood,
			s.outfit,
			s.act && s.act !== "act-sfw" ? s.act : ""
		].filter(Boolean).join(" · "), y = (e) => {
			_.src = e, _.removeAttribute("data-lazy-mood"), _.title = v, _.addEventListener("click", (t) => {
				t.preventDefault(), t.stopPropagation(), o && o(e, s.name);
			});
		}, b = r(s);
		if (b) {
			y(b);
			return;
		}
		l.has(e) || (l.add(e), d(async () => {
			try {
				let e = await n(s);
				if (e) {
					y(e);
					return;
				}
				let r = t().createElement("div");
				r.className = _.className.replace(/(custom-)?yq-bubble-avatar/g, "$1yq-bubble-avatar-fallback"), r.textContent = f(s.name), r.title = v + " (未上传头像)", _.parentNode && _.parentNode.replaceChild(r, _);
			} finally {
				l.delete(e);
			}
		}));
	}
	return {
		hydrateAll() {
			t().querySelectorAll(Ol).forEach(g);
		},
		refresh() {
			t().querySelectorAll(Ol).forEach((e) => {
				delete e.dataset[Pl], e.removeAttribute("data-yq-hydrated");
				let t = e.querySelector(kl);
				t && t.tagName === "IMG" && !t.getAttribute("data-lazy-mood") && t.setAttribute("data-lazy-mood", e.getAttribute("data-mood") ?? "");
			});
		}
	};
}
//#endregion
//#region src/features/bubble-render/key-format.ts
function Il(e) {
	let t = e.indexOf("__");
	return t >= 0 ? e.slice(0, t) : e;
}
function Ll(e, t) {
	let n = String(e ?? "");
	if (t != null) {
		let e = String(t) + "__";
		if (n.startsWith(e)) return Il(n.slice(e.length));
	}
	let r = $c + "__";
	if (n.startsWith(r)) return Il(n.slice(r.length));
	let i = n.indexOf("__");
	return i >= 0 ? Il(n.slice(i + 2)) : n;
}
function Rl(e) {
	let t = String(e ?? "");
	if (t.startsWith("_global___")) return $c;
	let n = t.indexOf("__");
	return n <= 0 ? $c : t.slice(0, n) || "_global_";
}
function zl(e, t) {
	return String(e || "_global_") + "__" + t.trim().toLowerCase();
}
function Bl(e) {
	return e.trim().toLowerCase();
}
function Vl(e, t, n) {
	return String(e || "_global_") + "__" + t.trim().toLowerCase() + "__" + n;
}
function Hl(e, t) {
	return "color_" + String(e || "_global_") + "__" + String(t ?? "").trim().toLowerCase();
}
function Ul(e, t) {
	let n = String(t || "_global_") + "__";
	return String(e ?? "").startsWith(n);
}
//#endregion
//#region src/features/bubble-render/indexeddb-avatar-library.ts
var Wl = "BubbleDialogueAvatars", Gl = "avatars", Kl = "mood_avatars", ql = "config", Jl = "cg_groups", Yl = "cg_images";
function Xl() {
	return new Promise((e) => {
		try {
			let t = indexedDB.open(Wl);
			t.onsuccess = () => {
				let n = t.result;
				try {
					if (!n.objectStoreNames.contains(Gl) || !n.objectStoreNames.contains(Kl)) {
						n.close(), e(null);
						return;
					}
				} catch {}
				e(n);
			}, t.onerror = () => e(null), t.onblocked = () => e(null), t.onupgradeneeded = () => {};
		} catch {
			e(null);
		}
	});
}
function Zl(e, t, n) {
	return e ? new Promise((r) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				r(null);
				return;
			}
			let i = e.transaction(t, "readonly").objectStore(t).get(n);
			i.onsuccess = () => r(i.result ?? null), i.onerror = () => r(null);
		} catch {
			r(null);
		}
	}) : Promise.resolve(null);
}
function Ql(e, t) {
	return e ? new Promise((n) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				n([]);
				return;
			}
			let r = e.transaction(t, "readonly").objectStore(t).getAll();
			r.onsuccess = () => n(r.result ?? []), r.onerror = () => n([]);
		} catch {
			n([]);
		}
	}) : Promise.resolve([]);
}
function $l(e, t) {
	return e ? new Promise((n) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				n([]);
				return;
			}
			let r = e.transaction(t, "readonly").objectStore(t).getAllKeys();
			r.onsuccess = () => n(r.result ?? []), r.onerror = () => n([]);
		} catch {
			n([]);
		}
	}) : Promise.resolve([]);
}
function eu(e, t, n, r) {
	return e ? new Promise((i) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				i([]);
				return;
			}
			let a = e.transaction(t, "readonly").objectStore(t);
			if (!a.indexNames.contains(n)) {
				i([]);
				return;
			}
			let o = a.index(n).getAll(IDBKeyRange.only(r));
			o.onsuccess = () => i(o.result ?? []), o.onerror = () => i([]);
		} catch {
			i([]);
		}
	}) : Promise.resolve([]);
}
function tu(e, t, n) {
	return e ? new Promise((r) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				r();
				return;
			}
			let i = e.transaction(t, "readwrite");
			i.objectStore(t).put(n), i.oncomplete = () => r(), i.onerror = () => r(), i.onabort = () => r();
		} catch {
			r();
		}
	}) : Promise.resolve();
}
function nu(e, t, n) {
	return e ? new Promise((r) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				r();
				return;
			}
			let i = e.transaction(t, "readwrite");
			i.objectStore(t).delete(n), i.oncomplete = () => r(), i.onerror = () => r(), i.onabort = () => r();
		} catch {
			r();
		}
	}) : Promise.resolve();
}
function ru(e, t) {
	return e ? new Promise((n) => {
		try {
			if (!e.objectStoreNames.contains(t)) {
				n();
				return;
			}
			let r = e.transaction(t, "readwrite");
			r.objectStore(t).clear(), r.oncomplete = () => n(), r.onerror = () => n(), r.onabort = () => n();
		} catch {
			n();
		}
	}) : Promise.resolve();
}
function iu(e, t) {
	return zl(t, e);
}
function au(e, t, n) {
	return Vl(n, e, t);
}
function ou(e, t = "alias") {
	let n = e.charId;
	return typeof n == "string" && n ? n : Rl(String(e[t] ?? e.lookupKey ?? e.id ?? ""));
}
function su(e) {
	let t = Number(e.fileSize ?? 0);
	if (Number.isFinite(t) && t > 0) return t;
	let n = e.imageBlob;
	return n && typeof n.size == "number" ? n.size : 0;
}
function cu(e = {
	mode: "global",
	charId: null
}, t = {}) {
	let n = null, r = () => (n ||= Xl(), n), i = e.mode === "character" && e.charId ? e.charId : $c, a = t.primaryOnly ? [i] : e.mode === "character" && e.charId ? [e.charId, $c] : [$c], o = null, s = (e) => (o ||= Ql(e, Kl), o), c = () => {
		o = null;
	};
	return {
		async isReady() {
			return await r() !== null;
		},
		async getAvatar(e) {
			let t = await r();
			for (let n of a) {
				let r = await Zl(t, Gl, iu(e, n));
				if (r) return r;
			}
			return null;
		},
		async getMoodAvatar(e, t) {
			let n = await r(), i = String(e ?? "").trim().toLowerCase(), o = String(t ?? "");
			for (let r of a) {
				let a = (await eu(n, Kl, "lookupKey", au(e, t, r))).find((e) => e.imageBlob);
				if (a) return a;
				let c = (await s(n)).find((e) => ou(e, "alias") === String(r) && String(e.alias ?? "").trim().toLowerCase() === i && String(e.moodId ?? "") === o && !!e.imageBlob);
				if (c) return c;
			}
			return null;
		},
		async listMoodAvatars() {
			let e = await Ql(await r(), Kl), t = new Set(a.map((e) => String(e)));
			return e.filter((e) => t.has(ou(e, "alias")));
		},
		async listAvatarNames() {
			let t = await r(), n = e.mode === "character" && e.charId ? e.charId : $c;
			return (await $l(t, Gl)).filter((e) => Ul(e, n)).map((e) => Ll(e, n)).filter(Boolean);
		},
		async getConfig(e) {
			return Zl(await r(), ql, e);
		},
		async setConfig(e, t) {
			await tu(await r(), ql, {
				key: e,
				value: t
			});
		},
		async putAvatar(t, n, i = {}) {
			await tu(await r(), Gl, {
				alias: iu(t, e.charId),
				charId: e.mode === "character" && e.charId ? e.charId : $c,
				imageBlob: n,
				mimeType: n.type || "image/webp",
				fileName: i.fileName || `${t}.webp`,
				fileSize: n.size,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				...i
			});
		},
		async putMoodAvatar(t, n, i, a = {}) {
			let o = await r(), s = au(t, n, e.charId), l = e.mode === "character" && e.charId ? e.charId : $c;
			await tu(o, Kl, {
				alias: Bl(t),
				lookupKey: s,
				charId: l,
				id: s,
				moodId: n,
				imageBlob: i,
				mimeType: i.type || "image/webp",
				fileName: a.fileName || `${t}_${n}.webp`,
				fileSize: i.size,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				...a
			}), c();
		},
		async deleteAvatar(t) {
			await nu(await r(), Gl, iu(t, e.charId));
		},
		async deleteMoodAvatar(t, n) {
			let i = await r();
			c();
			let a = await eu(i, Kl, "lookupKey", au(t, n, e.mode === "character" && e.charId ? e.charId : $c));
			for (let e of a) {
				let t = String(e.id ?? "");
				t && await nu(i, Kl, t);
			}
		},
		async listCgGroups() {
			let e = await Ql(await r(), Jl), t = new Set(a.map((e) => String(e)));
			return e.filter((e) => t.has(String(e.charId ?? "_global_")));
		},
		async listCgImages(e) {
			return (await Ql(await r(), Yl)).filter((t) => String(t.group ?? "") === e).map(({ imageBlob: e, ...t }) => t).sort((e, t) => Number(e.index) - Number(t.index));
		},
		async getCgImageBlob(e, t) {
			return (await Zl(await r(), Yl, `cg__${e}__${t}`))?.imageBlob ?? null;
		},
		async clear() {
			let e = await r();
			c();
			for (let t of [
				Gl,
				Kl,
				ql
			]) await ru(e, t);
		},
		async listMoodAvatarsPrimary() {
			return (await Ql(await r(), Kl)).filter((e) => ou(e, "alias") === i);
		},
		async getScopeStats() {
			let e = await r(), t = i, n = {
				avatars: 0,
				moodAvatars: 0,
				bytes: 0
			};
			for (let r of await Ql(e, Gl)) ou(r, "alias") === t && (n.avatars += 1, n.bytes += su(r));
			for (let r of await Ql(e, Kl)) ou(r, "alias") === t && (n.moodAvatars += 1, n.bytes += su(r));
			return n;
		},
		async listScopes() {
			let e = await r(), t = /* @__PURE__ */ new Map(), n = (e) => {
				let n = t.get(e);
				return n || (n = {
					charId: e,
					avatars: 0,
					moodAvatars: 0,
					cgImages: 0,
					bytes: 0
				}, t.set(e, n)), n;
			};
			for (let t of await Ql(e, Gl)) {
				let e = n(ou(t, "alias"));
				e.avatars += 1, e.bytes += su(t);
			}
			for (let t of await Ql(e, Kl)) {
				let e = n(ou(t, "alias"));
				e.moodAvatars += 1, e.bytes += su(t);
			}
			let i = /* @__PURE__ */ new Map();
			for (let t of await Ql(e, Jl)) {
				let e = String(t.group ?? "");
				e && i.set(e, ou(t, "id"));
			}
			for (let t of await Ql(e, Yl)) {
				let e = n(i.get(String(t.group ?? "")) ?? "_global_");
				e.cgImages += 1, e.bytes += su(t);
			}
			return [...t.values()].sort((e, t) => e.charId === "_global_" ? -1 : t.charId === "_global_" ? 1 : t.bytes - e.bytes);
		},
		async clearScope(e) {
			let t = await r();
			c();
			let n = String(e || "_global_");
			for (let e of await $l(t, Gl)) Rl(e) === n && await nu(t, Gl, e);
			for (let e of await Ql(t, Kl)) if (ou(e, "alias") === n) {
				let n = String(e.id ?? "");
				n && await nu(t, Kl, n);
			}
			let i = /* @__PURE__ */ new Set();
			for (let e of await Ql(t, Jl)) if (ou(e, "id") === n) {
				let n = String(e.group ?? "");
				n && i.add(n);
				let r = String(e.id ?? "");
				r && await nu(t, Jl, r);
			}
			for (let e of await Ql(t, Yl)) if (i.has(String(e.group ?? ""))) {
				let n = String(e.id ?? "");
				n && await nu(t, Yl, n);
			}
		},
		async clearAll() {
			let e = await r();
			c();
			for (let t of [
				Gl,
				Kl,
				Jl,
				Yl
			]) await ru(e, t);
		}
	};
}
//#endregion
//#region src/features/bubble-render/store-key.ts
var lu = /^[A-Za-z0-9_.-]+$/;
function uu(e) {
	return e.length > 0 && lu.test(e) && e !== "." && e !== ".." && !e.startsWith(".");
}
function du(e) {
	if (uu(e)) return e;
	let t = new TextEncoder().encode(e), n = "";
	for (let e of t) n += e.toString(16).padStart(2, "0");
	return `x${n}`;
}
function fu(e) {
	return e.map(du).join("-x-");
}
function pu(e, t) {
	let n = t.replace(/^\./, "");
	return !n || !lu.test(n) ? e : `${e}.${n}`;
}
//#endregion
//#region src/features/bubble-render/storage-types.ts
var mu = {
	mode: "global",
	charId: null
}, hu = "bubble-character", gu = "7.1-zip", _u = "bubble", vu = "avatars", yu = "mood", bu = "config", xu = "cg_groups", Su = "cg_images", Cu = "webp", wu = 16;
function Tu(e) {
	return e.mode === "character" && e.charId ? fu([
		_u,
		"char",
		e.charId
	]) : fu([_u, "global"]);
}
function Eu(e, t) {
	return pu(fu([e]), t || Cu);
}
function Du(e, t, n) {
	return pu(fu([e, t]), n || Cu);
}
function Ou(e, t) {
	return pu(fu([e, String(t)]), "webp");
}
function ku(e) {
	let t = String(e ?? "").toLowerCase();
	return t.includes("png") ? "png" : t.includes("jpeg") || t.includes("jpg") ? "jpg" : t.includes("gif") ? "gif" : t.includes("avif") ? "avif" : Cu;
}
function Au(e) {
	let t = /\.(webp|png|jpg|jpeg|gif|avif)$/i.exec(String(e ?? ""));
	return t ? t[1].toLowerCase() : void 0;
}
function ju(e, t) {
	return e + "::" + t;
}
async function Mu(e, t, n, r) {
	let i = ju(n, r), a = e.get(i);
	if (a) return a;
	let o = [];
	try {
		o = await t.listBlobKeys({
			namespace: n,
			table: r
		});
	} catch {
		o = [];
	}
	let s = new Set(o);
	return e.set(i, s), s;
}
async function Nu(e, t, n, r) {
	try {
		let i = await e.tryGetJson({
			namespace: t,
			table: n,
			key: r
		});
		if (i && i.found) return i.value;
	} catch {}
	return null;
}
function Pu(e, t = mu) {
	let n = Tu(t), r = Tu(mu), i = /* @__PURE__ */ new Map(), a = t.mode === "character" ? [n, r] : [n];
	async function o(t, n) {
		let r = await Nu(e, t, vu, fu([n]));
		if (!r) return null;
		try {
			let i = await e.getBlob({
				namespace: t,
				table: vu,
				key: Eu(n, Au(r.fileName) ?? ku(r.mimeType))
			});
			return {
				...r,
				imageBlob: i
			};
		} catch {
			return null;
		}
	}
	async function s(t, n, r) {
		let i = await Nu(e, t, yu, fu([n, r]));
		if (!i) return null;
		try {
			let a = await e.getBlob({
				namespace: t,
				table: yu,
				key: Du(n, r, Au(i.fileName) ?? ku(i.mimeType))
			});
			return {
				...i,
				imageBlob: a
			};
		} catch {
			return null;
		}
	}
	return {
		async isReady() {
			return !0;
		},
		async getAvatar(e) {
			for (let t of a) {
				let n = await o(t, e);
				if (n) return n;
			}
			return null;
		},
		async getMoodAvatar(e, t) {
			for (let n of a) {
				let r = await s(n, e, t);
				if (r) return r;
			}
			return null;
		},
		async listMoodAvatars() {
			let t = [];
			for (let n of a) try {
				let r = await Dl(await e.listKeys({
					namespace: n,
					table: yu
				}), wu, (t) => Nu(e, n, yu, t));
				for (let e of r) e && t.push(e);
			} catch {}
			return t;
		},
		async listAvatarNames() {
			let t = [];
			try {
				let r = await Dl(await e.listKeys({
					namespace: n,
					table: vu
				}), wu, (t) => Nu(e, n, vu, t));
				for (let e of r) {
					let n = String(e?.name ?? e?.alias ?? "");
					n && t.push(n);
				}
			} catch {}
			return t;
		},
		async getConfig(t) {
			for (let n of a) {
				let r = await Nu(e, n, bu, fu([t]));
				if (r !== null) return r;
			}
			return null;
		},
		async setConfig(t, r) {
			await e.setJson({
				namespace: n,
				table: bu,
				key: fu([t]),
				value: r ?? null
			});
		},
		async putAvatar(t, r, a = {}) {
			let o = fu([t]), s = ku(r.type);
			await e.setBlob({
				namespace: n,
				table: vu,
				key: Eu(t, s),
				data: r
			}), i.delete(ju(n, vu)), await e.setJson({
				namespace: n,
				table: vu,
				key: o,
				value: {
					alias: t,
					name: t,
					mimeType: r.type || "image/webp",
					fileName: a.fileName || `${t}.${s}`,
					fileSize: r.size,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					...a
				}
			});
		},
		async putMoodAvatar(t, r, a, o = {}) {
			let s = fu([t, r]), c = ku(a.type);
			await e.setBlob({
				namespace: n,
				table: yu,
				key: Du(t, r, c),
				data: a
			}), i.delete(ju(n, yu)), await e.setJson({
				namespace: n,
				table: yu,
				key: s,
				value: {
					alias: t,
					name: t,
					lookupKey: s,
					moodId: r,
					mimeType: a.type || "image/webp",
					fileName: o.fileName || `${t}_${r}.${c}`,
					fileSize: a.size,
					createdAt: Date.now(),
					updatedAt: Date.now(),
					...o
				}
			});
		},
		async deleteAvatar(t) {
			let r = fu([t]), a = await Nu(e, n, vu, r);
			a && await e.deleteJson({
				namespace: n,
				table: vu,
				key: r
			});
			let o = Eu(t, Au(a?.fileName) ?? ku(a?.mimeType)), s = await Mu(i, e, n, vu);
			s.has(o) && (await e.deleteBlob({
				namespace: n,
				table: vu,
				key: o
			}), s.delete(o));
		},
		async deleteMoodAvatar(t, r) {
			let a = fu([t, r]), o = await Nu(e, n, yu, a);
			o && await e.deleteJson({
				namespace: n,
				table: yu,
				key: a
			});
			let s = Du(t, r, Au(o?.fileName) ?? ku(o?.mimeType)), c = await Mu(i, e, n, yu);
			c.has(s) && (await e.deleteBlob({
				namespace: n,
				table: yu,
				key: s
			}), c.delete(s));
		},
		async listCgGroups() {
			let t = [];
			for (let n of a) try {
				let r = await e.listKeys({
					namespace: n,
					table: xu
				});
				for (let i of r) {
					let r = await Nu(e, n, xu, i);
					r && t.push(r);
				}
			} catch {}
			return t;
		},
		async listCgImages(t) {
			let n = [];
			for (let r of a) try {
				let i = await e.listKeys({
					namespace: r,
					table: Su
				});
				for (let a of i) {
					let i = await Nu(e, r, Su, a);
					i && String(i.group) === t && n.push(i);
				}
			} catch {}
			return n.sort((e, t) => Number(e.index) - Number(t.index));
		},
		async getCgImageBlob(t, n) {
			for (let r of a) try {
				return await e.getBlob({
					namespace: r,
					table: Su,
					key: Ou(t, n)
				});
			} catch {}
			return null;
		},
		async listMoodAvatarsPrimary() {
			let t = [];
			try {
				let r = await Dl(await e.listKeys({
					namespace: n,
					table: yu
				}), wu, (t) => Nu(e, n, yu, t));
				for (let e of r) e && t.push(e);
			} catch {}
			return t;
		},
		async getScopeStats() {
			let t = {
				avatars: 0,
				moodAvatars: 0,
				bytes: 0
			};
			for (let r of [
				vu,
				yu,
				Su
			]) try {
				let i = await Dl(await e.listKeys({
					namespace: n,
					table: r
				}), wu, (t) => Nu(e, n, r, t));
				for (let e of i) {
					let n = Number(e?.fileSize ?? 0);
					Number.isFinite(n) && (t.bytes += n), r === vu ? t.avatars += 1 : r === yu && (t.moodAvatars += 1);
				}
			} catch {}
			return t;
		},
		async listScopes() {
			let i = [];
			n === r || i.push([n, t.charId ?? "_global_"]), i.push([r, $c]);
			let a = [];
			for (let [t, n] of i) {
				let r = {
					charId: n,
					avatars: 0,
					moodAvatars: 0,
					cgImages: 0,
					bytes: 0
				};
				try {
					for (let n of [
						vu,
						yu,
						Su
					]) {
						let i = await Dl(await e.listKeys({
							namespace: t,
							table: n
						}), wu, (r) => Nu(e, t, n, r));
						for (let e of i) {
							let t = Number(e?.fileSize ?? 0);
							Number.isFinite(t) && (r.bytes += t), n === vu ? r.avatars += 1 : n === yu ? r.moodAvatars += 1 : r.cgImages += 1;
						}
					}
				} catch {}
				a.push(r);
			}
			return a;
		},
		async clearScope(i) {
			let a = String(i || "_global_"), o = a === (t.charId ?? "_global_") && a !== "_global_" ? n : a === "_global_" ? r : null;
			if (!o) return;
			let s = new Set(await e.listTables({ namespace: o }));
			for (let t of [
				vu,
				yu,
				xu,
				Su
			]) if (s.has(t)) try {
				await e.deleteTable({
					namespace: o,
					table: t
				});
			} catch {}
		},
		async clearAll() {
			for (let t of new Set([n, r])) for (let n of [
				vu,
				yu,
				xu,
				Su
			]) try {
				await e.deleteTable({
					namespace: t,
					table: n
				});
			} catch {}
		},
		async clear() {
			for (let t of [
				vu,
				yu,
				bu
			]) try {
				await e.deleteTable({
					namespace: n,
					table: t
				});
			} catch {}
		}
	};
}
//#endregion
//#region src/features/bubble-render/mood-resolver.ts
function Fu(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		t.set(n.id, n), t.set(n.label, n);
		for (let e of n.words) t.set(e, n);
	}
	let n = Array.from(t.keys());
	return function(e) {
		let r = String(e ?? "").trim();
		if (!r) return null;
		let i = t.get(r);
		if (i) return i;
		for (let e of n) if (r.includes(e)) return t.get(e) ?? null;
		return t.get("mood-calm") ?? null;
	};
}
function Iu() {
	let e = new Map(Jc.map((e) => [e.id, e])), t = new Map(Jc.map((e) => [e.label, e]));
	return function(n) {
		let r = String(n ?? "").trim();
		return r ? e.get(r) ?? t.get(r) ?? e.get("mood-calm") ?? null : null;
	};
}
//#endregion
//#region src/features/bubble-render/prompt-injector.ts
function Lu(e) {
	return e.map((e) => e.label + "组：" + e.words.join("、")).join("\n").trimEnd();
}
function Ru(e) {
	let { setExtensionPrompt: t, id: n = "bubble-dialogue-format", readFormatRule: r, readMoodGroups: i, readMoodTemplate: a } = e, o = null;
	async function s() {
		if (o) return o;
		let e = "";
		try {
			let t = await r();
			e = t && t.trim() ? t.trim() : "";
		} catch {
			e = "";
		}
		e ||= Xc;
		let t = null;
		try {
			t = await i();
		} catch {
			t = null;
		}
		let n = "";
		try {
			let e = await a();
			n = e && e.trim() ? e.trim() : "";
		} catch {
			n = "";
		}
		n ||= Zc;
		let s;
		return s = t && t.length ? n.replace(/\{\{mood_groups\}\}/g, Lu(t)) : n, o = e + "\n\n" + s, o;
	}
	return {
		apply() {
			s().then((e) => {
				try {
					t(n, e, 0, 0, !1, 0);
				} catch (e) {
					console.warn("[BubbleDialogue] setExtensionPrompt failed.", e);
				}
			}).catch((e) => {
				console.warn("[BubbleDialogue] Failed to build injection content.", e);
			});
		},
		invalidate() {
			o = null;
		},
		dispose() {
			o = null;
		}
	};
}
//#endregion
//#region src/features/bubble-render/config-store.ts
function zu(e) {
	let t = () => Yc.map((e) => ({
		...e,
		words: [...e.words]
	}));
	if (!Array.isArray(e)) return t();
	let n = e.map((e) => ({
		id: String(e.id ?? ""),
		label: String(e.label ?? ""),
		color: String(e.color ?? "#999999"),
		words: Array.isArray(e.words) ? e.words.map(String) : []
	})).filter((e) => e.id && e.label);
	return n.length ? n : t();
}
function Bu(e) {
	let t = /* @__PURE__ */ Dt({
		formatRule: Xc,
		moodTemplate: Zc,
		moodGroups: zu(null),
		style: { ...Qc },
		loaded: !1
	}), n = /* @__PURE__ */ new Set(), r = () => {
		for (let e of n) e();
	};
	async function i(e, t) {
		try {
			return await e.getConfig(t) ?? null;
		} catch (e) {
			return console.warn(`[BubbleDialogue] config "${t}" read failed.`, e), null;
		}
	}
	async function a() {
		let n = e(), a = await i(n, "format_rule");
		typeof a == "string" && a.trim() && (t.formatRule = a);
		let o = await i(n, "mood_prompt_template");
		typeof o == "string" && o.trim() && (t.moodTemplate = o);
		let s = await i(n, "mood_config");
		if (typeof s == "string" && s.trim()) try {
			t.moodGroups = zu(JSON.parse(s).groups);
		} catch (e) {
			console.warn("[BubbleDialogue] mood_config is not valid JSON; using defaults.", e), t.moodGroups = zu(null);
		}
		let c = { ...Qc }, l = Object.keys(Qc), u = await Promise.all(l.map((e) => i(n, e)));
		l.forEach((e, t) => {
			let n = u[t];
			n != null && (c[e] = n);
		}), t.style = c, t.loaded = !0, r();
	}
	function o(t, n) {
		return e().setConfig(t, n);
	}
	return {
		state: t,
		load: a,
		subscribe(e) {
			return n.add(e), () => {
				n.delete(e);
			};
		},
		markStale() {
			t.loaded = !1;
		},
		async setFormatRule(e) {
			t.formatRule = e, await o("format_rule", e), r();
		},
		async setMoodTemplate(e) {
			t.moodTemplate = e, await o("mood_prompt_template", e), r();
		},
		async setMoodGroups(e) {
			t.moodGroups = e, await o("mood_config", JSON.stringify({ groups: e })), r();
		},
		async addMoodWord(e, n) {
			let r = n.trim();
			if (!r) return;
			let i = t.moodGroups.map((t) => t.id === e && !t.words.includes(r) ? {
				...t,
				words: [...t.words, r]
			} : t);
			await this.setMoodGroups(i);
		},
		async removeMoodWord(e, n) {
			let r = t.moodGroups.map((t) => t.id === e ? {
				...t,
				words: t.words.filter((e) => e !== n)
			} : t);
			await this.setMoodGroups(r);
		},
		async setMoodColor(e, n) {
			let r = t.moodGroups.map((t) => t.id === e ? {
				...t,
				color: n
			} : t);
			await this.setMoodGroups(r);
		},
		async setStyle(e, n) {
			t.style = {
				...t.style,
				[e]: n
			}, await o(e, n), r();
		},
		async setStyleMany(e) {
			t.style = {
				...t.style,
				...e
			};
			for (let [t, n] of Object.entries(e)) await o(t, n);
			r();
		},
		async resetStyleKey(e) {
			let n = Qc, i = e in n ? n[e] : void 0;
			t.style = {
				...t.style,
				[e]: i
			}, await o(e, i), r();
		},
		async resetStyleAll() {
			t.style = { ...Qc };
			for (let [e, t] of Object.entries(Qc)) await o(e, t);
			r();
		},
		async resetFormatRule() {
			t.formatRule = Xc, await o("format_rule", Xc), r();
		},
		async resetMoodTemplate() {
			t.moodTemplate = Zc, await o("mood_prompt_template", Zc), r();
		},
		async resetMoodGroups() {
			t.moodGroups = Yc.map((e) => ({
				...e,
				words: [...e.words]
			})), await o("mood_config", JSON.stringify({ groups: t.moodGroups })), r();
		}
	};
}
//#endregion
//#region src/features/bubble-render/host-bridge.ts
function Vu() {
	try {
		let e = window.SillyTavern?.getContext;
		return typeof e == "function" ? e() ?? null : null;
	} catch {
		return null;
	}
}
function Hu() {
	return Vu()?.eventSource ?? null;
}
function Uu() {
	return Vu()?.eventTypes ?? null;
}
function Wu(e, t) {
	let n = Hu();
	if (!n) return () => {};
	try {
		return n.on(e, t), () => {
			try {
				n.off?.(e, t);
			} catch {}
		};
	} catch {
		return () => {};
	}
}
function Gu(e, t) {
	let n = Uu()?.[e];
	return typeof n == "string" && n ? n : t;
}
//#endregion
//#region src/features/bubble-render/migration.ts
var Ku = [
	"format_rule",
	"mood_config",
	"mood_prompt_template"
];
async function qu(e) {
	let { source: t, target: n, scope: r, configKeys: i = Ku, onProgress: a } = e, o = {
		avatars: 0,
		moodAvatars: 0,
		configs: 0,
		skipped: 0,
		failed: 0
	};
	if (!await t.isReady()) return o;
	for (let e of i) try {
		let r = await t.getConfig(e);
		if (r == null) continue;
		await n.setConfig(e, r), o.configs += 1;
	} catch {
		o.failed += 1;
	}
	let s = await t.listAvatarNames(), c = await t.listMoodAvatars(), l = s.length + c.length, u = 0, d = () => {
		u += 1, a && u % 25 == 0 && a(u, l);
	};
	for (let e of s) {
		try {
			if (!e) {
				o.skipped += 1, d();
				continue;
			}
			if ((await n.getAvatar(e))?.imageBlob) {
				o.skipped += 1, d();
				continue;
			}
			let r = await t.getAvatar(e);
			if (!r?.imageBlob) {
				o.skipped += 1, d();
				continue;
			}
			await n.putAvatar(e, r.imageBlob, {
				fileName: r.fileName,
				mimeType: r.mimeType,
				width: r.width,
				height: r.height,
				sourceUrl: r.sourceUrl
			}), o.avatars += 1;
		} catch {
			o.failed += 1;
		}
		d(), u % 50 == 0 && await Promise.resolve();
	}
	for (let e of c) {
		try {
			let r = Ju(String(e.alias ?? "")), i = String(e.moodId ?? "");
			if (!r || !i) {
				o.skipped += 1, d();
				continue;
			}
			if ((await n.getMoodAvatar(r, i))?.imageBlob) {
				o.skipped += 1, d();
				continue;
			}
			let a = e.imageBlob ? e : await t.getMoodAvatar(r, i);
			if (!a?.imageBlob) {
				o.skipped += 1, d();
				continue;
			}
			await n.putMoodAvatar(r, i, a.imageBlob, {
				fileName: a.fileName,
				mimeType: a.mimeType,
				width: a.width,
				height: a.height,
				sourceUrl: a.sourceUrl
			}), o.moodAvatars += 1;
		} catch {
			o.failed += 1;
		}
		d(), u % 50 == 0 && await Promise.resolve();
	}
	return o;
}
function Ju(e) {
	return Ll(e, null);
}
//#endregion
//#region node_modules/fflate/esm/browser.js
var Yu = {}, Xu = (function(e, t, n, r, i) {
	var a = new Worker(Yu[t] || (Yu[t] = URL.createObjectURL(new Blob([e + ";addEventListener(\"error\",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})"], { type: "text/javascript" }))));
	return a.onmessage = function(e) {
		var t = e.data, n = t.$e$;
		if (n) {
			var r = Error(n[0]);
			r.code = n[1], r.stack = n[2], i(r, null);
		} else i(null, t);
	}, a.postMessage(n, r), a;
}), $ = Uint8Array, Zu = Uint16Array, Qu = Int32Array, $u = new $([
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	1,
	1,
	1,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	0,
	0,
	0,
	0
]), ed = new $([
	0,
	0,
	0,
	0,
	1,
	1,
	2,
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	7,
	7,
	8,
	8,
	9,
	9,
	10,
	10,
	11,
	11,
	12,
	12,
	13,
	13,
	0,
	0
]), td = new $([
	16,
	17,
	18,
	0,
	8,
	7,
	9,
	6,
	10,
	5,
	11,
	4,
	12,
	3,
	13,
	2,
	14,
	1,
	15
]), nd = function(e, t) {
	for (var n = new Zu(31), r = 0; r < 31; ++r) n[r] = t += 1 << e[r - 1];
	for (var i = new Qu(n[30]), r = 1; r < 30; ++r) for (var a = n[r]; a < n[r + 1]; ++a) i[a] = a - n[r] << 5 | r;
	return {
		b: n,
		r: i
	};
}, rd = nd($u, 2), id = rd.b, ad = rd.r;
id[28] = 258, ad[258] = 28;
for (var od = nd(ed, 0), sd = od.b, cd = od.r, ld = new Zu(32768), ud = 0; ud < 32768; ++ud) {
	var dd = (ud & 43690) >> 1 | (ud & 21845) << 1;
	dd = (dd & 52428) >> 2 | (dd & 13107) << 2, dd = (dd & 61680) >> 4 | (dd & 3855) << 4, ld[ud] = ((dd & 65280) >> 8 | (dd & 255) << 8) >> 1;
}
for (var fd = (function(e, t, n) {
	for (var r = e.length, i = 0, a = new Zu(t); i < r; ++i) e[i] && ++a[e[i] - 1];
	var o = new Zu(t);
	for (i = 1; i < t; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
	var s;
	if (n) {
		s = new Zu(1 << t);
		var c = 15 - t;
		for (i = 0; i < r; ++i) if (e[i]) for (var l = i << 4 | e[i], u = t - e[i], d = o[e[i] - 1]++ << u, f = d | (1 << u) - 1; d <= f; ++d) s[ld[d] >> c] = l;
	} else for (s = new Zu(r), i = 0; i < r; ++i) e[i] && (s[i] = ld[o[e[i] - 1]++] >> 15 - e[i]);
	return s;
}), pd = new $(288), ud = 0; ud < 144; ++ud) pd[ud] = 8;
for (var ud = 144; ud < 256; ++ud) pd[ud] = 9;
for (var ud = 256; ud < 280; ++ud) pd[ud] = 7;
for (var ud = 280; ud < 288; ++ud) pd[ud] = 8;
for (var md = new $(32), ud = 0; ud < 32; ++ud) md[ud] = 5;
var hd = /* @__PURE__ */ fd(pd, 9, 0), gd = /* @__PURE__ */ fd(pd, 9, 1), _d = /* @__PURE__ */ fd(md, 5, 0), vd = /* @__PURE__ */ fd(md, 5, 1), yd = function(e) {
	for (var t = e[0], n = 1; n < e.length; ++n) e[n] > t && (t = e[n]);
	return t;
}, bd = function(e, t, n) {
	var r = t / 8 | 0;
	return (e[r] | e[r + 1] << 8) >> (t & 7) & n;
}, xd = function(e, t) {
	var n = t / 8 | 0;
	return (e[n] | e[n + 1] << 8 | e[n + 2] << 16) >> (t & 7);
}, Sd = function(e) {
	return (e + 7) / 8 | 0;
}, Cd = function(e, t, n) {
	return (t == null || t < 0) && (t = 0), (n == null || n > e.length) && (n = e.length), new $(e.subarray(t, n));
}, wd = [
	"unexpected EOF",
	"invalid block type",
	"invalid length/literal",
	"invalid distance",
	"stream finished",
	"no stream handler",
	,
	"no callback",
	"invalid UTF-8 data",
	"extra field too long",
	"date not in range 1980-2099",
	"filename too long",
	"stream finishing",
	"invalid zip data"
], Td = function(e, t, n) {
	var r = Error(t || wd[e]);
	if (r.code = e, Error.captureStackTrace && Error.captureStackTrace(r, Td), !n) throw r;
	return r;
}, Ed = function(e, t, n, r) {
	var i = e.length, a = r ? r.length : 0;
	if (!i || t.f && !t.l) return n || new $(0);
	var o = !n, s = o || t.i != 2, c = t.i;
	o && (n = new $(i * 3));
	var l = function(e) {
		var t = n.length;
		if (e > t) {
			var r = new $(Math.max(t * 2, e));
			r.set(n), n = r;
		}
	}, u = t.f || 0, d = t.p || 0, f = t.b || 0, p = t.l, m = t.d, h = t.m, g = t.n, _ = i * 8;
	do {
		if (!p) {
			u = bd(e, d, 1);
			var v = bd(e, d + 1, 3);
			if (d += 3, !v) {
				var y = Sd(d) + 4, b = e[y - 4] | e[y - 3] << 8, x = y + b;
				if (x > i) {
					c && Td(0);
					break;
				}
				s && l(f + b), n.set(e.subarray(y, x), f), t.b = f += b, t.p = d = x * 8, t.f = u;
				continue;
			} else if (v == 1) p = gd, m = vd, h = 9, g = 5;
			else if (v == 2) {
				var S = bd(e, d, 31) + 257, C = bd(e, d + 10, 15) + 4, w = S + bd(e, d + 5, 31) + 1;
				d += 14;
				for (var T = new $(w), E = new $(19), D = 0; D < C; ++D) E[td[D]] = bd(e, d + D * 3, 7);
				d += C * 3;
				for (var O = yd(E), ee = (1 << O) - 1, k = fd(E, O, 1), D = 0; D < w;) {
					var A = k[bd(e, d, ee)];
					d += A & 15;
					var y = A >> 4;
					if (y < 16) T[D++] = y;
					else {
						var j = 0, M = 0;
						for (y == 16 ? (M = 3 + bd(e, d, 3), d += 2, j = T[D - 1]) : y == 17 ? (M = 3 + bd(e, d, 7), d += 3) : y == 18 && (M = 11 + bd(e, d, 127), d += 7); M--;) T[D++] = j;
					}
				}
				var N = T.subarray(0, S), P = T.subarray(S);
				h = yd(N), g = yd(P), p = fd(N, h, 1), m = fd(P, g, 1);
			} else Td(1);
			if (d > _) {
				c && Td(0);
				break;
			}
		}
		s && l(f + 131072);
		for (var te = (1 << h) - 1, F = (1 << g) - 1, ne = d;; ne = d) {
			var j = p[xd(e, d) & te], I = j >> 4;
			if (d += j & 15, d > _) {
				c && Td(0);
				break;
			}
			if (j || Td(2), I < 256) n[f++] = I;
			else if (I == 256) {
				ne = d, p = null;
				break;
			} else {
				var L = I - 254;
				if (I > 264) {
					var D = I - 257, R = $u[D];
					L = bd(e, d, (1 << R) - 1) + id[D], d += R;
				}
				var re = m[xd(e, d) & F], ie = re >> 4;
				re || Td(3), d += re & 15;
				var P = sd[ie];
				if (ie > 3) {
					var R = ed[ie];
					P += xd(e, d) & (1 << R) - 1, d += R;
				}
				if (d > _) {
					c && Td(0);
					break;
				}
				s && l(f + 131072);
				var ae = f + L;
				if (f < P) {
					var z = a - P, oe = Math.min(P, ae);
					for (z + f < 0 && Td(3); f < oe; ++f) n[f] = r[z + f];
				}
				for (; f < ae; ++f) n[f] = n[f - P];
			}
		}
		t.l = p, t.p = ne, t.b = f, t.f = u, p && (u = 1, t.m = h, t.d = m, t.n = g);
	} while (!u);
	return f != n.length && o ? Cd(n, 0, f) : n.subarray(0, f);
}, Dd = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8;
}, Od = function(e, t, n) {
	n <<= t & 7;
	var r = t / 8 | 0;
	e[r] |= n, e[r + 1] |= n >> 8, e[r + 2] |= n >> 16;
}, kd = function(e, t) {
	for (var n = [], r = 0; r < e.length; ++r) e[r] && n.push({
		s: r,
		f: e[r]
	});
	var i = n.length, a = n.slice();
	if (!i) return {
		t: Id,
		l: 0
	};
	if (i == 1) {
		var o = new $(n[0].s + 1);
		return o[n[0].s] = 1, {
			t: o,
			l: 1
		};
	}
	n.sort(function(e, t) {
		return e.f - t.f;
	}), n.push({
		s: -1,
		f: 25001
	});
	var s = n[0], c = n[1], l = 0, u = 1, d = 2;
	for (n[0] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	}; u != i - 1;) s = n[n[l].f < n[d].f ? l++ : d++], c = n[l != u && n[l].f < n[d].f ? l++ : d++], n[u++] = {
		s: -1,
		f: s.f + c.f,
		l: s,
		r: c
	};
	for (var f = a[0].s, r = 1; r < i; ++r) a[r].s > f && (f = a[r].s);
	var p = new Zu(f + 1), m = Ad(n[u - 1], p, 0);
	if (m > t) {
		var r = 0, h = 0, g = m - t, _ = 1 << g;
		for (a.sort(function(e, t) {
			return p[t.s] - p[e.s] || e.f - t.f;
		}); r < i; ++r) {
			var v = a[r].s;
			if (p[v] > t) h += _ - (1 << m - p[v]), p[v] = t;
			else break;
		}
		for (h >>= g; h > 0;) {
			var y = a[r].s;
			p[y] < t ? h -= 1 << t - p[y]++ - 1 : ++r;
		}
		for (; r >= 0 && h; --r) {
			var b = a[r].s;
			p[b] == t && (--p[b], ++h);
		}
		m = t;
	}
	return {
		t: new $(p),
		l: m
	};
}, Ad = function(e, t, n) {
	return e.s == -1 ? Math.max(Ad(e.l, t, n + 1), Ad(e.r, t, n + 1)) : t[e.s] = n;
}, jd = function(e) {
	for (var t = e.length; t && !e[--t];);
	for (var n = new Zu(++t), r = 0, i = e[0], a = 1, o = function(e) {
		n[r++] = e;
	}, s = 1; s <= t; ++s) if (e[s] == i && s != t) ++a;
	else {
		if (!i && a > 2) {
			for (; a > 138; a -= 138) o(32754);
			a > 2 && (o(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
		} else if (a > 3) {
			for (o(i), --a; a > 6; a -= 6) o(8304);
			a > 2 && (o(a - 3 << 5 | 8208), a = 0);
		}
		for (; a--;) o(i);
		a = 1, i = e[s];
	}
	return {
		c: n.subarray(0, r),
		n: t
	};
}, Md = function(e, t) {
	for (var n = 0, r = 0; r < t.length; ++r) n += e[r] * t[r];
	return n;
}, Nd = function(e, t, n) {
	var r = n.length, i = Sd(t + 2);
	e[i] = r & 255, e[i + 1] = r >> 8, e[i + 2] = e[i] ^ 255, e[i + 3] = e[i + 1] ^ 255;
	for (var a = 0; a < r; ++a) e[i + a + 4] = n[a];
	return (i + 4 + r) * 8;
}, Pd = function(e, t, n, r, i, a, o, s, c, l, u) {
	Dd(t, u++, n), ++i[256];
	for (var d = kd(i, 15), f = d.t, p = d.l, m = kd(a, 15), h = m.t, g = m.l, _ = jd(f), v = _.c, y = _.n, b = jd(h), x = b.c, S = b.n, C = new Zu(19), w = 0; w < v.length; ++w) ++C[v[w] & 31];
	for (var w = 0; w < x.length; ++w) ++C[x[w] & 31];
	for (var T = kd(C, 7), E = T.t, D = T.l, O = 19; O > 4 && !E[td[O - 1]]; --O);
	var ee = l + 5 << 3, k = Md(i, pd) + Md(a, md) + o, A = Md(i, f) + Md(a, h) + o + 14 + 3 * O + Md(C, E) + 2 * C[16] + 3 * C[17] + 7 * C[18];
	if (c >= 0 && ee <= k && ee <= A) return Nd(t, u, e.subarray(c, c + l));
	var j, M, N, P;
	if (Dd(t, u, 1 + (A < k)), u += 2, A < k) {
		j = fd(f, p, 0), M = f, N = fd(h, g, 0), P = h;
		var te = fd(E, D, 0);
		Dd(t, u, y - 257), Dd(t, u + 5, S - 1), Dd(t, u + 10, O - 4), u += 14;
		for (var w = 0; w < O; ++w) Dd(t, u + 3 * w, E[td[w]]);
		u += 3 * O;
		for (var F = [v, x], ne = 0; ne < 2; ++ne) for (var I = F[ne], w = 0; w < I.length; ++w) {
			var L = I[w] & 31;
			Dd(t, u, te[L]), u += E[L], L > 15 && (Dd(t, u, I[w] >> 5 & 127), u += I[w] >> 12);
		}
	} else j = hd, M = pd, N = _d, P = md;
	for (var w = 0; w < s; ++w) {
		var R = r[w];
		if (R > 255) {
			var L = R >> 18 & 31;
			Od(t, u, j[L + 257]), u += M[L + 257], L > 7 && (Dd(t, u, R >> 23 & 31), u += $u[L]);
			var re = R & 31;
			Od(t, u, N[re]), u += P[re], re > 3 && (Od(t, u, R >> 5 & 8191), u += ed[re]);
		} else Od(t, u, j[R]), u += M[R];
	}
	return Od(t, u, j[256]), u + M[256];
}, Fd = /* @__PURE__ */ new Qu([
	65540,
	131080,
	131088,
	131104,
	262176,
	1048704,
	1048832,
	2114560,
	2117632
]), Id = /* @__PURE__ */ new $(0), Ld = function(e, t, n, r, i, a) {
	var o = a.z || e.length, s = new $(r + o + 5 * (1 + Math.ceil(o / 7e3)) + i), c = s.subarray(r, s.length - i), l = a.l, u = (a.r || 0) & 7;
	if (t) {
		u && (c[0] = a.r >> 3);
		for (var d = Fd[t - 1], f = d >> 13, p = d & 8191, m = (1 << n) - 1, h = a.p || new Zu(32768), g = a.h || new Zu(m + 1), _ = Math.ceil(n / 3), v = 2 * _, y = function(t) {
			return (e[t] ^ e[t + 1] << _ ^ e[t + 2] << v) & m;
		}, b = new Qu(25e3), x = new Zu(288), S = new Zu(32), C = 0, w = 0, T = a.i || 0, E = 0, D = a.w || 0, O = 0; T + 2 < o; ++T) {
			var ee = y(T), k = T & 32767, A = g[ee];
			if (h[k] = A, g[ee] = k, D <= T) {
				var j = o - T;
				if ((C > 7e3 || E > 24576) && (j > 423 || !l)) {
					u = Pd(e, c, 0, b, x, S, w, E, O, T - O, u), E = C = w = 0, O = T;
					for (var M = 0; M < 286; ++M) x[M] = 0;
					for (var M = 0; M < 30; ++M) S[M] = 0;
				}
				var N = 2, P = 0, te = p, F = k - A & 32767;
				if (j > 2 && ee == y(T - F)) for (var ne = Math.min(f, j) - 1, I = Math.min(32767, T), L = Math.min(258, j); F <= I && --te && k != A;) {
					if (e[T + N] == e[T + N - F]) {
						for (var R = 0; R < L && e[T + R] == e[T + R - F]; ++R);
						if (R > N) {
							if (N = R, P = F, R > ne) break;
							for (var re = Math.min(F, R - 2), ie = 0, M = 0; M < re; ++M) {
								var ae = T - F + M & 32767, z = ae - h[ae] & 32767;
								z > ie && (ie = z, A = ae);
							}
						}
					}
					k = A, A = h[k], F += k - A & 32767;
				}
				if (P) {
					b[E++] = 268435456 | ad[N] << 18 | cd[P];
					var oe = ad[N] & 31, se = cd[P] & 31;
					w += $u[oe] + ed[se], ++x[257 + oe], ++S[se], D = T + N, ++C;
				} else b[E++] = e[T], ++x[e[T]];
			}
		}
		for (T = Math.max(T, D); T < o; ++T) b[E++] = e[T], ++x[e[T]];
		u = Pd(e, c, l, b, x, S, w, E, O, T - O, u), l || (a.r = u & 7 | c[u / 8 | 0] << 3, u -= 7, a.h = g, a.p = h, a.i = T, a.w = D);
	} else {
		for (var T = a.w || 0; T < o + l; T += 65535) {
			var ce = T + 65535;
			ce >= o && (c[u / 8 | 0] = l, ce = o), u = Nd(c, u + 1, e.subarray(T, ce));
		}
		a.i = o;
	}
	return Cd(s, 0, r + Sd(u) + i);
}, Rd = /* @__PURE__ */ (function() {
	for (var e = new Int32Array(256), t = 0; t < 256; ++t) {
		for (var n = t, r = 9; --r;) n = (n & 1 && -306674912) ^ n >>> 1;
		e[t] = n;
	}
	return e;
})(), zd = function() {
	var e = -1;
	return {
		p: function(t) {
			for (var n = e, r = 0; r < t.length; ++r) n = Rd[n & 255 ^ t[r]] ^ n >>> 8;
			e = n;
		},
		d: function() {
			return ~e;
		}
	};
}, Bd = function(e, t, n, r, i) {
	if (!i && (i = { l: 1 }, t.dictionary)) {
		var a = t.dictionary.subarray(-32768), o = new $(a.length + e.length);
		o.set(a), o.set(e, a.length), e = o, i.w = a.length;
	}
	return Ld(e, t.level == null ? 6 : t.level, t.mem == null ? i.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(e.length))) * 1.5) : 20 : 12 + t.mem, n, r, i);
}, Vd = function(e, t) {
	var n = {};
	for (var r in e) n[r] = e[r];
	for (var r in t) n[r] = t[r];
	return n;
}, Hd = function(e, t, n) {
	for (var r = e(), i = e.toString(), a = i.slice(i.indexOf("[") + 1, i.lastIndexOf("]")).replace(/\s+/g, "").split(","), o = 0; o < r.length; ++o) {
		var s = r[o], c = a[o];
		if (typeof s == "function") {
			t += ";" + c + "=";
			var l = s.toString();
			if (s.prototype) if (l.indexOf("[native code]") != -1) {
				var u = l.indexOf(" ", 8) + 1;
				t += l.slice(u, l.indexOf("(", u));
			} else for (var d in t += l, s.prototype) t += ";" + c + ".prototype." + d + "=" + s.prototype[d].toString();
			else t += l;
		} else n[c] = s;
	}
	return t;
}, Ud = [], Wd = function(e) {
	var t = [];
	for (var n in e) e[n].buffer && t.push((e[n] = new e[n].constructor(e[n])).buffer);
	return t;
}, Gd = function(e, t, n, r) {
	if (!Ud[n]) {
		for (var i = "", a = {}, o = e.length - 1, s = 0; s < o; ++s) i = Hd(e[s], i, a);
		Ud[n] = {
			c: Hd(e[o], i, a),
			e: a
		};
	}
	var c = Vd({}, Ud[n].e);
	return Xu(Ud[n].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + t.toString() + "}", n, c, Wd(c), r);
}, Kd = function() {
	return [
		$,
		Zu,
		Qu,
		$u,
		ed,
		td,
		id,
		sd,
		gd,
		vd,
		ld,
		wd,
		fd,
		yd,
		bd,
		xd,
		Sd,
		Cd,
		Td,
		Ed,
		af,
		Jd,
		Yd
	];
}, qd = function() {
	return [
		$,
		Zu,
		Qu,
		$u,
		ed,
		td,
		ad,
		cd,
		hd,
		pd,
		_d,
		md,
		ld,
		Fd,
		Id,
		fd,
		Dd,
		Od,
		kd,
		Ad,
		jd,
		Md,
		Nd,
		Pd,
		Sd,
		Cd,
		Ld,
		Bd,
		nf,
		Jd
	];
}, Jd = function(e) {
	return postMessage(e, [e.buffer]);
}, Yd = function(e) {
	return e && {
		out: e.size && new $(e.size),
		dictionary: e.dictionary
	};
}, Xd = function(e, t, n, r, i, a) {
	var o = Gd(n, r, i, function(e, t) {
		o.terminate(), a(e, t);
	});
	return o.postMessage([e, t], t.consume ? [e.buffer] : []), function() {
		o.terminate();
	};
}, Zd = function(e, t) {
	return e[t] | e[t + 1] << 8;
}, Qd = function(e, t) {
	return (e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24) >>> 0;
}, $d = function(e, t) {
	return Qd(e, t) + Qd(e, t + 4) * 4294967296;
}, ef = function(e, t, n) {
	for (; n; ++t) e[t] = n, n >>>= 8;
};
function tf(e, t, n) {
	return n || (n = t, t = {}), typeof n != "function" && Td(7), Xd(e, t, [qd], function(e) {
		return Jd(nf(e.data[0], e.data[1]));
	}, 0, n);
}
function nf(e, t) {
	return Bd(e, t || {}, 0, 0);
}
function rf(e, t, n) {
	return n || (n = t, t = {}), typeof n != "function" && Td(7), Xd(e, t, [Kd], function(e) {
		return Jd(af(e.data[0], Yd(e.data[1])));
	}, 1, n);
}
function af(e, t) {
	return Ed(e, { i: 2 }, t && t.out, t && t.dictionary);
}
var of = function(e, t, n, r) {
	for (var i in e) {
		var a = e[i], o = t + i, s = r;
		Array.isArray(a) && (s = Vd(r, a[1]), a = a[0]), ArrayBuffer.isView(a) ? n[o] = [a, s] : (n[o += "/"] = [new $(0), s], of(a, o, n, r));
	}
}, sf = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), cf = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder();
try {
	cf.decode(Id, { stream: !0 });
} catch {}
var lf = function(e) {
	for (var t = "", n = 0;;) {
		var r = e[n++], i = (r > 127) + (r > 223) + (r > 239);
		if (n + i > e.length) return {
			s: t,
			r: Cd(e, n - 1)
		};
		i ? i == 3 ? (r = ((r & 15) << 18 | (e[n++] & 63) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) - 65536, t += String.fromCharCode(55296 | r >> 10, 56320 | r & 1023)) : i & 1 ? t += String.fromCharCode((r & 31) << 6 | e[n++] & 63) : t += String.fromCharCode((r & 15) << 12 | (e[n++] & 63) << 6 | e[n++] & 63) : t += String.fromCharCode(r);
	}
};
function uf(e, t) {
	if (t) {
		for (var n = new $(e.length), r = 0; r < e.length; ++r) n[r] = e.charCodeAt(r);
		return n;
	}
	if (sf) return sf.encode(e);
	for (var i = e.length, a = new $(e.length + (e.length >> 1)), o = 0, s = function(e) {
		a[o++] = e;
	}, r = 0; r < i; ++r) {
		if (o + 5 > a.length) {
			var c = new $(o + 8 + (i - r << 1));
			c.set(a), a = c;
		}
		var l = e.charCodeAt(r);
		l < 128 || t ? s(l) : l < 2048 ? (s(192 | l >> 6), s(128 | l & 63)) : l > 55295 && l < 57344 ? (l = 65536 + (l & 1047552) | e.charCodeAt(++r) & 1023, s(240 | l >> 18), s(128 | l >> 12 & 63), s(128 | l >> 6 & 63), s(128 | l & 63)) : (s(224 | l >> 12), s(128 | l >> 6 & 63), s(128 | l & 63));
	}
	return Cd(a, 0, o);
}
function df(e, t) {
	if (t) {
		for (var n = "", r = 0; r < e.length; r += 16384) n += String.fromCharCode.apply(null, e.subarray(r, r + 16384));
		return n;
	} else if (cf) return cf.decode(e);
	else {
		var i = lf(e), a = i.s, n = i.r;
		return n.length && Td(8), a;
	}
}
var ff = function(e, t) {
	return t + 30 + Zd(e, t + 26) + Zd(e, t + 28);
}, pf = function(e, t, n) {
	var r = Zd(e, t + 28), i = Zd(e, t + 30), a = df(e.subarray(t + 46, t + 46 + r), !(Zd(e, t + 8) & 2048)), o = t + 46 + r, s = mf(e, o, i, n, Qd(e, t + 20), Qd(e, t + 24), Qd(e, t + 42)), c = s[0], l = s[1], u = s[2];
	return [
		Zd(e, t + 10),
		c,
		l,
		a,
		o + i + Zd(e, t + 32),
		u
	];
}, mf = function(e, t, n, r, i, a, o) {
	var s = i == 4294967295, c = a == 4294967295, l = o == 4294967295, u = t + n, d = s + c + l;
	if (r && d) {
		for (; t + 4 < u; t += 4 + Zd(e, t + 2)) if (Zd(e, t) == 1) return [
			s ? $d(e, t + 4 + 8 * c) : i,
			c ? $d(e, t + 4) : a,
			l ? $d(e, t + 4 + 8 * (c + s)) : o,
			1
		];
		r < 2 && Td(13);
	}
	return [
		i,
		a,
		o,
		0
	];
}, hf = function(e) {
	var t = 0;
	if (e) for (var n in e) {
		var r = e[n].length;
		r > 65535 && Td(9), t += r + 4;
	}
	return t;
}, gf = function(e, t, n, r, i, a, o, s) {
	var c = r.length, l = n.extra, u = s && s.length, d = hf(l);
	ef(e, t, o == null ? 67324752 : 33639248), t += 4, o != null && (e[t++] = 20, e[t++] = n.os), e[t] = 20, t += 2, e[t++] = n.flag << 1 | (a < 0 && 8), e[t++] = i && 8, e[t++] = n.compression & 255, e[t++] = n.compression >> 8;
	var f = new Date(n.mtime == null ? Date.now() : n.mtime), p = f.getFullYear() - 1980;
	if ((p < 0 || p > 119) && Td(10), ef(e, t, p << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, a != -1 && (ef(e, t, n.crc), ef(e, t + 4, a < 0 ? -a - 2 : a), ef(e, t + 8, n.size)), ef(e, t + 12, c), ef(e, t + 14, d), t += 16, o != null && (ef(e, t, u), ef(e, t + 6, n.attrs), ef(e, t + 10, o), t += 14), e.set(r, t), t += c, d) for (var m in l) {
		var h = l[m], g = h.length;
		ef(e, t, +m), ef(e, t + 2, g), e.set(h, t + 4), t += 4 + g;
	}
	return u && (e.set(s, t), t += u), t;
}, _f = function(e, t, n, r, i) {
	ef(e, t, 101010256), ef(e, t + 8, n), ef(e, t + 10, n), ef(e, t + 12, r), ef(e, t + 16, i);
};
function vf(e, t, n) {
	n || (n = t, t = {}), typeof n != "function" && Td(7);
	var r = {};
	of(e, "", r, t);
	var i = Object.keys(r), a = i.length, o = 0, s = 0, c = a, l = Array(a), u = [], d = function() {
		for (var e = 0; e < u.length; ++e) u[e]();
	}, f = function(e, t) {
		yf(function() {
			n(e, t);
		});
	};
	yf(function() {
		f = n;
	});
	var p = function() {
		var e = new $(s + 22), t = o, n = s - o;
		s = 0;
		for (var r = 0; r < c; ++r) {
			var i = l[r];
			try {
				var a = i.c.length;
				gf(e, s, i, i.f, i.u, a);
				var u = 30 + i.f.length + hf(i.extra), d = s + u;
				e.set(i.c, d), gf(e, o, i, i.f, i.u, a, s, i.m), o += 16 + u + (i.m ? i.m.length : 0), s = d + a;
			} catch (e) {
				return f(e, null);
			}
		}
		_f(e, o, l.length, n, t), f(null, e);
	};
	a || p();
	for (var m = function(e) {
		var t = i[e], n = r[t], c = n[0], m = n[1], h = zd(), g = c.length;
		h.p(c);
		var _ = uf(t), v = _.length, y = m.comment, b = y && uf(y), x = b && b.length, S = hf(m.extra), C = m.level == 0 ? 0 : 8, w = function(n, r) {
			if (n) d(), f(n, null);
			else {
				var i = r.length;
				l[e] = Vd(m, {
					size: g,
					crc: h.d(),
					c: r,
					f: _,
					m: b,
					u: v != t.length || b && y.length != x,
					compression: C
				}), o += 30 + v + S + i, s += 76 + 2 * (v + S) + (x || 0) + i, --a || p();
			}
		};
		if (v > 65535 && w(Td(11, 0, 1), null), !C) w(null, c);
		else if (g < 16e4) try {
			w(null, nf(c, m));
		} catch (e) {
			w(e, null);
		}
		else u.push(tf(c, m, w));
	}, h = 0; h < c; ++h) m(h);
	return d;
}
var yf = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(e) {
	e();
};
function bf(e, t, n) {
	n || (n = t, t = {}), typeof n != "function" && Td(7);
	var r = [], i = function() {
		for (var e = 0; e < r.length; ++e) r[e]();
	}, a = {}, o = function(e, t) {
		yf(function() {
			n(e, t);
		});
	};
	yf(function() {
		o = n;
	});
	for (var s = e.length - 22; Qd(e, s) != 101010256; --s) if (!s || e.length - s > 65558) return o(Td(13, 0, 1), null), i;
	var c = Zd(e, s + 8);
	if (c) {
		var l = c, u = Qd(e, s + 16), d = Qd(e, s - 20) == 117853008;
		if (d) {
			var f = Qd(e, s - 12);
			d = Qd(e, f) == 101075792, d && (l = c = Qd(e, f + 32), u = Qd(e, f + 48));
		}
		for (var p = t && t.filter, m = function(t) {
			var n = pf(e, u, d), s = n[0], l = n[1], f = n[2], m = n[3], h = n[4], g = n[5], _ = ff(e, g);
			u = h;
			var v = function(e, t) {
				e ? (i(), o(e, null)) : (t && (a[m] = t), --c || o(null, a));
			};
			if (!p || p({
				name: m,
				size: l,
				originalSize: f,
				compression: s
			})) if (!s) v(null, Cd(e, _, _ + l));
			else if (s == 8) {
				var y = e.subarray(_, _ + l);
				if (f < 524288 || l > .8 * f) try {
					v(null, af(y, { out: new $(f) }));
				} catch (e) {
					v(e, null);
				}
				else r.push(rf(y, { size: f }, v));
			} else v(Td(14, "unknown compression type " + s, 1), null);
			else v(null, null);
		}, h = 0; h < l; ++h) m(h);
	} else o(null, {});
	return i;
}
//#endregion
//#region src/features/bubble-render/import-export.ts
var xf = /[\\/:*?"<>|]/g;
function Sf(e) {
	return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
}
function Cf(e) {
	return String(e ?? "").replace(xf, "_").trim() || "unnamed";
}
function wf(e, t) {
	let n = /\.(webp|png|jpg|jpeg|gif|avif)$/i.exec(String(t ?? ""));
	if (n) return n[1].toLowerCase();
	let r = String(e ?? "").toLowerCase();
	return r.includes("png") ? "png" : r.includes("jpeg") || r.includes("jpg") ? "jpg" : r.includes("gif") ? "gif" : r.includes("avif") ? "avif" : "webp";
}
async function Tf(e) {
	let { library: t, charId: n, charName: r, colors: i = {}, onProgress: a } = e, o = await t.listAvatarNames(), s = await t.listMoodAvatars(), c = [], l = [], u = {}, d = o.length + s.length, f = 0, p = () => {
		f += 1, a && f % 20 == 0 && a(f, d);
	};
	for (let e = 0; e < o.length; e += 1) {
		let n = o[e], r = await t.getAvatar(n);
		if (!r?.imageBlob) {
			p();
			continue;
		}
		let i = wf(r.mimeType, r.fileName), a = `avatars/${e}_${Cf(n)}.${i}`;
		u[a] = new Uint8Array(await r.imageBlob.arrayBuffer()), c.push({
			name: n,
			mimeType: r.mimeType || `image/${i}`,
			fileName: `${Cf(n)}.${i}`,
			fileSize: r.imageBlob.size,
			width: r.width,
			height: r.height,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
			imageUrl: r.sourceUrl ?? null,
			zipPath: a
		}), p(), e % 50 == 49 && await Promise.resolve();
	}
	for (let e = 0; e < s.length; e += 1) {
		let n = s[e], r = String(n.alias ?? ""), i = String(n.moodId ?? "");
		if (!r || !i) {
			p();
			continue;
		}
		let a = await t.getMoodAvatar(r, i);
		if (!a?.imageBlob) {
			p();
			continue;
		}
		let o = wf(a.mimeType, a.fileName), c = `mood/${e}_${Cf(r)}_${i}.${o}`;
		u[c] = new Uint8Array(await a.imageBlob.arrayBuffer()), l.push({
			name: r,
			moodId: i,
			mimeType: a.mimeType || `image/${o}`,
			fileName: `${Cf(r)}_${i}.${o}`,
			fileSize: a.imageBlob.size,
			width: a.width,
			height: a.height,
			createdAt: a.createdAt,
			updatedAt: a.updatedAt,
			imageUrl: a.sourceUrl ?? null,
			zipPath: c
		}), p(), e % 50 == 49 && await Promise.resolve();
	}
	let m = {
		type: hu,
		version: gu,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		charId: n,
		charName: r,
		avatars: c,
		moodAvatars: l,
		colors: i
	};
	return u["manifest.json"] = uf(JSON.stringify(m, null, 2)), new Promise((e, t) => {
		vf(u, { level: 0 }, (n, r) => {
			n ? t(n) : e(r);
		});
	});
}
async function Ef(e, t, n, r = null) {
	let i = await new Promise((e, n) => {
		bf(t, (t, r) => {
			t ? n(t) : e(r);
		});
	}), a = i["manifest.json"];
	if (!a) throw Error("压缩包缺少 manifest.json，不是本扩展的头像包");
	let o;
	try {
		o = JSON.parse(df(a));
	} catch {
		throw Error("manifest.json 解析失败");
	}
	if (o.type !== "bubble-character") throw Error(`不支持的包类型：${String(o.type)}`);
	let s = {
		avatars: 0,
		moodAvatars: 0,
		colors: 0,
		skipped: 0
	}, c = [...o.avatars, ...o.moodAvatars].length, l = 0;
	for (let t of o.avatars) {
		let r = i[t.zipPath];
		if (!r) {
			s.skipped += 1;
			continue;
		}
		if ((await e.getAvatar(t.name))?.imageBlob) {
			s.skipped += 1;
			continue;
		}
		let a = new Blob([Sf(r)], { type: t.mimeType || "image/webp" });
		await e.putAvatar(t.name, a, {
			fileName: t.fileName,
			mimeType: t.mimeType,
			width: t.width,
			height: t.height,
			sourceUrl: t.imageUrl
		}), s.avatars += 1, l += 1, n && l % 20 == 0 && n(l, c), l % 50 == 0 && await Promise.resolve();
	}
	for (let t of o.moodAvatars) {
		let r = i[t.zipPath];
		if (!r) {
			s.skipped += 1;
			continue;
		}
		if ((await e.getMoodAvatar(t.name, t.moodId))?.imageBlob) {
			s.skipped += 1;
			continue;
		}
		let a = new Blob([Sf(r)], { type: t.mimeType || "image/webp" });
		await e.putMoodAvatar(t.name, t.moodId, a, {
			fileName: t.fileName,
			mimeType: t.mimeType,
			width: t.width,
			height: t.height,
			sourceUrl: t.imageUrl
		}), s.moodAvatars += 1, l += 1, n && l % 20 == 0 && n(l, c), l % 50 == 0 && await Promise.resolve();
	}
	for (let [t, n] of Object.entries(o.colors ?? {})) n && (await e.setConfig(Hl(r, t), n), s.colors += 1);
	return s;
}
//#endregion
//#region src/features/bubble-render/runtime.ts
var Df = 8, Of = 450, kf = 80;
function Af(e) {
	let t = String(e ?? "").split("__");
	return {
		mood: t[0] ?? "",
		outfit: t[1] ?? "",
		act: t[2] ?? ""
	};
}
function jf() {
	let e = Vu(), t = e?.characterId, n = t == null || t === "" ? null : String(t), r = typeof e?.name2 == "string" ? e.name2.trim() : "", i = n !== null && r !== "SillyTavern System";
	return {
		id: i ? n : null,
		name: r || "SillyTavern System",
		hasCard: i
	};
}
async function Mf(e, t) {
	let n = t ? {
		mode: "character",
		charId: t
	} : mu;
	try {
		return (await Pu(e, n).listScopes()).sort((e, t) => Number(t.charId === $c) - Number(e.charId === $c));
	} catch (e) {
		return console.warn("[BubbleDialogue] native scope stats failed.", e), [];
	}
}
function Nf(e) {
	let t = jf(), n = /* @__PURE__ */ Dt({
		ready: !1,
		backend: "native",
		mode: "global",
		hasCharacterCard: t.hasCard,
		charId: t.id,
		charName: t.name,
		bubbleCount: 0,
		injected: !1,
		generationActive: !1,
		busy: !1,
		progress: null,
		lastResult: null,
		avatarNames: [],
		avatarCount: 0,
		moodCount: 0,
		totalBytes: 0,
		statsLoading: !0,
		nativeAvailable: !1,
		totalAvatars: 0,
		totalMoodAvatars: 0,
		totalCgImages: 0,
		totalStorageBytes: 0,
		totalStatsLoading: !0,
		totalStatsError: !1,
		totalStatsStale: !1,
		nativeScopes: [],
		deletingName: null,
		avatarColors: {}
	});
	function r() {
		let e = n.hasCharacterCard ? n.mode : "global";
		return {
			mode: e,
			charId: e === "character" ? n.charId : null
		};
	}
	let i = !1, a, o = ll({}), s = Iu();
	function c() {
		let t = r();
		if (n.backend === "native") {
			let n = e.host.api.extension?.store;
			return i = !!n, n ? Pu(n, t) : (console.warn("[BubbleDialogue] native store unavailable, reading legacy library as fallback."), cu(t));
		}
		return i = !!e.host.api.extension?.store, cu(t);
	}
	a = c(), n.nativeAvailable = i;
	let l = Bu(() => ({
		getConfig: (e) => a.getConfig(e),
		setConfig: (e, t) => a.setConfig(e, t)
	}));
	function u() {
		return ll(a, {
			getMoodGroups: () => l.state.moodGroups,
			resolveMoodId: (e) => {
				let t = String(e ?? "").trim();
				return t ? s(t)?.id ?? t : "";
			}
		});
	}
	o = u();
	let d = wl({
		documentRef: () => document,
		readStyle: () => l.state.style
	}), f = null, p = "", m = "", h = El({ documentRef: () => document }), g = Fl({
		documentRef: () => document,
		resolveAvatar: (e) => o.resolve(e),
		resolveCachedAvatar: (e) => o.resolveCached(e),
		resolveMoodGroup: (e) => s(e),
		resolveTextColor: (e) => String(l.state.style.style_textColorMode ?? "global") === "character" ? oe.get(se(e)) ?? null : null,
		onZoom: (e, t) => h.show(e, t)
	}), _ = Ru({
		setExtensionPrompt: (e, t, r, i, a, o) => {
			let s = Vu();
			if (!s || typeof s.setExtensionPrompt != "function") {
				console.warn("[BubbleDialogue] setExtensionPrompt is unavailable.");
				return;
			}
			s.setExtensionPrompt(e, t, r, i, a, o), n.injected = !0;
		},
		readFormatRule: async () => {
			let e = await a.getConfig("format_rule");
			return typeof e == "string" ? e : null;
		},
		readMoodGroups: async () => {
			let e = l.state.moodGroups;
			return e && e.length ? e : null;
		},
		readMoodTemplate: async () => {
			let e = await a.getConfig("mood_prompt_template");
			return typeof e == "string" ? e : null;
		}
	}), v = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map();
	function b(e) {
		let t = e ?? P();
		v.delete(t), y.delete(t);
	}
	function x() {
		v.clear(), y.clear();
	}
	async function S() {
		let e = P(), t = v.get(e);
		if (t) return t;
		let n = y.get(e);
		if (n) return n;
		let r = a.listMoodAvatarsPrimary();
		y.set(e, r);
		try {
			let t = await r;
			for (v.set(e, t); v.size > 4;) {
				let e = v.keys().next().value;
				if (e === void 0) break;
				v.delete(e);
			}
			return t;
		} finally {
			y.delete(e);
		}
	}
	let C = !1, w = null, T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map();
	function D(e) {
		let t = e ?? P();
		T.delete(t), E.delete(t);
	}
	function O() {
		T.clear(), E.clear();
	}
	let ee = null, k = null, A = [], j = 0, M = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new Map();
	function P() {
		let e = r();
		return e.mode === "character" && e.charId ? e.charId : $c;
	}
	function te(e) {
		let t = e ?? P();
		M.delete(t), N.delete(t);
	}
	function F() {
		M.clear(), N.clear();
	}
	async function ne(e = !1) {
		let t = P();
		if (!e) {
			let e = M.get(t);
			if (e) return e;
			let n = N.get(t);
			if (n) return n;
		}
		let n = (async () => ({
			names: (await a.listAvatarNames()).filter(Boolean),
			stats: await a.getScopeStats()
		}))();
		N.set(t, n);
		try {
			let e = await n;
			return M.set(t, e), e;
		} finally {
			N.delete(t);
		}
	}
	function I() {
		let e = M.get(P());
		return e ? (n.avatarNames = e.names, n.avatarCount = e.names.length, n.moodCount = e.stats.moodAvatars, n.totalBytes = e.stats.bytes, n.statsLoading = !1, !0) : !1;
	}
	async function L(e = {}) {
		n.statsLoading = !0;
		try {
			let t = await ne(e.force === !0);
			n.avatarNames = t.names, n.avatarCount = t.names.length, await ue(t.names), n.moodCount = t.stats.moodAvatars, n.totalBytes = t.stats.bytes;
		} catch (e) {
			console.warn("[BubbleDialogue] avatar stats failed.", e);
		} finally {
			n.statsLoading = !1;
		}
	}
	async function R() {
		n.totalStatsLoading = !0, n.totalStatsError = !1;
		try {
			let t = e.host.api.extension?.store;
			if (!t) {
				n.totalStatsError = !0;
				return;
			}
			let r = await Mf(t, n.charId), i = {
				avatars: 0,
				moodAvatars: 0,
				cgImages: 0,
				bytes: 0
			};
			for (let e of r) i.avatars += e.avatars, i.moodAvatars += e.moodAvatars, i.cgImages += e.cgImages, i.bytes += e.bytes;
			n.nativeScopes = r, n.totalAvatars = i.avatars, n.totalMoodAvatars = i.moodAvatars, n.totalCgImages = i.cgImages, n.totalStorageBytes = i.bytes, C = !0, n.totalStatsStale = !1, console.info(`[BubbleDialogue] 全库统计完成：范围 ${r.map((e) => e.charId).join(", ")}；头像 ${i.avatars}、差分 ${i.moodAvatars}、CG ${i.cgImages}`);
		} catch (e) {
			console.warn("[BubbleDialogue] total stats failed.", e), n.totalStatsError = !0;
		} finally {
			n.totalStatsLoading = !1;
		}
	}
	function re() {
		return C ? Promise.resolve() : (w ||= R().finally(() => {
			w = null;
		}), w);
	}
	async function ie() {
		let e = w;
		if (e) try {
			await e;
		} catch {}
		w = R().finally(() => {
			w = null;
		}), await w;
	}
	async function ae(e, t, r) {
		b(), await a.putAvatar(e, t, { mimeType: t.type }), te(), await L(), o.clearCache(), g.refresh(), g.hydrateAll(), n.lastResult = r ? `已替换「${e}」的默认头像` : `已添加/更新头像「${e}」`;
	}
	async function z(e) {
		if (n.deletingName !== e) {
			n.deletingName = e;
			try {
				b();
				let t = await a.listMoodAvatars(), r = [...new Set(t.filter((t) => String(t.alias ?? "") === e).map((e) => String(e.moodId ?? "")).filter(Boolean))], i = 0;
				await Dl(r, Df, async (t) => {
					try {
						await a.deleteMoodAvatar(e, t);
					} catch (n) {
						i += 1, console.warn(`[BubbleDialogue] delete mood avatar failed: ${e} / ${t}`, n);
					}
				}), await a.deleteAvatar(e), te(), await L(), o.clearCache(), g.refresh(), g.hydrateAll(), n.lastResult = i ? `已删除头像「${e}」，但有 ${i} 条差分删除失败（详见控制台）` : `已删除头像「${e}」`;
			} finally {
				n.deletingName = null;
			}
		}
	}
	let oe = /* @__PURE__ */ new Map(), se = (e) => String(e ?? "").trim().toLowerCase();
	async function ce(e) {
		try {
			let t = await a.getConfig(e);
			return typeof t == "string" && t.trim() ? t.trim() : null;
		} catch {
			return null;
		}
	}
	async function le(e) {
		let t = await ce(Hl(n.charId, e));
		if (t) return t;
		if (n.charId) {
			let t = await ce(Hl($c, e));
			if (t) return t;
		}
		return null;
	}
	async function ue(e) {
		let t = [...new Set(e.map(se).filter(Boolean))];
		oe.clear(), await Dl(t, Df, async (e) => {
			let t = await le(e);
			t && oe.set(e, t);
		}), n.avatarColors = Object.fromEntries(oe);
	}
	function de() {
		k !== null && window.clearTimeout(k);
		let e = n.generationActive ? Of : kf;
		k = window.setTimeout(() => {
			k = null, g.hydrateAll(), n.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length;
		}, e);
	}
	function fe() {
		if (!ee) try {
			ee = new MutationObserver((e) => {
				e.some((e) => e.addedNodes && e.addedNodes.length > 0) && de();
			}), ee.observe(document.body, {
				childList: !0,
				subtree: !0
			});
		} catch {
			ee = null;
		}
	}
	function B() {
		let e = jf();
		n.hasCharacterCard = e.hasCard, n.charId = e.id, n.charName = e.name;
	}
	function pe() {
		let e = Gu("CHARACTER_MESSAGE_RENDERED", "character_message_rendered"), t = Gu("USER_MESSAGE_RENDERED", "user_message_rendered"), r = Gu("CHAT_CHANGED", "chat_changed"), i = Gu("GENERATION_STARTED", "generation_started"), a = Gu("GENERATION_ENDED", "generation_ended"), o = Gu("GENERATION_STOPPED", "generation_stopped"), s = Gu("GENERATION_AFTER_COMMANDS", "generation_after_commands");
		for (let n of [
			e,
			t,
			r
		]) A.push(Wu(n, () => de()));
		A.push(Wu(i, () => {
			n.generationActive = !0;
		}));
		for (let e of [a, o]) A.push(Wu(e, () => {
			n.generationActive = !1, de();
		}));
		A.push(Wu(s, () => _.apply())), A.push(Wu(r, () => {
			let e = n.charId;
			B(), e !== n.charId && he();
		}));
	}
	function me() {
		let e = l.state.moodGroups;
		s = e && e.length ? Fu(e) : Iu();
	}
	async function he() {
		a = c(), n.nativeAvailable = i, o = u(), n.ready = await a.isReady(), await l.load(), me(), await L(), d.apply(), o.clearCache(), g.refresh(), g.hydrateAll();
	}
	return {
		state: n,
		config: l,
		async acquire() {
			j += 1, !(j > 1) && (B(), n.ready = await a.isReady(), await l.load(), me(), I() || await L(), re(), _.apply(), console.info(`[BubbleDialogue] 运行时已就绪：后端 ${n.backend}、当前范围 ${n.mode}、头像 ${n.avatarCount}`), f?.(), f = l.subscribe(() => {
				d.apply();
				let e = JSON.stringify(l.state.moodGroups);
				e !== p && (p = e, me(), _.invalidate(), _.apply());
				let t = String(l.state.style.style_textColorMode ?? "global");
				t !== m && (m = t, g.refresh(), g.hydrateAll());
			}), d.apply(), pe(), fe(), g.hydrateAll(), n.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length);
		},
		async release() {
			if (j = Math.max(0, j - 1), !(j > 0)) {
				for (let e of A.splice(0)) e();
				ee &&= (ee.disconnect(), null), k !== null && (window.clearTimeout(k), k = null), _.dispose(), f?.(), f = null, d.dispose(), h.dispose(), o.clearCache(), n.injected = !1;
			}
		},
		hydrateNow() {
			g.hydrateAll(), n.bubbleCount = document.querySelectorAll(".yq-bubble, .custom-yq-bubble").length;
		},
		refreshAvatars() {
			o.clearCache(), g.refresh(), g.hydrateAll();
		},
		reinject() {
			_.invalidate(), _.apply();
		},
		async setMode(e) {
			e !== n.mode && (n.mode = e, await he());
		},
		addAvatar: (e, t) => ae(e, t, !1),
		async replaceAvatar(e, t) {
			await ae(e, t, !0);
		},
		async renameAvatar(e, t) {
			let r = String(t ?? "").trim();
			if (!r) throw Error("新名字不能为空");
			if (r === e) return;
			if (await a.getAvatar(r)) throw Error(`名字「${r}」已被占用`);
			let i = await a.getAvatar(e);
			if (!i) throw Error(`头像「${e}」不存在`);
			n.busy = !0;
			try {
				i.imageBlob && await a.putAvatar(r, i.imageBlob, {
					fileName: i.fileName,
					mimeType: i.mimeType,
					width: i.width,
					height: i.height,
					sourceUrl: i.sourceUrl
				});
				let t = await a.listMoodAvatars(), o = [...new Set(t.filter((t) => String(t.alias ?? t.name ?? "") === e).map((e) => String(e.moodId ?? "")).filter(Boolean))], s = 0;
				if (await Dl(o, Df, async (t) => {
					try {
						let n = await a.getMoodAvatar(e, t);
						if (!n?.imageBlob) return;
						await a.putMoodAvatar(r, t, n.imageBlob, {
							fileName: n.fileName,
							mimeType: n.mimeType,
							width: n.width,
							height: n.height,
							sourceUrl: n.sourceUrl
						});
					} catch (n) {
						s += 1, console.warn(`[BubbleDialogue] rename mood avatar failed: ${e} → ${r} / ${t}`, n);
					}
				}), s) throw Error(`有 ${s} 条差分复制失败，已中止（原头像未改动）`);
				let c = await ce(Hl(n.charId, e));
				c && (await a.setConfig(Hl(n.charId, r), c), await a.setConfig(Hl(n.charId, e), null)), await z(e), n.lastResult = `已重命名「${e}」→「${r}」`;
			} finally {
				n.busy = !1;
			}
		},
		async setAvatarColor(e, t) {
			let r = se(e);
			try {
				await a.setConfig(Hl(n.charId, e), t), t ? oe.set(r, t) : oe.delete(r), n.avatarColors = Object.fromEntries(oe), g.refresh(), g.hydrateAll(), n.lastResult = t ? `已设置「${e}」的正文颜色（需把「正文美化 → 文字颜色」切到「按角色」才生效）` : `已清除「${e}」的正文颜色`;
			} catch (e) {
				n.lastResult = `设置颜色失败：${e instanceof Error ? e.message : String(e)}`;
			}
		},
		deleteAvatar: z,
		async getAvatarPreviewUrl(e) {
			try {
				let t = await a.getAvatar(e);
				return t?.imageBlob ? URL.createObjectURL(t.imageBlob) : null;
			} catch {
				return null;
			}
		},
		async getAvatarVariants(e) {
			try {
				return (await S()).filter((t) => String(t.alias ?? "") === e).map((e) => {
					let t = String(e.moodId ?? ""), n = Af(t), r = null;
					if (e.imageBlob) try {
						r = URL.createObjectURL(e.imageBlob);
					} catch {
						r = null;
					}
					return {
						moodId: t,
						...n,
						previewUrl: r
					};
				}).filter((e) => e.moodId);
			} catch {
				return [];
			}
		},
		async getMoodVariantPreviewUrl(e, t) {
			try {
				let n = await a.getMoodAvatar(e, t);
				return n?.imageBlob ? URL.createObjectURL(n.imageBlob) : null;
			} catch {
				return null;
			}
		},
		async listCgGroups() {
			let e = P(), t = T.get(e);
			if (t) return t;
			let n = E.get(e);
			if (n) return n;
			let r = a.listCgGroups();
			E.set(e, r);
			try {
				let t = await r;
				return T.set(e, t), t;
			} catch {
				return [];
			} finally {
				E.delete(e);
			}
		},
		async listCgImages(e) {
			try {
				return await a.listCgImages(e);
			} catch {
				return [];
			}
		},
		async getCgImagePreviewUrl(e, t) {
			try {
				let n = await a.getCgImageBlob(e, t);
				return n ? URL.createObjectURL(n) : null;
			} catch {
				return null;
			}
		},
		async exportZip() {
			n.busy = !0, n.progress = {
				done: 0,
				total: 0
			};
			try {
				let e = r(), t = await Tf({
					library: a,
					charId: e.charId ?? "_global_",
					charName: e.mode === "character" ? n.charName || "未命名" : "全局",
					colors: { ...n.avatarColors },
					onProgress: (e, t) => {
						n.progress = {
							done: e,
							total: t
						};
					}
				});
				return n.lastResult = `已导出 ${(t.length / 1024 / 1024).toFixed(1)} MB`, t;
			} finally {
				n.busy = !1, n.progress = null;
			}
		},
		async listDbScopes() {
			let e = cu({
				mode: "global",
				charId: null
			});
			try {
				return await e.listScopes();
			} catch (e) {
				return console.warn("[BubbleDialogue] list DB scopes failed.", e), [];
			}
		},
		async convertScope(t) {
			let r = e.host.api.extension?.store;
			if (!r) throw Error("宿主不支持原生扩展存储，无法转换");
			let i = t === "_global_" ? {
				mode: "global",
				charId: null
			} : {
				mode: "character",
				charId: t
			}, a = await qu({
				source: cu(i, { primaryOnly: !0 }),
				target: Pu(r, i),
				scope: i,
				configKeys: t === "_global_" ? void 0 : [],
				onProgress: (e, t) => {
					n.progress = {
						done: e,
						total: t
					};
				}
			});
			return te(t), b(t), D(t), n.backend === "native" && await he(), n.totalStatsStale = !0, console.info(`[BubbleDialogue] 转换范围 ${t}：头像 ${a.avatars}、差分 ${a.moodAvatars}、跳过 ${a.skipped}、失败 ${a.failed}`), a;
		},
		async removeDbScope(e) {
			await cu({
				mode: "global",
				charId: null
			}).clearScope(e), o.clearCache();
		},
		async convertAllAndRemove() {
			let e = await this.listDbScopes(), t = 0, r = 0;
			for (let n of e) try {
				await this.convertScope(n.charId), await this.removeDbScope(n.charId), t += 1;
			} catch (e) {
				console.warn(`[BubbleDialogue] convert scope ${n.charId} failed.`, e), r += 1;
			}
			return F(), x(), O(), await he(), n.totalStatsStale = !0, {
				scopes: e.length,
				converted: t,
				failed: r
			};
		},
		async refreshTotalStats() {
			await ie();
		},
		async removeNativeScope(t) {
			let r = e.host.api.extension?.store;
			if (!r) throw Error("宿主不支持原生扩展存储，无法删除");
			await Pu(r, t === "_global_" ? mu : {
				mode: "character",
				charId: t
			}).clearScope(t), te(t), b(t), D(t), o.clearCache(), n.backend === "native" && await he(), g.refresh(), g.hydrateAll();
			let i = n.nativeScopes.findIndex((e) => e.charId === t);
			i >= 0 && (n.nativeScopes = n.nativeScopes.map((e, t) => t === i ? {
				charId: e.charId,
				avatars: 0,
				moodAvatars: 0,
				cgImages: 0,
				bytes: 0
			} : e)), n.totalStatsStale = !0;
		},
		async refreshScopeStats() {
			await L({ force: !0 });
		},
		async importZip(e) {
			b(), n.busy = !0, n.progress = {
				done: 0,
				total: 0
			};
			try {
				let t = await Ef(a, e, (e, t) => {
					n.progress = {
						done: e,
						total: t
					};
				}, r().charId);
				return n.lastResult = `导入完成：头像 ${t.avatars}、差分 ${t.moodAvatars}、配色 ${t.colors}，跳过 ${t.skipped}`, console.info(`[BubbleDialogue] 导入 ZIP：头像 ${t.avatars}、差分 ${t.moodAvatars}、配色 ${t.colors}、跳过 ${t.skipped}`), te(), D(), await L(), n.totalStatsStale = !0, o.clearCache(), g.refresh(), g.hydrateAll(), t;
			} finally {
				n.busy = !1, n.progress = null;
			}
		}
	};
}
var Pf = /* @__PURE__ */ new WeakMap();
function Ff(e) {
	let t = Pf.get(e);
	return t || (t = Nf(e), Pf.set(e, t)), t;
}
//#endregion
//#region src/i18n/en.ts
var If = {
	"settings.title": "Creator Tools",
	"settings.description": "Enable or disable the floating assistant and individual tool modules. Changes apply immediately.",
	"settings.enableRuntime": "Enable Floating Assistant",
	"settings.enableRuntimeDesc": "Show or hide the floating bubble and tool panel.",
	"settings.appearance": "Appearance",
	"settings.appearanceDesc": "Switch the extension between its own night theme and warm white day theme.",
	"settings.appearanceNight": "Night",
	"settings.appearanceDay": "Day",
	"settings.area.bubbleDialogue": "Bubble Dialogue",
	"settings.area.characterTools": "Character Authoring",
	"settings.area.extensionDev": "Debugging & Logs",
	"settings.area.memoryDev": "Chat Memory",
	"settings.featureCount": "{n} tool(s)",
	"settings.customIcon": "Custom Bubble Icon",
	"settings.customIconDesc": "Upload an image to replace the default icon. Uploading a GIF will skip cropping.",
	"settings.transparentBg": "Hide Theme Background",
	"settings.transparentBgDesc": "When enabled, transparent images will not show the day/night theme background color.",
	"settings.uploadIcon": "Upload Image",
	"settings.removeIcon": "Restore Default",
	"panel.sidebarTitle": "Creator Tools",
	"panel.globalSettings": "Settings",
	"worldInfo.title": "World Book Monitor",
	"worldInfo.featureDesc": "Track which entries are included in each AI prompt",
	"worldInfo.description": "View which World Book entries were included in the latest AI prompt. Click any entry to jump to its definition.",
	"worldInfo.legendConstant": "Always Active",
	"worldInfo.legendActivated": "Triggered",
	"worldInfo.emptyNoBatch": "No World Book data yet. Start a conversation to see activated entries.",
	"worldInfo.emptyNoEntries": "No World Book entries were activated this time.",
	"worldInfo.factTrigger": "Source",
	"worldInfo.factCaptured": "Time",
	"worldInfo.factEntries": "Entries",
	"worldInfo.factWorldbooks": "Books",
	"worldInfo.factConstant": "Always Active",
	"worldInfo.factTriggered": "Triggered",
	"worldInfo.badgeConstant": "Always Active",
	"worldInfo.badgeActivated": "Triggered",
	"worldInfo.groupStats": "{entries} entries · {constant} always active · {activated} triggered",
	"worldInfo.bubbleTitle": "World Book ×{n}",
	"worldInfo.bubbleMessage": "{trigger} · {n} book(s)",
	"llmApi.title": "AI Request History",
	"llmApi.featureDesc": "View recent AI requests and responses",
	"llmApi.description": "Browse recent AI requests and responses. Switch between formatted and raw views.",
	"llmApi.keepLabel": "History Limit",
	"llmApi.apply": "Apply",
	"llmApi.prev": "← Older",
	"llmApi.next": "Newer →",
	"llmApi.reload": "Refresh",
	"llmApi.preview": "Formatted",
	"llmApi.raw": "Raw",
	"llmApi.copyRequest": "Copy Request",
	"llmApi.copyResponse": "Copy Response",
	"llmApi.requestCopied": "Request Copied",
	"llmApi.responseCopied": "Response Copied",
	"llmApi.requestPreview": "Request",
	"llmApi.requestRaw": "Raw Request",
	"llmApi.responsePreview": "Response",
	"llmApi.responseRaw": "Raw Response",
	"llmApi.empty": "No AI requests recorded yet.",
	"llmApi.loading": "Loading…",
	"llmApi.factStatus": "Status",
	"llmApi.factSource": "Source",
	"llmApi.factModel": "Model",
	"llmApi.factDuration": "Duration",
	"llmApi.factResponse": "Response",
	"llmApi.factTimestamp": "Timestamp",
	"devLogs.title": "Application Logs",
	"devLogs.featureDesc": "Monitor frontend and backend logs in real time",
	"devLogs.description": "Real-time logs from the frontend and backend. Errors and warnings also appear as floating notifications.",
	"devLogs.tabFrontend": "Frontend",
	"devLogs.tabBackend": "Backend",
	"devLogs.filterPlaceholder": "Search logs…",
	"devLogs.captureConsole": "Capture browser console",
	"devLogs.copyVisible": "Copy Visible",
	"devLogs.copied": "Copied",
	"devLogs.clearView": "Clear",
	"devLogs.emptyFiltered": "No logs match the current filter.",
	"devLogs.emptyNone": "No logs yet.",
	"devLogs.summaryLine": "{total} entries · {warnings} warnings · {errors} errors",
	"devLogs.bubbleFrontendWarn": "Frontend Warning",
	"devLogs.bubbleFrontendError": "Frontend Error",
	"devLogs.bubbleBackendWarn": "Backend Warning",
	"devLogs.bubbleBackendError": "Backend Error",
	"chatLab.title": "Chat Memory Search",
	"chatLab.featureDesc": "Look up messages by content or metadata",
	"chatLab.description": "Look up messages in the current conversation by content or metadata. Useful for testing memory and recall logic.",
	"chatLab.refreshContext": "Refresh",
	"chatLab.contextEmpty": "Open a character or group chat to get started.",
	"chatLab.tabFindLast": "Find Last Message",
	"chatLab.tabSearch": "Search Messages",
	"chatLab.findLastTitle": "Find Last Message",
	"chatLab.findLastDesc": "Find the most recent message matching a role and custom metadata keys.",
	"chatLab.fieldExtraKeys": "Custom Keys",
	"chatLab.fieldRole": "Role",
	"chatLab.fieldLimit": "Limit",
	"chatLab.fieldQuery": "Keyword",
	"chatLab.fieldQueryPlaceholder": "Enter search keyword…",
	"chatLab.btnLocate": "Find",
	"chatLab.btnSearch": "Search",
	"chatLab.searchTitle": "Search Messages",
	"chatLab.searchDesc": "Search message content with optional role filter and result limit.",
	"chatLab.resultsTitle": "Results",
	"chatLab.resultsDesc": "Switch between formatted output and raw JSON.",
	"chatLab.viewPretty": "Formatted",
	"chatLab.viewRaw": "Raw JSON",
	"chatLab.copyJson": "Copy JSON",
	"chatLab.jsonCopied": "Copied",
	"chatLab.stateLoading": "Searching…",
	"chatLab.stateEmpty": "Run a query to see results here.",
	"chatLab.errorNoChat": "Please open a character or group chat first.",
	"chatLab.noResult": "No matching messages found.",
	"chatLab.roleAny": "Any",
	"chatLab.roleUser": "User",
	"chatLab.roleAssistant": "Assistant",
	"chatLab.roleSystem": "System",
	"chatLab.factMode": "Mode",
	"chatLab.factKind": "Type",
	"chatLab.factChat": "Chat",
	"chatLab.factWindow": "Range",
	"chatLab.windowEmpty": "No messages loaded",
	"chatLab.chatUnavailable": "Not available",
	"bubbleRender.loadingStats": "Calculating statistics…",
	"bubbleRender.loadingConfig": "Loading settings…",
	"bubbleRender.loadingThumbs": "Loading thumbnails…",
	"bubbleRender.loadingVariants": "Loading mood variants…",
	"bubbleRender.loadingCg": "Loading CG library…",
	"bubbleRender.panelLegacy": "Original DB",
	"bubbleRender.panelNative": "TauriTavern native",
	"bubbleRender.dbScopesTitle": "Database usage by scope",
	"bubbleRender.nativeScopesHint": "Native storage can only reach \"global + current character card\"; press Refresh statistics to rescan.",
	"bubbleRender.colCgCount": "CG images",
	"bubbleRender.btnRescan": "Rescan",
	"bubbleRender.scanDb": "Scanning database…",
	"bubbleRender.noDbData": "No legacy database data found.",
	"bubbleRender.colScope": "Scope",
	"bubbleRender.colSize": "Size",
	"bubbleRender.statsTitle": "Statistics",
	"bubbleRender.statsAllScopesHint": "All scopes combined; does not change when you switch library scope.",
	"bubbleRender.totalAvatars": "Avatars (all)",
	"bubbleRender.totalMoodAvatars": "Mood variants (all)",
	"bubbleRender.totalCgImages": "CG images (all)",
	"bubbleRender.totalStorageSize": "Total size (all)",
	"bubbleRender.btnRefreshStats": "Refresh statistics",
	"bubbleRender.btnRefreshScopeStats": "Refresh current scope",
	"bubbleRender.statsUnavailable": "Native extension store unavailable; statistics cannot be read.",
	"bubbleRender.statsStaleHint": "Data has changed. Click “Refresh statistics” to recalculate.",
	"bubbleRender.scopeGlobal": "Global (shared)",
	"bubbleRender.btnConvert": "Convert",
	"bubbleRender.converting": "Converting…",
	"bubbleRender.btnConfirm": "Confirm",
	"bubbleRender.btnConvertAllRemove": "Convert all & delete",
	"bubbleRender.convertUnavailable": "The native extension store is unavailable, conversion is disabled.",
	"bubbleRender.convertDone": "Converted {scope}: {a} avatars, {m} mood variants",
	"bubbleRender.deleteScopeDone": "Deleted {scope}",
	"bubbleRender.convertAllDone": "Converted {n} scope(s), {f} failed",
	"bubbleRender.dbHint": "Conversion copies data into the native store and keeps the source until you delete it. Deleting is irreversible.",
	"bubbleRender.transferring": "Processing…",
	"bubbleRender.loading": "Loading…",
	"bubbleRender.previewHint": "Click a variant on the left to preview it here.",
	"bubbleRender.addWordPlaceholder": "Add word...",
	"bubbleRender.avatarCount": "Avatars",
	"bubbleRender.btnExport": "Export ZIP",
	"bubbleRender.btnImport": "Import ZIP",
	"bubbleRender.btnResetFormat": "Restore default format",
	"bubbleRender.btnResetMoods": "Restore default moods",
	"bubbleRender.btnResetStyle": "Restore defaults",
	"bubbleRender.btnSave": "Save",
	"bubbleRender.colorCharacter": "Follow character theme color",
	"bubbleRender.colorGlobal": "Global unified color",
	"bubbleRender.compressEnabled": "Auto-compress images (to WebP)",
	"bubbleRender.currentChar": "Current character",
	"bubbleRender.emptyAvatars": "No avatars in this library yet.",
	"bubbleRender.fontDefault": "(default)",
	"bubbleRender.formatRuleWarn": "Changing the format rule may break AI output format. If anything goes wrong, restore the default.",
	"bubbleRender.mdBasic": "Basic (bold / italic / strike)",
	"bubbleRender.mdFull": "Full (all syntax)",
	"bubbleRender.mode": "Library scope",
	"bubbleRender.modeCharacter": "Per character",
	"bubbleRender.modeGlobal": "Global (shared)",
	"bubbleRender.moodCount": "Mood variants",
	"bubbleRender.no": "No",
	"bubbleRender.searchPlaceholder": "Search avatar name...",
	"bubbleRender.secColor": "Color",
	"bubbleRender.secFont": "Fonts",
	"bubbleRender.secFormatRule": "Format rule",
	"bubbleRender.secLayout": "Layout",
	"bubbleRender.secMarkdown": "Markdown rendering",
	"bubbleRender.secMoodWords": "Mood words",
	"bubbleRender.secStorage": "Storage optimization",
	"bubbleRender.secText": "Text",
	"bubbleRender.sectionRuntime": "Runtime",
	"bubbleRender.shape_circle": "Circle",
	"bubbleRender.shape_rounded": "Rounded",
	"bubbleRender.shape_square": "Square",
	"bubbleRender.statBubbles": "Bubbles",
	"bubbleRender.statInjected": "Prompt injected",
	"bubbleRender.statReady": "Library ready",
	"bubbleRender.style_avatarShape": "Avatar shape",
	"bubbleRender.style_avatarSize": "Avatar size",
	"bubbleRender.style_compressQuality": "Compression quality",
	"bubbleRender.style_dialogueFont": "Dialogue font size",
	"bubbleRender.style_dialogueSpacing": "Dialogue line spacing",
	"bubbleRender.style_dialogueWeight": "Dialogue weight",
	"bubbleRender.style_nameFont": "Character name font",
	"bubbleRender.style_nameWeight": "Name weight",
	"bubbleRender.style_narrationBgColor": "Narration background",
	"bubbleRender.style_narrationBgOpacity": "Narration bg opacity",
	"bubbleRender.style_narrationFont": "Narration font size",
	"bubbleRender.style_narrationIndent": "Narration left indent",
	"bubbleRender.style_narrationLineHeight": "Narration line height",
	"bubbleRender.style_narrationPaddingRight": "Narration right padding",
	"bubbleRender.style_narrationRadius": "Narration corner radius",
	"bubbleRender.style_narrationTextIndent": "Narration first-line indent",
	"bubbleRender.style_narrationWeight": "Narration weight",
	"bubbleRender.style_thoughtGap": "Thought suffix gap",
	"bubbleRender.style_thoughtOffsetY": "Thought suffix offset",
	"bubbleRender.uploadHint": "Click or drop an image here to upload",
	"bubbleRender.uploadSub": "JPG / PNG / GIF / WebP",
	"bubbleRender.namePlaceholder": "Character name",
	"bubbleRender.btnCancel": "Cancel",
	"bubbleRender.btnConfirmAdd": "Confirm",
	"bubbleRender.btnDelete": "Delete",
	"bubbleRender.btnColor": "Text color for this name",
	"bubbleRender.btnReplace": "Replace default avatar",
	"bubbleRender.btnRename": "Rename",
	"bubbleRender.deleting": "Deleting…",
	"bubbleRender.errNotImage": "Please choose an image file",
	"bubbleRender.errNoName": "Name cannot be empty",
	"bubbleRender.pageAvatar": "Avatars",
	"bubbleRender.pageAvatarDesc": "Manage avatars and inspect mood variants and CG images",
	"bubbleRender.pageStyle": "Text Style",
	"bubbleRender.pageStyleDesc": "Adjust fonts, colors and layout for dialogue bubbles",
	"bubbleRender.pageMood": "Mood",
	"bubbleRender.pageMoodDesc": "Edit the format rule and mood word groups",
	"bubbleRender.pageStorage": "Storage",
	"bubbleRender.pageStorageDesc": "Storage backend, transfer and runtime status",
	"bubbleRender.noCardTag": "no character card",
	"bubbleRender.noCardHint": "Open a character card to use per-character storage",
	"bubbleRender.detailEmpty": "Select an avatar on the left to see its mood variants and CG images.",
	"bubbleRender.backToList": "Back to list",
	"bubbleRender.variantCount": "{n} mood variants",
	"bubbleRender.secVariants": "Mood variants",
	"bubbleRender.noVariants": "This avatar has no mood variants yet.",
	"bubbleRender.secCg": "CG library",
	"bubbleRender.noCg": "No CG groups in this scope.",
	"bubbleRender.btnLoadCg": "Reload",
	"bubbleRender.totalSize": "Total size",
	"bubbleRender.yes": "Yes",
	"bubbleRender.ioScope": "Import / export scope: {scope}",
	"logs.pageTitle": "Logs",
	"logs.pageDesc": "Record and inspect this extension's own logs",
	"logs.start": "Start recording",
	"logs.stop": "Stop recording",
	"logs.clear": "Clear",
	"logs.statusRecording": "Recording · {n} entries",
	"logs.statusStopped": "Stopped · {n} entries kept",
	"logs.empty": "No logs yet. Press \"Start recording\".",
	"logs.hint": "Shows only this extension ([BubbleDialogue]). Starting also turns on the host console capture switch (same switch as the host dev panel) and restores it when you stop.",
	"logs.unavailable": "The current client does not provide the log API.",
	"common.loading": "Loading…",
	"common.loaded": "Loaded",
	"common.expandView": "Expand view",
	"common.close": "Close",
	"common.apply": "Apply",
	"common.unknownModel": "Unknown"
}, Lf = {
	"settings.title": "创作者工具",
	"settings.description": "启用或关闭悬浮助手和各个工具模块。更改立即生效。",
	"settings.enableRuntime": "启用悬浮助手",
	"settings.enableRuntimeDesc": "显示或隐藏悬浮气泡与工具面板。",
	"settings.appearance": "外观",
	"settings.appearanceDesc": "切换扩展的夜间主题与日间主题。",
	"settings.appearanceNight": "夜间",
	"settings.appearanceDay": "日间",
	"settings.area.bubbleDialogue": "对话气泡",
	"settings.area.characterTools": "角色卡编写",
	"settings.area.extensionDev": "调试与日志",
	"settings.area.memoryDev": "聊天记忆",
	"settings.featureCount": "{n} 个工具",
	"settings.customIcon": "自定义悬浮球图标",
	"settings.customIconDesc": "上传图片替换默认图标。上传动图将跳过裁剪。",
	"settings.transparentBg": "隐藏主题底色",
	"settings.transparentBgDesc": "开启后，透明图片将不会透出日夜模式的主题底色。",
	"settings.uploadIcon": "上传图片",
	"settings.removeIcon": "恢复默认",
	"panel.sidebarTitle": "创作者工具",
	"panel.globalSettings": "设置",
	"worldInfo.title": "世界书监视器",
	"worldInfo.featureDesc": "追踪每次 AI 提示词中包含了哪些条目",
	"worldInfo.description": "查看最近一次 AI 提示词中包含了哪些世界书条目。点击任意条目可跳转到对应定义。",
	"worldInfo.legendConstant": "常驻",
	"worldInfo.legendActivated": "被触发",
	"worldInfo.emptyNoBatch": "暂无世界书数据。开始对话后将显示被激活的条目。",
	"worldInfo.emptyNoEntries": "本次没有世界书条目被激活。",
	"worldInfo.factTrigger": "来源",
	"worldInfo.factCaptured": "时间",
	"worldInfo.factEntries": "条目数",
	"worldInfo.factWorldbooks": "世界书数",
	"worldInfo.factConstant": "常驻",
	"worldInfo.factTriggered": "被触发",
	"worldInfo.badgeConstant": "常驻",
	"worldInfo.badgeActivated": "被触发",
	"worldInfo.groupStats": "{entries} 个条目 · {constant} 个常驻 · {activated} 个被触发",
	"worldInfo.bubbleTitle": "世界书 ×{n}",
	"worldInfo.bubbleMessage": "{trigger} · {n} 本世界书",
	"llmApi.title": "AI 请求记录",
	"llmApi.featureDesc": "查看最近的 AI 请求与回复",
	"llmApi.description": "浏览最近的 AI 请求与回复。可切换格式化视图和原始数据。",
	"llmApi.keepLabel": "保留条数",
	"llmApi.apply": "应用",
	"llmApi.prev": "← 更早",
	"llmApi.next": "更新 →",
	"llmApi.reload": "刷新",
	"llmApi.preview": "格式化",
	"llmApi.raw": "原始数据",
	"llmApi.copyRequest": "复制请求",
	"llmApi.copyResponse": "复制回复",
	"llmApi.requestCopied": "已复制请求",
	"llmApi.responseCopied": "已复制回复",
	"llmApi.requestPreview": "请求",
	"llmApi.requestRaw": "原始请求",
	"llmApi.responsePreview": "回复",
	"llmApi.responseRaw": "原始回复",
	"llmApi.empty": "暂无 AI 请求记录。",
	"llmApi.loading": "加载中…",
	"llmApi.factStatus": "状态",
	"llmApi.factSource": "来源",
	"llmApi.factModel": "模型",
	"llmApi.factDuration": "耗时",
	"llmApi.factResponse": "响应",
	"llmApi.factTimestamp": "时间",
	"devLogs.title": "应用日志",
	"devLogs.featureDesc": "实时监控前端与后端日志",
	"devLogs.description": "前端与后端的实时日志。错误和警告也会以浮动通知显示。",
	"devLogs.tabFrontend": "前端",
	"devLogs.tabBackend": "后端",
	"devLogs.filterPlaceholder": "搜索日志…",
	"devLogs.captureConsole": "捕获浏览器控制台",
	"devLogs.copyVisible": "复制可见内容",
	"devLogs.copied": "已复制",
	"devLogs.clearView": "清空",
	"devLogs.emptyFiltered": "没有日志匹配当前筛选条件。",
	"devLogs.emptyNone": "暂无日志。",
	"devLogs.summaryLine": "{total} 条记录 · {warnings} 条警告 · {errors} 条错误",
	"devLogs.bubbleFrontendWarn": "前端警告",
	"devLogs.bubbleFrontendError": "前端错误",
	"devLogs.bubbleBackendWarn": "后端警告",
	"devLogs.bubbleBackendError": "后端错误",
	"chatLab.title": "聊天记忆搜索",
	"chatLab.featureDesc": "按内容或元数据查找消息",
	"chatLab.description": "按内容或元数据查找当前对话中的消息。适用于测试记忆与检索逻辑。",
	"chatLab.refreshContext": "刷新",
	"chatLab.contextEmpty": "请先打开一个角色或群组对话。",
	"chatLab.tabFindLast": "查找最新消息",
	"chatLab.tabSearch": "搜索消息",
	"chatLab.findLastTitle": "查找最新消息",
	"chatLab.findLastDesc": "查找符合角色与自定义元数据键的最新消息。",
	"chatLab.fieldExtraKeys": "自定义键",
	"chatLab.fieldRole": "角色",
	"chatLab.fieldLimit": "数量上限",
	"chatLab.fieldQuery": "关键词",
	"chatLab.fieldQueryPlaceholder": "输入搜索关键词…",
	"chatLab.btnLocate": "查找",
	"chatLab.btnSearch": "搜索",
	"chatLab.searchTitle": "搜索消息",
	"chatLab.searchDesc": "按关键词搜索消息内容，可选角色筛选和数量限制。",
	"chatLab.resultsTitle": "结果",
	"chatLab.resultsDesc": "可在格式化输出和原始 JSON 之间切换。",
	"chatLab.viewPretty": "格式化",
	"chatLab.viewRaw": "原始 JSON",
	"chatLab.copyJson": "复制 JSON",
	"chatLab.jsonCopied": "已复制",
	"chatLab.stateLoading": "搜索中…",
	"chatLab.stateEmpty": "执行查询后结果将显示在此处。",
	"chatLab.errorNoChat": "请先打开一个角色或群组对话。",
	"chatLab.noResult": "未找到匹配的消息。",
	"chatLab.roleAny": "全部",
	"chatLab.roleUser": "用户",
	"chatLab.roleAssistant": "助手",
	"chatLab.roleSystem": "系统",
	"chatLab.factMode": "模式",
	"chatLab.factKind": "类型",
	"chatLab.factChat": "对话",
	"chatLab.factWindow": "范围",
	"chatLab.windowEmpty": "未加载消息",
	"chatLab.chatUnavailable": "不可用",
	"bubbleRender.loadingStats": "正在统计…",
	"bubbleRender.loadingConfig": "正在加载配置…",
	"bubbleRender.loadingThumbs": "正在加载缩略图…",
	"bubbleRender.loadingVariants": "正在加载情绪差分…",
	"bubbleRender.loadingCg": "正在加载 CG 图库…",
	"bubbleRender.panelLegacy": "原版 DB",
	"bubbleRender.panelNative": "TT 原生",
	"bubbleRender.dbScopesTitle": "各范围占用统计",
	"bubbleRender.nativeScopesHint": "原生存储只能触达「全局 + 当前角色卡」两个范围；数据变动后点「刷新统计」重新扫描。",
	"bubbleRender.colCgCount": "CG 图",
	"bubbleRender.btnRescan": "重新扫描",
	"bubbleRender.scanDb": "正在扫描数据库…",
	"bubbleRender.noDbData": "未发现原版数据库数据。",
	"bubbleRender.colScope": "范围",
	"bubbleRender.colSize": "大小",
	"bubbleRender.statsTitle": "统计数据",
	"bubbleRender.statsAllScopesHint": "汇总所有范围，切换库范围不会改变这里的数字。",
	"bubbleRender.totalAvatars": "头像数（全部）",
	"bubbleRender.totalMoodAvatars": "情绪差分（全部）",
	"bubbleRender.totalCgImages": "CG 图片（全部）",
	"bubbleRender.totalStorageSize": "总大小（全部）",
	"bubbleRender.btnRefreshStats": "刷新统计",
	"bubbleRender.btnRefreshScopeStats": "重新加载本范围",
	"bubbleRender.statsUnavailable": "原生扩展存储不可用，无法读取统计。",
	"bubbleRender.statsStaleHint": "数据已变动，点「刷新统计」重新计算。",
	"bubbleRender.scopeGlobal": "全局（共用）",
	"bubbleRender.btnConvert": "转换",
	"bubbleRender.converting": "转换中…",
	"bubbleRender.btnConfirm": "确认",
	"bubbleRender.btnConvertAllRemove": "一键转换并删除",
	"bubbleRender.convertUnavailable": "原生扩展存储不可用，已禁用转换。",
	"bubbleRender.convertDone": "已转换 {scope}：头像 {a}、差分 {m}",
	"bubbleRender.deleteScopeDone": "已删除 {scope}",
	"bubbleRender.convertAllDone": "已转换 {n} 个范围，失败 {f} 个",
	"bubbleRender.dbHint": "转换会把数据复制到原生存储；源数据会保留，直到你手动删除。删除不可撤销。",
	"bubbleRender.transferring": "处理中…",
	"bubbleRender.loading": "加载中…",
	"bubbleRender.previewHint": "点击左侧的差分头像，这里会显示大图。",
	"bubbleRender.addWordPlaceholder": "添加词…",
	"bubbleRender.avatarCount": "头像数",
	"bubbleRender.btnExport": "导出 ZIP",
	"bubbleRender.btnImport": "导入 ZIP",
	"bubbleRender.btnResetFormat": "恢复默认格式",
	"bubbleRender.btnResetMoods": "恢复默认情绪词",
	"bubbleRender.btnResetStyle": "恢复默认",
	"bubbleRender.btnSave": "保存",
	"bubbleRender.colorCharacter": "跟随角色主题色",
	"bubbleRender.colorGlobal": "全局统一色",
	"bubbleRender.compressEnabled": "自动压缩图片（存储前转为 WebP）",
	"bubbleRender.currentChar": "当前角色卡",
	"bubbleRender.emptyAvatars": "当前库还没有头像。",
	"bubbleRender.fontDefault": "（默认）",
	"bubbleRender.formatRuleWarn": "修改格式规则可能导致 AI 输出格式异常，请谨慎编辑。如遇问题，点击「恢复默认格式」还原。",
	"bubbleRender.mdBasic": "基础（粗体 / 斜体 / 删除线）",
	"bubbleRender.mdFull": "完整（全部语法）",
	"bubbleRender.mode": "库范围",
	"bubbleRender.modeCharacter": "按角色卡",
	"bubbleRender.modeGlobal": "全局（共用）",
	"bubbleRender.moodCount": "情绪差分",
	"bubbleRender.no": "否",
	"bubbleRender.searchPlaceholder": "搜索头像名…",
	"bubbleRender.secColor": "颜色",
	"bubbleRender.secFont": "字体",
	"bubbleRender.secFormatRule": "格式规则",
	"bubbleRender.secLayout": "布局",
	"bubbleRender.secMarkdown": "Markdown 渲染",
	"bubbleRender.secMoodWords": "情绪词配置",
	"bubbleRender.secStorage": "存储优化",
	"bubbleRender.secText": "文字",
	"bubbleRender.sectionRuntime": "运行状态",
	"bubbleRender.shape_circle": "圆形",
	"bubbleRender.shape_rounded": "方形圆角",
	"bubbleRender.shape_square": "方形",
	"bubbleRender.statBubbles": "气泡数",
	"bubbleRender.statInjected": "提示词已注入",
	"bubbleRender.statReady": "头像库就绪",
	"bubbleRender.style_avatarShape": "头像形状",
	"bubbleRender.style_avatarSize": "头像大小",
	"bubbleRender.style_compressQuality": "压缩质量",
	"bubbleRender.style_dialogueFont": "台词字号",
	"bubbleRender.style_dialogueSpacing": "台词行距",
	"bubbleRender.style_dialogueWeight": "台词字重",
	"bubbleRender.style_nameFont": "角色名字体",
	"bubbleRender.style_nameWeight": "角色名字重",
	"bubbleRender.style_narrationBgColor": "旁白背景色",
	"bubbleRender.style_narrationBgOpacity": "旁白透明度",
	"bubbleRender.style_narrationFont": "旁白字号",
	"bubbleRender.style_narrationIndent": "旁白左侧留白",
	"bubbleRender.style_narrationLineHeight": "旁白行距",
	"bubbleRender.style_narrationPaddingRight": "旁白右边距",
	"bubbleRender.style_narrationRadius": "旁白圆角",
	"bubbleRender.style_narrationTextIndent": "旁白首行缩进",
	"bubbleRender.style_narrationWeight": "旁白字重",
	"bubbleRender.style_thoughtGap": "心里话尾符间距",
	"bubbleRender.style_thoughtOffsetY": "心里话尾符偏移",
	"bubbleRender.uploadHint": "点击或拖拽图片到此处上传",
	"bubbleRender.uploadSub": "支持 JPG / PNG / GIF / WebP",
	"bubbleRender.namePlaceholder": "角色名",
	"bubbleRender.btnCancel": "取消",
	"bubbleRender.btnConfirmAdd": "确认添加",
	"bubbleRender.btnDelete": "删除",
	"bubbleRender.btnColor": "修改这个名字的正文颜色",
	"bubbleRender.btnReplace": "替换默认头像",
	"bubbleRender.btnRename": "重命名",
	"bubbleRender.deleting": "删除中…",
	"bubbleRender.errNotImage": "请选择图片文件",
	"bubbleRender.errNoName": "名字不能为空",
	"bubbleRender.pageAvatar": "头像管理",
	"bubbleRender.pageAvatarDesc": "管理头像，查看情绪差分与 CG 图片",
	"bubbleRender.pageStyle": "正文美化",
	"bubbleRender.pageStyleDesc": "调整气泡的字体、颜色与布局",
	"bubbleRender.pageMood": "情绪配置",
	"bubbleRender.pageMoodDesc": "编辑格式规则与情绪词组",
	"bubbleRender.pageStorage": "存储",
	"bubbleRender.pageStorageDesc": "存储后端、导入导出与运行状态",
	"bubbleRender.noCardTag": "未打开角色卡",
	"bubbleRender.noCardHint": "打开一张角色卡后才能使用按角色卡存储",
	"bubbleRender.detailEmpty": "点击左侧头像，这里会显示它的情绪差分和 CG 图片。",
	"bubbleRender.backToList": "返回列表",
	"bubbleRender.variantCount": "{n} 个情绪差分",
	"bubbleRender.secVariants": "情绪差分",
	"bubbleRender.noVariants": "这个头像还没有情绪差分。",
	"bubbleRender.secCg": "CG 图片库",
	"bubbleRender.noCg": "当前范围没有 CG 组。",
	"bubbleRender.btnLoadCg": "重新加载",
	"bubbleRender.totalSize": "总大小",
	"bubbleRender.yes": "是",
	"bubbleRender.ioScope": "导入 / 导出范围：{scope}",
	"logs.pageTitle": "日志",
	"logs.pageDesc": "记录并查看本扩展自己的日志",
	"logs.start": "开启记录",
	"logs.stop": "停止记录",
	"logs.clear": "清空",
	"logs.statusRecording": "记录中 · 已记录 {n} 条",
	"logs.statusStopped": "已停止 · 保留 {n} 条",
	"logs.empty": "还没有日志。点「开启记录」开始。",
	"logs.hint": "只显示本扩展（[BubbleDialogue]）的日志。开启时会同时打开宿主的控制台记录开关（与宿主开发者面板是同一个开关），停止时恢复原状态。",
	"logs.unavailable": "当前客户端没有提供日志接口。",
	"common.loading": "加载中…",
	"common.loaded": "加载完成",
	"common.expandView": "展开查看",
	"common.close": "关闭",
	"common.apply": "应用",
	"common.unknownModel": "未知"
}, Rf = {
	"settings.title": "創作者工具",
	"settings.description": "啟用或關閉懸浮助手和各個工具模組。變更立即生效。",
	"settings.enableRuntime": "啟用懸浮助手",
	"settings.enableRuntimeDesc": "顯示或隱藏懸浮氣泡與工具面板。",
	"settings.appearance": "外觀",
	"settings.appearanceDesc": "切換擴充套件的夜間主題與日間主題。",
	"settings.appearanceNight": "夜間",
	"settings.appearanceDay": "日間",
	"settings.area.bubbleDialogue": "對話氣泡",
	"settings.area.characterTools": "角色卡編寫",
	"settings.area.extensionDev": "偵錯與日誌",
	"settings.area.memoryDev": "聊天記憶",
	"settings.featureCount": "{n} 個工具",
	"settings.customIcon": "自訂懸浮球圖示",
	"settings.customIconDesc": "上傳圖片替換預設圖示。上傳動圖將跳過裁剪。",
	"settings.transparentBg": "隱藏主題底色",
	"settings.transparentBgDesc": "開啟後，透明圖片將不會透出日夜模式的主題底色。",
	"settings.uploadIcon": "上傳圖片",
	"settings.removeIcon": "恢復預設",
	"panel.sidebarTitle": "創作者工具",
	"panel.globalSettings": "設定",
	"worldInfo.title": "世界書監視器",
	"worldInfo.featureDesc": "追蹤每次 AI 提示詞中包含了哪些條目",
	"worldInfo.description": "查看最近一次 AI 提示詞中包含了哪些世界書條目。點擊任意條目可跳轉到對應定義。",
	"worldInfo.legendConstant": "常駐",
	"worldInfo.legendActivated": "被觸發",
	"worldInfo.emptyNoBatch": "暫無世界書資料。開始對話後將顯示被啟用的條目。",
	"worldInfo.emptyNoEntries": "本次沒有世界書條目被啟用。",
	"worldInfo.factTrigger": "來源",
	"worldInfo.factCaptured": "時間",
	"worldInfo.factEntries": "條目數",
	"worldInfo.factWorldbooks": "世界書數",
	"worldInfo.factConstant": "常駐",
	"worldInfo.factTriggered": "被觸發",
	"worldInfo.badgeConstant": "常駐",
	"worldInfo.badgeActivated": "被觸發",
	"worldInfo.groupStats": "{entries} 個條目 · {constant} 個常駐 · {activated} 個被觸發",
	"worldInfo.bubbleTitle": "世界書 ×{n}",
	"worldInfo.bubbleMessage": "{trigger} · {n} 本世界書",
	"llmApi.title": "AI 請求記錄",
	"llmApi.featureDesc": "查看最近的 AI 請求與回覆",
	"llmApi.description": "瀏覽最近的 AI 請求與回覆。可切換格式化檢視和原始資料。",
	"llmApi.keepLabel": "保留筆數",
	"llmApi.apply": "套用",
	"llmApi.prev": "← 更早",
	"llmApi.next": "更新 →",
	"llmApi.reload": "重新整理",
	"llmApi.preview": "格式化",
	"llmApi.raw": "原始資料",
	"llmApi.copyRequest": "複製請求",
	"llmApi.copyResponse": "複製回覆",
	"llmApi.requestCopied": "已複製請求",
	"llmApi.responseCopied": "已複製回覆",
	"llmApi.requestPreview": "請求",
	"llmApi.requestRaw": "原始請求",
	"llmApi.responsePreview": "回覆",
	"llmApi.responseRaw": "原始回覆",
	"llmApi.empty": "暫無 AI 請求記錄。",
	"llmApi.loading": "載入中…",
	"llmApi.factStatus": "狀態",
	"llmApi.factSource": "來源",
	"llmApi.factModel": "模型",
	"llmApi.factDuration": "耗時",
	"llmApi.factResponse": "回應",
	"llmApi.factTimestamp": "時間",
	"devLogs.title": "應用程式日誌",
	"devLogs.featureDesc": "即時監控前端與後端日誌",
	"devLogs.description": "前端與後端的即時日誌。錯誤與警告也會以浮動通知顯示。",
	"devLogs.tabFrontend": "前端",
	"devLogs.tabBackend": "後端",
	"devLogs.filterPlaceholder": "搜尋日誌…",
	"devLogs.captureConsole": "擷取瀏覽器主控台",
	"devLogs.copyVisible": "複製可見內容",
	"devLogs.copied": "已複製",
	"devLogs.clearView": "清除",
	"devLogs.emptyFiltered": "沒有日誌符合目前的篩選條件。",
	"devLogs.emptyNone": "暫無日誌。",
	"devLogs.summaryLine": "{total} 筆記錄 · {warnings} 筆警告 · {errors} 筆錯誤",
	"devLogs.bubbleFrontendWarn": "前端警告",
	"devLogs.bubbleFrontendError": "前端錯誤",
	"devLogs.bubbleBackendWarn": "後端警告",
	"devLogs.bubbleBackendError": "後端錯誤",
	"chatLab.title": "聊天記憶搜尋",
	"chatLab.featureDesc": "依內容或中繼資料查找訊息",
	"chatLab.description": "依內容或中繼資料查找目前對話中的訊息。適用於測試記憶與檢索邏輯。",
	"chatLab.refreshContext": "重新整理",
	"chatLab.contextEmpty": "請先開啟一個角色或群組對話。",
	"chatLab.tabFindLast": "查找最新訊息",
	"chatLab.tabSearch": "搜尋訊息",
	"chatLab.findLastTitle": "查找最新訊息",
	"chatLab.findLastDesc": "查找符合角色與自訂中繼資料鍵的最新訊息。",
	"chatLab.fieldExtraKeys": "自訂鍵",
	"chatLab.fieldRole": "角色",
	"chatLab.fieldLimit": "數量上限",
	"chatLab.fieldQuery": "關鍵字",
	"chatLab.fieldQueryPlaceholder": "輸入搜尋關鍵字…",
	"chatLab.btnLocate": "查找",
	"chatLab.btnSearch": "搜尋",
	"chatLab.searchTitle": "搜尋訊息",
	"chatLab.searchDesc": "依關鍵字搜尋訊息內容，可選角色篩選與數量限制。",
	"chatLab.resultsTitle": "結果",
	"chatLab.resultsDesc": "可在格式化輸出與原始 JSON 之間切換。",
	"chatLab.viewPretty": "格式化",
	"chatLab.viewRaw": "原始 JSON",
	"chatLab.copyJson": "複製 JSON",
	"chatLab.jsonCopied": "已複製",
	"chatLab.stateLoading": "搜尋中…",
	"chatLab.stateEmpty": "執行查詢後結果將顯示在此處。",
	"chatLab.errorNoChat": "請先開啟一個角色或群組對話。",
	"chatLab.noResult": "未找到符合的訊息。",
	"chatLab.roleAny": "全部",
	"chatLab.roleUser": "使用者",
	"chatLab.roleAssistant": "助手",
	"chatLab.roleSystem": "系統",
	"chatLab.factMode": "模式",
	"chatLab.factKind": "類型",
	"chatLab.factChat": "對話",
	"chatLab.factWindow": "範圍",
	"chatLab.windowEmpty": "未載入訊息",
	"chatLab.chatUnavailable": "不可用",
	"bubbleRender.loadingStats": "正在統計…",
	"bubbleRender.loadingConfig": "正在載入設定…",
	"bubbleRender.loadingThumbs": "正在載入縮圖…",
	"bubbleRender.loadingVariants": "正在載入情緒差分…",
	"bubbleRender.loadingCg": "正在載入 CG 圖庫…",
	"bubbleRender.panelLegacy": "原版 DB",
	"bubbleRender.panelNative": "TT 原生",
	"bubbleRender.dbScopesTitle": "各範圍佔用統計",
	"bubbleRender.nativeScopesHint": "原生儲存只能觸達「全域 + 目前角色卡」兩個範圍；資料變動後點「重新統計」重新掃描。",
	"bubbleRender.colCgCount": "CG 圖",
	"bubbleRender.btnRescan": "重新掃描",
	"bubbleRender.scanDb": "正在掃描資料庫…",
	"bubbleRender.noDbData": "未發現原版資料庫資料。",
	"bubbleRender.colScope": "範圍",
	"bubbleRender.colSize": "大小",
	"bubbleRender.statsTitle": "統計資料",
	"bubbleRender.statsAllScopesHint": "彙總所有範圍，切換庫範圍不會改變這裡的數字。",
	"bubbleRender.totalAvatars": "頭像數（全部）",
	"bubbleRender.totalMoodAvatars": "情緒差分（全部）",
	"bubbleRender.totalCgImages": "CG 圖片（全部）",
	"bubbleRender.totalStorageSize": "總大小（全部）",
	"bubbleRender.btnRefreshStats": "重新統計",
	"bubbleRender.btnRefreshScopeStats": "重新載入本範圍",
	"bubbleRender.statsUnavailable": "原生擴充儲存不可用，無法讀取統計。",
	"bubbleRender.statsStaleHint": "資料已變動，點「重新統計」重新計算。",
	"bubbleRender.scopeGlobal": "全域（共用）",
	"bubbleRender.btnConvert": "轉換",
	"bubbleRender.converting": "轉換中…",
	"bubbleRender.btnConfirm": "確認",
	"bubbleRender.btnConvertAllRemove": "一鍵轉換並刪除",
	"bubbleRender.convertUnavailable": "原生擴充儲存不可用，已停用轉換。",
	"bubbleRender.convertDone": "已轉換 {scope}：頭像 {a}、差分 {m}",
	"bubbleRender.deleteScopeDone": "已刪除 {scope}",
	"bubbleRender.convertAllDone": "已轉換 {n} 個範圍，失敗 {f} 個",
	"bubbleRender.dbHint": "轉換會把資料複製到原生儲存；來源資料會保留，直到你手動刪除。刪除無法復原。",
	"bubbleRender.transferring": "處理中…",
	"bubbleRender.loading": "載入中…",
	"bubbleRender.previewHint": "點擊左側的差分頭像，這裡會顯示大圖。",
	"bubbleRender.addWordPlaceholder": "新增詞…",
	"bubbleRender.avatarCount": "頭像數",
	"bubbleRender.btnExport": "匯出 ZIP",
	"bubbleRender.btnImport": "匯入 ZIP",
	"bubbleRender.btnResetFormat": "恢復預設格式",
	"bubbleRender.btnResetMoods": "恢復預設情緒詞",
	"bubbleRender.btnResetStyle": "恢復預設",
	"bubbleRender.btnSave": "儲存",
	"bubbleRender.colorCharacter": "跟隨角色主題色",
	"bubbleRender.colorGlobal": "全域統一色",
	"bubbleRender.compressEnabled": "自動壓縮圖片（儲存前轉為 WebP）",
	"bubbleRender.currentChar": "當前角色卡",
	"bubbleRender.emptyAvatars": "目前庫還沒有頭像。",
	"bubbleRender.fontDefault": "（預設）",
	"bubbleRender.formatRuleWarn": "修改格式規則可能導致 AI 輸出格式異常，請謹慎編輯。如遇問題，點擊「恢復預設格式」還原。",
	"bubbleRender.mdBasic": "基礎（粗體 / 斜體 / 刪除線）",
	"bubbleRender.mdFull": "完整（全部語法）",
	"bubbleRender.mode": "庫範圍",
	"bubbleRender.modeCharacter": "按角色卡",
	"bubbleRender.modeGlobal": "全域（共用）",
	"bubbleRender.moodCount": "情緒差分",
	"bubbleRender.no": "否",
	"bubbleRender.searchPlaceholder": "搜尋頭像名…",
	"bubbleRender.secColor": "顏色",
	"bubbleRender.secFont": "字體",
	"bubbleRender.secFormatRule": "格式規則",
	"bubbleRender.secLayout": "版面",
	"bubbleRender.secMarkdown": "Markdown 渲染",
	"bubbleRender.secMoodWords": "情緒詞配置",
	"bubbleRender.secStorage": "儲存最佳化",
	"bubbleRender.secText": "文字",
	"bubbleRender.sectionRuntime": "執行狀態",
	"bubbleRender.shape_circle": "圓形",
	"bubbleRender.shape_rounded": "方形圓角",
	"bubbleRender.shape_square": "方形",
	"bubbleRender.statBubbles": "氣泡數",
	"bubbleRender.statInjected": "提示詞已注入",
	"bubbleRender.statReady": "頭像庫就緒",
	"bubbleRender.style_avatarShape": "頭像形狀",
	"bubbleRender.style_avatarSize": "頭像大小",
	"bubbleRender.style_compressQuality": "壓縮品質",
	"bubbleRender.style_dialogueFont": "台詞字號",
	"bubbleRender.style_dialogueSpacing": "台詞行距",
	"bubbleRender.style_dialogueWeight": "台詞字重",
	"bubbleRender.style_nameFont": "角色名字體",
	"bubbleRender.style_nameWeight": "角色名字重",
	"bubbleRender.style_narrationBgColor": "旁白背景色",
	"bubbleRender.style_narrationBgOpacity": "旁白透明度",
	"bubbleRender.style_narrationFont": "旁白字號",
	"bubbleRender.style_narrationIndent": "旁白左側留白",
	"bubbleRender.style_narrationLineHeight": "旁白行距",
	"bubbleRender.style_narrationPaddingRight": "旁白右邊距",
	"bubbleRender.style_narrationRadius": "旁白圓角",
	"bubbleRender.style_narrationTextIndent": "旁白首行縮排",
	"bubbleRender.style_narrationWeight": "旁白字重",
	"bubbleRender.style_thoughtGap": "心裡話尾符間距",
	"bubbleRender.style_thoughtOffsetY": "心裡話尾符偏移",
	"bubbleRender.uploadHint": "點擊或拖曳圖片到此處上傳",
	"bubbleRender.uploadSub": "支援 JPG / PNG / GIF / WebP",
	"bubbleRender.namePlaceholder": "角色名",
	"bubbleRender.btnCancel": "取消",
	"bubbleRender.btnConfirmAdd": "確認新增",
	"bubbleRender.btnDelete": "刪除",
	"bubbleRender.btnColor": "修改這個名字的正文顏色",
	"bubbleRender.btnReplace": "取代預設頭像",
	"bubbleRender.btnRename": "重新命名",
	"bubbleRender.deleting": "刪除中…",
	"bubbleRender.errNotImage": "請選擇圖片檔案",
	"bubbleRender.errNoName": "名字不能為空",
	"bubbleRender.pageAvatar": "頭像管理",
	"bubbleRender.pageAvatarDesc": "管理頭像，檢視情緒差分與 CG 圖片",
	"bubbleRender.pageStyle": "正文美化",
	"bubbleRender.pageStyleDesc": "調整氣泡的字體、顏色與版面",
	"bubbleRender.pageMood": "情緒配置",
	"bubbleRender.pageMoodDesc": "編輯格式規則與情緒詞組",
	"bubbleRender.pageStorage": "儲存",
	"bubbleRender.pageStorageDesc": "儲存後端、匯入匯出與執行狀態",
	"bubbleRender.noCardTag": "未開啟角色卡",
	"bubbleRender.noCardHint": "開啟角色卡後才能使用按角色卡儲存",
	"bubbleRender.detailEmpty": "點擊左側頭像，這裡會顯示它的情緒差分和 CG 圖片。",
	"bubbleRender.backToList": "返回列表",
	"bubbleRender.variantCount": "{n} 個情緒差分",
	"bubbleRender.secVariants": "情緒差分",
	"bubbleRender.noVariants": "這個頭像還沒有情緒差分。",
	"bubbleRender.secCg": "CG 圖片庫",
	"bubbleRender.noCg": "目前範圍沒有 CG 群組。",
	"bubbleRender.btnLoadCg": "重新載入",
	"bubbleRender.totalSize": "總大小",
	"bubbleRender.yes": "是",
	"bubbleRender.ioScope": "匯入 / 匯出範圍：{scope}",
	"logs.pageTitle": "日誌",
	"logs.pageDesc": "記錄並檢視本擴充功能自己的日誌",
	"logs.start": "開啟記錄",
	"logs.stop": "停止記錄",
	"logs.clear": "清空",
	"logs.statusRecording": "記錄中 · 已記錄 {n} 條",
	"logs.statusStopped": "已停止 · 保留 {n} 條",
	"logs.empty": "還沒有日誌。點「開啟記錄」開始。",
	"logs.hint": "只顯示本擴充功能（[BubbleDialogue]）的日誌。開啟時會同時打開宿主的控制台記錄開關（與宿主開發者面板是同一個開關），停止時還原原狀態。",
	"logs.unavailable": "目前用戶端沒有提供日誌介面。",
	"common.loading": "載入中…",
	"common.loaded": "載入完成",
	"common.expandView": "展開檢視",
	"common.close": "關閉",
	"common.apply": "套用",
	"common.unknownModel": "未知"
}, zf = {
	en: If,
	"zh-Hans": Lf,
	"zh-Hant": Rf
};
function Bf() {
	let e = navigator.language;
	return e.startsWith("zh") ? /^zh-(TW|HK|MO)/i.test(e) ? "zh-Hant" : "zh-Hans" : "en";
}
function Vf(e = Bf()) {
	let t = zf[e];
	return {
		locale: e,
		t(e, n) {
			let r = t[e];
			if (n) for (let [e, t] of Object.entries(n)) r = r.replace(`{${e}}`, String(t));
			return r;
		}
	};
}
var Hf = Symbol("i18n");
function Uf() {
	let e = Tn(Hf);
	if (!e) throw Error("I18n context is unavailable.");
	return e;
}
var Wf = 1024;
async function Gf(e) {
	if (typeof createImageBitmap == "function") return await createImageBitmap(e);
	let t = URL.createObjectURL(e);
	try {
		return await new Promise((e, n) => {
			let r = new Image();
			r.onload = () => e(r), r.onerror = () => n(/* @__PURE__ */ Error("图片解码失败")), r.src = t;
		});
	} finally {
		URL.revokeObjectURL(t);
	}
}
async function Kf(e, t) {
	if (e.size > 2097152 * 4) throw Error(`图片过大（${(e.size / 1024 / 1024).toFixed(1)}MB），请先自行压缩`);
	let n = await Gf(e), r = "width" in n ? n.width : 0, i = "height" in n ? n.height : 0, a = Math.max(r, i) > Wf;
	if (!t.enabled && !a) return e;
	let o = a ? Wf / Math.max(r, i) : 1, s = Math.max(1, Math.round(r * o)), c = Math.max(1, Math.round(i * o)), l = document.createElement("canvas");
	l.width = s, l.height = c;
	let u = l.getContext("2d");
	if (!u) return e;
	u.drawImage(n, 0, 0, s, c), "close" in n && typeof n.close == "function" && n.close();
	let d = Math.min(1, Math.max(.3, t.quality)), f = await new Promise((e) => {
		l.toBlob((t) => e(t), "image/webp", d);
	});
	return f && f.size < e.size ? f : e;
}
function qf(e) {
	return String(e ?? "").replace(/\.[^.]+$/, "").trim() || "未命名";
}
//#endregion
//#region src/components/LoadingHint.vue?vue&type=script&setup=true&lang.ts
var Jf = { class: "ttbd-loading-text" }, Yf = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "LoadingHint",
	props: {
		loading: { type: Boolean },
		loadingText: {},
		doneText: { default: "" },
		doneHoldMs: { default: 1200 }
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ U(t.loading ? "loading" : "idle"), r = null;
		function i() {
			r !== null && (window.clearTimeout(r), r = null);
		}
		return On(() => t.loading, (e) => {
			if (i(), e) {
				n.value = "loading";
				return;
			}
			if (n.value === "loading") {
				if (!t.doneText) {
					n.value = "idle";
					return;
				}
				n.value = "done", t.doneHoldMs > 0 && (r = window.setTimeout(() => {
					r = null, n.value = "idle";
				}, t.doneHoldMs));
			}
		}, { immediate: !0 }), wr(i), (t, r) => n.value === "idle" ? Z("", !0) : (q(), J("div", {
			key: 0,
			class: z(["ttbd-loading", n.value])
		}, [r[0] ||= Y("span", {
			class: "ttbd-spinner",
			"aria-hidden": "true"
		}, null, -1), Y("span", Jf, B(n.value === "loading" ? e.loadingText : e.doneText), 1)], 2));
	}
}), [["__scopeId", "data-v-1d7f42f8"]]), Xf = { class: "bd-col-left" }, Zf = { class: "bd-row" }, Qf = { class: "bd-label" }, $f = { class: "bd-value" }, ep = {
	key: 0,
	class: "bd-tag"
}, tp = { class: "bd-loading-row" }, np = ["disabled"], rp = { class: "bd-stats-row" }, ip = { class: "bd-stat" }, ap = { class: "bd-stat-label" }, op = { class: "bd-stat-value" }, sp = { class: "bd-stat" }, cp = { class: "bd-stat-label" }, lp = { class: "bd-stat-value" }, up = { class: "bd-stat" }, dp = { class: "bd-stat-label" }, fp = { class: "bd-stat-value" }, pp = { class: "bd-field" }, mp = { class: "bd-field-label" }, hp = { class: "bd-mode-row" }, gp = { class: "bd-segmented" }, _p = ["disabled"], vp = ["disabled", "title"], yp = ["disabled", "title"], bp = ["disabled", "title"], xp = { class: "bd-io-hint" }, Sp = {
	key: 0,
	class: "bd-loading-row"
}, Cp = {
	key: 0,
	class: "bd-progress"
}, wp = {
	key: 1,
	class: "bd-result"
}, Tp = { class: "bd-drop-main" }, Ep = { class: "bd-drop-sub" }, Dp = {
	key: 1,
	class: "bd-pending"
}, Op = ["src"], kp = { class: "bd-pending-body" }, Ap = ["placeholder"], jp = { class: "bd-pending-actions" }, Mp = ["disabled"], Np = {
	key: 2,
	class: "bd-error"
}, Pp = ["placeholder"], Fp = { class: "bd-loading-row" }, Ip = {
	key: 3,
	class: "bd-empty"
}, Lp = {
	key: 4,
	class: "bd-list"
}, Rp = ["onClick"], zp = { class: "bd-item-main" }, Bp = ["src"], Vp = {
	key: 1,
	class: "bd-thumb-fallback"
}, Hp = ["onKeydown", "onBlur"], Up = {
	key: 3,
	class: "bd-item-name"
}, Wp = { class: "bd-item-actions" }, Gp = ["title", "onClick"], Kp = ["title", "onClick"], qp = ["title", "onClick"], Jp = ["title", "onClick"], Yp = { class: "bd-col-right" }, Xp = {
	key: 0,
	class: "bd-detail-empty"
}, Zp = { class: "bd-detail-head" }, Qp = { class: "bd-detail-meta" }, $p = { class: "bd-loading-row" }, em = { class: "bd-variants-block" }, tm = { class: "bd-sec" }, nm = { class: "bd-variants-layout" }, rm = { class: "bd-variant-col" }, im = {
	key: 0,
	class: "bd-detail-empty small"
}, am = {
	key: 1,
	class: "bd-detail-empty small"
}, om = {
	key: 2,
	class: "bd-variants"
}, sm = ["onClick"], cm = ["src"], lm = {
	key: 1,
	class: "bd-variant-fallback"
}, um = { class: "bd-variant-info" }, dm = { class: "bd-variant-mood" }, fm = { class: "bd-variant-tags" }, pm = { class: "bd-preview" }, mm = ["src"], hm = {
	key: 1,
	class: "bd-preview-hint"
}, gm = { class: "bd-sec" }, _m = { class: "bd-loading-row" }, vm = {
	key: 0,
	class: "bd-detail-empty small"
}, ym = {
	key: 1,
	class: "bd-cg-groups"
}, bm = { class: "bd-cg-head" }, xm = { class: "bd-cg-name" }, Sm = { class: "bd-cg-count" }, Cm = { class: "bd-cg-grid" }, wm = ["src"], Tm = 12, Em = 6, Dm = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "AvatarsPage",
	props: { controller: {} },
	setup(e) {
		let t = e, n = Uf(), r = n.t.bind(n), i = t.controller.runtime, a = Q(() => i.state), o = Q(() => a.value.busy), s = Q(() => a.value.hasCharacterCard), c = Q(() => s.value ? a.value.mode : "global"), l = Q(() => c.value === "global" ? r("bubbleRender.scopeGlobal") : a.value.charName), u = Q(() => c.value === "global" ? "global" : String(a.value.charId ?? "global")), d = /* @__PURE__ */ U(""), f = Q(() => a.value.avatarNames), p = Q(() => {
			let e = d.value.trim().toLowerCase();
			return e ? f.value.filter((t) => t.toLowerCase().includes(e)) : f.value;
		}), m = /* @__PURE__ */ U(null), h = /* @__PURE__ */ U(null), g = /* @__PURE__ */ U(!1), _ = /* @__PURE__ */ U([]), v = /* @__PURE__ */ U({}), y = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ U({}), x = /* @__PURE__ */ U(!1), S = /* @__PURE__ */ U(!1);
		function C(e) {
			for (let t of Object.values(e)) String(t).startsWith("blob:") && URL.revokeObjectURL(t);
		}
		function w(e) {
			for (let t of e) t.previewUrl && t.previewUrl.startsWith("blob:") && URL.revokeObjectURL(t.previewUrl);
		}
		async function T(e) {
			if (y.has(e) || v.value[e]) return;
			y.add(e);
			let t = await i.getAvatarPreviewUrl(e);
			t && (v.value = {
				...v.value,
				[e]: t
			});
		}
		async function E() {
			let e = p.value.filter((e) => !v.value[e]);
			if (e.length) {
				x.value = !0;
				try {
					let t = Array.from({ length: Math.min(6, e.length) }, async () => {
						for (; e.length;) {
							let t = e.shift();
							if (!t) break;
							await T(t);
						}
					});
					await Promise.all(t);
				} finally {
					x.value = !1;
				}
			}
		}
		On([p, () => a.value.avatarCount], () => {
			E();
		}, { immediate: !0 });
		let D = Q(() => _.value.find((e) => e.moodId === h.value)?.previewUrl ?? null);
		async function O(e) {
			let t = e.filter((e) => !e.previewUrl), n = 0, r = Array.from({ length: Math.min(Em, t.length) }, async () => {
				for (; n < t.length;) {
					let e = t[n];
					n += 1;
					try {
						let t = await i.getMoodVariantPreviewUrl(m.value ?? "", e.moodId);
						t && (e.previewUrl = t, _.value = [..._.value]);
					} catch {}
				}
			});
			await Promise.all(r);
		}
		async function ee(e) {
			w(_.value), _.value = [], h.value = null, g.value = !0;
			try {
				let t = await i.getAvatarVariants(e);
				if (m.value !== e) {
					w(t);
					return;
				}
				_.value = t, h.value = t[0]?.moodId ?? null, t.length && t.some((e) => !e.previewUrl) && await O(t);
			} catch (e) {
				console.error("[BubbleDialogue] load variants failed.", e);
			} finally {
				m.value === e && (g.value = !1);
			}
		}
		async function k(e) {
			m.value = e, await ee(e);
		}
		function A() {
			w(_.value), _.value = [], h.value = null, m.value = null;
		}
		On(() => a.value.avatarCount, () => {
			m.value && !f.value.includes(m.value) && (w(_.value), _.value = [], h.value = null, m.value = null);
		});
		let j = /* @__PURE__ */ U([]), M = /* @__PURE__ */ U({});
		async function N() {
			S.value = !0, C(b.value), b.value = {}, j.value = (await i.listCgGroups()).map((e) => ({
				group: String(e.group ?? ""),
				count: Number(e.count ?? 0),
				imageUrls: Array.isArray(e.imageUrls) ? e.imageUrls : [],
				albumUrl: String(e.albumUrl ?? "")
			}));
			let e = {};
			for (let t of j.value) e[t.group] = await i.listCgImages(t.group);
			M.value = e;
			let t = [];
			for (let n of j.value) for (let r of e[n.group].slice(0, Tm)) t.push({
				group: n.group,
				index: r.index
			});
			let n = Array.from({ length: Math.min(6, t.length) }, async () => {
				for (; t.length;) {
					let e = t.shift();
					if (!e) break;
					await P(e.group, e.index);
				}
			});
			await Promise.all(n), S.value = !1;
		}
		async function P(e, t) {
			let n = `${e}__${t}`;
			if (b.value[n]) return;
			let r = await i.getCgImagePreviewUrl(e, t);
			r && (b.value = {
				...b.value,
				[n]: r
			});
		}
		function te(e) {
			return (M.value[e] ?? []).slice(0, Tm);
		}
		let F = /* @__PURE__ */ U(null), ne = /* @__PURE__ */ U(null), I = /* @__PURE__ */ U(null), R = /* @__PURE__ */ U(!1), re = /* @__PURE__ */ U(null), ie = /* @__PURE__ */ U(null), ae = /* @__PURE__ */ U(null), oe = /* @__PURE__ */ U(null), se = /* @__PURE__ */ U(null), ce = /* @__PURE__ */ U("");
		function le(e) {
			return a.value.avatarColors[e.trim().toLowerCase()] ?? "";
		}
		function ue() {
			C(v.value), v.value = {}, y.clear();
		}
		let de = /* @__PURE__ */ U(null);
		async function fe(e) {
			let t = e.target, n = t.files?.[0];
			if (n) try {
				let e = new Uint8Array(await n.arrayBuffer());
				await i.importZip(e), ue(), E();
			} catch (e) {
				I.value = e instanceof Error ? e.message : String(e);
			} finally {
				t.value = "";
			}
		}
		async function pe() {
			try {
				let e = await i.exportZip(), t = u.value.replace(/[\\/:*?"<>|]/g, "_"), n = new Uint8Array(e.byteLength);
				n.set(e);
				let r = new Blob([n.buffer], { type: "application/zip" }), a = URL.createObjectURL(r), o = document.createElement("a");
				o.href = a, o.download = `bubble-character-${t}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip`, o.click(), URL.revokeObjectURL(a);
			} catch (e) {
				I.value = e instanceof Error ? e.message : String(e);
			}
		}
		function me(e) {
			ae.value = e;
			let t = re.value;
			t && (t.value = le(e) || "#d9d9d9", t.click());
		}
		async function he(e) {
			let n = ae.value;
			if (ae.value = null, !n) return;
			let r = e.target.value;
			await t.controller.runtime.setAvatarColor(n, r);
		}
		function ge(e) {
			oe.value = e, ie.value?.click();
		}
		async function _e(e) {
			let t = e.target, n = t.files?.[0], a = oe.value;
			if (oe.value = null, t.value = "", !(!n || !a)) {
				if (!n.type.startsWith("image/")) {
					I.value = r("bubbleRender.errNotImage");
					return;
				}
				try {
					let e = i.config.state.style, t = await Kf(n, {
						enabled: !!e.style_imageCompressEnabled,
						quality: Number(e.style_imageCompressQuality ?? .82)
					});
					await i.replaceAvatar(a, t), ue(), E();
				} catch (e) {
					I.value = e instanceof Error ? e.message : String(e);
				}
			}
		}
		function V(e) {
			let t = e;
			t && typeof t.focus == "function" && queueMicrotask(() => t.focus());
		}
		function ve(e) {
			se.value = e, ce.value = e;
		}
		function ye() {
			se.value = null, ce.value = "";
		}
		async function be(e) {
			let n = ce.value.trim();
			if (!n || n === e) {
				ye();
				return;
			}
			try {
				await t.controller.runtime.renameAvatar(e, n), ue(), E(), m.value === e && (m.value = n), I.value = null;
			} catch (e) {
				I.value = e instanceof Error ? e.message : String(e);
			} finally {
				ye();
			}
		}
		function xe(e) {
			if (I.value = null, !e.type.startsWith("image/")) {
				I.value = r("bubbleRender.errNotImage");
				return;
			}
			F.value && URL.revokeObjectURL(F.value.previewUrl), F.value = {
				file: e,
				name: qf(e.name),
				previewUrl: URL.createObjectURL(e)
			};
		}
		function Se(e) {
			let t = e.target, n = t.files?.[0];
			n && xe(n), t.value = "";
		}
		function Ce(e) {
			R.value = !1;
			let t = e.dataTransfer?.files?.[0];
			t && xe(t);
		}
		function we() {
			F.value && URL.revokeObjectURL(F.value.previewUrl), F.value = null, I.value = null;
		}
		async function Te() {
			let e = F.value;
			if (!e) return;
			let t = e.name.trim();
			if (!t) {
				I.value = r("bubbleRender.errNoName");
				return;
			}
			try {
				let n = i.config.state.style, r = await Kf(e.file, {
					enabled: !!n.style_imageCompressEnabled,
					quality: Number(n.style_imageCompressQuality ?? .82)
				});
				await i.addAvatar(t, r), we(), C(v.value), v.value = {}, y.clear(), T(t), await k(t);
			} catch (e) {
				I.value = e instanceof Error ? e.message : String(e);
			}
		}
		async function Ee(e) {
			await i.deleteAvatar(e);
			let t = v.value[e];
			t && String(t).startsWith("blob:") && URL.revokeObjectURL(t);
			let n = { ...v.value };
			delete n[e], v.value = n, y.delete(e), m.value === e && (w(_.value), _.value = [], h.value = null, m.value = null);
		}
		xr(() => {
			N();
		}), wr(() => {
			C(v.value), C(b.value), w(_.value), F.value && URL.revokeObjectURL(F.value.previewUrl);
		});
		function De(e) {
			return e >= 1024 * 1024 ? (e / 1024 / 1024).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B";
		}
		function Oe(e) {
			let t = i.config.state.moodGroups.find((t) => t.id === e);
			return t ? t.label : e;
		}
		return (e, t) => (q(), J("div", { class: z(["bd-page", { "is-detail": !!m.value }]) }, [Y("div", Xf, [
			Y("div", Zf, [
				Y("span", Qf, B(W(r)("bubbleRender.currentChar")) + "：", 1),
				Y("span", $f, B(a.value.charName), 1),
				s.value ? Z("", !0) : (q(), J("span", ep, B(W(r)("bubbleRender.noCardTag")), 1))
			]),
			Y("div", tp, [X(Yf, {
				loading: a.value.statsLoading,
				"loading-text": W(r)("bubbleRender.loadingStats"),
				"done-text": W(r)("common.loaded")
			}, null, 8, [
				"loading",
				"loading-text",
				"done-text"
			]), Y("button", {
				type: "button",
				class: "bd-mini",
				disabled: a.value.statsLoading,
				onClick: t[0] ||= (e) => W(i).refreshScopeStats()
			}, B(W(r)("bubbleRender.btnRefreshScopeStats")), 9, np)]),
			Y("div", rp, [
				Y("div", ip, [Y("span", ap, B(W(r)("bubbleRender.avatarCount")), 1), Y("span", op, B(a.value.avatarCount), 1)]),
				Y("div", sp, [Y("span", cp, B(W(r)("bubbleRender.moodCount")), 1), Y("span", lp, B(a.value.moodCount), 1)]),
				Y("div", up, [Y("span", dp, B(W(r)("bubbleRender.totalSize")), 1), Y("span", fp, B(De(a.value.totalBytes)), 1)])
			]),
			Y("div", pp, [
				Y("span", mp, B(W(r)("bubbleRender.mode")), 1),
				Y("div", hp, [
					Y("div", gp, [Y("button", {
						type: "button",
						class: z(["bd-seg", { active: c.value === "global" }]),
						disabled: o.value,
						onClick: t[1] ||= (e) => W(i).setMode("global")
					}, B(W(r)("bubbleRender.modeGlobal")), 11, _p), Y("button", {
						type: "button",
						class: z(["bd-seg", { active: c.value === "character" }]),
						disabled: o.value || !s.value,
						title: s.value ? "" : W(r)("bubbleRender.noCardHint"),
						onClick: t[2] ||= (e) => W(i).setMode("character")
					}, B(W(r)("bubbleRender.modeCharacter")), 11, vp)]),
					Y("button", {
						type: "button",
						class: "bd-mini",
						disabled: o.value,
						title: W(r)("bubbleRender.ioScope", { scope: l.value }),
						onClick: t[3] ||= (e) => de.value?.click()
					}, B(W(r)("bubbleRender.btnImport")), 9, yp),
					Y("button", {
						type: "button",
						class: "bd-mini",
						disabled: o.value,
						title: W(r)("bubbleRender.ioScope", { scope: l.value }),
						onClick: t[4] ||= (e) => pe()
					}, B(W(r)("bubbleRender.btnExport")), 9, bp)
				]),
				Y("p", xp, B(W(r)("bubbleRender.ioScope", { scope: l.value })), 1),
				a.value.busy ? (q(), J("div", Sp, [X(Yf, {
					loading: a.value.busy,
					"loading-text": W(r)("bubbleRender.transferring"),
					"done-text": W(r)("common.loaded")
				}, null, 8, [
					"loading",
					"loading-text",
					"done-text"
				]), a.value.progress ? (q(), J("span", Cp, B(a.value.progress.done) + " / " + B(a.value.progress.total), 1)) : Z("", !0)])) : Z("", !0),
				a.value.lastResult ? (q(), J("p", wp, B(a.value.lastResult), 1)) : Z("", !0),
				Y("input", {
					ref_key: "importInput",
					ref: de,
					type: "file",
					accept: ".zip,application/zip",
					class: "bd-file",
					onChange: fe
				}, null, 544)
			]),
			F.value ? (q(), J("div", Dp, [Y("img", {
				class: "bd-pending-img",
				src: F.value.previewUrl,
				alt: ""
			}, null, 8, Op), Y("div", kp, [Sn(Y("input", {
				"onUpdate:modelValue": t[8] ||= (e) => F.value.name = e,
				class: "bd-input",
				placeholder: W(r)("bubbleRender.namePlaceholder")
			}, null, 8, Ap), [[os, F.value.name]]), Y("div", jp, [Y("button", {
				type: "button",
				class: "bd-btn ghost",
				onClick: we
			}, B(W(r)("bubbleRender.btnCancel")), 1), Y("button", {
				type: "button",
				class: "bd-btn",
				disabled: o.value,
				onClick: Te
			}, B(W(r)("bubbleRender.btnConfirmAdd")), 9, Mp)])])])) : (q(), J("div", {
				key: 0,
				class: z(["bd-drop", { active: R.value }]),
				onClick: t[5] ||= (e) => ne.value?.click(),
				onDragover: t[6] ||= ms((e) => R.value = !0, ["prevent"]),
				onDragleave: t[7] ||= ms((e) => R.value = !1, ["prevent"]),
				onDrop: ms(Ce, ["prevent"])
			}, [
				t[13] ||= Y("div", { class: "bd-drop-plus" }, "＋", -1),
				Y("div", Tp, B(W(r)("bubbleRender.uploadHint")), 1),
				Y("div", Ep, B(W(r)("bubbleRender.uploadSub")), 1)
			], 34)),
			I.value ? (q(), J("p", Np, B(I.value), 1)) : Z("", !0),
			Y("input", {
				ref_key: "fileInput",
				ref: ne,
				type: "file",
				accept: "image/*",
				class: "bd-file",
				onChange: Se
			}, null, 544),
			Sn(Y("input", {
				"onUpdate:modelValue": t[9] ||= (e) => d.value = e,
				class: "bd-input",
				placeholder: W(r)("bubbleRender.searchPlaceholder")
			}, null, 8, Pp), [[os, d.value]]),
			Y("div", Fp, [X(Yf, {
				loading: x.value,
				"loading-text": W(r)("bubbleRender.loadingThumbs"),
				"done-text": W(r)("common.loaded")
			}, null, 8, [
				"loading",
				"loading-text",
				"done-text"
			])]),
			Y("input", {
				ref_key: "colorInput",
				ref: re,
				type: "color",
				class: "bd-hidden-input",
				onInput: he
			}, null, 544),
			Y("input", {
				ref_key: "replaceInput",
				ref: ie,
				type: "file",
				accept: "image/*",
				class: "bd-hidden-input",
				onChange: _e
			}, null, 544),
			p.value.length === 0 ? (q(), J("div", Ip, B(W(r)("bubbleRender.emptyAvatars")), 1)) : (q(), J("div", Lp, [(q(!0), J(K, null, G(p.value, (e) => (q(), J("button", {
				key: e,
				type: "button",
				class: z(["bd-item", { active: m.value === e }]),
				onClick: (t) => k(e)
			}, [Y("span", zp, [v.value[e] ? (q(), J("img", {
				key: 0,
				class: "bd-thumb",
				src: v.value[e],
				alt: ""
			}, null, 8, Bp)) : (q(), J("span", Vp, B(e.slice(0, 1)), 1)), se.value === e ? Sn((q(), J("input", {
				key: 2,
				class: "bd-rename",
				"onUpdate:modelValue": t[10] ||= (e) => ce.value = e,
				ref_for: !0,
				ref: V,
				onClick: t[11] ||= ms(() => {}, ["stop"]),
				onKeydown: [gs(ms((t) => be(e), ["stop"]), ["enter"]), t[12] ||= gs(ms((e) => ye(), ["stop"]), ["esc"])],
				onBlur: (t) => be(e)
			}, null, 40, Hp)), [[os, ce.value]]) : (q(), J("span", Up, B(e), 1))]), Y("span", Wp, [
				Y("span", {
					class: z(["bd-icon", { on: !!le(e) }]),
					style: L(le(e) ? { color: le(e) } : void 0),
					title: W(r)("bubbleRender.btnColor"),
					onClick: ms((t) => me(e), ["stop"])
				}, [...t[14] ||= [Y("svg", {
					viewBox: "0 0 16 16",
					width: "13",
					height: "13",
					"aria-hidden": "true"
				}, [Y("circle", {
					cx: "8",
					cy: "8",
					r: "5.2",
					fill: "currentColor",
					"fill-opacity": "0.45",
					stroke: "currentColor",
					"stroke-width": "1.6"
				})], -1)]], 14, Gp),
				Y("span", {
					class: "bd-icon",
					title: W(r)("bubbleRender.btnReplace"),
					onClick: ms((t) => ge(e), ["stop"])
				}, [...t[15] ||= [Y("svg", {
					viewBox: "0 0 16 16",
					width: "13",
					height: "13",
					"aria-hidden": "true"
				}, [Y("rect", {
					x: "1.8",
					y: "3",
					width: "12.4",
					height: "10",
					rx: "2",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "1.5"
				}), Y("path", {
					d: "M3.6 11.4l3-3 2.2 2.2 3-3.2",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "1.5",
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				})], -1)]], 8, Kp),
				Y("span", {
					class: "bd-icon",
					title: W(r)("bubbleRender.btnRename"),
					onClick: ms((t) => ve(e), ["stop"])
				}, [...t[16] ||= [Y("svg", {
					viewBox: "0 0 16 16",
					width: "13",
					height: "13",
					"aria-hidden": "true"
				}, [Y("path", {
					d: "M11.2 2.4l2.4 2.4-8 8-3 .6.6-3 8-8z",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": "1.5",
					"stroke-linejoin": "round"
				})], -1)]], 8, qp),
				Y("span", {
					class: z(["bd-item-del", { busy: a.value.deletingName === e }]),
					title: a.value.deletingName === e ? W(r)("bubbleRender.deleting") : W(r)("bubbleRender.btnDelete"),
					onClick: ms((t) => Ee(e), ["stop"])
				}, B(a.value.deletingName === e ? "…" : "×"), 11, Jp)
			])], 10, Rp))), 128))]))
		]), Y("div", Yp, [m.value ? (q(), J(K, { key: 1 }, [
			Y("section", Zp, [
				Y("button", {
					type: "button",
					class: "bd-back",
					onClick: A
				}, [t[17] ||= Y("span", { "aria-hidden": "true" }, "←", -1), da(" " + B(W(r)("bubbleRender.backToList")), 1)]),
				Y("h3", null, B(m.value), 1),
				Y("span", Qp, [g.value ? (q(), J(K, { key: 0 }, [da(B(W(r)("bubbleRender.loading")), 1)], 64)) : (q(), J(K, { key: 1 }, [da(B(W(r)("bubbleRender.variantCount", { n: _.value.length })), 1)], 64))]),
				Y("div", $p, [X(Yf, {
					loading: g.value,
					"loading-text": W(r)("bubbleRender.loadingVariants"),
					"done-text": W(r)("common.loaded")
				}, null, 8, [
					"loading",
					"loading-text",
					"done-text"
				])])
			]),
			Y("section", em, [Y("h4", tm, B(W(r)("bubbleRender.secVariants")), 1), Y("div", nm, [Y("div", rm, [g.value ? (q(), J("div", im, B(W(r)("bubbleRender.loading")), 1)) : _.value.length === 0 ? (q(), J("div", am, B(W(r)("bubbleRender.noVariants")), 1)) : (q(), J("div", om, [(q(!0), J(K, null, G(_.value, (e) => (q(), J("button", {
				key: e.moodId + e.outfit + e.act,
				type: "button",
				class: z(["bd-variant", { active: h.value === e.moodId }]),
				onClick: (t) => h.value = e.moodId
			}, [e.previewUrl ? (q(), J("img", {
				key: 0,
				class: "bd-variant-img",
				src: e.previewUrl,
				alt: "",
				loading: "lazy"
			}, null, 8, cm)) : (q(), J("span", lm, B(Oe(e.mood).slice(0, 1)), 1)), Y("div", um, [Y("span", dm, B(Oe(e.mood)), 1), Y("span", fm, B(e.outfit) + " · " + B(e.act), 1)])], 10, sm))), 128))]))]), Y("div", pm, [D.value ? (q(), J("img", {
				key: 0,
				class: "bd-preview-img",
				src: D.value,
				alt: ""
			}, null, 8, mm)) : (q(), J("div", hm, B(W(r)("bubbleRender.previewHint")), 1))])])]),
			Y("section", null, [
				Y("h4", gm, [da(B(W(r)("bubbleRender.secCg")) + " ", 1), Y("button", {
					type: "button",
					class: "bd-mini",
					onClick: N
				}, B(W(r)("bubbleRender.btnLoadCg")), 1)]),
				Y("div", _m, [X(Yf, {
					loading: S.value,
					"loading-text": W(r)("bubbleRender.loadingCg"),
					"done-text": W(r)("common.loaded")
				}, null, 8, [
					"loading",
					"loading-text",
					"done-text"
				])]),
				!S.value && j.value.length === 0 ? (q(), J("div", vm, B(W(r)("bubbleRender.noCg")), 1)) : (q(), J("div", ym, [(q(!0), J(K, null, G(j.value, (e) => (q(), J("div", {
					key: e.group,
					class: "bd-cg-group"
				}, [Y("div", bm, [Y("span", xm, B(e.group), 1), Y("span", Sm, B((M.value[e.group] || []).length), 1)]), Y("div", Cm, [(q(!0), J(K, null, G(te(e.group), (t) => (q(), J("img", {
					key: t.index,
					class: "bd-cg-img",
					src: b.value[e.group + "__" + t.index] || "",
					alt: ""
				}, null, 8, wm))), 128))])]))), 128))]))
			])
		], 64)) : (q(), J("div", Xp, B(W(r)("bubbleRender.detailEmpty")), 1))])], 2));
	}
}), [["__scopeId", "data-v-d36175bc"]]), Om = { class: "bd-tab" }, km = { class: "bd-loading-row" }, Am = { class: "bd-sec" }, jm = { class: "bd-slider-head" }, Mm = { class: "bd-slider-val" }, Nm = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Pm = { class: "bd-sec" }, Fm = { class: "bd-radio" }, Im = ["disabled"], Lm = { class: "bd-radio" }, Rm = { class: "bd-slider" }, zm = { class: "bd-slider-head" }, Bm = { class: "bd-slider-val" }, Vm = ["value"], Hm = { class: "bd-inline" }, Um = { class: "bd-sec" }, Wm = { class: "bd-slider-head" }, Gm = { class: "bd-slider-val" }, Km = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], qm = { class: "bd-field-row" }, Jm = { class: "bd-field-label" }, Ym = { class: "bd-segmented" }, Xm = ["onClick"], Zm = { class: "bd-sec" }, Qm = ["value", "onChange"], $m = ["value"], eh = { class: "bd-sec" }, th = { class: "bd-radio" }, nh = { class: "bd-slider" }, rh = { class: "bd-slider-head" }, ih = { class: "bd-slider-val" }, ah = ["value"], oh = { class: "bd-sec" }, sh = { class: "bd-segmented" }, ch = { class: "bd-actions" }, lh = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "StylePage",
	props: { controller: {} },
	setup(e) {
		let t = e, n = Uf(), r = n.t.bind(n);
		function i(e) {
			return r(e);
		}
		let a = Q(() => t.controller.runtime.config.state.style), o = Q(() => !t.controller.runtime.config.state.loaded), s = [
			{
				key: "style_dialogueFontSize",
				label: "dialogueFont",
				min: 12,
				max: 22,
				step: .5,
				unit: "px"
			},
			{
				key: "style_narrationFontSize",
				label: "narrationFont",
				min: 12,
				max: 22,
				step: .5,
				unit: "px"
			},
			{
				key: "style_dialogueSpacing",
				label: "dialogueSpacing",
				min: 4,
				max: 24,
				step: 1,
				unit: "px"
			},
			{
				key: "style_dialogueFontWeight",
				label: "dialogueWeight",
				min: 100,
				max: 900,
				step: 10,
				unit: ""
			},
			{
				key: "style_narrationFontWeight",
				label: "narrationWeight",
				min: 100,
				max: 900,
				step: 10,
				unit: ""
			},
			{
				key: "style_nameFontWeight",
				label: "nameWeight",
				min: 100,
				max: 900,
				step: 10,
				unit: ""
			},
			{
				key: "style_narrationBgOpacity",
				label: "narrationBgOpacity",
				min: 0,
				max: 1,
				step: .01,
				unit: ""
			},
			{
				key: "style_avatarSize",
				label: "avatarSize",
				min: 32,
				max: 96,
				step: 2,
				unit: "px"
			},
			{
				key: "style_narrationIndent",
				label: "narrationIndent",
				min: 0,
				max: 160,
				step: 2,
				unit: "px"
			},
			{
				key: "style_narrationBorderRadius",
				label: "narrationRadius",
				min: 0,
				max: 24,
				step: 1,
				unit: "px"
			},
			{
				key: "style_narrationTextIndent",
				label: "narrationTextIndent",
				min: 0,
				max: 80,
				step: 1,
				unit: "px"
			},
			{
				key: "style_narrationLineHeight",
				label: "narrationLineHeight",
				min: 1,
				max: 2.6,
				step: .05,
				unit: ""
			},
			{
				key: "style_narrationPaddingRight",
				label: "narrationPaddingRight",
				min: 0,
				max: 60,
				step: 2,
				unit: "px"
			},
			{
				key: "style_thoughtSuffixGap",
				label: "thoughtGap",
				min: 0,
				max: 30,
				step: 1,
				unit: "px"
			},
			{
				key: "style_thoughtSuffixOffsetY",
				label: "thoughtOffsetY",
				min: 0,
				max: 30,
				step: 1,
				unit: "px"
			},
			{
				key: "style_imageCompressQuality",
				label: "compressQuality",
				min: .3,
				max: 1,
				step: .02,
				unit: ""
			}
		], c = Q({
			get: () => String(a.value.style_textColorMode ?? "global"),
			set: (e) => t.controller.runtime.config.setStyle("style_textColorMode", e)
		}), l = Q({
			get: () => String(a.value.style_globalTextColor ?? "#d9d9d9"),
			set: (e) => t.controller.runtime.config.setStyle("style_globalTextColor", e)
		}), u = Q({
			get: () => String(a.value.style_narrationBgColor ?? "#ffffff"),
			set: (e) => t.controller.runtime.config.setStyle("style_narrationBgColor", e)
		}), d = Q({
			get: () => String(a.value.style_avatarShape ?? "rounded"),
			set: (e) => t.controller.runtime.config.setStyle("style_avatarShape", e)
		}), f = Q({
			get: () => String(a.value.style_markdownMode ?? "basic"),
			set: (e) => t.controller.runtime.config.setStyle("style_markdownMode", e)
		}), p = Q({
			get: () => !!a.value.style_imageCompressEnabled,
			set: (e) => t.controller.runtime.config.setStyle("style_imageCompressEnabled", e)
		}), m = [
			"",
			"Noto Sans SC",
			"Noto Serif SC",
			"Source Han Sans SC",
			"Source Han Serif SC",
			"system-ui",
			"serif"
		], h = Q({
			get: () => String(a.value.style_narrationFontFamily ?? ""),
			set: (e) => t.controller.runtime.config.setStyle("style_narrationFontFamily", e)
		}), g = Q({
			get: () => String(a.value.style_dialogueFontFamily ?? ""),
			set: (e) => t.controller.runtime.config.setStyle("style_dialogueFontFamily", e)
		}), _ = Q({
			get: () => String(a.value.style_nameFontFamily ?? ""),
			set: (e) => t.controller.runtime.config.setStyle("style_nameFontFamily", e)
		});
		function v(e) {
			return Number(a.value[e] ?? 0);
		}
		async function y(e, n) {
			let r = Number(n.target.value);
			await t.controller.runtime.config.setStyle(e, r);
		}
		async function b() {
			await t.controller.runtime.config.resetStyleAll();
		}
		return (e, n) => (q(), J("div", Om, [
			Y("div", km, [X(Yf, {
				loading: o.value,
				"loading-text": W(r)("bubbleRender.loadingConfig"),
				"done-text": W(r)("common.loaded")
			}, null, 8, [
				"loading",
				"loading-text",
				"done-text"
			])]),
			Y("section", null, [Y("h4", Am, B(W(r)("bubbleRender.secText")), 1), (q(!0), J(K, null, G(s.slice(0, 6), (e) => (q(), J("div", {
				key: e.key,
				class: "bd-slider"
			}, [Y("div", jm, [Y("span", null, B(i("bubbleRender.style_" + e.label)), 1), Y("span", Mm, B(v(e.key)) + B(e.unit), 1)]), Y("input", {
				type: "range",
				min: e.min,
				max: e.max,
				step: e.step,
				value: v(e.key),
				onInput: (t) => y(e.key, t)
			}, null, 40, Nm)]))), 128))]),
			Y("section", null, [
				Y("h4", Pm, B(W(r)("bubbleRender.secColor")), 1),
				Y("label", Fm, [
					Sn(Y("input", {
						type: "radio",
						value: "global",
						"onUpdate:modelValue": n[0] ||= (e) => c.value = e
					}, null, 512), [[ls, c.value]]),
					Y("span", null, B(W(r)("bubbleRender.colorGlobal")), 1),
					Sn(Y("input", {
						type: "color",
						class: "bd-color",
						"onUpdate:modelValue": n[1] ||= (e) => l.value = e,
						disabled: c.value !== "global"
					}, null, 8, Im), [[os, l.value]])
				]),
				Y("label", Lm, [Sn(Y("input", {
					type: "radio",
					value: "character",
					"onUpdate:modelValue": n[2] ||= (e) => c.value = e
				}, null, 512), [[ls, c.value]]), Y("span", null, B(W(r)("bubbleRender.colorCharacter")), 1)]),
				Y("div", Rm, [Y("div", zm, [Y("span", null, B(W(r)("bubbleRender.style_narrationBgOpacity")), 1), Y("span", Bm, B(v("style_narrationBgOpacity")), 1)]), Y("input", {
					type: "range",
					min: "0",
					max: "1",
					step: "0.01",
					value: v("style_narrationBgOpacity"),
					onInput: n[3] ||= (e) => y("style_narrationBgOpacity", e)
				}, null, 40, Vm)]),
				Y("label", Hm, [Y("span", null, B(W(r)("bubbleRender.style_narrationBgColor")), 1), Sn(Y("input", {
					type: "color",
					class: "bd-color",
					"onUpdate:modelValue": n[4] ||= (e) => u.value = e
				}, null, 512), [[os, u.value]])])
			]),
			Y("section", null, [
				Y("h4", Um, B(W(r)("bubbleRender.secLayout")), 1),
				(q(!0), J(K, null, G(s.slice(7, 15), (e) => (q(), J("div", {
					class: "bd-slider",
					key: e.key
				}, [Y("div", Wm, [Y("span", null, B(i("bubbleRender.style_" + e.label)), 1), Y("span", Gm, B(v(e.key)) + B(e.unit), 1)]), Y("input", {
					type: "range",
					min: e.min,
					max: e.max,
					step: e.step,
					value: v(e.key),
					onInput: (t) => y(e.key, t)
				}, null, 40, Km)]))), 128)),
				Y("div", qm, [Y("span", Jm, B(W(r)("bubbleRender.style_avatarShape")), 1), Y("div", Ym, [(q(), J(K, null, G([
					"circle",
					"rounded",
					"square"
				], (e) => Y("button", {
					key: e,
					type: "button",
					class: z(["bd-seg", { active: d.value === e }]),
					onClick: (t) => d.value = e
				}, B(i("bubbleRender.shape_" + e)), 11, Xm)), 64))])])
			]),
			Y("section", null, [Y("h4", Zm, B(W(r)("bubbleRender.secFont")), 1), (q(!0), J(K, null, G([
				["narrationFont", h.value],
				["dialogueFont", g.value],
				["nameFont", _.value]
			], (e) => (q(), J("label", {
				class: "bd-inline",
				key: e[0]
			}, [Y("span", null, B(i("bubbleRender.style_" + e[0])), 1), Y("select", {
				class: "bd-select",
				value: e[1],
				onChange: (n) => t.controller.runtime.config.setStyle("style_" + e[0] + "Family", n.target.value)
			}, [(q(), J(K, null, G(m, (e) => Y("option", {
				key: e,
				value: e
			}, B(e || W(r)("bubbleRender.fontDefault")), 9, $m)), 64))], 40, Qm)]))), 128))]),
			Y("section", null, [
				Y("h4", eh, B(W(r)("bubbleRender.secStorage")), 1),
				Y("label", th, [Sn(Y("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[5] ||= (e) => p.value = e
				}, null, 512), [[ss, p.value]]), Y("span", null, B(W(r)("bubbleRender.compressEnabled")), 1)]),
				Y("div", nh, [Y("div", rh, [Y("span", null, B(W(r)("bubbleRender.style_compressQuality")), 1), Y("span", ih, B(v("style_imageCompressQuality")), 1)]), Y("input", {
					type: "range",
					min: "0.3",
					max: "1",
					step: "0.02",
					value: v("style_imageCompressQuality"),
					onInput: n[6] ||= (e) => y("style_imageCompressQuality", e)
				}, null, 40, ah)])
			]),
			Y("section", null, [Y("h4", oh, B(W(r)("bubbleRender.secMarkdown")), 1), Y("div", sh, [Y("button", {
				type: "button",
				class: z(["bd-seg", { active: f.value === "basic" }]),
				onClick: n[7] ||= (e) => f.value = "basic"
			}, B(W(r)("bubbleRender.mdBasic")), 3), Y("button", {
				type: "button",
				class: z(["bd-seg", { active: f.value === "full" }]),
				onClick: n[8] ||= (e) => f.value = "full"
			}, B(W(r)("bubbleRender.mdFull")), 3)])]),
			Y("div", ch, [Y("button", {
				type: "button",
				class: "bd-btn",
				onClick: b
			}, B(W(r)("bubbleRender.btnResetStyle")), 1)])
		]));
	}
}), [["__scopeId", "data-v-b1577175"]]), uh = { class: "bd-tab" }, dh = { class: "bd-loading-row" }, fh = { class: "bd-sec" }, ph = { class: "bd-warn" }, mh = { class: "bd-actions" }, hh = ["disabled"], gh = { class: "bd-sec" }, _h = { class: "bd-group-head" }, vh = { class: "bd-group-label" }, yh = { class: "bd-group-count" }, bh = ["value", "onInput"], xh = { class: "bd-words" }, Sh = ["onClick"], Ch = { class: "bd-add-row" }, wh = [
	"onUpdate:modelValue",
	"placeholder",
	"onKeyup"
], Th = ["onClick"], Eh = { class: "bd-actions" }, Dh = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "MoodPage",
	props: { controller: {} },
	setup(e) {
		let t = e, n = Uf(), r = n.t.bind(n), i = Q(() => t.controller.runtime.config.state), a = Q(() => !i.value.loaded), o = /* @__PURE__ */ U(""), s = Q(() => o.value !== "" && o.value !== i.value.formatRule);
		function c() {
			o.value = i.value.formatRule;
		}
		c();
		let l = /* @__PURE__ */ U({});
		async function u() {
			await t.controller.runtime.config.setFormatRule(o.value), c();
		}
		async function d() {
			await t.controller.runtime.config.resetFormatRule(), c();
		}
		async function f(e) {
			let n = (l.value[e] ?? "").trim();
			n && (await t.controller.runtime.config.addMoodWord(e, n), l.value = {
				...l.value,
				[e]: ""
			});
		}
		async function p(e, n) {
			await t.controller.runtime.config.removeMoodWord(e, n);
		}
		async function m(e, n) {
			await t.controller.runtime.config.setMoodColor(e, n.target.value);
		}
		async function h() {
			await t.controller.runtime.config.resetMoodGroups();
		}
		return (e, t) => (q(), J("div", uh, [
			Y("div", dh, [X(Yf, {
				loading: a.value,
				"loading-text": W(r)("bubbleRender.loadingConfig"),
				"done-text": W(r)("common.loaded")
			}, null, 8, [
				"loading",
				"loading-text",
				"done-text"
			])]),
			Y("section", null, [
				Y("h4", fh, B(W(r)("bubbleRender.secFormatRule")), 1),
				Y("div", ph, "⚠ " + B(W(r)("bubbleRender.formatRuleWarn")), 1),
				Sn(Y("textarea", {
					"onUpdate:modelValue": t[0] ||= (e) => o.value = e,
					class: "bd-textarea",
					spellcheck: "false"
				}, null, 512), [[os, o.value]]),
				Y("div", mh, [Y("button", {
					type: "button",
					class: "bd-btn ghost",
					onClick: d
				}, B(W(r)("bubbleRender.btnResetFormat")), 1), Y("button", {
					type: "button",
					class: "bd-btn",
					disabled: !s.value,
					onClick: u
				}, B(W(r)("bubbleRender.btnSave")), 9, hh)])
			]),
			Y("section", null, [
				Y("h4", gh, B(W(r)("bubbleRender.secMoodWords")), 1),
				(q(!0), J(K, null, G(i.value.moodGroups, (e) => (q(), J("div", {
					key: e.id,
					class: "bd-group"
				}, [
					Y("div", _h, [
						Y("span", {
							class: "bd-group-dot",
							style: L({ background: e.color })
						}, null, 4),
						Y("span", vh, B(e.label), 1),
						Y("span", yh, B(e.words.length), 1),
						Y("input", {
							type: "color",
							class: "bd-color",
							value: e.color,
							onInput: (t) => m(e.id, t)
						}, null, 40, bh)
					]),
					Y("div", xh, [(q(!0), J(K, null, G(e.words, (t) => (q(), J("span", {
						key: t,
						class: "bd-word"
					}, [da(B(t) + " ", 1), Y("button", {
						type: "button",
						class: "bd-word-del",
						onClick: (n) => p(e.id, t)
					}, "×", 8, Sh)]))), 128))]),
					Y("div", Ch, [Sn(Y("input", {
						class: "bd-input",
						"onUpdate:modelValue": (t) => l.value[e.id] = t,
						placeholder: W(r)("bubbleRender.addWordPlaceholder"),
						onKeyup: gs((t) => f(e.id), ["enter"])
					}, null, 40, wh), [[os, l.value[e.id]]]), Y("button", {
						type: "button",
						class: "bd-btn small",
						onClick: (t) => f(e.id)
					}, "＋", 8, Th)])
				]))), 128)),
				Y("div", Eh, [Y("button", {
					type: "button",
					class: "bd-btn ghost",
					onClick: h
				}, B(W(r)("bubbleRender.btnResetMoods")), 1)])
			])
		]));
	}
}), [["__scopeId", "data-v-0fbf8b60"]]), Oh = { class: "bd-page" }, kh = { class: "bd-panels" }, Ah = {
	key: 0,
	class: "bd-section"
}, jh = { class: "bd-sec" }, Mh = ["disabled"], Nh = { class: "bd-loading-row" }, Ph = {
	key: 0,
	class: "bd-detail-empty small"
}, Fh = {
	key: 1,
	class: "bd-table"
}, Ih = { class: "bd-tr bd-th" }, Lh = { class: "bd-th-actions" }, Rh = ["disabled", "title"], zh = ["disabled"], Bh = ["title"], Vh = ["data-label"], Hh = ["data-label"], Uh = ["data-label"], Wh = { class: "bd-actions" }, Gh = ["disabled", "onClick"], Kh = [
	"disabled",
	"title",
	"onClick"
], qh = ["disabled", "onClick"], Jh = { class: "bd-note" }, Yh = {
	key: 2,
	class: "bd-result"
}, Xh = { class: "bd-section" }, Zh = { class: "bd-sec" }, Qh = { class: "bd-hint" }, $h = { class: "bd-loading-row" }, eg = {
	key: 0,
	class: "bd-result"
}, tg = {
	key: 1,
	class: "bd-hint"
}, ng = { class: "bd-stats-row" }, rg = { class: "bd-stat" }, ig = { class: "bd-stat-label" }, ag = { class: "bd-stat-value" }, og = { class: "bd-stat" }, sg = { class: "bd-stat-label" }, cg = { class: "bd-stat-value" }, lg = { class: "bd-stat" }, ug = { class: "bd-stat-label" }, dg = { class: "bd-stat-value" }, fg = { class: "bd-stat" }, pg = { class: "bd-stat-label" }, mg = { class: "bd-stat-value" }, hg = { class: "bd-actions-row" }, gg = ["disabled"], _g = { class: "bd-section" }, vg = { class: "bd-sec" }, yg = { class: "bd-hint" }, bg = {
	key: 0,
	class: "bd-detail-empty small"
}, xg = {
	key: 1,
	class: "bd-table"
}, Sg = { class: "bd-tr bd-th cols-6" }, Cg = ["title"], wg = ["data-label"], Tg = ["data-label"], Eg = ["data-label"], Dg = ["data-label"], Og = { class: "bd-actions" }, kg = ["disabled", "onClick"], Ag = ["disabled", "onClick"], jg = { class: "bd-section" }, Mg = { class: "bd-sec" }, Ng = { class: "bd-stats-row" }, Pg = { class: "bd-stat" }, Fg = { class: "bd-stat-label" }, Ig = { class: "bd-stat-value" }, Lg = { class: "bd-stat" }, Rg = { class: "bd-stat-label" }, zg = { class: "bd-stat-value" }, Bg = { class: "bd-stat" }, Vg = { class: "bd-stat-label" }, Hg = { class: "bd-stat-value" }, Ug = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "StoragePage",
	props: { controller: {} },
	setup(e) {
		let t = e, n = Uf(), r = n.t.bind(n), i = t.controller.runtime, a = Q(() => i.state), o = /* @__PURE__ */ U("native"), s = /* @__PURE__ */ U([]), c = /* @__PURE__ */ U(!1), l = /* @__PURE__ */ U(null), u = /* @__PURE__ */ U(null), d = /* @__PURE__ */ U(!1), f = Q(() => a.value.nativeAvailable);
		async function p() {
			c.value = !0;
			try {
				s.value = await i.listDbScopes();
			} catch (e) {
				console.error("[BubbleDialogue] scan DB failed.", e), s.value = [];
			} finally {
				c.value = !1;
			}
		}
		function m(e) {
			return e === "_global_" ? r("bubbleRender.scopeGlobal") : e;
		}
		async function h(e) {
			l.value = e, a.value.lastResult = null;
			try {
				let t = await i.convertScope(e);
				a.value.lastResult = r("bubbleRender.convertDone", {
					scope: m(e),
					a: t.avatars,
					m: t.moodAvatars
				});
			} catch (t) {
				a.value.lastResult = `${m(e)}: ${t instanceof Error ? t.message : String(t)}`;
			} finally {
				l.value = null, await p();
			}
		}
		async function g(e) {
			u.value = null, l.value = e;
			try {
				await i.removeDbScope(e), a.value.lastResult = r("bubbleRender.deleteScopeDone", { scope: m(e) });
			} catch (e) {
				console.error("[BubbleDialogue] delete scope failed.", e);
			} finally {
				l.value = null, await p();
			}
		}
		async function _() {
			d.value = !1, l.value = "*";
			try {
				let e = await i.convertAllAndRemove();
				a.value.lastResult = r("bubbleRender.convertAllDone", {
					n: e.converted,
					f: e.failed
				});
			} catch (e) {
				console.error("[BubbleDialogue] convert all failed.", e);
			} finally {
				l.value = null, await p();
			}
		}
		function v(e) {
			return e >= 1024 * 1024 ? (e / 1024 / 1024).toFixed(1) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B";
		}
		let y = /* @__PURE__ */ U(null);
		function b(e) {
			return e.avatars + e.moodAvatars + e.cgImages > 0;
		}
		function x(e) {
			return e === "_global_" ? r("bubbleRender.scopeGlobal") : String(a.value.charId ?? "") === String(e) && a.value.charName || e;
		}
		async function S(e) {
			y.value = null, l.value = e, a.value.lastResult = null;
			try {
				await i.removeNativeScope(e), a.value.lastResult = r("bubbleRender.deleteScopeDone", { scope: x(e) });
			} catch (t) {
				a.value.lastResult = `${x(e)}: ${t instanceof Error ? t.message : String(t)}`;
			} finally {
				l.value = null;
			}
		}
		return xr(() => {
			p();
		}), (e, t) => (q(), J("div", Oh, [Y("nav", kh, [Y("button", {
			type: "button",
			class: z(["bd-panel-btn", { active: o.value === "native" }]),
			onClick: t[0] ||= (e) => o.value = "native"
		}, B(W(r)("bubbleRender.panelNative")), 3), Y("button", {
			type: "button",
			class: z(["bd-panel-btn", { active: o.value === "legacy" }]),
			onClick: t[1] ||= (e) => o.value = "legacy"
		}, B(W(r)("bubbleRender.panelLegacy")), 3)]), o.value === "legacy" ? (q(), J("section", Ah, [
			Y("h4", jh, [da(B(W(r)("bubbleRender.dbScopesTitle")) + " ", 1), Y("button", {
				type: "button",
				class: "bd-mini",
				disabled: c.value,
				onClick: p
			}, B(W(r)("bubbleRender.btnRescan")), 9, Mh)]),
			Y("div", Nh, [X(Yf, {
				loading: c.value,
				"loading-text": W(r)("bubbleRender.scanDb"),
				"done-text": W(r)("common.loaded")
			}, null, 8, [
				"loading",
				"loading-text",
				"done-text"
			])]),
			!c.value && s.value.length === 0 ? (q(), J("div", Ph, B(W(r)("bubbleRender.noDbData")), 1)) : (q(), J("div", Fh, [Y("div", Ih, [
				Y("span", null, B(W(r)("bubbleRender.colScope")), 1),
				Y("span", null, B(W(r)("bubbleRender.avatarCount")), 1),
				Y("span", null, B(W(r)("bubbleRender.moodCount")), 1),
				Y("span", null, B(W(r)("bubbleRender.colSize")), 1),
				Y("span", Lh, [d.value ? (q(), J(K, { key: 1 }, [Y("button", {
					type: "button",
					class: "bd-btn tiny danger",
					disabled: l.value !== null,
					onClick: _
				}, B(W(r)("bubbleRender.btnConfirm")), 9, zh), Y("button", {
					type: "button",
					class: "bd-btn tiny ghost",
					onClick: t[3] ||= (e) => d.value = !1
				}, B(W(r)("bubbleRender.btnCancel")), 1)], 64)) : (q(), J("button", {
					key: 0,
					type: "button",
					class: "bd-btn tiny danger",
					disabled: l.value !== null || !f.value,
					title: f.value ? "" : W(r)("bubbleRender.convertUnavailable"),
					onClick: t[2] ||= (e) => d.value = !0
				}, B(W(r)("bubbleRender.btnConvertAllRemove")), 9, Rh))])
			]), (q(!0), J(K, null, G(s.value, (e) => (q(), J("div", {
				key: e.charId,
				class: "bd-tr"
			}, [
				Y("span", {
					class: "bd-scope",
					title: e.charId
				}, B(m(e.charId)), 9, Bh),
				Y("span", { "data-label": W(r)("bubbleRender.avatarCount") }, B(e.avatars), 9, Vh),
				Y("span", { "data-label": W(r)("bubbleRender.moodCount") }, B(e.moodAvatars), 9, Hh),
				Y("span", { "data-label": W(r)("bubbleRender.colSize") }, B(v(e.bytes)), 9, Uh),
				Y("span", Wh, [u.value === e.charId ? (q(), J(K, { key: 0 }, [Y("button", {
					type: "button",
					class: "bd-btn tiny danger",
					disabled: l.value !== null,
					onClick: (t) => g(e.charId)
				}, B(W(r)("bubbleRender.btnConfirm")), 9, Gh), Y("button", {
					type: "button",
					class: "bd-btn tiny ghost",
					onClick: t[4] ||= (e) => u.value = null
				}, B(W(r)("bubbleRender.btnCancel")), 1)], 64)) : (q(), J(K, { key: 1 }, [Y("button", {
					type: "button",
					class: "bd-btn tiny",
					disabled: l.value !== null || !f.value,
					title: f.value ? "" : W(r)("bubbleRender.convertUnavailable"),
					onClick: (t) => h(e.charId)
				}, B(l.value === e.charId ? W(r)("bubbleRender.converting") : W(r)("bubbleRender.btnConvert")), 9, Kh), Y("button", {
					type: "button",
					class: "bd-btn tiny ghost danger-text",
					disabled: l.value !== null,
					onClick: (t) => u.value = e.charId
				}, B(W(r)("bubbleRender.btnDelete")), 9, qh)], 64))])
			]))), 128))])),
			Y("p", Jh, B(W(r)("bubbleRender.dbHint")), 1),
			a.value.lastResult ? (q(), J("p", Yh, B(a.value.lastResult), 1)) : Z("", !0)
		])) : (q(), J(K, { key: 1 }, [
			Y("section", Xh, [
				Y("h4", Zh, B(W(r)("bubbleRender.statsTitle")), 1),
				Y("p", Qh, B(W(r)("bubbleRender.statsAllScopesHint")), 1),
				Y("div", $h, [X(Yf, {
					loading: a.value.totalStatsLoading,
					"loading-text": W(r)("bubbleRender.loadingStats"),
					"done-text": W(r)("common.loaded")
				}, null, 8, [
					"loading",
					"loading-text",
					"done-text"
				])]),
				a.value.totalStatsError ? (q(), J("p", eg, B(W(r)("bubbleRender.statsUnavailable")), 1)) : a.value.totalStatsStale ? (q(), J("p", tg, B(W(r)("bubbleRender.statsStaleHint")), 1)) : Z("", !0),
				Y("div", ng, [
					Y("div", rg, [Y("span", ig, B(W(r)("bubbleRender.totalAvatars")), 1), Y("span", ag, B(a.value.totalAvatars), 1)]),
					Y("div", og, [Y("span", sg, B(W(r)("bubbleRender.totalMoodAvatars")), 1), Y("span", cg, B(a.value.totalMoodAvatars), 1)]),
					Y("div", lg, [Y("span", ug, B(W(r)("bubbleRender.totalCgImages")), 1), Y("span", dg, B(a.value.totalCgImages), 1)]),
					Y("div", fg, [Y("span", pg, B(W(r)("bubbleRender.totalStorageSize")), 1), Y("span", mg, B(v(a.value.totalStorageBytes)), 1)])
				]),
				Y("div", hg, [Y("button", {
					type: "button",
					class: "bd-btn ghost",
					disabled: a.value.totalStatsLoading,
					onClick: t[5] ||= (e) => W(i).refreshTotalStats()
				}, B(W(r)("bubbleRender.btnRefreshStats")), 9, gg)])
			]),
			Y("section", _g, [
				Y("h4", vg, B(W(r)("bubbleRender.dbScopesTitle")), 1),
				Y("p", yg, B(W(r)("bubbleRender.nativeScopesHint")), 1),
				a.value.nativeScopes.length === 0 ? (q(), J("div", bg, B(a.value.totalStatsLoading ? W(r)("bubbleRender.loading") : W(r)("bubbleRender.noDbData")), 1)) : (q(), J("div", xg, [Y("div", Sg, [
					Y("span", null, B(W(r)("bubbleRender.colScope")), 1),
					Y("span", null, B(W(r)("bubbleRender.avatarCount")), 1),
					Y("span", null, B(W(r)("bubbleRender.moodCount")), 1),
					Y("span", null, B(W(r)("bubbleRender.colCgCount")), 1),
					Y("span", null, B(W(r)("bubbleRender.colSize")), 1),
					t[7] ||= Y("span", { class: "bd-th-actions" }, null, -1)
				]), (q(!0), J(K, null, G(a.value.nativeScopes, (e) => (q(), J("div", {
					key: e.charId,
					class: "bd-tr cols-6"
				}, [
					Y("span", {
						class: "bd-scope",
						title: e.charId
					}, B(x(e.charId)), 9, Cg),
					Y("span", { "data-label": W(r)("bubbleRender.avatarCount") }, B(e.avatars), 9, wg),
					Y("span", { "data-label": W(r)("bubbleRender.moodCount") }, B(e.moodAvatars), 9, Tg),
					Y("span", { "data-label": W(r)("bubbleRender.colCgCount") }, B(e.cgImages), 9, Eg),
					Y("span", { "data-label": W(r)("bubbleRender.colSize") }, B(v(e.bytes)), 9, Dg),
					Y("span", Og, [y.value === e.charId ? (q(), J(K, { key: 0 }, [Y("button", {
						type: "button",
						class: "bd-btn tiny danger",
						disabled: l.value !== null,
						onClick: (t) => S(e.charId)
					}, B(W(r)("bubbleRender.btnConfirm")), 9, kg), Y("button", {
						type: "button",
						class: "bd-btn tiny ghost",
						onClick: t[6] ||= (e) => y.value = null
					}, B(W(r)("bubbleRender.btnCancel")), 1)], 64)) : (q(), J("button", {
						key: 1,
						type: "button",
						class: "bd-btn tiny ghost danger-text",
						disabled: l.value !== null || !b(e),
						onClick: (t) => y.value = e.charId
					}, B(l.value === e.charId ? W(r)("bubbleRender.deleting") : W(r)("bubbleRender.btnDelete")), 9, Ag))])
				]))), 128))]))
			]),
			Y("section", jg, [Y("h4", Mg, B(W(r)("bubbleRender.sectionRuntime")), 1), Y("div", Ng, [
				Y("div", Pg, [Y("span", Fg, B(W(r)("bubbleRender.statReady")), 1), Y("span", Ig, B(a.value.ready ? W(r)("bubbleRender.yes") : W(r)("bubbleRender.no")), 1)]),
				Y("div", Lg, [Y("span", Rg, B(W(r)("bubbleRender.statBubbles")), 1), Y("span", zg, B(a.value.bubbleCount), 1)]),
				Y("div", Bg, [Y("span", Vg, B(W(r)("bubbleRender.statInjected")), 1), Y("span", Hg, B(a.value.injected ? W(r)("bubbleRender.yes") : W(r)("bubbleRender.no")), 1)])
			])])
		], 64))]));
	}
}), [["__scopeId", "data-v-3aad9d0e"]]);
//#endregion
//#region src/features/bubble-render/modules.ts
function Wg(e) {
	let t = Ff(e);
	return {
		runtime: t,
		async activate() {
			await t.acquire();
		},
		async deactivate() {
			await t.release();
		}
	};
}
function Gg(e, t, n, r, i) {
	return {
		id: e,
		area: "bubble-dialogue",
		titleKey: t,
		descriptionKey: n,
		order: r,
		capabilities: [],
		defaultEnabled: !0,
		component: i,
		createController: Wg
	};
}
var Kg = [
	Gg("bubble-avatar", "bubbleRender.pageAvatar", "bubbleRender.pageAvatarDesc", 10, Dm),
	Gg("bubble-style", "bubbleRender.pageStyle", "bubbleRender.pageStyleDesc", 20, lh),
	Gg("bubble-mood", "bubbleRender.pageMood", "bubbleRender.pageMoodDesc", 30, Dh),
	Gg("bubble-storage", "bubbleRender.pageStorage", "bubbleRender.pageStorageDesc", 40, Ug)
], qg = { class: "lg-page" }, Jg = { class: "lg-toolbar" }, Yg = ["disabled"], Xg = ["disabled"], Zg = ["disabled"], Qg = { class: "lg-hint" }, $g = {
	key: 0,
	class: "lg-error"
}, e_ = {
	key: 0,
	class: "lg-empty"
}, t_ = { class: "lg-time" }, n_ = { class: "lg-level" }, r_ = { class: "lg-body" }, i_ = {
	key: 0,
	class: "lg-target"
}, a_ = { class: "lg-message" }, o_ = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "LogsPage",
	props: { controller: {} },
	setup(e) {
		let t = e, n = Uf(), r = n.t.bind(n), i = Q(() => t.controller.state), a = /* @__PURE__ */ U(null), o = Q(() => i.value.recording ? r("logs.statusRecording", { n: i.value.entries.length }) : r("logs.statusStopped", { n: i.value.entries.length }));
		function s(e, t = 2) {
			return String(e).padStart(t, "0");
		}
		function c(e) {
			let t = new Date(Number.isFinite(e) ? e : Date.now());
			return `${s(t.getHours())}:${s(t.getMinutes())}:${s(t.getSeconds())}.${s(t.getMilliseconds(), 3)}`;
		}
		return On(() => i.value.entries.length, async () => {
			if (!i.value.recording) return;
			await ln();
			let e = a.value;
			e && (e.scrollTop = e.scrollHeight);
		}), (e, n) => (q(), J("div", qg, [
			Y("div", Jg, [
				i.value.recording ? (q(), J("button", {
					key: 1,
					type: "button",
					class: "lg-btn danger",
					disabled: i.value.busy,
					onClick: n[1] ||= (e) => t.controller.stop()
				}, B(W(r)("logs.stop")), 9, Xg)) : (q(), J("button", {
					key: 0,
					type: "button",
					class: "lg-btn primary",
					disabled: i.value.busy,
					onClick: n[0] ||= (e) => t.controller.start()
				}, B(W(r)("logs.start")), 9, Yg)),
				Y("button", {
					type: "button",
					class: "lg-btn ghost",
					disabled: i.value.entries.length === 0,
					onClick: n[2] ||= (e) => t.controller.clear()
				}, B(W(r)("logs.clear")), 9, Zg),
				Y("span", { class: z(["lg-status", { on: i.value.recording }]) }, B(o.value), 3)
			]),
			Y("p", Qg, B(W(r)("logs.hint")), 1),
			i.value.error ? (q(), J("p", $g, B(W(r)("logs.unavailable")) + "（" + B(i.value.error) + "）", 1)) : Z("", !0),
			Y("div", {
				ref_key: "listRef",
				ref: a,
				class: "lg-list"
			}, [i.value.entries.length === 0 ? (q(), J("p", e_, B(W(r)("logs.empty")), 1)) : Z("", !0), (q(!0), J(K, null, G(i.value.entries, (e) => (q(), J("div", {
				key: e.key,
				class: z(["lg-row", e.level])
			}, [
				Y("span", t_, B(c(e.timestampMs)), 1),
				Y("span", n_, B(e.level), 1),
				Y("span", r_, [e.target && e.target !== "main" ? (q(), J("span", i_, B(e.target), 1)) : Z("", !0), Y("span", a_, B(e.message), 1)])
			], 2))), 128))], 512)
		]));
	}
}), [["__scopeId", "data-v-c906dcce"]]), s_ = "[BubbleDialogue]", c_ = 300, l_ = 50;
function u_(e, t) {
	return String(e ?? "").includes(s_) ? !0 : String(t ?? "") === "3p:BubbleDialogue";
}
function d_(e) {
	let t = String(e ?? "").toLowerCase();
	return t === "debug" || t === "warn" || t === "error" ? t : "info";
}
function f_(e) {
	let t = /* @__PURE__ */ Dt({
		recording: !1,
		busy: !1,
		error: null,
		entries: []
	}), n = null, r = null, i = /* @__PURE__ */ new Set(), a = (e) => {
		if (i.has(e.key)) return;
		i.add(e.key);
		let n = t.entries.concat(e);
		if (t.entries = n.length > c_ ? n.slice(n.length - c_) : n, i.size > c_ * 2) {
			i.clear();
			for (let e of t.entries) i.add(e.key);
		}
	}, o = (e) => {
		let t = String(e.message ?? ""), n = String(e.target ?? "main");
		u_(t, n) && a({
			key: `f:${e.id}`,
			timestampMs: Number(e.timestampMs ?? Date.now()),
			level: d_(e.level),
			target: n,
			message: t
		});
	};
	async function s() {
		let i = e.host.api.dev?.frontendLogs, a = n;
		if (n = null, a) try {
			await a();
		} catch (e) {
			console.warn("[BubbleDialogue] unsubscribe frontend logs failed.", e);
		}
		if (i && r !== null) {
			let e = r;
			r = null;
			try {
				await i.setConsoleCaptureEnabled(e);
			} catch (e) {
				console.warn("[BubbleDialogue] restore console capture failed.", e);
			}
		}
		t.recording = !1;
	}
	async function c() {
		if (t.recording || t.busy) return;
		let i = e.host.api.dev?.frontendLogs;
		if (!i) {
			t.error = "host-api-unavailable";
			return;
		}
		t.busy = !0, t.error = null;
		try {
			let e = await i.getConsoleCaptureEnabled();
			e || (await i.setConsoleCaptureEnabled(!0), r = e);
			for (let e of await i.list({ limit: l_ })) o(e);
			n = await i.subscribe(o), t.recording = !0;
		} catch (e) {
			t.error = e instanceof Error ? e.message : String(e), await s();
		} finally {
			t.busy = !1;
		}
	}
	return {
		state: t,
		start: c,
		stop: s,
		clear() {
			t.entries = [], i.clear();
		},
		async activate() {},
		async deactivate() {
			await s();
		}
	};
}
//#endregion
//#region src/features/dev-logs/module.ts
var p_ = {
	id: "bubble-logs",
	area: "bubble-dialogue",
	titleKey: "logs.pageTitle",
	descriptionKey: "logs.pageDesc",
	order: 50,
	capabilities: ["dev.frontendLogs", "dev.backendLogs"],
	defaultEnabled: !0,
	component: o_,
	createController: (e) => f_(e)
}, m_ = [...Kg, p_];
//#endregion
//#region src/features/catalog.ts
function h_(e) {
	return e.slice().sort((e, t) => e.order - t.order);
}
function g_(e) {
	return h_(m_).filter((t) => e.supportsAll(t.capabilities));
}
//#endregion
//#region src/features/registry.ts
function __(e) {
	let t = /* @__PURE__ */ Dt(g_(e.host).map((t) => ({
		id: t.id,
		area: t.area,
		titleKey: t.titleKey,
		descriptionKey: t.descriptionKey,
		order: t.order,
		capabilities: t.capabilities,
		component: t.component,
		controller: t.createController(e),
		enabled: e.settings.isFeatureEnabled(t.id, t.defaultEnabled),
		active: !1
	}))), n = (e) => {
		let n = t.find((t) => t.id === e);
		if (!n) throw Error(`Unknown feature: ${e}`);
		return n;
	}, r = async (e) => {
		e.active ||= (await e.controller.activate(), !0);
	}, i = async (e) => {
		e.active &&= (await e.controller.deactivate(), !1);
	};
	return {
		features: t,
		async activateEnabledFeatures() {
			for (let e of t) e.enabled && await r(e);
		},
		async deactivateAllFeatures() {
			for (let e of t) await i(e);
		},
		async setFeatureEnabled(t, a) {
			let o = n(t);
			if (o.enabled !== a) {
				if (a) {
					await r(o), o.enabled = !0, e.settings.setFeatureEnabled(t, !0);
					return;
				}
				await i(o), o.enabled = !1, e.settings.setFeatureEnabled(t, !1), e.shell.state.activeTab === t && e.shell.setActiveTab("settings");
			}
		},
		getFeaturesByArea(e) {
			return t.filter((t) => t.enabled && t.area === e);
		},
		getActiveFeatures() {
			return t.filter((e) => e.active);
		},
		resolveTab(e) {
			return qc(e, t.filter((e) => e.active).map((e) => e.id));
		}
	};
}
//#endregion
//#region src/app/shell-store.ts
function v_(e, t) {
	let n = /* @__PURE__ */ Dt({
		panelOpen: !1,
		activeTab: e.state.activeTab
	}), r = (t) => {
		n.activeTab = t, e.setActiveTab(t);
	}, i = (e) => {
		e && r(e), n.panelOpen = !0, t.markAllRead();
	};
	return {
		state: n,
		openPanel: i,
		closePanel() {
			n.panelOpen = !1;
		},
		togglePanel(e) {
			if (n.panelOpen && !e) {
				n.panelOpen = !1;
				return;
			}
			i(e);
		},
		setActiveTab: r
	};
}
//#endregion
//#region src/app/settings-store.ts
var y_ = "ttbd:settings";
function b_() {
	return {
		enabled: !0,
		enabledFeatures: {},
		bubblePosition: null,
		activeTab: "settings",
		appearanceMode: oc,
		customBubbleIcon: null,
		customBubbleBgTransparent: !1
	};
}
function x_() {
	let e = localStorage.getItem(y_);
	if (!e) return b_();
	try {
		let t = JSON.parse(e);
		return {
			...b_(),
			...t,
			appearanceMode: t.appearanceMode === "day" ? "day" : oc,
			customBubbleIcon: t.customBubbleIcon ?? null,
			customBubbleBgTransparent: !!t.customBubbleBgTransparent
		};
	} catch {
		return b_();
	}
}
function S_(e) {
	return {
		enabled: e.enabled,
		enabledFeatures: { ...e.enabledFeatures },
		bubblePosition: e.bubblePosition ? { ...e.bubblePosition } : null,
		activeTab: e.activeTab,
		appearanceMode: e.appearanceMode,
		customBubbleIcon: e.customBubbleIcon,
		customBubbleBgTransparent: e.customBubbleBgTransparent
	};
}
function C_() {
	let e = /* @__PURE__ */ Dt(x_()), t = /* @__PURE__ */ new Set(), n = () => {
		localStorage.setItem(y_, JSON.stringify(S_(e)));
	}, r = () => {
		n(), t.forEach((e) => e());
	};
	return {
		state: e,
		subscribe(e) {
			return t.add(e), () => {
				t.delete(e);
			};
		},
		setEnabled(t) {
			e.enabled !== t && (e.enabled = t, r());
		},
		setAppearanceMode(t) {
			e.appearanceMode !== t && (e.appearanceMode = t, r());
		},
		isFeatureEnabled(t, n) {
			return e.enabledFeatures[t] ?? n;
		},
		setFeatureEnabled(t, n) {
			e.enabledFeatures[t] !== n && (e.enabledFeatures[t] = n, r());
		},
		setBubblePosition(t) {
			e.bubblePosition?.x === t.x && e.bubblePosition?.y === t.y || (e.bubblePosition = { ...t }, r());
		},
		setActiveTab(t) {
			e.activeTab !== t && (e.activeTab = t, r());
		},
		setCustomBubbleIcon(t) {
			e.customBubbleIcon !== t && (e.customBubbleIcon = t, r());
		},
		setCustomBubbleBgTransparent(t) {
			e.customBubbleBgTransparent !== t && (e.customBubbleBgTransparent = t, r());
		}
	};
}
//#endregion
//#region src/app/layout-store.ts
var w_ = 768;
function T_(e = 0, t = 0, n = 0, r = 0) {
	return {
		top: Math.max(0, e),
		right: Math.max(0, t),
		bottom: Math.max(0, n),
		left: Math.max(0, r)
	};
}
function E_(e = 0, t = 0, n = 0, r = 0) {
	let i = Math.max(0, e), a = Math.max(0, t), o = Math.max(0, n), s = Math.max(0, r);
	return {
		left: i,
		top: a,
		width: o,
		height: s,
		right: i + o,
		bottom: a + s
	};
}
function D_(e, t, n, r, i) {
	e.left = Math.max(0, t), e.top = Math.max(0, n), e.width = Math.max(0, r), e.height = Math.max(0, i), e.right = e.left + e.width, e.bottom = e.top + e.height;
}
function O_(e, t) {
	let n = t.safeInsets ?? T_();
	e.safeInsets.top = n.top, e.safeInsets.right = n.right, e.safeInsets.bottom = n.bottom, e.safeInsets.left = n.left;
	let r = t.viewport ?? E_();
	D_(e.viewportFrame, r.left, r.top, r.width, r.height);
	let i = t.safeFrame ?? E_();
	D_(e.safeFrame, i.left, i.top, i.width, i.height), e.compact = e.safeFrame.width <= w_;
}
async function k_(e) {
	let t = /* @__PURE__ */ Dt({
		compact: !1,
		safeInsets: T_(),
		viewportFrame: E_(),
		safeFrame: E_()
	}), n = null, r = !1, i = () => {
		if (r) throw Error("Layout store is disposed.");
		O_(t, e.snapshot());
	};
	return i(), n = await e.subscribe((e) => {
		r || O_(t, e);
	}), {
		state: t,
		refresh: i,
		async dispose() {
			r = !0, await n?.();
		}
	};
}
//#endregion
//#region src/app/create-creator-app.ts
async function A_(e, t = {}) {
	let n = t.settings ?? C_(), r = t.i18n ?? Vf();
	if (!e.api.layout) throw Error("Host layout API is unavailable.");
	let i = await k_(e.api.layout), a = Es(), o = {
		host: e,
		settings: n,
		shell: v_(n, a),
		layout: i,
		bubbleBus: a,
		i18n: r
	}, s = __(o);
	return await s.activateEnabledFeatures(), {
		...o,
		registry: s
	};
}
//#endregion
//#region src/host/api.ts
function j_() {
	return window.__TAURITAVERN__?.api ?? null;
}
async function M_() {
	let e = window.__TAURITAVERN__?.ready ?? window.__TAURITAVERN_MAIN_READY__;
	e && await e;
}
//#endregion
//#region src/host/client.ts
function N_(e) {
	let t = /* @__PURE__ */ new Set();
	return e.layout && t.add("layout"), e.chat && t.add("chat"), e.dev?.frontendLogs && t.add("dev.frontendLogs"), e.dev?.backendLogs && t.add("dev.backendLogs"), e.dev?.llmApiLogs && t.add("dev.llmApiLogs"), e.worldInfo && t.add("worldInfo"), e.extension?.store && t.add("extension.store"), t;
}
function P_(e = j_()) {
	if (!e) throw Error("TauriTavern host API is unavailable.");
	let t = N_(e);
	return {
		api: e,
		capabilities: t,
		supports(e) {
			return t.has(e);
		},
		supportsAll(e) {
			return e.every((e) => t.has(e));
		},
		getChatHandle() {
			if (!e.chat) throw Error("Chat API is unavailable.");
			return e.chat.current.handle();
		},
		getChatWindowInfo() {
			if (!e.chat) throw Error("Chat API is unavailable.");
			return e.chat.current.windowInfo();
		}
	};
}
//#endregion
//#region src/settings-page/ExtensionsPagePanel.vue?vue&type=script&setup=true&lang.ts
var F_ = { class: "inline-drawer wide100p ttbd-settings-drawer" }, I_ = { class: "inline-drawer-content" }, L_ = ["data-ttbd-appearance"], R_ = /* @__PURE__ */ Us(/* @__PURE__ */ or({
	__name: "ExtensionsPagePanel",
	props: {
		settings: {},
		features: {},
		setFeatureEnabled: { type: Function }
	},
	setup(e) {
		let t = e, n = Vf(), r = n.t.bind(n), i = Q(() => t.features.map((e) => ({
			id: e.id,
			area: e.area,
			titleKey: e.titleKey,
			descriptionKey: e.descriptionKey,
			enabled: t.settings.isFeatureEnabled(e.id, e.defaultEnabled)
		}))), a = (e) => {
			t.settings.setEnabled(e);
		}, o = (e) => {
			t.settings.setAppearanceMode(e);
		}, s = (e) => {
			t.settings.setCustomBubbleIcon(e);
		}, c = (e) => {
			t.settings.setCustomBubbleBgTransparent(e);
		}, l = async ({ id: e, enabled: n }) => {
			await t.setFeatureEnabled(e, n);
		};
		return (e, u) => (q(), J("div", F_, [u[1] ||= Y("div", { class: "inline-drawer-toggle inline-drawer-header" }, [Y("div", { class: "ttbd-settings-header" }, [Y("i", { class: "fa-solid fa-code" }), Y("b", null, "Bubble Dialogue")]), Y("div", { class: "inline-drawer-icon fa-solid fa-circle-chevron-down down" })], -1), Y("div", I_, [Y("div", {
			class: "ttbd-theme-root ttbd-settings-surface",
			"data-ttbd-appearance": t.settings.state.appearanceMode
		}, [X(jc, {
			title: W(r)("settings.title"),
			description: W(r)("settings.description"),
			"extension-enabled": t.settings.state.enabled,
			"appearance-mode": t.settings.state.appearanceMode,
			"custom-bubble-icon": t.settings.state.customBubbleIcon,
			"custom-bubble-bg-transparent": t.settings.state.customBubbleBgTransparent,
			features: i.value,
			i18n: W(n),
			onToggleExtension: a,
			onSetAppearance: o,
			onToggleFeature: u[0] ||= (e) => void l(e),
			onSetCustomIcon: s,
			onSetCustomIconTransparent: c
		}, null, 8, [
			"title",
			"description",
			"extension-enabled",
			"appearance-mode",
			"custom-bubble-icon",
			"custom-bubble-bg-transparent",
			"features",
			"i18n"
		])], 8, L_)])]));
	}
}), [["__scopeId", "data-v-629f97bf"]]), z_ = "tauritavern-bubble-dialogue-root", B_ = "tauritavern-bubble-dialogue-settings-root", V_ = "ttbd-theme-root", H_ = null, U_ = null, W_ = null, G_ = null, K_ = null, q_ = null, J_ = null, Y_ = null, X_ = [], Z_ = null, Q_ = Promise.resolve();
function $_() {
	return document.readyState === "loading" ? new Promise((e) => {
		document.addEventListener("DOMContentLoaded", () => e(), { once: !0 });
	}) : Promise.resolve();
}
function ev(e, t, n) {
	document.getElementById(e)?.remove();
	let r = document.createElement("div");
	return r.id = e, r.className = n, t.appendChild(r), r;
}
function tv() {
	return document.getElementById("extensions_settings2") ?? document.getElementById("extensions_settings");
}
function nv() {
	!U_ || !J_ || (U_.dataset.ttbdAppearance = J_.state.appearanceMode);
}
async function rv() {
	if (H_ || !q_ || !J_ || !J_.state.enabled) return;
	let e = await A_(q_, {
		settings: J_,
		i18n: Y_
	});
	if (!J_.state.enabled) {
		try {
			await e.registry.deactivateAllFeatures();
		} finally {
			await e.layout.dispose();
		}
		return;
	}
	K_ = e, U_ = ev(z_, document.body, V_), nv(), H_ = bs(Kc), H_.provide(Cs, e), H_.provide(Hf, e.i18n), H_.mount(U_);
}
async function iv() {
	let e = K_;
	if (K_ = null, e) try {
		await e.registry.deactivateAllFeatures();
	} finally {
		await e.layout.dispose();
	}
	H_?.unmount(), H_ = null, U_?.remove(), U_ = null;
}
async function av() {
	if (J_) {
		if (J_.state.enabled) {
			await rv(), nv();
			return;
		}
		await iv();
	}
}
function ov() {
	return Q_ = Q_.catch((e) => {
		console.error("[BubbleDialogue] Runtime lifecycle sync failed.", e);
	}).then(() => av()), Q_;
}
function sv() {
	if (W_ || !J_) return;
	let e = tv();
	if (!e) {
		console.warn("[BubbleDialogue] Extensions settings container is unavailable.");
		return;
	}
	G_ = ev(B_, e, "extension_container");
	let t = Y_ ?? Vf();
	W_ = bs(R_, {
		settings: J_,
		features: X_,
		setFeatureEnabled: async (e, t) => {
			if (K_) {
				await K_.registry.setFeatureEnabled(e, t);
				return;
			}
			J_?.setFeatureEnabled(e, t);
		}
	}), W_.provide(Hf, t), W_.mount(G_);
}
function cv() {
	W_?.unmount(), W_ = null, G_?.remove(), G_ = null;
}
function lv() {
	Z_?.(), Z_ = null, Q_.finally(() => {
		iv(), cv();
	});
}
async function uv() {
	await $_(), await M_();
	let e = j_();
	if (!e) {
		console.error("[BubbleDialogue] Host API is unavailable.");
		return;
	}
	q_ = P_(e), J_ = C_(), Y_ = Vf(), X_ = g_(q_), sv(), Z_ = J_.subscribe(() => {
		ov();
	}), await ov(), window.addEventListener("pagehide", lv, { once: !0 });
}
uv();
//#endregion

//# sourceMappingURL=index.js.map