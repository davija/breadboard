define("schematic/Logger", [], function () {
    return function (e, t, n) {
        var r = {TRACE: 1, DEBUG: 2, INFO: 3, WARN: 4, ERROR: 5}, i, s = [];
        e = r[e.toUpperCase()], t || (t = console), typeof n == "undefined" && (n = ""), i = function (e, r, i, o, u) {
            var a = t[e] || t.info;
            r = n + r;
            if (o)i ? a.call(t, r + " --> " + JSON.stringify(i)) : a.call(t, r); else try {
                u[0] && (u[0] = n + u[0]), a.apply(t, u)
            } catch (f) {
                a(r, i, o, u)
            }
            s.forEach(function (t) {
                t.log(e, r, i, o)
            })
        }, this.addPlugin = function (e) {
            s.push(e)
        }, this.trace = function (t, n, s) {
            e <= r.TRACE && i("debug", t, n, s, arguments)
        }, this.debug = function (t, n, s) {
            e <= r.DEBUG && i("debug", t, n, s, arguments)
        }, this.info = function (t, n, s) {
            e <= r.INFO && i("info", t, n, s, arguments)
        }, this.warn = function (t, n, s) {
            e <= r.WARN && i("warn", t, n, s, arguments)
        }, this.error = function (t, n, s) {
            e <= r.ERROR && i("error", t, n, s, arguments)
        }, this.time = function (e) {
            t.time.apply(t, arguments)
        }, this.timeEnd = function (e) {
            t.timeEnd.apply(t, arguments)
        }
    }
}), define("schematic/log", ["./Logger"], function (e) {
    return new e("debug")
}), define("schematic/SchemaResolver", [], function () {
    return function (e) {
        this.resolveRefs = function (t, n, r) {
            (!t.tag || !t.tag.resolved) && Object.keys(t).forEach(function (i, s, o) {
                var u = t[i], a;
                i === "$ref" ? (e.some(function (e) {
                    return a = e(u), a
                }), a && !a.resolved && (a.resolved = !0, this.resolveRefs(a, t, i)), n[r] = a) : typeof u == "object" && !u.resolved && this.resolveRefs(u, t, i)
            }, this)
        }
    }
}), define("schematic/Validator", [], function () {
    return function (e, t, n) {
        return
    }
}), define("schematic/BackboneExtension", ["./Validator", "./log"], function (e, t) {
    var n, r;
    return typeof Backbone != "undefined" && (r = Backbone.sync, Backbone.sync = function (e, n, i) {
        if (!(n instanceof Backbone.SchematicModel))return r(e, n, i);
        t.debug(e + " : " + n + " : " + i)
    }, Backbone.SchematicModel = Backbone.Model.extend({initialize: function (e, t) {
        var n = this, r = this.jsonschema = t && t.schema;
        Object.keys(r && r.properties).forEach(function (e, t, r) {
            Object.defineProperty(n, e, {get: function () {
                return n.get(e)
            }, set: function (t) {
                return n.set(e, t, {validate: !0})
            }, enumerable: !0})
        })
    }, validate: function (t, n) {
        var r = new Backbone.Model(this.toJSON());
        return r.set(t), e(this.jsonschema, r.toJSON(), t)
    }}), n = Backbone.SchematicModel), n
}), define("schematic/util", {mixin: function (e, t) {
    var n;
    for (n in t)e[n] = t[n];
    return e
}, indexOf: function (e, t) {
    return Array.prototype.indexOf || (Array.prototype.indexOf = function (e, t) {
        t == null ? t = 0 : t < 0 && (t = Math.max(0, this.length + t));
        for (var n = t, r = this.length; n < r; n++)if (this[n] === e)return n;
        return-1
    }), t.indexOf(e)
}}), define("schematic/ModelFactory", ["./log", "./SchemaResolver", "./BackboneExtension", "./util"], function (e, t, n, r) {
    return function (i) {
        var s = this, o = [], u = function (e) {
            var t = [];
            return o.forEach(function (n) {
                n.modelPattern.test(e) && t.push(n)
            }), t
        }, a = function (t, n, i, o) {
            var u = n, a = n || {}, f = this, l, c = o && o.createSubModels, h = {}, p = {}, d = function (n, r) {
                var i = !1;
                if (h[n])e.debug("schema: " + t.id + " contains property: " + n), i = !0; else {
                    e.debug("schema: " + t.id + " does not contain property: " + n);
                    if (!r)throw new Error(n + " not defined in " + t.id)
                }
                return i
            }, v = function (n, r, s) {
                var o = h[n], u, a = !0;
                return e.debug("Checking if property: " + n + " is valid to set"), d(n, s) && (a = i.some(function (e, i, s) {
                    if (e.propertyPattern.test(n))return u = e.validate(n, f, r, t), u
                }), l = u), !a
            }, m = function (e, t) {
                Object.keys(e.properties).forEach(function (n) {
                    t[n] = e.properties[n]
                })
            }, g = function (e, t) {
                e["extends"] && g(e["extends"], t), t(e)
            };
            return g(t, function (e) {
                m(e, h)
            }), Object.defineProperty(f, "schemaId", {get: function () {
                return t.id
            }, enumerable: !0}), Object.defineProperty(f, "lastErrors", {get: function () {
                return l
            }, enumerable: !1}), this.getMeta = function (e) {
                if (d(e, !1))return r.mixin({}, h[e])
            }, this.validate = function (e, t) {
                var n, r = v(e, t, !0);
                return r || (n = l), n
            }, this.get = function (e) {
                var t, n = h[e];
                if (d(e))return n.type === "array" && u ? (t = [], a[e].forEach(function (e, r) {
                    e && t.push(s.getModel(n.items, e))
                }, this)) : a[e] && (t = u && n.type === "object" ? s.getModel(n, a[e]) : a[e]), t
            }, this.set = function (e, t) {
                if (v(e, t))return p[e] && p[e].forEach(function (n, r, i) {
                    n(a[e], t)
                }), a[e] = t, !0
            }, this.onChange = function (e, t) {
                p[e] || (p[e] = []), p[e].push(t)
            }, this.getRaw = function () {
                return a
            }, this.copyFrom = function (e, t) {
                var n = t || {};
                Object.keys(e).forEach(function (r, i, o) {
                    var u;
                    if (e[r]) {
                        var a = e[r].schemaId || f[r] && f[r].schemaId;
                        a ? (u = f[r], n.shallowModels || (u || (u = s.getModel(a)), u.copyFrom(e[r], t)), f.set(r, u)) : v(r, e[r], !0) && f.set(r, JSON.parse(JSON.stringify(e[r])))
                    }
                })
            }, this.initialize = function (t) {
                Object.keys(t).forEach(function (n, r, i) {
                    var o;
                    t[n] && (t[n].schemaId ? (e.debug("Getting and initializing model with schema ID: " + t[n].schemaId), o = s.getModel(t[n].schemaId), o.initialize(t[n]), f.set(n, o)) : v(n, t[n], !0) && f.set(n, JSON.parse(JSON.stringify(t[n]))))
                })
            }, Object.keys(h).forEach(function (e, t, n) {
                Object.defineProperty(f, e, {get: function () {
                    return f.get(e)
                }, set: function (t) {
                    return f.set(e, t)
                }, enumerable: !0}), h[e].id && c && f.set(e, s.getModel(h[e].id))
            }), Object.freeze(this)
        };
        this.config = i || {resolver: function (e) {
            var t;
            return require([e], function (e) {
                e && (typeof e == "function" ? t = new e : t = e)
            }), t
        }}, this.resolvers = [this.config.resolver], this.addResolver = function (e) {
            this.resolvers.push(e)
        }, this.getModelBySchema = function (t, r, i) {
            var s;
            return e.debug("Getting new model with schema ID: " + t.id), typeof n == "function" ? s = new n(r, {validate: !0, schema: t, serviceFactory: this.config.serviceFactory}) : s = new a(t, r, u(t.id), i), s
        }, this.getModel = function (e, t, n) {
            var r;
            return typeof e == "string" ? r = this.getModelByName(e, t, n) : r = this.getModelBySchema(e, t, n), r
        }, this.getSchema = function (e) {
            var n, r = new t(this.resolvers);
            return this.resolvers.some(function (t) {
                return n = t(e), n
            }), r.resolveRefs(n, null, null), n
        }, this.addValidator = function (e) {
            o.push(e)
        }, this.getModelByName = function (t, n, r) {
            var i = this.getSchema(t);
            return e.debug("Getting new model by name: " + t + " using schema: " + i), this.getModelBySchema(i, n, r)
        }, this.getModelInitialized = function (t, n) {
            var r;
            return t.schemaId ? r = this.getModel(t.schemaId) : r = this.getModel(n), e.debug("Initializing new model with schema ID: " + r.schemaId), r.initialize(t), r
        }
    }
}), define("schematic/plugins/ConditionallyRequiredValidationPlugin", ["../util"], function (e) {
    var t = function (e, n) {
        var r = e && e.properties && e.properties[n];
        return!r && e["extends"] && (r = t(e["extends"], n)), r
    }, n = function (n) {
        var r = {code: 0, message: "Field is required."};
        e.mixin(this, n), this.validate = function (n, i, s, o) {
            var u = [], a = s, f = t(o, n), l = i[this.requiredWhen.property], c = this.requiredWhen.values || [];
            return e.indexOf(l, c) > -1 && f && !a && (this.message && this.message.message ? u.push(this.message) : u.push(r)), u.length ? u : undefined
        }
    };
    return n
}), define("schematic/plugins/FutureDateValidationPlugin", ["../util"], function (e) {
    var t = function (t) {
        this.message = {code: 0, message: "Date is not in the future"}, e.mixin(this, t), this.validate = function (e, t, n, r) {
            var i = [], s = n === undefined ? t[e] : n, o = Date.parse(s), u = Date.now();
            return u >= o && i.push(this.message), i.length ? i : undefined
        }
    };
    return t
}), define("schematic/plugins/LuhnValidationPlugin", ["../util"], function (e) {
    var t = function (t) {
        function n(e) {
            return!isNaN(parseFloat(e)) && isFinite(e)
        }

        this.message = {code: 0, message: "Invalid number"}, e.mixin(this, t), this.validate = function (e, t, r, i) {
            var s = [], o = o = r === undefined ? t[e] : r, u = 0, a = o && o.length, f = a % 2, l, c;
            if (o && n(o)) {
                for (l = 0; l < a; l += 1)c = parseInt(o.charAt(l), 10), l % 2 === f && (c *= 2), c > 9 && (c -= 9), u += c;
                u % 10 !== 0 && s.push(this.message)
            } else s.push(this.message);
            return s.length ? s : undefined
        }
    };
    return t
}), define("schematic/plugins/RegExpValidationPlugin", ["../util"], function (e) {
    var t = function (t) {
        var n = this;
        this.message = {code: 0, message: "Failed regular expression match"}, e.mixin(this, t), this.validate = function (e, t, r, i) {
            var s = [], o = r === undefined ? t[e] : r, u = new RegExp(this.pattern || ".*");
            return o !== "" && !u.test(o) && s.push(n.message), s.length ? s : undefined
        }
    };
    return t
}), define("schematic/plugins/SchemaValidationPlugin", ["../util"], function (e) {
    var t = function (e, n) {
        var r = e && e.properties && e.properties[n];
        return!r && e["extends"] && (r = t(e["extends"], n)), r
    }, n = function (n) {
        this.requiredMessage = {code: 0, message: "Field is required."}, this.maxLengthMessage = {code: 0, message: "Field length is greater than max allowable"}, this.minLengthMessage = {code: 0, message: "Field length is less than minimum required"}, e.mixin(this, n), this.validate = function (e, n, r, i) {
            var s = [], o = r, u = t(i, e);
            return u && (u.required && !o ? s.push(this.requiredMessage) : o && u.maximum && o.length > u.maximum ? s.push(this.maxLengthMessage) : o && u.minimum && o.length < u.minimum && s.push(this.minLengthMessage)), s.length ? s : undefined
        }
    };
    return n
}), define("schematic/fullpack", ["./ModelFactory", "./plugins/ConditionallyRequiredValidationPlugin", "./plugins/FutureDateValidationPlugin", "./plugins/LuhnValidationPlugin", "./plugins/RegExpValidationPlugin", "./plugins/SchemaValidationPlugin"], function () {
});
