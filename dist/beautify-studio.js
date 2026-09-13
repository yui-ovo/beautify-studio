var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/picocolors/picocolors.browser.js
var require_picocolors_browser = __commonJS({
  "node_modules/picocolors/picocolors.browser.js"(exports, module) {
    var x = String;
    var create = function() {
      return { isColorSupported: false, reset: x, bold: x, dim: x, italic: x, underline: x, inverse: x, hidden: x, strikethrough: x, black: x, red: x, green: x, yellow: x, blue: x, magenta: x, cyan: x, white: x, gray: x, bgBlack: x, bgRed: x, bgGreen: x, bgYellow: x, bgBlue: x, bgMagenta: x, bgCyan: x, bgWhite: x, blackBright: x, redBright: x, greenBright: x, yellowBright: x, blueBright: x, magentaBright: x, cyanBright: x, whiteBright: x, bgBlackBright: x, bgRedBright: x, bgGreenBright: x, bgYellowBright: x, bgBlueBright: x, bgMagentaBright: x, bgCyanBright: x, bgWhiteBright: x };
    };
    module.exports = create();
    module.exports.createColors = create;
  }
});

// (disabled):node_modules/postcss/lib/terminal-highlight
var require_terminal_highlight = __commonJS({
  "(disabled):node_modules/postcss/lib/terminal-highlight"() {
  }
});

// node_modules/postcss/lib/css-syntax-error.js
var require_css_syntax_error = __commonJS({
  "node_modules/postcss/lib/css-syntax-error.js"(exports, module) {
    "use strict";
    var pico = require_picocolors_browser();
    var terminalHighlight = require_terminal_highlight();
    var CssSyntaxError2 = class _CssSyntaxError extends Error {
      constructor(message, line, column, source, file, plugin2) {
        super(message);
        this.name = "CssSyntaxError";
        this.reason = message;
        if (file) {
          this.file = file;
        }
        if (source) {
          this.source = source;
        }
        if (plugin2) {
          this.plugin = plugin2;
        }
        if (typeof line !== "undefined" && typeof column !== "undefined") {
          if (typeof line === "number") {
            this.line = line;
            this.column = column;
          } else {
            this.line = line.line;
            this.column = line.column;
            this.endLine = column.line;
            this.endColumn = column.column;
          }
        }
        this.setMessage();
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, _CssSyntaxError);
        }
      }
      setMessage() {
        this.message = this.plugin ? this.plugin + ": " : "";
        this.message += this.file ? this.file : "<css input>";
        if (typeof this.line !== "undefined") {
          this.message += ":" + this.line + ":" + this.column;
        }
        this.message += ": " + this.reason;
      }
      showSourceCode(color) {
        if (!this.source) return "";
        let css = this.source;
        if (color == null) color = pico.isColorSupported;
        let aside = (text) => text;
        let mark = (text) => text;
        let highlight = (text) => text;
        if (color) {
          let { bold, gray, red } = pico.createColors(true);
          mark = (text) => bold(red(text));
          aside = (text) => gray(text);
          if (terminalHighlight) {
            highlight = (text) => terminalHighlight(text);
          }
        }
        let lines = css.split(/\r?\n/);
        let start2 = Math.max(this.line - 3, 0);
        let end = Math.min(this.line + 2, lines.length);
        let maxWidth = String(end).length;
        return lines.slice(start2, end).map((line, index) => {
          let number = start2 + 1 + index;
          let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
          if (number === this.line) {
            if (line.length > 160) {
              let padding = 20;
              let subLineStart = Math.max(0, this.column - padding);
              let subLineEnd = Math.max(
                this.column + padding,
                this.endColumn + padding
              );
              let subLine = line.slice(subLineStart, subLineEnd);
              let spacing2 = aside(gutter.replace(/\d/g, " ")) + line.slice(0, Math.min(this.column - 1, padding - 1)).replace(/[^\t]/g, " ");
              return mark(">") + aside(gutter) + highlight(subLine) + "\n " + spacing2 + mark("^");
            }
            let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
            return mark(">") + aside(gutter) + highlight(line) + "\n " + spacing + mark("^");
          }
          return " " + aside(gutter) + highlight(line);
        }).join("\n");
      }
      toString() {
        let code = this.showSourceCode();
        if (code) {
          code = "\n\n" + code + "\n";
        }
        return this.name + ": " + this.message + code;
      }
    };
    module.exports = CssSyntaxError2;
    CssSyntaxError2.default = CssSyntaxError2;
  }
});

// node_modules/postcss/lib/stringifier.js
var require_stringifier = __commonJS({
  "node_modules/postcss/lib/stringifier.js"(exports, module) {
    "use strict";
    var STYLE_TAG = /(<)(\/?style\b)/gi;
    var COMMENT_OPEN = /(<)(!--)/g;
    var AT_NAME_END = /[\t\n\f\r "#'()/;[\\\]{}]/;
    function escapeHTMLInCSS(str) {
      if (typeof str !== "string") return str;
      if (!str.includes("<")) return str;
      return str.replace(STYLE_TAG, "\\3c $2").replace(COMMENT_OPEN, "\\3c $2");
    }
    var DEFAULT_RAW = {
      after: "\n",
      beforeClose: "\n",
      beforeComment: "\n",
      beforeDecl: "\n",
      beforeOpen: " ",
      beforeRule: "\n",
      colon: ": ",
      commentLeft: " ",
      commentRight: " ",
      emptyBody: "",
      indent: "    ",
      semicolon: false
    };
    function capitalize(str) {
      return str[0].toUpperCase() + str.slice(1);
    }
    function atruleStart(str, node) {
      let name = "@" + node.name;
      let params = node.params ? str.rawValue(node, "params") : "";
      let afterName = node.raws.afterName;
      if (typeof afterName === "undefined") {
        afterName = params ? " " : "";
      } else if (afterName === "" && params && !AT_NAME_END.test(params[0])) {
        afterName = " ";
      }
      return name + afterName + params;
    }
    function isCustomProperty(node) {
      if (!node.prop.startsWith("--")) return false;
      let before = node.raws.before;
      return typeof before === "undefined" || !/\S$/.test(before);
    }
    function pushBody(str, stack, node) {
      let nodes = node.nodes;
      let last = nodes.length - 1;
      while (last > 0) {
        if (nodes[last].type !== "comment") break;
        last -= 1;
      }
      let semicolon = str.raw(node, "semicolon");
      let isDocument = node.type === "document";
      for (let i = nodes.length - 1; i >= 0; i--) {
        let child = nodes[i];
        let childSemicolon = last !== i || semicolon;
        if (!childSemicolon && i < nodes.length - 1 && (child.type === "atrule" && !child.nodes || child.type === "decl" && isCustomProperty(child))) {
          childSemicolon = true;
        }
        stack.push({
          document: isDocument,
          node: child,
          semicolon: childSemicolon
        });
      }
    }
    function pushBlock(str, stack, node, start2) {
      let between = str.raw(node, "between", "beforeOpen");
      str.builder(escapeHTMLInCSS(start2 + between) + "{", node, "start");
      let hasNodes = node.nodes && node.nodes.length;
      let close = () => {
        let after = hasNodes ? str.raw(node, "after") : str.raw(node, "after", "emptyBody");
        if (after) str.builder(escapeHTMLInCSS(after));
        str.builder("}", node, "end");
        if (node.type === "rule" && node.raws.ownSemicolon) {
          str.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
        }
      };
      if (hasNodes) {
        stack.push(close);
        pushBody(str, stack, node);
      } else {
        close();
      }
    }
    var Stringifier = class _Stringifier {
      constructor(builder) {
        this.builder = builder;
      }
      atrule(node, semicolon) {
        let start2 = atruleStart(this, node);
        if (node.nodes) {
          this.block(node, start2);
        } else {
          let end = (node.raws.between || "") + (semicolon ? ";" : "");
          this.builder(escapeHTMLInCSS(start2 + end), node);
        }
      }
      beforeAfter(node, detect) {
        let value;
        if (node.type === "decl") {
          value = this.raw(node, null, "beforeDecl");
        } else if (node.type === "comment") {
          value = this.raw(node, null, "beforeComment");
        } else if (detect === "before") {
          value = this.raw(node, null, "beforeRule");
        } else {
          value = this.raw(node, null, "beforeClose");
        }
        let buf = node.parent;
        let depth = 0;
        while (buf && buf.type !== "root") {
          depth += 1;
          buf = buf.parent;
        }
        if (value.includes("\n")) {
          let indent = this.raw(node, null, "indent");
          if (indent.length) {
            for (let step = 0; step < depth; step++) value += indent;
          }
        }
        return value;
      }
      block(node, start2) {
        let between = this.raw(node, "between", "beforeOpen");
        this.builder(escapeHTMLInCSS(start2 + between) + "{", node, "start");
        let after;
        if (node.nodes && node.nodes.length) {
          this.body(node);
          after = this.raw(node, "after");
        } else {
          after = this.raw(node, "after", "emptyBody");
        }
        if (after) this.builder(escapeHTMLInCSS(after));
        this.builder("}", node, "end");
      }
      body(node) {
        let proto = _Stringifier.prototype;
        let expandable = ["atrule", "block", "body", "rule", "stringify"].every(
          (method) => this[method] === proto[method]
        );
        let stack = [];
        pushBody(this, stack, node);
        while (stack.length > 0) {
          let entry = stack.pop();
          if (typeof entry === "function") {
            entry();
            continue;
          }
          let child = entry.node;
          let before = this.raw(child, "before");
          if (before) {
            this.builder(entry.document ? before : escapeHTMLInCSS(before));
          }
          if (expandable && child.type === "rule") {
            pushBlock(this, stack, child, this.rawValue(child, "selector"));
          } else if (expandable && child.type === "atrule" && child.nodes) {
            pushBlock(this, stack, child, atruleStart(this, child));
          } else {
            this.stringify(child, entry.semicolon);
          }
        }
      }
      comment(node) {
        let left = this.raw(node, "left", "commentLeft");
        let right = this.raw(node, "right", "commentRight");
        this.builder(escapeHTMLInCSS("/*" + left + node.text + right + "*/"), node);
      }
      decl(node, semicolon) {
        let raws = node.raws;
        let between = this.raw(node, "between", "colon");
        let string = node.prop + between + this.rawValue(node, "value");
        if (node.important) {
          string += raws.important || " !important";
        }
        if (semicolon) string += ";";
        this.builder(escapeHTMLInCSS(string), node);
      }
      document(node) {
        this.body(node);
      }
      raw(node, own, detect) {
        let value;
        if (!detect) detect = own;
        if (own) {
          value = node.raws[own];
          if (typeof value !== "undefined") return value;
        }
        let parent = node.parent;
        if (detect === "before") {
          if (!parent || parent.type === "root" && parent.first === node) {
            return "";
          }
          if (parent && parent.type === "document") {
            return "";
          }
        }
        if (!parent) return DEFAULT_RAW[detect];
        let root2 = node.root();
        let cache = root2.rawCache || (root2.rawCache = {});
        if (typeof cache[detect] !== "undefined") {
          return cache[detect];
        }
        if (detect === "before" || detect === "after") {
          return this.beforeAfter(node, detect);
        } else {
          let method = "raw" + capitalize(detect);
          if (this[method]) {
            value = this[method](root2, node);
          } else {
            root2.walk((i) => {
              value = i.raws[own];
              if (typeof value !== "undefined") return false;
            });
          }
        }
        if (typeof value === "undefined") value = DEFAULT_RAW[detect];
        cache[detect] = value;
        return value;
      }
      rawBeforeClose(root2) {
        let value;
        root2.walk((i) => {
          if (i.nodes && i.nodes.length > 0) {
            if (typeof i.raws.after !== "undefined") {
              value = i.raws.after;
              if (value.includes("\n")) {
                value = value.replace(/[^\n]+$/, "");
              }
              return false;
            }
          }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
      }
      rawBeforeComment(root2, node) {
        let value;
        root2.walkComments((i) => {
          if (typeof i.raws.before !== "undefined") {
            value = i.raws.before;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        });
        if (typeof value === "undefined") {
          value = this.raw(node, null, "beforeDecl");
        } else if (value) {
          value = value.replace(/\S/g, "");
        }
        return value;
      }
      rawBeforeDecl(root2, node) {
        let value;
        root2.walkDecls((i) => {
          if (typeof i.raws.before !== "undefined") {
            value = i.raws.before;
            if (value.includes("\n")) {
              value = value.replace(/[^\n]+$/, "");
            }
            return false;
          }
        });
        if (typeof value === "undefined") {
          value = this.raw(node, null, "beforeRule");
        } else if (value) {
          value = value.replace(/\S/g, "");
        }
        return value;
      }
      rawBeforeOpen(root2) {
        let value;
        root2.walk((i) => {
          if (i.type !== "decl") {
            value = i.raws.between;
            if (typeof value !== "undefined") return false;
          }
        });
        return value;
      }
      rawBeforeRule(root2) {
        let value;
        root2.walk((i) => {
          if (i.nodes && (i.parent !== root2 || root2.first !== i)) {
            if (typeof i.raws.before !== "undefined") {
              value = i.raws.before;
              if (value.includes("\n")) {
                value = value.replace(/[^\n]+$/, "");
              }
              return false;
            }
          }
        });
        if (value) value = value.replace(/\S/g, "");
        return value;
      }
      rawColon(root2) {
        let value;
        root2.walkDecls((i) => {
          if (typeof i.raws.between !== "undefined") {
            value = i.raws.between.replace(/[^\s:]/g, "");
            return false;
          }
        });
        return value;
      }
      rawEmptyBody(root2) {
        let value;
        root2.walk((i) => {
          if (i.nodes && i.nodes.length === 0) {
            value = i.raws.after;
            if (typeof value !== "undefined") return false;
          }
        });
        return value;
      }
      rawIndent(root2) {
        if (root2.raws.indent) return root2.raws.indent;
        let value;
        root2.walk((i) => {
          let p = i.parent;
          if (p && p !== root2 && p.parent && p.parent === root2) {
            if (typeof i.raws.before !== "undefined") {
              let parts = i.raws.before.split("\n");
              value = parts[parts.length - 1];
              value = value.replace(/\S/g, "");
              return false;
            }
          }
        });
        return value;
      }
      rawSemicolon(root2) {
        let value;
        root2.walk((i) => {
          if (i.nodes && i.nodes.length && i.last.type === "decl") {
            value = i.raws.semicolon;
            if (typeof value !== "undefined") return false;
          }
        });
        return value;
      }
      rawValue(node, prop) {
        let value = node[prop];
        let raw = node.raws[prop];
        if (raw && raw.value === value) {
          return raw.raw;
        }
        return value;
      }
      root(node) {
        if (node.source && node.source.input.hasBOM) {
          this.builder("\uFEFF", node, "start");
        }
        this.body(node);
        if (node.raws.after) {
          let after = node.raws.after;
          let isDocument = node.parent && node.parent.type === "document";
          this.builder(isDocument ? after : escapeHTMLInCSS(after));
        }
      }
      rule(node) {
        this.block(node, this.rawValue(node, "selector"));
        if (node.raws.ownSemicolon) {
          this.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
        }
      }
      stringify(node, semicolon) {
        if (!this[node.type]) {
          throw new Error(
            "Unknown AST node type " + node.type + ". Maybe you need to change PostCSS stringifier."
          );
        }
        this[node.type](node, semicolon);
      }
    };
    module.exports = Stringifier;
    Stringifier.default = Stringifier;
  }
});

// node_modules/postcss/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/postcss/lib/stringify.js"(exports, module) {
    "use strict";
    var Stringifier = require_stringifier();
    function stringify2(node, builder) {
      let str = new Stringifier(builder);
      str.stringify(node);
    }
    module.exports = stringify2;
    stringify2.default = stringify2;
  }
});

// node_modules/postcss/lib/symbols.js
var require_symbols = __commonJS({
  "node_modules/postcss/lib/symbols.js"(exports, module) {
    "use strict";
    module.exports.isClean = Symbol("isClean");
    module.exports.my = Symbol("my");
  }
});

// node_modules/postcss/lib/node.js
var require_node = __commonJS({
  "node_modules/postcss/lib/node.js"(exports, module) {
    "use strict";
    var CssSyntaxError2 = require_css_syntax_error();
    var Stringifier = require_stringifier();
    var stringify2 = require_stringify();
    var { isClean, my } = require_symbols();
    function cloneNode(obj, parent) {
      let cloned = new obj.constructor();
      let stack = [[obj, cloned, parent]];
      while (stack.length > 0) {
        let [source, target, targetParent] = stack.pop();
        for (let i in source) {
          if (!Object.prototype.hasOwnProperty.call(source, i)) {
            continue;
          }
          if (i === "proxyCache") continue;
          let value = source[i];
          let type = typeof value;
          if (i === "parent" && type === "object") {
            if (targetParent) target[i] = targetParent;
          } else if (i === "source") {
            target[i] = value;
          } else if (Array.isArray(value)) {
            let children = [];
            target[i] = children;
            for (let j of value) {
              let childClone = new j.constructor();
              children.push(childClone);
              stack.push([j, childClone, target]);
            }
          } else {
            if (type === "object" && value !== null) {
              let valueClone = new value.constructor();
              stack.push([value, valueClone, void 0]);
              value = valueClone;
            }
            target[i] = value;
          }
        }
      }
      return cloned;
    }
    function sourceOffset(inputCSS, position) {
      if (position && typeof position.offset !== "undefined") {
        return position.offset;
      }
      let column = 1;
      let line = 1;
      let offset = 0;
      for (let i = 0; i < inputCSS.length; i++) {
        if (line === position.line && column === position.column) {
          offset = i;
          break;
        }
        if (inputCSS[i] === "\n") {
          column = 1;
          line += 1;
        } else {
          column += 1;
        }
      }
      return offset;
    }
    var Node2 = class _Node {
      get proxyOf() {
        return this;
      }
      constructor(defaults = {}) {
        this.raws = {};
        this[isClean] = false;
        this[my] = true;
        for (let name of Object.keys(defaults)) {
          if (name === "__proto__") continue;
          if (name === "nodes") {
            this.nodes = [];
            for (let node of defaults[name]) {
              if (typeof node.clone === "function" && node.parent) {
                this.append(node.clone());
              } else {
                this.append(node);
              }
            }
          } else {
            this[name] = defaults[name];
          }
        }
      }
      addToError(error) {
        error.postcssNode = this;
        if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
          let s = this.source;
          error.stack = error.stack.replace(
            /\n\s{4}at /,
            `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
          );
        }
        return error;
      }
      after(add) {
        this.parent.insertAfter(this, add);
        return this;
      }
      assign(overrides = {}) {
        for (let name in overrides) {
          this[name] = overrides[name];
        }
        return this;
      }
      before(add) {
        this.parent.insertBefore(this, add);
        return this;
      }
      cleanRaws(keepBetween) {
        delete this.raws.before;
        delete this.raws.after;
        if (!keepBetween) delete this.raws.between;
      }
      clone(overrides = {}) {
        let cloned = cloneNode(this);
        for (let name in overrides) {
          cloned[name] = overrides[name];
        }
        return cloned;
      }
      cloneAfter(overrides = {}) {
        let cloned = this.clone(overrides);
        this.parent.insertAfter(this, cloned);
        return cloned;
      }
      cloneBefore(overrides = {}) {
        let cloned = this.clone(overrides);
        this.parent.insertBefore(this, cloned);
        return cloned;
      }
      error(message, opts = {}) {
        if (this.source) {
          let { end, start: start2 } = this.rangeBy(opts);
          return this.source.input.error(
            message,
            { column: start2.column, line: start2.line },
            { column: end.column, line: end.line },
            opts
          );
        }
        return new CssSyntaxError2(message);
      }
      getProxyProcessor() {
        return {
          get(node, prop) {
            if (prop === "proxyOf") {
              return node;
            } else if (prop === "root") {
              return () => node.root().toProxy();
            } else {
              return node[prop];
            }
          },
          set(node, prop, value) {
            if (node[prop] === value) return true;
            node[prop] = value;
            if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */
            prop === "text") {
              node.markDirty();
            }
            return true;
          }
        };
      }
      /* c8 ignore next 3 */
      markClean() {
        this[isClean] = true;
      }
      markDirty() {
        if (this[isClean]) {
          this[isClean] = false;
          let next = this;
          while (next = next.parent) {
            next[isClean] = false;
          }
        }
      }
      next() {
        if (!this.parent) return void 0;
        let index = this.parent.index(this);
        return this.parent.nodes[index + 1];
      }
      positionBy(opts = {}) {
        let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
        let pos = {
          column: this.source.start.column,
          line: this.source.start.line,
          offset: sourceOffset(inputString, this.source.start)
        };
        if (opts.index) {
          pos = this.positionInside(opts.index);
        } else if (opts.word) {
          let stringRepresentation = inputString.slice(
            sourceOffset(inputString, this.source.start),
            sourceOffset(inputString, this.source.end)
          );
          let index = stringRepresentation.indexOf(opts.word);
          if (index !== -1) pos = this.positionInside(index);
        }
        return pos;
      }
      positionInside(index) {
        let column = this.source.start.column;
        let line = this.source.start.line;
        let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
        let offset = sourceOffset(inputString, this.source.start);
        let end = offset + index;
        for (let i = offset; i < end; i++) {
          if (inputString[i] === "\n") {
            column = 1;
            line += 1;
          } else {
            column += 1;
          }
        }
        return { column, line, offset: end };
      }
      prev() {
        if (!this.parent) return void 0;
        let index = this.parent.index(this);
        return this.parent.nodes[index - 1];
      }
      rangeBy(opts = {}) {
        let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
        let start2 = {
          column: this.source.start.column,
          line: this.source.start.line,
          offset: sourceOffset(inputString, this.source.start)
        };
        let end = this.source.end ? {
          column: this.source.end.column + 1,
          line: this.source.end.line,
          offset: typeof this.source.end.offset === "number" ? (
            // `source.end.offset` is exclusive, so we don't need to add 1
            this.source.end.offset
          ) : (
            // Since line/column in this.source.end is inclusive,
            // the `sourceOffset(... , this.source.end)` returns an inclusive offset.
            // So, we add 1 to convert it to exclusive.
            sourceOffset(inputString, this.source.end) + 1
          )
        } : {
          column: start2.column + 1,
          line: start2.line,
          offset: start2.offset + 1
        };
        if (opts.word) {
          let stringRepresentation = inputString.slice(
            sourceOffset(inputString, this.source.start),
            sourceOffset(inputString, this.source.end)
          );
          let index = stringRepresentation.indexOf(opts.word);
          if (index !== -1) {
            start2 = this.positionInside(index);
            end = this.positionInside(index + opts.word.length);
          }
        } else {
          if (opts.start) {
            start2 = {
              column: opts.start.column,
              line: opts.start.line,
              offset: sourceOffset(inputString, opts.start)
            };
          } else if (typeof opts.index === "number") {
            start2 = this.positionInside(opts.index);
          }
          if (opts.end) {
            end = {
              column: opts.end.column,
              line: opts.end.line,
              offset: sourceOffset(inputString, opts.end)
            };
          } else if (typeof opts.endIndex === "number") {
            end = this.positionInside(opts.endIndex);
          } else if (typeof opts.index === "number") {
            end = this.positionInside(opts.index + 1);
          }
        }
        if (end.line < start2.line || end.line === start2.line && end.column <= start2.column) {
          end = {
            column: start2.column + 1,
            line: start2.line,
            offset: start2.offset + 1
          };
        }
        return { end, start: start2 };
      }
      raw(prop, defaultType) {
        let str = new Stringifier();
        return str.raw(this, prop, defaultType);
      }
      remove() {
        if (this.parent) {
          this.parent.removeChild(this);
        }
        this.parent = void 0;
        return this;
      }
      replaceWith(...nodes) {
        if (this.parent) {
          let bookmark = this;
          let foundSelf = false;
          for (let node of nodes) {
            if (node === this) {
              foundSelf = true;
            } else if (foundSelf) {
              this.parent.insertAfter(bookmark, node);
              bookmark = node;
            } else {
              this.parent.insertBefore(bookmark, node);
            }
          }
          if (!foundSelf) {
            this.remove();
          }
        }
        return this;
      }
      root() {
        let result = this;
        while (result.parent && result.parent.type !== "document") {
          result = result.parent;
        }
        return result;
      }
      toJSON(_, inputs) {
        let emitInputs = inputs == null;
        inputs = inputs || /* @__PURE__ */ new Map();
        let holderOfRoot = [];
        let queue = [[this, holderOfRoot, 0]];
        for (let step = 0; step < queue.length; step++) {
          let [node, holder, key] = queue[step];
          let fixed2 = {};
          holder[key] = fixed2;
          for (let name in node) {
            if (!Object.prototype.hasOwnProperty.call(node, name)) {
              continue;
            }
            if (name === "parent" || name === "proxyCache") continue;
            let value = node[name];
            if (Array.isArray(value)) {
              let fixedArray = [];
              fixed2[name] = fixedArray;
              for (let i = 0; i < value.length; i++) {
                let item = value[i];
                if (typeof item === "object" && item.toJSON) {
                  if (item.toJSON === _Node.prototype.toJSON) {
                    queue.push([item, fixedArray, i]);
                  } else {
                    fixedArray[i] = item.toJSON(null, inputs);
                  }
                } else {
                  fixedArray[i] = item;
                }
              }
            } else if (typeof value === "object" && value.toJSON) {
              if (value.toJSON === _Node.prototype.toJSON) {
                queue.push([value, fixed2, name]);
              } else {
                fixed2[name] = value.toJSON(null, inputs);
              }
            } else if (name === "source") {
              if (value == null) continue;
              let inputId = inputs.get(value.input);
              if (inputId == null) {
                inputId = inputs.size;
                inputs.set(value.input, inputId);
              }
              fixed2[name] = {
                end: value.end,
                inputId,
                start: value.start
              };
            } else {
              fixed2[name] = value;
            }
          }
        }
        let fixed = holderOfRoot[0];
        if (emitInputs) {
          fixed.inputs = [...inputs.keys()].map((input) => input.toJSON());
        }
        return fixed;
      }
      toProxy() {
        if (!this.proxyCache) {
          this.proxyCache = new Proxy(this, this.getProxyProcessor());
        }
        return this.proxyCache;
      }
      toString(stringifier = stringify2) {
        if (stringifier.stringify) stringifier = stringifier.stringify;
        let result = "";
        stringifier(this, (i) => {
          result += i;
        });
        return result;
      }
      warn(result, text, opts = {}) {
        let data = { node: this };
        for (let i in opts) data[i] = opts[i];
        return result.warn(text, data);
      }
    };
    module.exports = Node2;
    Node2.default = Node2;
  }
});

// node_modules/postcss/lib/comment.js
var require_comment = __commonJS({
  "node_modules/postcss/lib/comment.js"(exports, module) {
    "use strict";
    var Node2 = require_node();
    var Comment2 = class extends Node2 {
      constructor(defaults) {
        super(defaults);
        this.type = "comment";
      }
    };
    module.exports = Comment2;
    Comment2.default = Comment2;
  }
});

// node_modules/postcss/lib/declaration.js
var require_declaration = __commonJS({
  "node_modules/postcss/lib/declaration.js"(exports, module) {
    "use strict";
    var Node2 = require_node();
    var Declaration2 = class extends Node2 {
      get variable() {
        return this.prop.startsWith("--") || this.prop[0] === "$";
      }
      constructor(defaults) {
        if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
          defaults = { ...defaults, value: String(defaults.value) };
        }
        super(defaults);
        this.type = "decl";
      }
    };
    module.exports = Declaration2;
    Declaration2.default = Declaration2;
  }
});

// node_modules/postcss/lib/container.js
var require_container = __commonJS({
  "node_modules/postcss/lib/container.js"(exports, module) {
    "use strict";
    var Comment2 = require_comment();
    var Declaration2 = require_declaration();
    var Node2 = require_node();
    var { isClean, my } = require_symbols();
    var AtRule2;
    var parse2;
    var Root2;
    var Rule2;
    function cleanSource(nodes) {
      let stack = nodes.slice();
      while (stack.length > 0) {
        let node = stack.pop();
        delete node.source;
        if (node.nodes) {
          node.nodes = node.nodes.slice();
          for (let i of node.nodes) stack.push(i);
        }
      }
      return nodes.slice();
    }
    function markTreeDirty(node) {
      let stack = [node];
      while (stack.length > 0) {
        let next = stack.pop();
        next[isClean] = false;
        if (next.proxyOf.nodes) {
          for (let i of next.proxyOf.nodes) stack.push(i);
        }
      }
    }
    var Container2 = class _Container extends Node2 {
      get first() {
        if (!this.proxyOf.nodes) return void 0;
        return this.proxyOf.nodes[0];
      }
      get last() {
        if (!this.proxyOf.nodes) return void 0;
        return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
      }
      append(...children) {
        for (let child of children) {
          let nodes = this.normalize(child, this.last);
          for (let node of nodes) this.proxyOf.nodes.push(node);
        }
        this.markDirty();
        return this;
      }
      cleanRaws(keepBetween) {
        let stack = [this];
        while (stack.length > 0) {
          let node = stack.pop();
          if (node !== this && node.cleanRaws !== _Container.prototype.cleanRaws) {
            node.cleanRaws(keepBetween);
            continue;
          }
          Node2.prototype.cleanRaws.call(node, keepBetween);
          if (node.nodes) {
            for (let child of node.nodes) stack.push(child);
          }
        }
      }
      each(callback) {
        if (!this.proxyOf.nodes) return void 0;
        let iterator = this.getIterator();
        let index, result;
        while (this.indexes[iterator] < this.proxyOf.nodes.length) {
          index = this.indexes[iterator];
          result = callback(this.proxyOf.nodes[index], index);
          if (result === false) break;
          this.indexes[iterator] += 1;
        }
        delete this.indexes[iterator];
        return result;
      }
      every(condition) {
        return this.nodes.every(condition);
      }
      getIterator() {
        if (!this.lastEach) this.lastEach = 0;
        if (!this.indexes) this.indexes = {};
        this.lastEach += 1;
        let iterator = this.lastEach;
        this.indexes[iterator] = 0;
        return iterator;
      }
      getProxyProcessor() {
        return {
          get(node, prop) {
            if (prop === "proxyOf") {
              return node;
            } else if (!node[prop]) {
              return node[prop];
            } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
              return (...args) => {
                return node[prop](
                  ...args.map((i) => {
                    if (typeof i === "function") {
                      return (child, index) => i(child.toProxy(), index);
                    } else {
                      return i;
                    }
                  })
                );
              };
            } else if (prop === "every" || prop === "some") {
              return (cb) => {
                return node[prop](
                  (child, ...other) => cb(child.toProxy(), ...other)
                );
              };
            } else if (prop === "root") {
              return () => node.root().toProxy();
            } else if (prop === "nodes") {
              return node.nodes.map((i) => i.toProxy());
            } else if (prop === "first" || prop === "last") {
              return node[prop].toProxy();
            } else {
              return node[prop];
            }
          },
          set(node, prop, value) {
            if (node[prop] === value) return true;
            node[prop] = value;
            if (prop === "name" || prop === "params" || prop === "selector") {
              node.markDirty();
            }
            return true;
          }
        };
      }
      index(child) {
        if (typeof child === "number") return child;
        if (child.proxyOf) child = child.proxyOf;
        return this.proxyOf.nodes.indexOf(child);
      }
      insertAfter(exist, add) {
        let existIndex = this.index(exist);
        let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
        existIndex = this.index(exist);
        for (let node of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node);
        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (existIndex < index) {
            this.indexes[id] = index + nodes.length;
          }
        }
        this.markDirty();
        return this;
      }
      insertBefore(exist, add) {
        let existIndex = this.index(exist);
        let type = existIndex === 0 ? "prepend" : false;
        let nodes = this.normalize(
          add,
          this.proxyOf.nodes[existIndex],
          type
        ).reverse();
        existIndex = this.index(exist);
        for (let node of nodes) this.proxyOf.nodes.splice(existIndex, 0, node);
        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (existIndex <= index) {
            this.indexes[id] = index + nodes.length;
          }
        }
        this.markDirty();
        return this;
      }
      normalize(nodes, sample) {
        if (typeof nodes === "string") {
          nodes = cleanSource(parse2(nodes).nodes);
        } else if (typeof nodes === "undefined") {
          nodes = [];
        } else if (Array.isArray(nodes)) {
          nodes = nodes.slice(0);
          for (let i of nodes) {
            if (i.parent) i.parent.removeChild(i, "ignore");
          }
        } else if (nodes.type === "root" && this.type !== "document") {
          nodes = nodes.nodes.slice(0);
          for (let i of nodes) {
            if (i.parent) i.parent.removeChild(i, "ignore");
          }
        } else if (nodes.type) {
          nodes = [nodes];
        } else if (nodes.prop) {
          if (typeof nodes.value === "undefined") {
            throw new Error("Value field is missed in node creation");
          } else if (typeof nodes.value !== "string") {
            nodes.value = String(nodes.value);
          }
          nodes = [new Declaration2(nodes)];
        } else if (nodes.selector || nodes.selectors) {
          nodes = [new Rule2(nodes)];
        } else if (nodes.name) {
          nodes = [new AtRule2(nodes)];
        } else if (nodes.text) {
          nodes = [new Comment2(nodes)];
        } else {
          throw new Error("Unknown node type in node creation");
        }
        let processed = nodes.map((i) => {
          if (!i[my]) _Container.rebuild(i);
          i = i.proxyOf;
          if (i.parent) i.parent.removeChild(i);
          if (i[isClean]) markTreeDirty(i);
          if (!i.raws) i.raws = {};
          if (typeof i.raws.before === "undefined") {
            if (sample && typeof sample.raws.before !== "undefined") {
              i.raws.before = sample.raws.before.replace(/\S/g, "");
            }
          }
          i.parent = this.proxyOf;
          return i;
        });
        return processed;
      }
      prepend(...children) {
        children = children.reverse();
        for (let child of children) {
          let nodes = this.normalize(child, this.first, "prepend").reverse();
          for (let node of nodes) this.proxyOf.nodes.unshift(node);
          for (let id in this.indexes) {
            this.indexes[id] = this.indexes[id] + nodes.length;
          }
        }
        this.markDirty();
        return this;
      }
      push(child) {
        child.parent = this;
        this.proxyOf.nodes.push(child);
        return this;
      }
      removeAll() {
        for (let node of this.proxyOf.nodes) node.parent = void 0;
        this.proxyOf.nodes = [];
        this.markDirty();
        return this;
      }
      removeChild(child) {
        child = this.index(child);
        this.proxyOf.nodes[child].parent = void 0;
        this.proxyOf.nodes.splice(child, 1);
        let index;
        for (let id in this.indexes) {
          index = this.indexes[id];
          if (index >= child) {
            this.indexes[id] = index - 1;
          }
        }
        this.markDirty();
        return this;
      }
      replaceValues(pattern, opts, callback) {
        if (!callback) {
          callback = opts;
          opts = {};
        }
        this.walkDecls((decl2) => {
          if (opts.props && !opts.props.includes(decl2.prop)) return;
          if (opts.fast && !decl2.value.includes(opts.fast)) return;
          decl2.value = decl2.value.replace(pattern, callback);
        });
        this.markDirty();
        return this;
      }
      some(condition) {
        return this.nodes.some(condition);
      }
      walk(callback) {
        if (!this.proxyOf.nodes) return void 0;
        let stack = [{ iterator: this.getIterator(), node: this.proxyOf }];
        while (stack.length > 0) {
          let { iterator, node } = stack[stack.length - 1];
          let index = node.indexes[iterator];
          if (index >= node.proxyOf.nodes.length) {
            delete node.indexes[iterator];
            stack.pop();
            let parent = stack[stack.length - 1];
            if (parent) parent.node.indexes[parent.iterator] += 1;
            continue;
          }
          let child = node.proxyOf.nodes[index];
          let result;
          try {
            result = callback(child, index);
          } catch (e) {
            throw child.addToError(e);
          }
          if (result === false) {
            for (let opened of stack) {
              delete opened.node.indexes[opened.iterator];
            }
            return false;
          }
          if (child.walk && child.proxyOf.nodes) {
            stack.push({ iterator: child.getIterator(), node: child });
          } else {
            node.indexes[iterator] += 1;
          }
        }
        return void 0;
      }
      walkAtRules(name, callback) {
        if (!callback) {
          callback = name;
          return this.walk((child, i) => {
            if (child.type === "atrule") {
              return callback(child, i);
            }
          });
        }
        if (name instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === "atrule" && name.test(child.name)) {
              return callback(child, i);
            }
          });
        }
        return this.walk((child, i) => {
          if (child.type === "atrule" && child.name === name) {
            return callback(child, i);
          }
        });
      }
      walkComments(callback) {
        return this.walk((child, i) => {
          if (child.type === "comment") {
            return callback(child, i);
          }
        });
      }
      walkDecls(prop, callback) {
        if (!callback) {
          callback = prop;
          return this.walk((child, i) => {
            if (child.type === "decl") {
              return callback(child, i);
            }
          });
        }
        if (prop instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === "decl" && prop.test(child.prop)) {
              return callback(child, i);
            }
          });
        }
        return this.walk((child, i) => {
          if (child.type === "decl" && child.prop === prop) {
            return callback(child, i);
          }
        });
      }
      walkRules(selector, callback) {
        if (!callback) {
          callback = selector;
          return this.walk((child, i) => {
            if (child.type === "rule") {
              return callback(child, i);
            }
          });
        }
        if (selector instanceof RegExp) {
          return this.walk((child, i) => {
            if (child.type === "rule" && selector.test(child.selector)) {
              return callback(child, i);
            }
          });
        }
        return this.walk((child, i) => {
          if (child.type === "rule" && child.selector === selector) {
            return callback(child, i);
          }
        });
      }
    };
    Container2.registerParse = (dependant) => {
      parse2 = dependant;
    };
    Container2.registerRule = (dependant) => {
      Rule2 = dependant;
    };
    Container2.registerAtRule = (dependant) => {
      AtRule2 = dependant;
    };
    Container2.registerRoot = (dependant) => {
      Root2 = dependant;
    };
    module.exports = Container2;
    Container2.default = Container2;
    Container2.rebuild = (node) => {
      let stack = [node];
      while (stack.length > 0) {
        let next = stack.pop();
        if (next.type === "atrule") {
          Object.setPrototypeOf(next, AtRule2.prototype);
        } else if (next.type === "rule") {
          Object.setPrototypeOf(next, Rule2.prototype);
        } else if (next.type === "decl") {
          Object.setPrototypeOf(next, Declaration2.prototype);
        } else if (next.type === "comment") {
          Object.setPrototypeOf(next, Comment2.prototype);
        } else if (next.type === "root") {
          Object.setPrototypeOf(next, Root2.prototype);
        }
        next[my] = true;
        if (next.nodes) {
          for (let child of next.nodes) stack.push(child);
        }
      }
    };
  }
});

// node_modules/postcss/lib/at-rule.js
var require_at_rule = __commonJS({
  "node_modules/postcss/lib/at-rule.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var AtRule2 = class extends Container2 {
      constructor(defaults) {
        super(defaults);
        this.type = "atrule";
      }
      append(...children) {
        if (!this.proxyOf.nodes) this.nodes = [];
        return super.append(...children);
      }
      prepend(...children) {
        if (!this.proxyOf.nodes) this.nodes = [];
        return super.prepend(...children);
      }
    };
    module.exports = AtRule2;
    AtRule2.default = AtRule2;
    Container2.registerAtRule(AtRule2);
  }
});

// node_modules/postcss/lib/document.js
var require_document = __commonJS({
  "node_modules/postcss/lib/document.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var LazyResult;
    var Processor2;
    var Document2 = class extends Container2 {
      constructor(defaults) {
        super({ type: "document", ...defaults });
        if (!this.nodes) {
          this.nodes = [];
        }
      }
      toResult(opts = {}) {
        let lazy = new LazyResult(new Processor2(), this, opts);
        return lazy.stringify();
      }
    };
    Document2.registerLazyResult = (dependant) => {
      LazyResult = dependant;
    };
    Document2.registerProcessor = (dependant) => {
      Processor2 = dependant;
    };
    module.exports = Document2;
    Document2.default = Document2;
  }
});

// node_modules/nanoid/non-secure/index.cjs
var require_non_secure = __commonJS({
  "node_modules/nanoid/non-secure/index.cjs"(exports, module) {
    var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
    var customAlphabet = (alphabet, defaultSize = 21) => {
      return (size = defaultSize) => {
        let id = "";
        let i = size | 0;
        while (i-- > 0) {
          id += alphabet[Math.random() * alphabet.length | 0];
        }
        return id;
      };
    };
    var nanoid = (size = 21) => {
      let id = "";
      let i = size | 0;
      while (i-- > 0) {
        id += urlAlphabet[Math.random() * 64 | 0];
      }
      return id;
    };
    module.exports = { nanoid, customAlphabet };
  }
});

// (disabled):path
var require_path = __commonJS({
  "(disabled):path"() {
  }
});

// (disabled):node_modules/source-map-js/source-map.js
var require_source_map = __commonJS({
  "(disabled):node_modules/source-map-js/source-map.js"() {
  }
});

// (disabled):url
var require_url = __commonJS({
  "(disabled):url"() {
  }
});

// (disabled):fs
var require_fs = __commonJS({
  "(disabled):fs"() {
  }
});

// node_modules/postcss/lib/previous-map.js
var require_previous_map = __commonJS({
  "node_modules/postcss/lib/previous-map.js"(exports, module) {
    "use strict";
    var { existsSync, readFileSync, realpathSync } = require_fs();
    var { dirname, isAbsolute, join, relative, sep } = require_path();
    var { SourceMapConsumer, SourceMapGenerator } = require_source_map();
    function realPath(path) {
      try {
        return realpathSync(path);
      } catch {
        return path;
      }
    }
    function fromBase64(str) {
      if (Buffer) {
        return Buffer.from(str, "base64").toString();
      } else {
        return window.atob(str);
      }
    }
    var PreviousMap = class {
      constructor(css, opts) {
        if (opts.map === false) return;
        if (opts.unsafeMap) this.unsafeMap = true;
        this.loadAnnotation(css);
        this.inline = this.startWith(this.annotation, "data:");
        let prev = opts.map ? opts.map.prev : void 0;
        let text = this.loadMap(opts.from, prev);
        if (!this.mapFile && opts.from) {
          this.mapFile = opts.from;
        }
        if (this.mapFile) this.root = dirname(this.mapFile);
        if (text) this.text = text;
      }
      consumer() {
        if (!this.consumerCache) {
          this.consumerCache = new SourceMapConsumer(this.json || this.text);
        }
        return this.consumerCache;
      }
      decodeInline(text) {
        let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
        let baseUri = /^data:application\/json;base64,/;
        let charsetUri = /^data:application\/json;charset=utf-?8,/;
        let uri = /^data:application\/json,/;
        let uriMatch = text.match(charsetUri) || text.match(uri);
        if (uriMatch) {
          return decodeURIComponent(text.substr(uriMatch[0].length));
        }
        let baseUriMatch = text.match(baseCharsetUri) || text.match(baseUri);
        if (baseUriMatch) {
          return fromBase64(text.substr(baseUriMatch[0].length));
        }
        let encoding = text.slice("data:application/json;".length);
        encoding = encoding.slice(0, encoding.indexOf(","));
        throw new Error("Unsupported source map encoding " + encoding);
      }
      getAnnotationURL(sourceMapString) {
        return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
      }
      isMap(map) {
        if (typeof map !== "object") return false;
        return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
      }
      loadAnnotation(css) {
        let comments = css.match(/\/\*\s*# sourceMappingURL=/g);
        if (!comments) return;
        let start2 = css.lastIndexOf(comments.pop());
        let end = css.indexOf("*/", start2);
        if (start2 > -1 && end > -1) {
          this.annotation = this.getAnnotationURL(css.substring(start2, end));
        }
      }
      loadFile(path, cssFile, trusted) {
        if (!trusted && !this.unsafeMap) {
          if (!/\.map$/i.test(path)) return void 0;
          if (!cssFile) return void 0;
          let rel = relative(realPath(dirname(cssFile)), realPath(path));
          if (rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)) {
            return void 0;
          }
        }
        this.root = dirname(path);
        if (existsSync(path)) {
          this.mapFile = path;
          return readFileSync(path, "utf-8").toString().trim();
        }
      }
      loadMap(file, prev) {
        if (prev === false) return false;
        if (prev) {
          if (typeof prev === "string") {
            return prev;
          } else if (typeof prev === "function") {
            let prevPath = prev(file);
            if (prevPath) {
              let map = this.loadFile(prevPath, file, true);
              if (!map) {
                throw new Error(
                  "Unable to load previous source map: " + prevPath.toString()
                );
              }
              return map;
            }
          } else if (prev instanceof SourceMapConsumer) {
            return SourceMapGenerator.fromSourceMap(prev).toString();
          } else if (prev instanceof SourceMapGenerator) {
            return prev.toString();
          } else if (this.isMap(prev)) {
            return JSON.stringify(prev);
          } else {
            throw new Error(
              "Unsupported previous source map format: " + prev.toString()
            );
          }
        } else if (this.inline) {
          return this.decodeInline(this.annotation);
        } else if (this.annotation) {
          let map = this.annotation;
          if (file) map = join(dirname(file), map);
          let unknown = this.loadFile(map, file, false);
          if (unknown) {
            try {
              this.json = JSON.parse(unknown.replace(/^\)]}'[^\n]*\n/, ""));
            } catch {
              return void 0;
            }
          }
          return unknown;
        }
      }
      startWith(string, start2) {
        if (!string) return false;
        return string.substr(0, start2.length) === start2;
      }
      withContent() {
        return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
      }
    };
    module.exports = PreviousMap;
    PreviousMap.default = PreviousMap;
  }
});

// node_modules/postcss/lib/input.js
var require_input = __commonJS({
  "node_modules/postcss/lib/input.js"(exports, module) {
    "use strict";
    var { nanoid } = require_non_secure();
    var { isAbsolute, resolve } = require_path();
    var { SourceMapConsumer, SourceMapGenerator } = require_source_map();
    var { fileURLToPath, pathToFileURL } = require_url();
    var CssSyntaxError2 = require_css_syntax_error();
    var PreviousMap = require_previous_map();
    var terminalHighlight = require_terminal_highlight();
    var lineToIndexCache = Symbol("lineToIndexCache");
    var sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
    var pathAvailable = Boolean(resolve && isAbsolute);
    function getLineToIndex(input) {
      if (input[lineToIndexCache]) return input[lineToIndexCache];
      let lines = input.css.split("\n");
      let lineToIndex = new Array(lines.length);
      let prevIndex = 0;
      for (let i = 0, l = lines.length; i < l; i++) {
        lineToIndex[i] = prevIndex;
        prevIndex += lines[i].length + 1;
      }
      input[lineToIndexCache] = lineToIndex;
      return lineToIndex;
    }
    var Input2 = class {
      get from() {
        return this.file || this.id;
      }
      constructor(css, opts = {}) {
        if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) {
          throw new Error(`PostCSS received ${css} instead of CSS string`);
        }
        this.css = css.toString();
        if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
          this.hasBOM = true;
          this.css = this.css.slice(1);
        } else {
          this.hasBOM = false;
        }
        this.document = this.css;
        if (opts.document) this.document = opts.document.toString();
        if (opts.from) {
          if (!pathAvailable || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
            this.file = opts.from;
          } else {
            this.file = resolve(opts.from);
          }
        }
        if (pathAvailable && sourceMapAvailable) {
          let map = new PreviousMap(this.css, opts);
          if (map.text) {
            this.map = map;
            let file = map.consumer().file;
            if (!this.file && file) this.file = this.mapResolve(file);
          }
        }
        if (!this.file) {
          this.id = "<input css " + nanoid(6) + ">";
        }
        if (this.map) this.map.file = this.from;
      }
      error(message, line, column, opts = {}) {
        let endColumn, endLine, endOffset, offset, result;
        if (line && typeof line === "object") {
          let start2 = line;
          let end = column;
          if (typeof start2.offset === "number") {
            offset = start2.offset;
            let pos = this.fromOffset(offset);
            line = pos.line;
            column = pos.col;
          } else {
            line = start2.line;
            column = start2.column;
            offset = this.fromLineAndColumn(line, column);
          }
          if (typeof end.offset === "number") {
            endOffset = end.offset;
            let pos = this.fromOffset(endOffset);
            endLine = pos.line;
            endColumn = pos.col;
          } else {
            endLine = end.line;
            endColumn = end.column;
            endOffset = this.fromLineAndColumn(end.line, end.column);
          }
        } else if (!column) {
          offset = line;
          let pos = this.fromOffset(offset);
          line = pos.line;
          column = pos.col;
        } else {
          offset = this.fromLineAndColumn(line, column);
        }
        let origin = this.origin(line, column, endLine, endColumn);
        if (origin) {
          result = new CssSyntaxError2(
            message,
            origin.endLine === void 0 ? origin.line : { column: origin.column, line: origin.line },
            origin.endLine === void 0 ? origin.column : { column: origin.endColumn, line: origin.endLine },
            origin.source,
            origin.file,
            opts.plugin
          );
        } else {
          result = new CssSyntaxError2(
            message,
            endLine === void 0 ? line : { column, line },
            endLine === void 0 ? column : { column: endColumn, line: endLine },
            this.css,
            this.file,
            opts.plugin
          );
        }
        result.input = {
          column,
          endColumn,
          endLine,
          endOffset,
          line,
          offset,
          source: this.css
        };
        if (this.file) {
          if (pathToFileURL) {
            result.input.url = pathToFileURL(this.file).toString();
          }
          result.input.file = this.file;
        }
        return result;
      }
      fromLineAndColumn(line, column) {
        let lineToIndex = getLineToIndex(this);
        let index = lineToIndex[line - 1];
        return index + column - 1;
      }
      fromOffset(offset) {
        let lineToIndex = getLineToIndex(this);
        let lastLine = lineToIndex[lineToIndex.length - 1];
        let min = 0;
        if (offset >= lastLine) {
          min = lineToIndex.length - 1;
        } else {
          let max = lineToIndex.length - 2;
          let mid;
          while (min < max) {
            mid = min + (max - min >> 1);
            if (offset < lineToIndex[mid]) {
              max = mid - 1;
            } else if (offset >= lineToIndex[mid + 1]) {
              min = mid + 1;
            } else {
              min = mid;
              break;
            }
          }
        }
        return {
          col: offset - lineToIndex[min] + 1,
          line: min + 1
        };
      }
      mapResolve(file) {
        if (/^\w+:\/\//.test(file)) {
          return file;
        }
        return resolve(this.map.consumer().sourceRoot || this.map.root || ".", file);
      }
      origin(line, column, endLine, endColumn) {
        if (!this.map) return false;
        let consumer = this.map.consumer();
        let from = consumer.originalPositionFor({ column: column - 1, line });
        if (!from.source) return false;
        let to;
        if (typeof endLine === "number") {
          let toPosition = consumer.originalPositionFor({
            column: endColumn - 1,
            line: endLine
          });
          if (toPosition.source) to = toPosition;
        }
        let fromUrl;
        if (isAbsolute(from.source)) {
          fromUrl = pathToFileURL(from.source);
        } else {
          fromUrl = new URL(
            from.source,
            this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
          );
        }
        let result = {
          column: from.column + 1,
          endColumn: to && to.column + 1,
          endLine: to && to.line,
          line: from.line,
          url: fromUrl.toString()
        };
        if (fromUrl.protocol === "file:") {
          if (fileURLToPath) {
            result.file = fileURLToPath(fromUrl);
          } else {
            throw new Error(`file: protocol is not available in this PostCSS build`);
          }
        }
        let source = consumer.sourceContentFor(from.source);
        if (source) result.source = source;
        return result;
      }
      toJSON() {
        let json = {};
        for (let name of ["hasBOM", "css", "file", "id"]) {
          if (this[name] != null) {
            json[name] = this[name];
          }
        }
        if (this.map) {
          json.map = { ...this.map };
          if (json.map.consumerCache) {
            json.map.consumerCache = void 0;
          }
        }
        return json;
      }
    };
    module.exports = Input2;
    Input2.default = Input2;
    if (terminalHighlight && terminalHighlight.registerInput) {
      terminalHighlight.registerInput(Input2);
    }
  }
});

// node_modules/postcss/lib/root.js
var require_root = __commonJS({
  "node_modules/postcss/lib/root.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var LazyResult;
    var Processor2;
    var Root2 = class extends Container2 {
      constructor(defaults) {
        super(defaults);
        this.type = "root";
        if (!this.nodes) this.nodes = [];
      }
      normalize(child, sample, type) {
        let keepBefore = /* @__PURE__ */ new Set();
        for (let node of Array.isArray(child) ? child : [child]) {
          if (node && typeof node === "object" && !node.parent && node.raws && typeof node.raws.before !== "undefined") {
            keepBefore.add(node.raws);
          }
        }
        let nodes = super.normalize(child);
        if (sample) {
          if (type === "prepend") {
            if (this.nodes.length > 1) {
              sample.raws.before = this.nodes[1].raws.before;
            } else {
              delete sample.raws.before;
            }
          } else if (this.first !== sample) {
            for (let node of nodes) {
              if (!keepBefore.has(node.raws)) {
                node.raws.before = sample.raws.before;
              }
            }
          }
        }
        return nodes;
      }
      removeChild(child, ignore) {
        let index = this.index(child);
        if (!ignore && index === 0 && this.nodes.length > 1) {
          this.nodes[1].raws.before = this.nodes[index].raws.before;
        }
        return super.removeChild(child);
      }
      toResult(opts = {}) {
        let lazy = new LazyResult(new Processor2(), this, opts);
        return lazy.stringify();
      }
    };
    Root2.registerLazyResult = (dependant) => {
      LazyResult = dependant;
    };
    Root2.registerProcessor = (dependant) => {
      Processor2 = dependant;
    };
    module.exports = Root2;
    Root2.default = Root2;
    Container2.registerRoot(Root2);
  }
});

// node_modules/postcss/lib/list.js
var require_list = __commonJS({
  "node_modules/postcss/lib/list.js"(exports, module) {
    "use strict";
    var list2 = {
      comma(string) {
        return list2.split(string, [","], true);
      },
      space(string) {
        let spaces = [" ", "\n", "	"];
        return list2.split(string, spaces);
      },
      split(string, separators, last) {
        if (typeof string !== "string") return [];
        let array = [];
        let current = "";
        let split = false;
        let func = 0;
        let inQuote = false;
        let prevQuote = "";
        let escape = false;
        for (let letter of string) {
          if (escape) {
            escape = false;
          } else if (letter === "\\") {
            escape = true;
          } else if (inQuote) {
            if (letter === prevQuote) {
              inQuote = false;
            }
          } else if (letter === '"' || letter === "'") {
            inQuote = true;
            prevQuote = letter;
          } else if (letter === "(") {
            func += 1;
          } else if (letter === ")") {
            if (func > 0) func -= 1;
          } else if (func === 0) {
            if (separators.includes(letter)) split = true;
          }
          if (split) {
            let value2 = current.trim();
            if (last || value2 !== "") array.push(value2);
            current = "";
            split = false;
          } else {
            current += letter;
          }
        }
        let value = current.trim();
        if (last || value !== "") array.push(value);
        return array;
      }
    };
    module.exports = list2;
    list2.default = list2;
  }
});

// node_modules/postcss/lib/rule.js
var require_rule = __commonJS({
  "node_modules/postcss/lib/rule.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var list2 = require_list();
    var Rule2 = class extends Container2 {
      get selectors() {
        return list2.comma(this.selector);
      }
      set selectors(values) {
        let match = this.selector ? this.selector.match(/,\s*/) : null;
        let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
        this.selector = values.join(sep);
      }
      constructor(defaults) {
        super(defaults);
        this.type = "rule";
        if (!this.nodes) this.nodes = [];
      }
    };
    module.exports = Rule2;
    Rule2.default = Rule2;
    Container2.registerRule(Rule2);
  }
});

// node_modules/postcss/lib/fromJSON.js
var require_fromJSON = __commonJS({
  "node_modules/postcss/lib/fromJSON.js"(exports, module) {
    "use strict";
    var AtRule2 = require_at_rule();
    var Comment2 = require_comment();
    var Declaration2 = require_declaration();
    var Input2 = require_input();
    var PreviousMap = require_previous_map();
    var Root2 = require_root();
    var Rule2 = require_rule();
    function hydrateInputs(json, inputs) {
      if (!json.inputs) return inputs;
      return json.inputs.map((input) => {
        let inputHydrated = { ...input, __proto__: Input2.prototype };
        if (inputHydrated.map) {
          inputHydrated.map = {
            ...inputHydrated.map,
            __proto__: PreviousMap.prototype
          };
        }
        return inputHydrated;
      });
    }
    function constructNode(json, inputs, children) {
      let defaults = { ...json };
      delete defaults.inputs;
      delete defaults.nodes;
      if (defaults.source) {
        let { inputId, ...source } = defaults.source;
        defaults.source = source;
        if (inputId != null) {
          defaults.source.input = inputs[inputId];
        }
      }
      let node;
      if (defaults.type === "root") {
        node = new Root2(defaults);
      } else if (defaults.type === "decl") {
        node = new Declaration2(defaults);
      } else if (defaults.type === "rule") {
        node = new Rule2(defaults);
      } else if (defaults.type === "comment") {
        node = new Comment2(defaults);
      } else if (defaults.type === "atrule") {
        node = new AtRule2(defaults);
      } else {
        throw new Error("Unknown node type: " + json.type);
      }
      if (children) {
        node.nodes = children;
        for (let child of children) child.parent = node;
      }
      return node;
    }
    function fromJSON2(json, inputs) {
      if (Array.isArray(json)) return json.map((n) => fromJSON2(n));
      let result;
      let stack = [
        { childIndex: 0, children: [], inputs: hydrateInputs(json, inputs), json }
      ];
      while (stack.length > 0) {
        let frame = stack[stack.length - 1];
        let jsonNodes = frame.json.nodes;
        if (jsonNodes && frame.childIndex < jsonNodes.length) {
          let childJson = jsonNodes[frame.childIndex];
          frame.childIndex += 1;
          stack.push({
            childIndex: 0,
            children: [],
            inputs: hydrateInputs(childJson, frame.inputs),
            json: childJson
          });
          continue;
        }
        stack.pop();
        let node = constructNode(
          frame.json,
          frame.inputs,
          jsonNodes ? frame.children : void 0
        );
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          result = node;
        }
      }
      return result;
    }
    module.exports = fromJSON2;
    fromJSON2.default = fromJSON2;
  }
});

// node_modules/postcss/lib/map-generator.js
var require_map_generator = __commonJS({
  "node_modules/postcss/lib/map-generator.js"(exports, module) {
    "use strict";
    var { dirname, relative, resolve, sep } = require_path();
    var { SourceMapConsumer, SourceMapGenerator } = require_source_map();
    var { pathToFileURL } = require_url();
    var Input2 = require_input();
    var sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
    var pathAvailable = Boolean(dirname && resolve && relative && sep);
    var MapGenerator = class {
      constructor(stringify2, root2, opts, cssString) {
        this.stringify = stringify2;
        this.mapOpts = opts.map || {};
        this.root = root2;
        this.opts = opts;
        this.css = cssString;
        this.originalCSS = cssString;
        this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
        this.memoizedFileURLs = /* @__PURE__ */ new Map();
        this.memoizedPaths = /* @__PURE__ */ new Map();
        this.memoizedURLs = /* @__PURE__ */ new Map();
      }
      addAnnotation() {
        let content;
        if (this.isInline()) {
          content = "data:application/json;base64," + this.toBase64(this.map.toString());
        } else if (typeof this.mapOpts.annotation === "string") {
          content = this.mapOpts.annotation;
        } else if (typeof this.mapOpts.annotation === "function") {
          content = this.mapOpts.annotation(this.opts.to, this.root);
        } else {
          content = this.outputFile() + ".map";
        }
        let eol = "\n";
        if (this.css.includes("\r\n")) eol = "\r\n";
        this.css += eol + "/*# sourceMappingURL=" + content + " */";
      }
      applyPrevMaps() {
        for (let prev of this.previous()) {
          let from = this.toUrl(this.path(prev.file));
          let root2 = prev.root || dirname(prev.file);
          let map;
          if (this.mapOpts.sourcesContent === false) {
            map = new SourceMapConsumer(prev.text);
            if (map.sourcesContent) {
              map.sourcesContent = null;
            }
          } else {
            map = prev.consumer();
          }
          this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
        }
      }
      clearAnnotation() {
        if (this.mapOpts.annotation === false) return;
        if (this.root) {
          let node;
          for (let i = this.root.nodes.length - 1; i >= 0; i--) {
            node = this.root.nodes[i];
            if (node.type !== "comment") continue;
            if (node.text.startsWith("# sourceMappingURL=")) {
              this.root.removeChild(i);
            }
          }
        } else if (this.css) {
          let annotation = "/*# sourceMappingURL=";
          let startIndex;
          while ((startIndex = this.css.lastIndexOf(annotation)) !== -1) {
            let endIndex = this.css.indexOf("*/", startIndex + annotation.length);
            if (endIndex === -1) break;
            while (startIndex > 0 && this.css[startIndex - 1] === "\n") {
              startIndex--;
            }
            this.css = this.css.slice(0, startIndex) + this.css.slice(endIndex + 2);
          }
        }
      }
      generate() {
        this.clearAnnotation();
        if (pathAvailable && sourceMapAvailable && this.isMap()) {
          return this.generateMap();
        } else {
          let result = "";
          this.stringify(this.root, (i) => {
            result += i;
          });
          return [result];
        }
      }
      generateMap() {
        if (this.root) {
          this.generateString();
        } else if (this.previous().length === 1) {
          let prev = this.previous()[0].consumer();
          prev.file = this.outputFile();
          this.map = SourceMapGenerator.fromSourceMap(prev, {
            ignoreInvalidMapping: true
          });
        } else {
          this.map = new SourceMapGenerator({
            file: this.outputFile(),
            ignoreInvalidMapping: true
          });
          this.map.addMapping({
            generated: { column: 0, line: 1 },
            original: { column: 0, line: 1 },
            source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
          });
        }
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.root && this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();
        if (this.isInline()) {
          return [this.css];
        } else {
          return [this.css, this.map];
        }
      }
      generateString() {
        this.css = "";
        this.map = new SourceMapGenerator({
          file: this.outputFile(),
          ignoreInvalidMapping: true
        });
        let line = 1;
        let column = 1;
        let noSource = "<no source>";
        let mapping = {
          generated: { column: 0, line: 0 },
          original: { column: 0, line: 0 },
          source: ""
        };
        let last, lines;
        this.stringify(this.root, (str, node, type) => {
          this.css += str;
          if (node && type !== "end") {
            mapping.generated.line = line;
            mapping.generated.column = column - 1;
            if (node.source && node.source.start) {
              mapping.source = this.sourcePath(node);
              mapping.original.line = node.source.start.line;
              mapping.original.column = node.source.start.column - 1;
              this.map.addMapping(mapping);
            } else {
              mapping.source = noSource;
              mapping.original.line = 1;
              mapping.original.column = 0;
              this.map.addMapping(mapping);
            }
          }
          lines = str.match(/\n/g);
          if (lines) {
            line += lines.length;
            last = str.lastIndexOf("\n");
            column = str.length - last;
          } else {
            column += str.length;
          }
          if (node && type !== "start") {
            let p = node.parent || { raws: {} };
            let childless = node.type === "decl" || node.type === "atrule" && !node.nodes;
            if (!childless || node !== p.last || p.raws.semicolon) {
              if (node.source && node.source.end) {
                mapping.source = this.sourcePath(node);
                mapping.original.line = node.source.end.line;
                mapping.original.column = node.source.end.column - 1;
                mapping.generated.line = line;
                mapping.generated.column = column - 2;
                this.map.addMapping(mapping);
              } else {
                mapping.source = noSource;
                mapping.original.line = 1;
                mapping.original.column = 0;
                mapping.generated.line = line;
                mapping.generated.column = column - 1;
                this.map.addMapping(mapping);
              }
            }
          }
        });
      }
      isAnnotation() {
        if (this.isInline()) {
          return true;
        }
        if (typeof this.mapOpts.annotation !== "undefined") {
          return this.mapOpts.annotation;
        }
        if (this.previous().length) {
          return this.previous().some((i) => i.annotation);
        }
        return true;
      }
      isInline() {
        if (typeof this.mapOpts.inline !== "undefined") {
          return this.mapOpts.inline;
        }
        let annotation = this.mapOpts.annotation;
        if (typeof annotation !== "undefined" && annotation !== true) {
          return false;
        }
        if (this.previous().length) {
          return this.previous().some((i) => i.inline);
        }
        return true;
      }
      isMap() {
        if (typeof this.opts.map !== "undefined") {
          return !!this.opts.map;
        }
        return this.previous().length > 0;
      }
      isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== "undefined") {
          return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
          return this.previous().some((i) => i.withContent());
        }
        return true;
      }
      outputFile() {
        if (this.opts.to) {
          return this.path(this.opts.to);
        } else if (this.opts.from) {
          return this.path(this.opts.from);
        } else {
          return "to.css";
        }
      }
      path(file) {
        if (this.mapOpts.absolute) return file;
        if (file.charCodeAt(0) === 60) return file;
        if (/^\w+:\/\//.test(file)) return file;
        let cached = this.memoizedPaths.get(file);
        if (cached) return cached;
        let from = this.opts.to ? dirname(this.opts.to) : ".";
        if (typeof this.mapOpts.annotation === "string") {
          from = dirname(resolve(from, this.mapOpts.annotation));
        }
        let path = relative(from, file);
        this.memoizedPaths.set(file, path);
        return path;
      }
      previous() {
        if (!this.previousMaps) {
          this.previousMaps = [];
          if (this.root) {
            this.root.walk((node) => {
              if (node.source && node.source.input.map) {
                let map = node.source.input.map;
                if (!this.previousMaps.includes(map)) {
                  this.previousMaps.push(map);
                }
              }
            });
          } else {
            let input = new Input2(this.originalCSS, this.opts);
            if (input.map) this.previousMaps.push(input.map);
          }
        }
        return this.previousMaps;
      }
      setSourcesContent() {
        let already = {};
        if (this.root) {
          this.root.walk((node) => {
            if (node.source) {
              let from = node.source.input.from;
              if (from && !already[from]) {
                already[from] = true;
                let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
                this.map.setSourceContent(fromUrl, node.source.input.css);
              }
            }
          });
        } else if (this.css) {
          let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
          this.map.setSourceContent(from, this.css);
        }
      }
      sourcePath(node) {
        if (this.mapOpts.from) {
          return this.toUrl(this.mapOpts.from);
        } else if (this.usesFileUrls) {
          return this.toFileUrl(node.source.input.from);
        } else {
          return this.toUrl(this.path(node.source.input.from));
        }
      }
      toBase64(str) {
        if (Buffer) {
          return Buffer.from(str).toString("base64");
        } else {
          return window.btoa(unescape(encodeURIComponent(str)));
        }
      }
      toFileUrl(path) {
        let cached = this.memoizedFileURLs.get(path);
        if (cached) return cached;
        if (pathToFileURL) {
          let fileURL = pathToFileURL(path).toString();
          this.memoizedFileURLs.set(path, fileURL);
          return fileURL;
        } else {
          throw new Error(
            "`map.absolute` option is not available in this PostCSS build"
          );
        }
      }
      toUrl(path) {
        let cached = this.memoizedURLs.get(path);
        if (cached) return cached;
        if (sep === "\\") {
          path = path.replace(/\\/g, "/");
        }
        let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
        this.memoizedURLs.set(path, url);
        return url;
      }
    };
    module.exports = MapGenerator;
  }
});

// node_modules/postcss/lib/tokenize.js
var require_tokenize = __commonJS({
  "node_modules/postcss/lib/tokenize.js"(exports, module) {
    "use strict";
    var SINGLE_QUOTE = "'".charCodeAt(0);
    var DOUBLE_QUOTE = '"'.charCodeAt(0);
    var BACKSLASH = "\\".charCodeAt(0);
    var SLASH = "/".charCodeAt(0);
    var NEWLINE = "\n".charCodeAt(0);
    var SPACE = " ".charCodeAt(0);
    var FEED = "\f".charCodeAt(0);
    var TAB = "	".charCodeAt(0);
    var CR = "\r".charCodeAt(0);
    var OPEN_SQUARE = "[".charCodeAt(0);
    var CLOSE_SQUARE = "]".charCodeAt(0);
    var OPEN_PARENTHESES = "(".charCodeAt(0);
    var CLOSE_PARENTHESES = ")".charCodeAt(0);
    var OPEN_CURLY = "{".charCodeAt(0);
    var CLOSE_CURLY = "}".charCodeAt(0);
    var SEMICOLON = ";".charCodeAt(0);
    var ASTERISK = "*".charCodeAt(0);
    var COLON = ":".charCodeAt(0);
    var AT = "@".charCodeAt(0);
    var RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
    var RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
    var RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
    var RE_HEX_ESCAPE = /[\da-f]/i;
    module.exports = function tokenizer(input, options2 = {}) {
      let css = input.css.valueOf();
      let ignore = options2.ignoreErrors;
      let code, content, escape, next, quote;
      let currentToken, escaped, escapePos, n, prev;
      let length = css.length;
      let pos = 0;
      let buffer = [];
      let returned = [];
      let lastBadParen = -1;
      function position() {
        return pos;
      }
      function unclosed(what) {
        throw input.error("Unclosed " + what, pos);
      }
      function endOfFile() {
        return returned.length === 0 && pos >= length;
      }
      function nextToken(opts) {
        if (returned.length) return returned.pop();
        if (pos >= length) return;
        let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
        code = css.charCodeAt(pos);
        switch (code) {
          case NEWLINE:
          case SPACE:
          case TAB:
          case CR:
          case FEED: {
            next = pos;
            do {
              next += 1;
              code = css.charCodeAt(next);
            } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
            currentToken = ["space", css.slice(pos, next)];
            pos = next - 1;
            break;
          }
          case OPEN_SQUARE:
          case CLOSE_SQUARE:
          case OPEN_CURLY:
          case CLOSE_CURLY:
          case COLON:
          case SEMICOLON:
          case CLOSE_PARENTHESES: {
            let controlChar = String.fromCharCode(code);
            currentToken = [controlChar, controlChar, pos];
            break;
          }
          case OPEN_PARENTHESES: {
            prev = buffer.length ? buffer.pop()[1] : "";
            n = css.charCodeAt(pos + 1);
            if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
              next = pos;
              do {
                escaped = false;
                next = css.indexOf(")", next + 1);
                if (next === -1) {
                  if (ignore || ignoreUnclosed) {
                    next = pos;
                    break;
                  } else {
                    unclosed("bracket");
                  }
                }
                escapePos = next;
                while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                  escapePos -= 1;
                  escaped = !escaped;
                }
              } while (escaped);
              currentToken = ["brackets", css.slice(pos, next + 1), pos, next];
              pos = next;
            } else if (pos <= lastBadParen) {
              currentToken = ["(", "(", pos];
            } else {
              next = css.indexOf(")", pos + 1);
              content = css.slice(pos, next + 1);
              if (next === -1 || RE_BAD_BRACKET.test(content)) {
                lastBadParen = next === -1 ? length : next;
                currentToken = ["(", "(", pos];
              } else {
                currentToken = ["brackets", content, pos, next];
                pos = next;
              }
            }
            break;
          }
          case SINGLE_QUOTE:
          case DOUBLE_QUOTE: {
            quote = code === SINGLE_QUOTE ? "'" : '"';
            next = pos;
            do {
              escaped = false;
              next = css.indexOf(quote, next + 1);
              if (next === -1) {
                if (ignore || ignoreUnclosed) {
                  next = pos + 1;
                  break;
                } else {
                  unclosed("string");
                }
              }
              escapePos = next;
              while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
                escapePos -= 1;
                escaped = !escaped;
              }
            } while (escaped);
            currentToken = ["string", css.slice(pos, next + 1), pos, next];
            pos = next;
            break;
          }
          case AT: {
            RE_AT_END.lastIndex = pos + 1;
            RE_AT_END.test(css);
            if (RE_AT_END.lastIndex === 0) {
              next = css.length - 1;
            } else {
              next = RE_AT_END.lastIndex - 2;
            }
            currentToken = ["at-word", css.slice(pos, next + 1), pos, next];
            pos = next;
            break;
          }
          case BACKSLASH: {
            next = pos;
            escape = true;
            while (css.charCodeAt(next + 1) === BACKSLASH) {
              next += 1;
              escape = !escape;
            }
            code = css.charCodeAt(next + 1);
            if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
              next += 1;
              if (RE_HEX_ESCAPE.test(css.charAt(next))) {
                while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
                  next += 1;
                }
                if (css.charCodeAt(next + 1) === SPACE) {
                  next += 1;
                }
              }
            }
            currentToken = ["word", css.slice(pos, next + 1), pos, next];
            pos = next;
            break;
          }
          default: {
            if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
              next = css.indexOf("*/", pos + 2) + 1;
              if (next === 0) {
                if (ignore || ignoreUnclosed) {
                  next = css.length;
                } else {
                  unclosed("comment");
                }
              }
              currentToken = ["comment", css.slice(pos, next + 1), pos, next];
              pos = next;
            } else {
              RE_WORD_END.lastIndex = pos + 1;
              RE_WORD_END.test(css);
              if (RE_WORD_END.lastIndex === 0) {
                next = css.length - 1;
              } else {
                next = RE_WORD_END.lastIndex - 2;
              }
              currentToken = ["word", css.slice(pos, next + 1), pos, next];
              buffer.push(currentToken);
              pos = next;
            }
            break;
          }
        }
        pos++;
        return currentToken;
      }
      function back(token) {
        returned.push(token);
      }
      return {
        back,
        endOfFile,
        nextToken,
        position
      };
    };
  }
});

// node_modules/postcss/lib/parser.js
var require_parser = __commonJS({
  "node_modules/postcss/lib/parser.js"(exports, module) {
    "use strict";
    var AtRule2 = require_at_rule();
    var Comment2 = require_comment();
    var Declaration2 = require_declaration();
    var Root2 = require_root();
    var Rule2 = require_rule();
    var tokenizer = require_tokenize();
    var SAFE_COMMENT_NEIGHBOR = {
      empty: true,
      space: true
    };
    function findLastWithPosition(tokens) {
      for (let i = tokens.length - 1; i >= 0; i--) {
        let token = tokens[i];
        let pos = token[3] || token[2];
        if (pos) return pos;
      }
    }
    function tokensToString(tokens, from, to) {
      let result = "";
      for (let i = from; i < to; i++) result += tokens[i][1];
      return result;
    }
    var Parser = class {
      constructor(input) {
        this.input = input;
        this.root = new Root2();
        this.current = this.root;
        this.spaces = "";
        this.semicolon = false;
        this.createTokenizer();
        this.root.source = { input, start: { column: 1, line: 1, offset: 0 } };
      }
      atrule(token) {
        let node = new AtRule2();
        node.name = token[1].slice(1);
        if (node.name === "") {
          this.unnamedAtrule(node, token);
        }
        this.init(node, token[2]);
        let type;
        let prev;
        let shift;
        let last = false;
        let open = false;
        let params = [];
        let brackets = [];
        while (!this.tokenizer.endOfFile()) {
          token = this.tokenizer.nextToken();
          type = token[0];
          if (type === "(" || type === "[") {
            brackets.push(type === "(" ? ")" : "]");
          } else if (type === "{" && brackets.length > 0) {
            brackets.push("}");
          } else if (type === brackets[brackets.length - 1]) {
            brackets.pop();
          }
          if (brackets.length === 0) {
            if (type === ";") {
              node.source.end = this.getPosition(token[2]);
              node.source.end.offset++;
              this.semicolon = true;
              break;
            } else if (type === "{") {
              open = true;
              break;
            } else if (type === "}") {
              if (params.length > 0) {
                shift = params.length - 1;
                prev = params[shift];
                while (prev && prev[0] === "space") {
                  prev = params[--shift];
                }
                if (prev) {
                  node.source.end = this.getPosition(prev[3] || prev[2]);
                  node.source.end.offset++;
                }
              }
              this.end(token);
              break;
            } else {
              params.push(token);
            }
          } else {
            params.push(token);
          }
          if (this.tokenizer.endOfFile()) {
            last = true;
            break;
          }
        }
        node.raws.between = this.spacesAndCommentsFromEnd(params);
        if (params.length) {
          node.raws.afterName = this.spacesAndCommentsFromStart(params);
          this.raw(node, "params", params);
          if (last) {
            token = params[params.length - 1];
            node.source.end = this.getPosition(token[3] || token[2]);
            node.source.end.offset++;
            this.spaces = node.raws.between;
            node.raws.between = "";
          }
        } else {
          node.raws.afterName = "";
          node.params = "";
        }
        if (open) {
          node.nodes = [];
          this.current = node;
        }
      }
      checkMissedSemicolon(tokens) {
        let colon = this.colon(tokens);
        if (colon === false) return;
        let founded = 0;
        let token;
        for (let j = colon - 1; j >= 0; j--) {
          token = tokens[j];
          if (token[0] !== "space") {
            founded += 1;
            if (founded === 2) break;
          }
        }
        throw this.input.error(
          "Missed semicolon",
          token[0] === "word" ? token[3] + 1 : token[2]
        );
      }
      colon(tokens) {
        let brackets = 0;
        let prev, token, type;
        for (let [i, element] of tokens.entries()) {
          token = element;
          type = token[0];
          if (type === "(") {
            brackets += 1;
          }
          if (type === ")") {
            brackets -= 1;
          }
          if (brackets === 0 && type === ":") {
            if (!prev) {
              this.doubleColon(token);
            } else if (prev[0] === "word" && prev[1] === "progid") {
              continue;
            } else {
              return i;
            }
          }
          prev = token;
        }
        return false;
      }
      comment(token) {
        let node = new Comment2();
        this.init(node, token[2]);
        node.source.end = this.getPosition(token[3] || token[2]);
        node.source.end.offset++;
        let text = token[1].slice(2, -2);
        if (!text.trim()) {
          node.text = "";
          node.raws.left = text;
          node.raws.right = "";
        } else {
          let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
          node.text = match[2];
          node.raws.left = match[1];
          node.raws.right = match[3];
        }
      }
      createTokenizer() {
        this.tokenizer = tokenizer(this.input);
      }
      decl(tokens, customProperty) {
        let node = new Declaration2();
        this.init(node, tokens[0][2]);
        let last = tokens[tokens.length - 1];
        if (last[0] === ";") {
          this.semicolon = true;
          tokens.pop();
        }
        node.source.end = this.getPosition(
          last[3] || last[2] || findLastWithPosition(tokens)
        );
        node.source.end.offset++;
        let start2 = 0;
        while (tokens[start2][0] !== "word") {
          if (start2 === tokens.length - 1) this.unknownWord([tokens[start2]]);
          start2++;
        }
        node.raws.before += tokensToString(tokens, 0, start2);
        node.source.start = this.getPosition(tokens[start2][2]);
        let propStart = start2;
        while (start2 < tokens.length) {
          let type = tokens[start2][0];
          if (type === ":" || type === "space" || type === "comment") {
            break;
          }
          start2++;
        }
        node.prop = tokensToString(tokens, propStart, start2);
        let betweenStart = start2;
        let token;
        while (start2 < tokens.length) {
          token = tokens[start2];
          start2++;
          if (token[0] === ":") break;
          if (token[0] === "word" && /\w/.test(token[1])) {
            this.unknownWord([token]);
          }
        }
        node.raws.between = tokensToString(tokens, betweenStart, start2);
        if (node.prop[0] === "_" || node.prop[0] === "*") {
          node.raws.before += node.prop[0];
          node.prop = node.prop.slice(1);
        }
        let firstSpacesStart = start2;
        while (start2 < tokens.length) {
          let next = tokens[start2][0];
          if (next !== "space" && next !== "comment") break;
          start2++;
        }
        let firstSpaces = tokens.slice(firstSpacesStart, start2);
        tokens = tokens.slice(start2);
        this.precheckMissedSemicolon(tokens);
        for (let i = tokens.length - 1; i >= 0; i--) {
          token = tokens[i];
          if (token[1].toLowerCase() === "!important") {
            node.important = true;
            let string = this.stringFrom(tokens, i);
            string = this.spacesFromEnd(tokens) + string;
            if (string !== " !important") node.raws.important = string;
            break;
          } else if (token[1].toLowerCase() === "important") {
            let cache = tokens.slice(0);
            let str = "";
            for (let j = i; j > 0; j--) {
              let type = cache[j][0];
              if (str.trim().startsWith("!") && type !== "space") {
                break;
              }
              str = cache.pop()[1] + str;
            }
            if (str.trim().startsWith("!")) {
              node.important = true;
              node.raws.important = str;
              tokens = cache;
            }
          }
          if (token[0] !== "space" && token[0] !== "comment") {
            break;
          }
        }
        let hasWord = tokens.some((i) => i[0] !== "space" && i[0] !== "comment");
        if (hasWord) {
          node.raws.between += firstSpaces.map((i) => i[1]).join("");
          firstSpaces = [];
        }
        this.raw(node, "value", firstSpaces.concat(tokens), customProperty);
        if (node.value.includes(":") && !customProperty) {
          this.checkMissedSemicolon(tokens);
        }
      }
      doubleColon(token) {
        throw this.input.error(
          "Double colon",
          { offset: token[2] },
          { offset: token[2] + token[1].length }
        );
      }
      emptyRule(token) {
        let node = new Rule2();
        this.init(node, token[2]);
        node.selector = "";
        node.raws.between = "";
        this.current = node;
      }
      end(token) {
        if (this.current.nodes && this.current.nodes.length) {
          this.current.raws.semicolon = this.semicolon;
        }
        this.semicolon = false;
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.spaces = "";
        if (this.current.parent) {
          this.current.source.end = this.getPosition(token[2]);
          this.current.source.end.offset++;
          this.current = this.current.parent;
        } else {
          this.unexpectedClose(token);
        }
      }
      endFile() {
        if (this.current.parent) this.unclosedBlock();
        if (this.current.nodes && this.current.nodes.length) {
          this.current.raws.semicolon = this.semicolon;
        }
        this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        this.root.source.end = this.getPosition(this.tokenizer.position());
      }
      freeSemicolon(token) {
        this.spaces += token[1];
        if (this.current.nodes) {
          let prev = this.current.nodes[this.current.nodes.length - 1];
          if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
            prev.raws.ownSemicolon = this.spaces;
            this.spaces = "";
            prev.source.end = this.getPosition(token[2]);
            prev.source.end.offset++;
          }
        }
      }
      // Helpers
      getPosition(offset) {
        let pos = this.input.fromOffset(offset);
        return {
          column: pos.col,
          line: pos.line,
          offset
        };
      }
      init(node, offset) {
        this.current.push(node);
        node.source = {
          input: this.input,
          start: this.getPosition(offset)
        };
        node.raws.before = this.spaces;
        this.spaces = "";
        if (node.type !== "comment") this.semicolon = false;
      }
      other(start2) {
        let end = false;
        let type = null;
        let colon = false;
        let bracket = null;
        let brackets = [];
        let customProperty = start2[1].startsWith("--");
        let tokens = [];
        let token = start2;
        while (token) {
          type = token[0];
          tokens.push(token);
          if (type === "(" || type === "[") {
            if (!bracket) bracket = token;
            brackets.push(type === "(" ? ")" : "]");
          } else if (customProperty && colon && type === "{") {
            if (!bracket) bracket = token;
            brackets.push("}");
          } else if (brackets.length === 0) {
            if (type === ";") {
              if (colon) {
                this.decl(tokens, customProperty);
                return;
              } else {
                break;
              }
            } else if (type === "{") {
              this.rule(tokens);
              return;
            } else if (type === "}") {
              this.tokenizer.back(tokens.pop());
              end = true;
              break;
            } else if (type === ":") {
              colon = true;
            }
          } else if (type === brackets[brackets.length - 1]) {
            brackets.pop();
            if (brackets.length === 0) bracket = null;
          }
          token = this.tokenizer.nextToken();
        }
        if (this.tokenizer.endOfFile()) end = true;
        if (brackets.length > 0) this.unclosedBracket(bracket);
        if (end && colon) {
          if (!customProperty) {
            while (tokens.length) {
              token = tokens[tokens.length - 1][0];
              if (token !== "space" && token !== "comment") break;
              this.tokenizer.back(tokens.pop());
            }
          }
          this.decl(tokens, customProperty);
        } else {
          this.unknownWord(tokens);
        }
      }
      parse() {
        let token;
        while (!this.tokenizer.endOfFile()) {
          token = this.tokenizer.nextToken();
          switch (token[0]) {
            case "space":
              this.spaces += token[1];
              break;
            case ";":
              this.freeSemicolon(token);
              break;
            case "}":
              this.end(token);
              break;
            case "comment":
              this.comment(token);
              break;
            case "at-word":
              this.atrule(token);
              break;
            case "{":
              this.emptyRule(token);
              break;
            default:
              this.other(token);
              break;
          }
        }
        this.endFile();
      }
      precheckMissedSemicolon() {
      }
      raw(node, prop, tokens, customProperty) {
        let token, type;
        let length = tokens.length;
        let value = "";
        let clean = true;
        let next, prev;
        for (let i = 0; i < length; i += 1) {
          token = tokens[i];
          type = token[0];
          if (type === "space" && i === length - 1 && !customProperty) {
            clean = false;
          } else if (type === "comment") {
            prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
            next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
            if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
              if (value.slice(-1) === ",") {
                clean = false;
              } else {
                value += token[1];
              }
            } else {
              clean = false;
            }
          } else {
            value += token[1];
          }
        }
        if (!clean) {
          let raw = tokens.reduce((all, i) => all + i[1], "");
          node.raws[prop] = { raw, value };
        }
        node[prop] = value;
      }
      rule(tokens) {
        tokens.pop();
        let node = new Rule2();
        this.init(node, tokens[0][2]);
        node.raws.between = this.spacesAndCommentsFromEnd(tokens);
        this.raw(node, "selector", tokens);
        this.current = node;
      }
      spacesAndCommentsFromEnd(tokens) {
        let lastTokenType;
        let spaces = "";
        while (tokens.length) {
          lastTokenType = tokens[tokens.length - 1][0];
          if (lastTokenType !== "space" && lastTokenType !== "comment") break;
          spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
      }
      // Errors
      spacesAndCommentsFromStart(tokens) {
        let next;
        let spaces = "";
        while (tokens.length) {
          next = tokens[0][0];
          if (next !== "space" && next !== "comment") break;
          spaces += tokens.shift()[1];
        }
        return spaces;
      }
      spacesFromEnd(tokens) {
        let lastTokenType;
        let spaces = "";
        while (tokens.length) {
          lastTokenType = tokens[tokens.length - 1][0];
          if (lastTokenType !== "space") break;
          spaces = tokens.pop()[1] + spaces;
        }
        return spaces;
      }
      stringFrom(tokens, from) {
        let result = "";
        for (let i = from; i < tokens.length; i++) {
          result += tokens[i][1];
        }
        tokens.splice(from, tokens.length - from);
        return result;
      }
      unclosedBlock() {
        let pos = this.current.source.start;
        throw this.input.error("Unclosed block", pos.line, pos.column);
      }
      unclosedBracket(bracket) {
        throw this.input.error(
          "Unclosed bracket",
          { offset: bracket[2] },
          { offset: bracket[2] + 1 }
        );
      }
      unexpectedClose(token) {
        throw this.input.error(
          "Unexpected }",
          { offset: token[2] },
          { offset: token[2] + 1 }
        );
      }
      unknownWord(tokens) {
        throw this.input.error(
          "Unknown word " + tokens[0][1],
          { offset: tokens[0][2] },
          { offset: tokens[0][2] + tokens[0][1].length }
        );
      }
      unnamedAtrule(node, token) {
        throw this.input.error(
          "At-rule without name",
          { offset: token[2] },
          { offset: token[2] + token[1].length }
        );
      }
    };
    module.exports = Parser;
  }
});

// node_modules/postcss/lib/parse.js
var require_parse = __commonJS({
  "node_modules/postcss/lib/parse.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var Input2 = require_input();
    var Parser = require_parser();
    function parse2(css, opts) {
      let input = new Input2(css, opts);
      let parser = new Parser(input);
      try {
        parser.parse();
      } catch (e) {
        if (true) {
          if (e.name === "CssSyntaxError" && opts && opts.from) {
            if (/\.scss$/i.test(opts.from)) {
              e.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
            } else if (/\.sass/i.test(opts.from)) {
              e.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
            } else if (/\.less$/i.test(opts.from)) {
              e.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
            }
          }
        }
        throw e;
      }
      return parser.root;
    }
    module.exports = parse2;
    parse2.default = parse2;
    Container2.registerParse(parse2);
  }
});

// node_modules/postcss/lib/warning.js
var require_warning = __commonJS({
  "node_modules/postcss/lib/warning.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var { my } = require_symbols();
    var Warning2 = class {
      constructor(text, opts = {}) {
        this.type = "warning";
        this.text = text;
        if (opts.node && opts.node.source) {
          if (!opts.node[my]) {
            Container2.rebuild(opts.node);
          }
          let range = opts.node.rangeBy(opts);
          this.line = range.start.line;
          this.column = range.start.column;
          this.endLine = range.end.line;
          this.endColumn = range.end.column;
        }
        for (let opt in opts) this[opt] = opts[opt];
      }
      toString() {
        if (this.node) {
          return this.node.error(this.text, {
            index: this.index,
            plugin: this.plugin,
            word: this.word
          }).message;
        }
        if (this.plugin) {
          return this.plugin + ": " + this.text;
        }
        return this.text;
      }
    };
    module.exports = Warning2;
    Warning2.default = Warning2;
  }
});

// node_modules/postcss/lib/result.js
var require_result = __commonJS({
  "node_modules/postcss/lib/result.js"(exports, module) {
    "use strict";
    var Warning2 = require_warning();
    var Result2 = class {
      get content() {
        return this.css;
      }
      constructor(processor, root2, opts) {
        this.processor = processor;
        this.messages = [];
        this.root = root2;
        this.opts = opts;
        this.css = "";
        this.map = void 0;
      }
      toString() {
        return this.css;
      }
      warn(text, opts = {}) {
        if (!opts.plugin) {
          if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
            opts.plugin = this.lastPlugin.postcssPlugin;
          }
        }
        let warning = new Warning2(text, opts);
        this.messages.push(warning);
        return warning;
      }
      warnings() {
        return this.messages.filter((i) => i.type === "warning");
      }
    };
    module.exports = Result2;
    Result2.default = Result2;
  }
});

// node_modules/postcss/lib/warn-once.js
var require_warn_once = __commonJS({
  "node_modules/postcss/lib/warn-once.js"(exports, module) {
    "use strict";
    var printed = {};
    module.exports = function warnOnce(message) {
      if (printed[message]) return;
      printed[message] = true;
      if (typeof console !== "undefined" && console.warn) {
        console.warn(message);
      }
    };
  }
});

// node_modules/postcss/lib/lazy-result.js
var require_lazy_result = __commonJS({
  "node_modules/postcss/lib/lazy-result.js"(exports, module) {
    "use strict";
    var Container2 = require_container();
    var Document2 = require_document();
    var MapGenerator = require_map_generator();
    var parse2 = require_parse();
    var Result2 = require_result();
    var Root2 = require_root();
    var stringify2 = require_stringify();
    var { isClean, my } = require_symbols();
    var warnOnce = require_warn_once();
    var TYPE_TO_CLASS_NAME = {
      atrule: "AtRule",
      comment: "Comment",
      decl: "Declaration",
      document: "Document",
      root: "Root",
      rule: "Rule"
    };
    var PLUGIN_PROPS = {
      AtRule: true,
      AtRuleExit: true,
      Comment: true,
      CommentExit: true,
      Declaration: true,
      DeclarationExit: true,
      Document: true,
      DocumentExit: true,
      Once: true,
      OnceExit: true,
      postcssPlugin: true,
      prepare: true,
      Root: true,
      RootExit: true,
      Rule: true,
      RuleExit: true
    };
    var NOT_VISITORS = {
      Once: true,
      postcssPlugin: true,
      prepare: true
    };
    var CHILDREN = 0;
    function isPromise(obj) {
      return typeof obj === "object" && typeof obj.then === "function";
    }
    function getEvents(node) {
      let key = false;
      let type = TYPE_TO_CLASS_NAME[node.type];
      if (node.type === "decl") {
        key = node.prop.toLowerCase();
      } else if (node.type === "atrule") {
        key = node.name.toLowerCase();
      }
      if (key && node.append) {
        return [
          type,
          type + "-" + key,
          CHILDREN,
          type + "Exit",
          type + "Exit-" + key
        ];
      } else if (key) {
        return [type, type + "-" + key, type + "Exit", type + "Exit-" + key];
      } else if (node.append) {
        return [type, CHILDREN, type + "Exit"];
      } else {
        return [type, type + "Exit"];
      }
    }
    function toStack(node) {
      let events;
      if (node.type === "document") {
        events = ["Document", CHILDREN, "DocumentExit"];
      } else if (node.type === "root") {
        events = ["Root", CHILDREN, "RootExit"];
      } else {
        events = getEvents(node);
      }
      return {
        eventIndex: 0,
        events,
        iterator: 0,
        node,
        visitorIndex: 0,
        visitors: []
      };
    }
    function cleanMarks(node) {
      let stack = [node];
      while (stack.length > 0) {
        let next = stack.pop();
        next[isClean] = false;
        if (next.nodes) {
          for (let i of next.nodes) stack.push(i);
        }
      }
      return node;
    }
    var postcss2 = {};
    var LazyResult = class _LazyResult {
      get content() {
        return this.stringify().content;
      }
      get css() {
        return this.stringify().css;
      }
      get map() {
        return this.stringify().map;
      }
      get messages() {
        return this.sync().messages;
      }
      get opts() {
        return this.result.opts;
      }
      get processor() {
        return this.result.processor;
      }
      get root() {
        return this.sync().root;
      }
      get [Symbol.toStringTag]() {
        return "LazyResult";
      }
      constructor(processor, css, opts) {
        this.stringified = false;
        this.processed = false;
        let root2;
        if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) {
          root2 = cleanMarks(css);
        } else if (css instanceof _LazyResult || css instanceof Result2) {
          root2 = cleanMarks(css.root);
          if (css.map) {
            if (typeof opts.map === "undefined") opts.map = {};
            if (!opts.map.inline) opts.map.inline = false;
            opts.map.prev = css.map;
          }
        } else {
          let parser = parse2;
          if (opts.syntax) parser = opts.syntax.parse;
          if (opts.parser) parser = opts.parser;
          if (parser.parse) parser = parser.parse;
          try {
            root2 = parser(css, opts);
          } catch (error) {
            this.processed = true;
            this.error = error;
          }
          if (root2 && !root2[my]) {
            Container2.rebuild(root2);
          }
        }
        this.result = new Result2(processor, root2, opts);
        this.helpers = { ...postcss2, postcss: postcss2, result: this.result };
        this.plugins = this.processor.plugins.map((plugin2) => {
          if (typeof plugin2 === "object" && plugin2.prepare) {
            return { ...plugin2, ...plugin2.prepare(this.result) };
          } else {
            return plugin2;
          }
        });
      }
      async() {
        if (this.error) return Promise.reject(this.error);
        if (this.processed) return Promise.resolve(this.result);
        if (!this.processing) {
          this.processing = this.runAsync();
        }
        return this.processing;
      }
      catch(onRejected) {
        return this.async().catch(onRejected);
      }
      finally(onFinally) {
        return this.async().then(onFinally, onFinally);
      }
      getAsyncError() {
        throw new Error("Use process(css).then(cb) to work with async plugins");
      }
      handleError(error, node) {
        let plugin2 = this.result.lastPlugin;
        try {
          if (node) node.addToError(error);
          this.error = error;
          if (error.name === "CssSyntaxError" && !error.plugin) {
            error.plugin = plugin2.postcssPlugin;
            error.setMessage();
          } else if (plugin2.postcssVersion) {
            if (true) {
              let pluginName = plugin2.postcssPlugin;
              let pluginVer = plugin2.postcssVersion;
              let runtimeVer = this.result.processor.version;
              let a = pluginVer.split(".");
              let b = runtimeVer.split(".");
              if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
                console.error(
                  "Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below."
                );
              }
            }
          }
        } catch (err) {
          if (console && console.error) console.error(err);
        }
        return error;
      }
      prepareVisitors() {
        this.listeners = {};
        let add = (plugin2, type, cb) => {
          if (!this.listeners[type]) this.listeners[type] = [];
          this.listeners[type].push([plugin2, cb]);
        };
        for (let plugin2 of this.plugins) {
          if (typeof plugin2 === "object") {
            for (let event in plugin2) {
              if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) {
                throw new Error(
                  `Unknown event ${event} in ${plugin2.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
                );
              }
              if (!NOT_VISITORS[event]) {
                if (typeof plugin2[event] === "object") {
                  for (let filter in plugin2[event]) {
                    if (filter === "*") {
                      add(plugin2, event, plugin2[event][filter]);
                    } else {
                      add(
                        plugin2,
                        event + "-" + filter.toLowerCase(),
                        plugin2[event][filter]
                      );
                    }
                  }
                } else if (typeof plugin2[event] === "function") {
                  add(plugin2, event, plugin2[event]);
                }
              }
            }
          }
        }
        this.hasListener = Object.keys(this.listeners).length > 0;
      }
      async runAsync() {
        this.plugin = 0;
        for (let i = 0; i < this.plugins.length; i++) {
          let plugin2 = this.plugins[i];
          let promise = this.runOnRoot(plugin2);
          if (isPromise(promise)) {
            try {
              await promise;
            } catch (error) {
              throw this.handleError(error);
            }
          }
        }
        this.prepareVisitors();
        if (this.hasListener) {
          let root2 = this.result.root;
          while (!root2[isClean]) {
            root2[isClean] = true;
            let stack = [toStack(root2)];
            while (stack.length > 0) {
              let promise = this.visitTick(stack);
              if (isPromise(promise)) {
                try {
                  await promise;
                } catch (e) {
                  let node = stack[stack.length - 1].node;
                  throw this.handleError(e, node);
                }
              }
            }
          }
          if (this.listeners.OnceExit) {
            for (let [plugin2, visitor] of this.listeners.OnceExit) {
              this.result.lastPlugin = plugin2;
              try {
                if (root2.type === "document") {
                  let roots = root2.nodes.map(
                    (subRoot) => visitor(subRoot, this.helpers)
                  );
                  await Promise.all(roots);
                } else {
                  await visitor(root2, this.helpers);
                }
              } catch (e) {
                throw this.handleError(e);
              }
            }
          }
        }
        this.processed = true;
        return this.stringify();
      }
      runOnRoot(plugin2) {
        this.result.lastPlugin = plugin2;
        try {
          if (typeof plugin2 === "object" && plugin2.Once) {
            if (this.result.root.type === "document") {
              let roots = this.result.root.nodes.map(
                (root2) => plugin2.Once(root2, this.helpers)
              );
              if (isPromise(roots[0])) {
                return Promise.all(roots);
              }
              return roots;
            }
            return plugin2.Once(this.result.root, this.helpers);
          } else if (typeof plugin2 === "function") {
            return plugin2(this.result.root, this.result);
          }
        } catch (error) {
          throw this.handleError(error);
        }
      }
      stringify() {
        if (this.error) throw this.error;
        if (this.stringified) return this.result;
        this.stringified = true;
        this.sync();
        let opts = this.result.opts;
        let str = stringify2;
        if (opts.syntax) str = opts.syntax.stringify;
        if (opts.stringifier) str = opts.stringifier;
        if (str.stringify) str = str.stringify;
        let rootSource = this.result.root.source;
        if (opts.map === void 0 && !(rootSource && rootSource.input && rootSource.input.map)) {
          let result = "";
          str(this.result.root, (i) => {
            result += i;
          });
          this.result.css = result;
          return this.result;
        }
        let map = new MapGenerator(str, this.result.root, this.result.opts);
        let data = map.generate();
        this.result.css = data[0];
        this.result.map = data[1];
        return this.result;
      }
      sync() {
        if (this.error) throw this.error;
        if (this.processed) return this.result;
        this.processed = true;
        if (this.processing) {
          throw this.getAsyncError();
        }
        for (let plugin2 of this.plugins) {
          let promise = this.runOnRoot(plugin2);
          if (isPromise(promise)) {
            throw this.getAsyncError();
          }
        }
        this.prepareVisitors();
        if (this.hasListener) {
          let root2 = this.result.root;
          while (!root2[isClean]) {
            root2[isClean] = true;
            this.walkSync(root2);
          }
          if (this.listeners.OnceExit) {
            if (root2.type === "document") {
              for (let subRoot of root2.nodes) {
                this.visitSync(this.listeners.OnceExit, subRoot);
              }
            } else {
              this.visitSync(this.listeners.OnceExit, root2);
            }
          }
        }
        return this.result;
      }
      then(onFulfilled, onRejected) {
        if (true) {
          if (!("from" in this.opts)) {
            warnOnce(
              "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
            );
          }
        }
        return this.async().then(onFulfilled, onRejected);
      }
      toString() {
        return this.css;
      }
      visitSync(visitors, node) {
        for (let [plugin2, visitor] of visitors) {
          this.result.lastPlugin = plugin2;
          let promise;
          try {
            promise = visitor(node, this.helpers);
          } catch (e) {
            throw this.handleError(e, node.proxyOf);
          }
          if (node.type !== "root" && node.type !== "document" && !node.parent) {
            return true;
          }
          if (isPromise(promise)) {
            throw this.getAsyncError();
          }
        }
      }
      visitTick(stack) {
        let visit = stack[stack.length - 1];
        let { node, visitors } = visit;
        if (node.type !== "root" && node.type !== "document" && !node.parent) {
          stack.pop();
          return;
        }
        if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
          let [plugin2, visitor] = visitors[visit.visitorIndex];
          visit.visitorIndex += 1;
          if (visit.visitorIndex === visitors.length) {
            visit.visitors = [];
            visit.visitorIndex = 0;
          }
          this.result.lastPlugin = plugin2;
          try {
            return visitor(node.toProxy(), this.helpers);
          } catch (e) {
            throw this.handleError(e, node);
          }
        }
        if (visit.iterator !== 0) {
          let iterator = visit.iterator;
          if (visit.descending) {
            visit.descending = false;
            node.indexes[iterator] += 1;
          }
          let child;
          while (child = node.nodes[node.indexes[iterator]]) {
            if (!child[isClean]) {
              child[isClean] = true;
              visit.descending = true;
              stack.push(toStack(child));
              return;
            }
            node.indexes[iterator] += 1;
          }
          visit.iterator = 0;
          delete node.indexes[iterator];
        }
        let events = visit.events;
        while (visit.eventIndex < events.length) {
          let event = events[visit.eventIndex];
          visit.eventIndex += 1;
          if (event === CHILDREN) {
            if (node.nodes && node.nodes.length) {
              node[isClean] = true;
              visit.iterator = node.getIterator();
            }
            return;
          } else if (this.listeners[event]) {
            visit.visitors = this.listeners[event];
            return;
          }
        }
        stack.pop();
      }
      walkSync(node) {
        node[isClean] = true;
        let stack = [{ eventIndex: 0, events: getEvents(node), iterator: 0, node }];
        while (stack.length > 0) {
          let visit = stack[stack.length - 1];
          let visitNode = visit.node;
          if (visit.iterator !== 0) {
            let iterator = visit.iterator;
            if (visit.descending) {
              visit.descending = false;
              visitNode.indexes[iterator] += 1;
            }
            let child;
            let descended = false;
            while (child = visitNode.nodes[visitNode.indexes[iterator]]) {
              if (!child[isClean]) {
                child[isClean] = true;
                visit.descending = true;
                stack.push({
                  eventIndex: 0,
                  events: getEvents(child),
                  iterator: 0,
                  node: child
                });
                descended = true;
                break;
              }
              visitNode.indexes[iterator] += 1;
            }
            if (descended) continue;
            visit.iterator = 0;
            delete visitNode.indexes[iterator];
          }
          if (visit.eventIndex < visit.events.length) {
            let event = visit.events[visit.eventIndex];
            visit.eventIndex += 1;
            if (event === CHILDREN) {
              if (visitNode.nodes && visitNode.nodes.length) {
                visit.iterator = visitNode.getIterator();
              }
            } else {
              let visitors = this.listeners[event];
              if (visitors) {
                if (this.visitSync(visitors, visitNode.toProxy())) stack.pop();
              }
            }
            continue;
          }
          stack.pop();
        }
      }
      warnings() {
        return this.sync().warnings();
      }
    };
    LazyResult.registerPostcss = (dependant) => {
      postcss2 = dependant;
    };
    module.exports = LazyResult;
    LazyResult.default = LazyResult;
    Root2.registerLazyResult(LazyResult);
    Document2.registerLazyResult(LazyResult);
  }
});

// node_modules/postcss/lib/no-work-result.js
var require_no_work_result = __commonJS({
  "node_modules/postcss/lib/no-work-result.js"(exports, module) {
    "use strict";
    var MapGenerator = require_map_generator();
    var parse2 = require_parse();
    var Result2 = require_result();
    var stringify2 = require_stringify();
    var warnOnce = require_warn_once();
    var NoWorkResult = class {
      get content() {
        return this.result.css;
      }
      get css() {
        return this.result.css;
      }
      get map() {
        return this.result.map;
      }
      get messages() {
        return [];
      }
      get opts() {
        return this.result.opts;
      }
      get processor() {
        return this.result.processor;
      }
      get root() {
        if (this._root) {
          return this._root;
        }
        let root2;
        let parser = parse2;
        try {
          root2 = parser(this._css, this._opts);
        } catch (error) {
          this.error = error;
        }
        if (this.error) {
          throw this.error;
        } else {
          this._root = root2;
          return root2;
        }
      }
      get [Symbol.toStringTag]() {
        return "NoWorkResult";
      }
      constructor(processor, css, opts) {
        css = css.toString();
        this.stringified = false;
        this._processor = processor;
        this._css = css;
        this._opts = opts;
        this._map = void 0;
        let str = stringify2;
        this.result = new Result2(this._processor, void 0, this._opts);
        this.result.css = css;
        let self = this;
        Object.defineProperty(this.result, "root", {
          get() {
            return self.root;
          }
        });
        let map = new MapGenerator(str, void 0, this._opts, css);
        if (map.isMap()) {
          let [generatedCSS, generatedMap] = map.generate();
          if (generatedCSS) {
            this.result.css = generatedCSS;
          }
          if (generatedMap) {
            this.result.map = generatedMap;
          }
        } else {
          map.clearAnnotation();
          this.result.css = map.css;
        }
      }
      async() {
        if (this.error) return Promise.reject(this.error);
        return Promise.resolve(this.result);
      }
      catch(onRejected) {
        return this.async().catch(onRejected);
      }
      finally(onFinally) {
        return this.async().then(onFinally, onFinally);
      }
      sync() {
        if (this.error) throw this.error;
        return this.result;
      }
      then(onFulfilled, onRejected) {
        if (true) {
          if (!("from" in this._opts)) {
            warnOnce(
              "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
            );
          }
        }
        return this.async().then(onFulfilled, onRejected);
      }
      toString() {
        return this._css;
      }
      warnings() {
        return [];
      }
    };
    module.exports = NoWorkResult;
    NoWorkResult.default = NoWorkResult;
  }
});

// node_modules/postcss/lib/processor.js
var require_processor = __commonJS({
  "node_modules/postcss/lib/processor.js"(exports, module) {
    "use strict";
    var Document2 = require_document();
    var LazyResult = require_lazy_result();
    var NoWorkResult = require_no_work_result();
    var Root2 = require_root();
    var Processor2 = class {
      constructor(plugins = []) {
        this.version = "8.5.28";
        this.plugins = this.normalize(plugins);
      }
      normalize(plugins) {
        let normalized = [];
        for (let i of plugins) {
          if (i.postcss === true) {
            i = i();
          } else if (i.postcss) {
            i = i.postcss;
          }
          if (typeof i === "object" && Array.isArray(i.plugins)) {
            normalized = normalized.concat(i.plugins);
          } else if (typeof i === "object" && i.postcssPlugin) {
            normalized.push(i);
          } else if (typeof i === "function") {
            normalized.push(i);
          } else if (typeof i === "object" && (i.parse || i.stringify)) {
            if (true) {
              throw new Error(
                "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
              );
            }
          } else {
            throw new Error(i + " is not a PostCSS plugin");
          }
        }
        return normalized;
      }
      process(css, opts = {}) {
        if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
          return new NoWorkResult(this, css, opts);
        } else {
          return new LazyResult(this, css, opts);
        }
      }
      use(plugin2) {
        this.plugins = this.plugins.concat(this.normalize([plugin2]));
        return this;
      }
    };
    module.exports = Processor2;
    Processor2.default = Processor2;
    Root2.registerProcessor(Processor2);
    Document2.registerProcessor(Processor2);
  }
});

// node_modules/postcss/lib/postcss.js
var require_postcss = __commonJS({
  "node_modules/postcss/lib/postcss.js"(exports, module) {
    "use strict";
    var AtRule2 = require_at_rule();
    var Comment2 = require_comment();
    var Container2 = require_container();
    var CssSyntaxError2 = require_css_syntax_error();
    var Declaration2 = require_declaration();
    var Document2 = require_document();
    var fromJSON2 = require_fromJSON();
    var Input2 = require_input();
    var LazyResult = require_lazy_result();
    var list2 = require_list();
    var Node2 = require_node();
    var parse2 = require_parse();
    var Processor2 = require_processor();
    var Result2 = require_result();
    var Root2 = require_root();
    var Rule2 = require_rule();
    var stringify2 = require_stringify();
    var Warning2 = require_warning();
    function postcss2(...plugins) {
      if (plugins.length === 1 && Array.isArray(plugins[0])) {
        plugins = plugins[0];
      }
      return new Processor2(plugins);
    }
    postcss2.plugin = function plugin2(name, initializer) {
      let warningPrinted = false;
      function creator(...args) {
        if (console && console.warn && !warningPrinted) {
          warningPrinted = true;
          console.warn(
            name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration"
          );
          if (process.env.LANG && process.env.LANG.startsWith("zh")) {
            console.warn(
              name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226"
            );
          }
        }
        let transformer = initializer(...args);
        transformer.postcssPlugin = name;
        transformer.postcssVersion = new Processor2().version;
        return transformer;
      }
      let cache;
      Object.defineProperty(creator, "postcss", {
        get() {
          if (!cache) cache = creator();
          return cache;
        }
      });
      creator.process = function(css, processOpts, pluginOpts) {
        return postcss2([creator(pluginOpts)]).process(css, processOpts);
      };
      return creator;
    };
    postcss2.stringify = stringify2;
    postcss2.parse = parse2;
    postcss2.fromJSON = fromJSON2;
    postcss2.list = list2;
    postcss2.comment = (defaults) => new Comment2(defaults);
    postcss2.atRule = (defaults) => new AtRule2(defaults);
    postcss2.decl = (defaults) => new Declaration2(defaults);
    postcss2.rule = (defaults) => new Rule2(defaults);
    postcss2.root = (defaults) => new Root2(defaults);
    postcss2.document = (defaults) => new Document2(defaults);
    postcss2.CssSyntaxError = CssSyntaxError2;
    postcss2.Declaration = Declaration2;
    postcss2.Container = Container2;
    postcss2.Processor = Processor2;
    postcss2.Document = Document2;
    postcss2.Comment = Comment2;
    postcss2.Warning = Warning2;
    postcss2.AtRule = AtRule2;
    postcss2.Result = Result2;
    postcss2.Input = Input2;
    postcss2.Rule = Rule2;
    postcss2.Root = Root2;
    postcss2.Node = Node2;
    LazyResult.registerPostcss(postcss2);
    module.exports = postcss2;
    postcss2.default = postcss2;
  }
});

// src/config.js
var VERSION = "1.3.0";
var BUTTON_NAME = "美化工作室";
var STORAGE_KEY = "tt-theme-helper-options-v2";
var OVERLAY_HOST_ID = "tt-theme-helper-overlay-host";
var RUNTIME_STYLE_ID = "tt-theme-helper-runtime-style";
var WAND_ENTRY_ID = "tt-theme-helper-wand-entry";
var TAURI_ROOT_CLASS = "tta-tauri-runtime";
var COMPOSER_OPEN_CLASS = "tta-composer-touch-open";
var PATCH_START = "/* === TT_THEME_ADAPTER_PATCH_START === */";
var PATCH_END = "/* === TT_THEME_ADAPTER_PATCH_END === */";
var DEFAULT_OPTIONS = Object.freeze({
  hideImpersonate: true,
  preserveHiddenControls: true,
  mobileGeometry: true,
  indentParagraphs: false
});

// src/core/validation.js
var THEME_KEYS = ["custom_css", "main_text_color", "blur_tint_color", "chat_tint_color", "font_scale", "blur_strength", "avatar_style", "chat_display"];
function validateTheme(theme) {
  if (!theme || typeof theme !== "object" || Array.isArray(theme) || typeof theme.name !== "string" || !theme.name.trim() || !THEME_KEYS.some((key) => Object.hasOwn(theme, key))) {
    throw new Error("请选择 UI 美化 JSON：需要主题名称和 UI 样式字段，角色卡、世界书或模型预设不适用。");
  }
  if (theme.custom_css != null && typeof theme.custom_css !== "string") {
    throw new Error("主题的 custom_css 必须是文本。");
  }
  return theme;
}

// src/core/adapter.js
var RISK_RULES = Object.freeze([
  {
    code: "shell-geometry",
    level: "high",
    label: "主聊天容器使用固定几何",
    detail: "发现 #sheld 的 top/height/min-height/max-height；转换时会删除这些 ST 视口覆盖，让 TT 接管布局。",
    pattern: /#sheld\b[^{}]*\{[^{}]*(?:top|height|min-height|max-height)\s*:/gis
  },
  {
    code: "composer-geometry",
    level: "high",
    label: "输入栏使用固定定位",
    detail: "发现 #form_sheld 的定位规则，可能与 TT 的键盘和底部安全区规则冲突。",
    pattern: /#form_sheld\b[^{}]*\{[^{}]*(?:position|top|bottom|left|right|transform)\s*:/gis
  },
  {
    code: "chat-viewport-height",
    level: "high",
    label: "聊天列表直接使用视口高度",
    detail: "发现 #chat 使用 vh/dvh 高度；在 TT 中更适合跟随 #sheld 的可用高度。",
    pattern: /#chat\b[^{}]*\{[^{}]*(?:height|max-height|min-height)\s*:[^;}]*(?:dvh|svh|lvh|vh)\b/gis
  },
  {
    code: "top-geometry",
    level: "medium",
    label: "顶部栏使用固定几何",
    detail: "发现顶部栏位置或尺寸规则，可能忽略刘海安全区；转换后仍建议实际查看。",
    pattern: /#(?:top-bar|top-settings-holder)\b[^{}]*\{[^{}]*(?:position|top|height|width|transform)\s*:/gis
  },
  {
    code: "drawer-geometry",
    level: "high",
    label: "主设置抽屉使用固定 top",
    detail: "发现左右主抽屉或通用抽屉的固定 top；转换时会只删 top，让 TT 原生顶栏和抽屉自行对齐。",
    pattern: /(?:\.drawer-content|#(?:left|right)-nav-panel)\b[^{}]*\{[^{}]*top\s*:/gis
  },
  {
    code: "forced-display",
    level: "medium",
    label: "主题强制显示元素",
    detail: "发现 display: … !important，可能让酒馆或 TT 已隐藏的按钮重新出现。",
    pattern: /display\s*:\s*(?!none\b)[^;{}]+!important/gi
  },
  {
    code: "global-important",
    level: "low",
    label: "存在通配强制样式",
    detail: "发现通配选择器中的 !important，它可能影响 TT 或其他插件。",
    pattern: /(?:^|})[^{}]*\*\s*\{[^{}]*!important/gis
  }
]);
function countMatches(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return Array.from(String(text || "").matchAll(new RegExp(pattern.source, flags))).length;
}
function splitCssValueTokens(value) {
  const tokens = [];
  let token = "";
  let depth = 0;
  let quote = "";
  for (let index = 0; index < String(value || "").length; index += 1) {
    const character = String(value || "")[index];
    if (quote) {
      token += character;
      if (character === "\\") {
        index += 1;
        if (index < String(value || "").length) token += String(value || "")[index];
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      token += character;
    } else if (character === "(") {
      depth += 1;
      token += character;
    } else if (character === ")") {
      depth = Math.max(0, depth - 1);
      token += character;
    } else if (/\s/.test(character) && depth === 0) {
      if (token) tokens.push(token);
      token = "";
    } else {
      token += character;
    }
  }
  if (token) tokens.push(token);
  return tokens;
}
function readCssDeclaration(body, property) {
  const escaped = String(property).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|;)\\s*${escaped}\\s*:\\s*([^;}]+)`, "gi");
  let value = null;
  for (const match of String(body || "").matchAll(pattern)) value = match[1];
  return value == null ? null : value.replace(/\s*!important\s*$/i, "").trim();
}
function isUsableBottomReserve(value) {
  const normalized = String(value || "").trim();
  if (!normalized || /^(?:0(?:\.0+)?(?:px|rem|em|vh|vw|dvh|%)?|auto|initial|inherit|unset)$/i.test(normalized)) {
    return false;
  }
  return !/[{};]/.test(normalized) && !/^calc\(\s*-/i.test(normalized) && !/^-/.test(normalized);
}
function bottomValueFromMargin(body) {
  const direct = readCssDeclaration(body, "margin-bottom");
  if (isUsableBottomReserve(direct)) return direct;
  const shorthand = readCssDeclaration(body, "margin");
  const tokens = splitCssValueTokens(shorthand);
  const bottom = tokens.length === 1 ? tokens[0] : tokens.length === 2 ? tokens[0] : tokens.length >= 3 ? tokens[2] : null;
  return isUsableBottomReserve(bottom) ? bottom : null;
}
function detectDecorativeBottomBar(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let reserve = null;
  let pseudoHeight = null;
  let count = 0;
  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || "").trim();
    const body = String(match[2] || "");
    const selectorParts = selector.split(",").map((part) => part.trim());
    const isBaseComposer = selectorParts.some((part) => /#(?:send_form|form_sheld)(?:\.[\w-]+)*\s*$/i.test(part));
    if (isBaseComposer) {
      const candidate = bottomValueFromMargin(body);
      if (candidate) reserve = candidate;
    }
    const isComposerPseudo = selectorParts.some((part) => /#(?:send_form|form_sheld)\s*::?(?:after|before)\b/i.test(part));
    if (!isComposerPseudo) continue;
    const positioned = /(?:^|;)\s*position\s*:\s*(?:absolute|fixed)\b/i.test(body);
    const anchoredBelow = /(?:^|;)\s*top\s*:\s*100%(?:\s*!important)?\s*(?:;|$)/i.test(body) || /(?:^|;)\s*bottom\s*:\s*(?:0|0px|0rem|0em)\b/i.test(body);
    const visual = /(?:^|;)\s*background(?:-image)?\s*:/i.test(body);
    if (!positioned || !anchoredBelow || !visual) continue;
    count += 1;
    const candidateHeight = readCssDeclaration(body, "height") || readCssDeclaration(body, "min-height");
    if (isUsableBottomReserve(candidateHeight)) pseudoHeight = candidateHeight;
  }
  return {
    detected: count > 0,
    count,
    reserve: reserve || pseudoHeight,
    safelyAdaptable: count > 0 && Boolean(reserve || pseudoHeight)
  };
}
function detectComposerLayout(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let overlay = false;
  let position = null;
  let bottom = null;
  let hidesUntilInteraction = false;
  let revealsOnHover = false;
  let revealsOnFocus = false;
  let surface = null;
  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || "").trim();
    const body = String(match[2] || "");
    if (/#form_sheld\b/i.test(selector)) {
      const candidatePosition = readCssDeclaration(body, "position");
      const candidateBottom = readCssDeclaration(body, "bottom");
      if (/^(?:absolute|fixed)$/i.test(candidatePosition || "") && candidateBottom != null) {
        overlay = true;
        position = candidatePosition.toLowerCase();
        bottom = candidateBottom;
      }
    }
    if (!/#send_form\b/i.test(selector)) continue;
    if (!/::?(?:before|after)\b/i.test(selector) && !/:hover\b|:focus-within\b/i.test(selector)) {
      const declarationBody = body.replace(/\/\*[\s\S]*?\*\//g, "");
      const candidateSurface = readCssDeclaration(declarationBody, "background") || readCssDeclaration(declarationBody, "background-color");
      if (candidateSurface) surface = candidateSurface;
    }
    const opacity = readCssDeclaration(body, "opacity");
    const opacityIsHidden = /^(?:0|0\.0+)$/i.test(opacity || "");
    const opacityIsVisible = /^(?:1|1\.0+)$/i.test(opacity || "");
    if (!/:hover\b|:focus-within\b/i.test(selector) && opacityIsHidden) hidesUntilInteraction = true;
    if (/:hover\b/i.test(selector) && opacityIsVisible) revealsOnHover = true;
    if (/:focus-within\b/i.test(selector) && opacityIsVisible) revealsOnFocus = true;
  }
  return {
    overlay,
    position,
    bottom,
    stickyHoverRisk: hidesUntilInteraction && revealsOnHover,
    revealsOnFocus,
    surface
  };
}
function detectChatBottomPadding(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let paddingBottom = null;
  for (const match of css.matchAll(blockPattern)) {
    const selectorParts = String(match[1] || "").split(",").map((part) => part.trim());
    if (!selectorParts.some((part) => /#chat(?:\.[\w-]+)*\s*$/i.test(part))) continue;
    const body = String(match[2] || "").replace(/\/\*[\s\S]*?\*\//g, "");
    const direct = readCssDeclaration(body, "padding-bottom");
    if (direct != null) paddingBottom = direct;
  }
  if (!paddingBottom || /^(?:auto|initial|inherit|unset|revert)$/i.test(paddingBottom) || /[{};]/.test(paddingBottom)) {
    return null;
  }
  return paddingBottom;
}
function detectToolbarVisibility(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let hiddenByDefault = false;
  let stateDependentReveal = false;
  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || "").trim();
    const body = String(match[2] || "");
    if (!/\.drawer-icon\b/i.test(selector)) continue;
    const opacity = readCssDeclaration(body, "opacity");
    if (!/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:0|0\.0+)$/i.test(opacity || "")) {
      hiddenByDefault = true;
    }
    if (/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:1|1\.0+)$/i.test(opacity || "")) {
      stateDependentReveal = true;
    }
  }
  return {
    hiddenByDefault,
    stateDependentReveal,
    risk: hiddenByDefault && stateDependentReveal
  };
}
function analyzeCss(cssText) {
  const risks = RISK_RULES.map((rule2) => ({
    code: rule2.code,
    level: rule2.level,
    label: rule2.label,
    detail: rule2.detail,
    count: countMatches(cssText, rule2.pattern)
  })).filter((item) => item.count > 0);
  const bottomBar = detectDecorativeBottomBar(cssText);
  if (bottomBar.detected) {
    risks.push({
      code: "decorative-bottom-bar",
      level: bottomBar.safelyAdaptable ? "medium" : "high",
      label: "主题自绘了仿 App 底栏",
      detail: bottomBar.safelyAdaptable ? `发现底栏伪元素和主题自带的下方留位（${bottomBar.reserve}）；新版会保留主题原始位置，不再额外填色或抬高。` : "发现底栏伪元素；新版会保留主题原始位置，不再额外填色或抬高。",
      count: bottomBar.count
    });
  }
  const composer = detectComposerLayout(cssText);
  if (composer.overlay) {
    risks.push({
      code: "overlay-composer",
      level: "high",
      label: "主题使用悬浮输入栏",
      detail: "主题要求输入栏绝对定位；若被 TT 改回普通流式布局，会明显挤高并遮挡聊天区域。",
      count: 1
    });
  }
  if (composer.stickyHoverRisk) {
    risks.push({
      code: "sticky-hover-composer",
      level: "medium",
      label: "输入栏依赖悬停显示",
      detail: "触屏 WebView 可能保留 :hover 状态，导致本应收起的输入栏一直显示；会改为失焦收起。",
      count: 1
    });
  }
  const toolbar = detectToolbarVisibility(cssText);
  if (toolbar.risk) {
    risks.push({
      code: "state-hidden-toolbar",
      level: "high",
      label: "主预设工具栏依赖图标状态显示",
      detail: "主题默认把顶栏图标透明，只在特定 openIcon 状态显示；TT 的抽屉状态不同，可能让整排工具栏消失。",
      count: 1
    });
  }
  return risks;
}
function stripAdapterPatch(cssText) {
  const css = typeof cssText === "string" ? cssText : "";
  let output = css;
  let start2 = output.indexOf(PATCH_START);
  let end = output.indexOf(PATCH_END);
  while (start2 !== -1 && end !== -1 && end >= start2) {
    output = `${output.slice(0, start2)}${output.slice(end + PATCH_END.length)}`;
    start2 = output.indexOf(PATCH_START);
    end = output.indexOf(PATCH_END);
  }
  return output.trimEnd();
}
function splitSelectorList(selectorText) {
  const parts = [];
  let start2 = 0;
  let quote = "";
  let comment2 = false;
  let roundDepth = 0;
  let squareDepth = 0;
  const text = String(selectorText || "");
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (comment2) {
      if (character === "*" && next === "/") {
        comment2 = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "*") {
      comment2 = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      roundDepth += 1;
    } else if (character === ")") {
      roundDepth = Math.max(0, roundDepth - 1);
    } else if (character === "[") {
      squareDepth += 1;
    } else if (character === "]") {
      squareDepth = Math.max(0, squareDepth - 1);
    } else if (character === "," && roundDepth === 0 && squareDepth === 0) {
      parts.push(text.slice(start2, index));
      start2 = index + 1;
    }
  }
  parts.push(text.slice(start2));
  return parts;
}
function directGeometryTarget(selectorPart) {
  const selector = String(selectorPart || "").replace(/\/\*[\s\S]*?\*\//g, " ").trim();
  if (!selector || /::(?:before|after)\b/i.test(selector)) return null;
  const compounds = selector.split(/\s+|[>+~]/).filter(Boolean);
  const last = compounds[compounds.length - 1] || "";
  if (/#sheld(?![\w-])/i.test(last)) return "shell";
  if (/\.drawer-content(?![\w-])/i.test(last) || /#(?:left|right)-nav-panel(?![\w-])/i.test(last)) return "drawer";
  return null;
}
function splitDeclarationSegments(bodyText) {
  const segments = [];
  const text = String(bodyText || "");
  let start2 = 0;
  let quote = "";
  let comment2 = false;
  let roundDepth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (comment2) {
      if (character === "*" && next === "/") {
        comment2 = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "*") {
      comment2 = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      roundDepth += 1;
    } else if (character === ")") {
      roundDepth = Math.max(0, roundDepth - 1);
    } else if (character === ";" && roundDepth === 0) {
      segments.push(text.slice(start2, index + 1));
      start2 = index + 1;
    }
  }
  if (start2 < text.length) segments.push(text.slice(start2));
  return segments;
}
function removeDeclarations(bodyText, propertyNames) {
  const wanted = new Set(propertyNames.map((name) => String(name).toLowerCase()));
  let removed = 0;
  const counts = Object.fromEntries(Array.from(wanted, (name) => [name, 0]));
  const body = splitDeclarationSegments(bodyText).map((segment) => {
    const match = /^((?:\s|\/\*[\s\S]*?\*\/)*)((?:--)?[-_a-zA-Z][\w-]*)\s*:/.exec(segment);
    if (!match || !wanted.has(match[2].toLowerCase())) return segment;
    removed += 1;
    counts[match[2].toLowerCase()] += 1;
    return match[1];
  }).join("");
  return { body, removed, counts };
}
function stripTauriConflictingGeometry(cssText) {
  const stats = {
    shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
    drawer: { top: 0 },
    total: 0
  };
  const css = String(cssText || "");
  const output = css.replace(/([^{}]+)\{([^{}]*)\}/g, (whole, rawSelector, rawBody) => {
    const selectorParts = splitSelectorList(rawSelector);
    const targetKinds = selectorParts.map(directGeometryTarget);
    const activeKinds = targetKinds.filter(Boolean);
    if (!activeKinds.length || activeKinds.length !== targetKinds.length) return whole;
    const uniqueKinds = new Set(activeKinds);
    if (uniqueKinds.size !== 1) return whole;
    const kind = activeKinds[0];
    const properties = kind === "shell" ? ["top", "height", "min-height", "max-height"] : ["top"];
    const result = removeDeclarations(rawBody, properties);
    if (!result.removed) return whole;
    if (kind === "shell") {
      stats.shell.top += result.counts.top || 0;
      stats.shell.height += result.counts.height || 0;
      stats.shell.minHeight += result.counts["min-height"] || 0;
      stats.shell.maxHeight += result.counts["max-height"] || 0;
    } else {
      stats.drawer.top += result.removed;
    }
    stats.total += result.removed;
    return `${rawSelector}{${result.body}}`;
  });
  return { css: output.trimEnd(), removed: stats };
}
function buildCompatibilityCss(options2 = {}, context = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options2 };
  const composer = context?.composer || null;
  const rules = [
    PATCH_START,
    `/* Generated by 美化工作室 v${VERSION}. */`
  ];
  if (settings.preserveHiddenControls) {
    rules.push(
      "/* Respect controls hidden by SillyTavern or TauriTavern. */",
      "html body [hidden][hidden] { display: none !important; }",
      "html body #mes_impersonate.displayNone { display: none !important; }",
      "html body #ttas_agent_send_toggle.displayNone { display: none !important; }"
    );
  }
  if (settings.hideImpersonate) {
    rules.push(
      "/* Hide Quick Impersonate (hat-and-glasses icon). */",
      "html body #mes_impersonate#mes_impersonate { display: none !important; }"
    );
  }
  if (settings.indentParagraphs) {
    rules.push(
      "/* Add a first-line indent only to chat paragraphs. */",
      "html body #chat p { text-indent: 2em; }"
    );
  }
  if (settings.mobileGeometry && composer?.overlay) {
    rules.push(
      "/* The theme already owns an absolute bottom composer; remove TT duplicate safe-area padding. */",
      `html.${TAURI_ROOT_CLASS} body #form_sheld#form_sheld { padding-bottom: 0 !important; }`,
      "@media screen and (max-width: 1000px) {",
      `  html.${TAURI_ROOT_CLASS} body #sheld#sheld > #form_sheld#form_sheld {`,
      "    position: fixed !important;",
      "    inset: auto 0 0 0 !important;",
      "    width: 100vw !important;",
      "    max-width: none !important;",
      "    flex: none !important;",
      "    z-index: 35 !important;",
      "    pointer-events: auto !important;",
      "  }",
      "}"
    );
  }
  if (settings.mobileGeometry && composer?.stickyHoverRisk) {
    rules.push(
      "/* TT WebView may report mouse hover even on touch; change visibility only, never its geometry. */",
      `html.${TAURI_ROOT_CLASS} body #send_form#send_form:not(:focus-within),`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:not(:focus-within) { opacity: 0 !important; }`,
      `html.${TAURI_ROOT_CLASS} body #send_form#send_form:focus-within,`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:focus-within,`,
      `html.${TAURI_ROOT_CLASS} body #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form,`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form { opacity: 1 !important; }`
    );
  }
  rules.push(PATCH_END);
  return rules.join("\n");
}
function normalizeThemeName(value) {
  const name = String(value || "").trim();
  if (!name) throw new Error("这不是有效的 UI 美化：文件里缺少 name。");
  return name;
}
function makeAdaptedName(name) {
  const normalized = normalizeThemeName(name);
  return / - TT适配(?: \(\d+\))?$/.test(normalized) ? normalized : `${normalized} - TT适配`;
}
function adaptTheme(theme, options2 = {}) {
  if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
    throw new Error("请选择酒馆 UI 美化 JSON，不是角色卡、世界书或预设。");
  }
  validateTheme(theme);
  const sourceName = normalizeThemeName(theme.name);
  const sourceCss = typeof theme.custom_css === "string" ? theme.custom_css : "";
  const settings = { ...DEFAULT_OPTIONS, ...options2 };
  const patchFreeCss = stripAdapterPatch(sourceCss);
  const geometry = settings.mobileGeometry ? stripTauriConflictingGeometry(patchFreeCss) : {
    css: patchFreeCss,
    removed: {
      shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
      drawer: { top: 0 },
      total: 0
    }
  };
  const cleanCss = geometry.css;
  const bottomBar = detectDecorativeBottomBar(cleanCss);
  const composer = detectComposerLayout(cleanCss);
  const chatBottomPadding = detectChatBottomPadding(cleanCss);
  const toolbar = detectToolbarVisibility(cleanCss);
  const adapted = JSON.parse(JSON.stringify(theme));
  adapted.name = makeAdaptedName(sourceName);
  adapted.custom_css = `${cleanCss}

${buildCompatibilityCss(settings, { composer })}`.trim();
  adapted.tta_adapter = {
    version: VERSION,
    source_name: theme.tta_adapter?.source_name || sourceName,
    converted_at: (/* @__PURE__ */ new Date()).toISOString(),
    risks: analyzeCss(sourceCss).map((item) => item.code),
    decorative_bottom_bar: bottomBar.safelyAdaptable ? { detected: true, reserve: bottomBar.reserve } : { detected: bottomBar.detected },
    overlay_composer: composer.overlay ? { detected: true, position: composer.position, bottom: composer.bottom, sticky_hover_risk: composer.stickyHoverRisk } : { detected: false },
    chat_bottom_padding: chatBottomPadding,
    state_hidden_toolbar: toolbar,
    removed_layout_geometry: geometry.removed
  };
  return adapted;
}

// src/host/diagnostics.js
function readNodeDiagnostic(hostWin, element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect?.();
  const computed = typeof hostWin.getComputedStyle === "function" ? hostWin.getComputedStyle(element) : null;
  return {
    rect: rect ? {
      top: Number(rect.top.toFixed(2)),
      bottom: Number(rect.bottom.toFixed(2)),
      left: Number(rect.left.toFixed(2)),
      right: Number(rect.right.toFixed(2)),
      width: Number(rect.width.toFixed(2)),
      height: Number(rect.height.toFixed(2))
    } : null,
    computed: computed ? {
      display: computed.display,
      position: computed.position,
      top: computed.top,
      bottom: computed.bottom,
      height: computed.height,
      minHeight: computed.minHeight,
      maxHeight: computed.maxHeight,
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom,
      marginBottom: computed.marginBottom,
      overflow: computed.overflow,
      opacity: computed.opacity,
      backgroundColor: computed.backgroundColor,
      zIndex: computed.zIndex
    } : null,
    classes: String(element.className || "")
  };
}
function readElementDiagnostic(hostWin, doc, id) {
  return readNodeDiagnostic(hostWin, doc.getElementById(id));
}
function readSelectorDiagnostic(hostWin, doc, selector) {
  return readNodeDiagnostic(hostWin, doc.querySelector?.(selector));
}
function makeLayoutDiagnostic(hostWin) {
  const doc = hostWin.document;
  const rootStyle = typeof hostWin.getComputedStyle === "function" ? hostWin.getComputedStyle(doc.documentElement) : null;
  const readVariable = (name) => String(rootStyle?.getPropertyValue?.(name) || "").trim();
  const customCss = String(doc.getElementById("custom-style")?.textContent || "");
  const composer = detectComposerLayout(customCss);
  const themeSelect = doc.getElementById("themes");
  const stylePins = doc.querySelectorAll?.("#chat > .style-pins style, #chat style") || [];
  return {
    diagnostic_version: VERSION,
    captured_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_tauri_tavern: Boolean(hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__ || doc.getElementById("ttas_agent_send_toggle")),
    selected_theme: String(themeSelect?.value || themeSelect?.selectedOptions?.[0]?.textContent || ""),
    viewport: {
      innerWidth: hostWin.innerWidth ?? null,
      innerHeight: hostWin.innerHeight ?? null,
      visualViewport: hostWin.visualViewport ? {
        width: hostWin.visualViewport.width,
        height: hostWin.visualViewport.height,
        offsetTop: hostWin.visualViewport.offsetTop,
        offsetLeft: hostWin.visualViewport.offsetLeft,
        scale: hostWin.visualViewport.scale
      } : null
    },
    css_variables: {
      ttInsetTop: readVariable("--tt-inset-top"),
      ttInsetRight: readVariable("--tt-inset-right"),
      ttInsetBottom: readVariable("--tt-inset-bottom"),
      ttInsetLeft: readVariable("--tt-inset-left"),
      ttImeBottom: readVariable("--tt-ime-bottom"),
      ttBaseViewportHeight: readVariable("--tt-base-viewport-height"),
      docHeight: readVariable("--doc-height"),
      topBarBlockSize: readVariable("--topBarBlockSize"),
      bottomFormBlockSize: readVariable("--bottomFormBlockSize")
    },
    theme_css: {
      length: customCss.length,
      hasAdapterPatch: customCss.includes(PATCH_START),
      composer,
      riskCodes: analyzeCss(customCss).map((item) => item.code)
    },
    chat_embedded_styles: {
      count: Number(stylePins.length || 0),
      pinnedContainerPresent: Boolean(doc.querySelector?.("#chat > .style-pins"))
    },
    page_state: {
      welcomePanelCount: Number(doc.querySelectorAll?.("#chat > .welcomePanel, #chat .welcomePanel").length || 0),
      welcomePanel: readSelectorDiagnostic(hostWin, doc, "#chat > .welcomePanel, #chat .welcomePanel"),
      openDrawers: Array.from(doc.querySelectorAll?.("#left-nav-panel.openDrawer, #right-nav-panel.openDrawer, #top-settings-holder .drawer-content.openDrawer, #top-settings-holder .drawer-content.open") || []).map((element) => ({ id: String(element.id || ""), diagnostic: readNodeDiagnostic(hostWin, element) }))
    },
    elements: Object.fromEntries([
      "top-bar",
      "top-settings-holder",
      "user-settings-block",
      "left-nav-panel",
      "right-nav-panel",
      "sheld",
      "chat",
      "form_sheld",
      "send_form",
      "nonQRFormItems",
      "send_textarea"
    ].map((id) => [id, readElementDiagnostic(hostWin, doc, id)]))
  };
}
function downloadLayoutDiagnostic(hostWin) {
  const doc = hostWin.document;
  const data = makeLayoutDiagnostic(hostWin);
  const file = new hostWin.File(
    [JSON.stringify(data, null, 2)],
    `TT布局诊断-v${VERSION}.json`,
    { type: "application/json" }
  );
  const url = hostWin.URL.createObjectURL(file);
  const anchor = doc.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.style.cssText = "display:none!important";
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2e3);
  return data;
}

// src/host/themes.js
async function readHostSettings(host) {
  const context = host.SillyTavern?.getContext?.();
  if (!context || typeof host.fetch !== "function") {
    throw new Error("未连接酒馆，请在酒馆助手中打开；也可以上传美化 JSON。");
  }
  const controller = new host.AbortController();
  const timer = host.setTimeout(() => controller.abort(), 12e3);
  try {
    let headers;
    if (typeof context.getRequestHeaders === "function") headers = context.getRequestHeaders();
    else {
      const tokenResponse = await host.fetch("/csrf-token", { credentials: "same-origin", signal: controller.signal });
      if (!tokenResponse.ok) throw new Error("无法获取酒馆请求凭据，请刷新酒馆后重试。");
      const { token } = await tokenResponse.json();
      headers = { "Content-Type": "application/json", "X-CSRF-Token": token };
    }
    const response = await host.fetch("/api/settings/get", {
      method: "POST",
      headers,
      body: "{}",
      credentials: "same-origin",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`酒馆美化读取失败（${response.status}），请刷新列表或上传 JSON。`);
    return await response.json();
  } finally {
    host.clearTimeout(timer);
  }
}
async function themeRequest(host, name) {
  const context = host.SillyTavern?.getContext?.();
  if (!context || typeof host.fetch !== "function") throw new Error("未连接酒馆，请刷新后重试。");
  const headers = {
    "Content-Type": "application/json",
    ...typeof context.getRequestHeaders === "function" ? context.getRequestHeaders() : {}
  };
  const response = await host.fetch("/api/themes/delete", { method: "POST", headers, body: JSON.stringify({ name }), credentials: "same-origin" });
  if (!response.ok) throw new Error(`删除「${name}」失败（${response.status}）。`);
}
async function readInstalledThemes(host) {
  const { themes } = await readHostSettings(host);
  if (!Array.isArray(themes)) throw new Error("当前酒馆未返回美化列表，请使用 JSON 导入。");
  return themes.flatMap((value) => {
    try {
      const theme = typeof value === "string" ? JSON.parse(value) : value;
      validateTheme(theme);
      return [JSON.parse(JSON.stringify(theme))];
    } catch {
      return [];
    }
  });
}
async function verifySavedTheme(host, theme) {
  const themes = await readInstalledThemes(host);
  return themes.some((item) => item.name === theme.name && item.custom_css === theme.custom_css);
}
async function updateActiveThemeCss(host, theme, expectedCss) {
  const doc = host.document;
  const select = doc?.getElementById("themes");
  const input = doc?.getElementById("customCSS");
  const update = doc?.getElementById("ui-preset-update-button");
  const style = doc?.getElementById("custom-style");
  if (!select || !input || !update || !style) throw new Error("没有找到原生美化保存控件，请打开一次酒馆的用户设置后重试。");
  const checkActive = () => {
    if (select.value !== theme.name) throw new Error("当前美化已切换，已停止保存，请重新打开微调。");
  };
  checkActive();
  const themes = await readInstalledThemes(host);
  if (!themes.some((item) => item.name === theme.name)) throw new Error("原美化已经不存在，请刷新美化列表。");
  checkActive();
  if (expectedCss !== void 0 && style.textContent !== expectedCss) throw new Error("当前美化已被其他操作修改，请重新打开后再保存。");
  input.value = theme.custom_css;
  input.dispatchEvent(new host.Event("input", { bubbles: true }));
  checkActive();
  if (style.textContent !== theme.custom_css) throw new Error("酒馆未接收 CSS 修改，请刷新后重试。");
  update.click();
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await new Promise((resolve) => host.setTimeout(resolve, 250));
    checkActive();
    if (await verifySavedTheme(host, theme)) {
      if (style.textContent !== theme.custom_css) throw new Error("保存期间 CSS 被其他操作修改，请刷新核对。");
      return theme;
    }
  }
  throw new Error("当前 CSS 已应用，但未核实原美化保存；请检查连接后重新保存或导出 JSON。");
}
async function deleteInstalledThemes(host, names) {
  const uniqueNames = [...new Set(names.filter((name) => typeof name === "string" && name.trim()))];
  for (const name of uniqueNames) await themeRequest(host, name);
  const remaining = await readInstalledThemes(host);
  const stillThere = new Set(remaining.map((theme) => theme.name));
  const failed = uniqueNames.filter((name) => stillThere.has(name));
  if (failed.length) throw new Error(`有 ${failed.length} 款美化删除后仍在列表中：${failed.join("、")}`);
  return uniqueNames.length;
}

// src/ui/markup.js
var star = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>';
var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
var upload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></svg>';
function panelMarkup(detected) {
  return `<div class="backdrop" role="presentation">
    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <header class="header">
        <div class="brand-mark">${star}</div>
        <div class="titlebox"><h1 id="studio-title">美化工作室</h1><span class="wordmark">BEAUTIFY STUDIO</span></div>
        <span class="version">VOL. 01 <i>/</i> v${VERSION}</span>
        <button class="close-x icon-button" type="button" aria-label="关闭工作室">×</button>
      </header>
      <div class="body">
        <div class="masthead"><span>YOUR THEME, YOUR WAY</span><span>${star} THE STUDIO ${star}</span><span>MADE FOR TAVERN</span></div>
        <div class="intro"><span class="connection" data-connected="${detected}"><i></i>${detected ? "TauriTavern 已连接" : "美化适配工作台"}</span></div>
        <button class="visual-edit" type="button"><span>✥</span><div><b>可视化微调</b><small>点选头像或底部输入栏，用手柄边看边调</small></div><span>体验新版 ↗</span></button>
        <div class="workspace">
          <section class="source-section">
            <div class="section-heading"><h3><span>01</span> 选择美化</h3><span class="caption">THE COLLECTION</span></div>
            <div class="source-card">
              <div class="source-tabs" role="tablist" aria-label="美化来源"><button type="button" id="tab-installed" role="tab" aria-controls="source-installed" aria-selected="true" data-source="installed">酒馆内的美化</button><button type="button" id="tab-upload" role="tab" aria-controls="source-upload" aria-selected="false" tabindex="-1" data-source="upload">上传 JSON</button></div>
              <div id="source-installed" role="tabpanel" aria-labelledby="tab-installed"><div class="collection-meta"><span class="library-count">正在读取美化…</span><span class="collection-actions"><button class="search-toggle icon-button" type="button" aria-label="搜索美化" aria-expanded="false">⌕</button><button class="batch-delete icon-button danger" type="button" aria-label="删除当前列表中的美化">⌫</button><button class="refresh text-button" type="button" aria-label="刷新酒馆美化列表">↻ 刷新</button></span></div><div class="theme-search" hidden><label><span class="sr-only">按名称搜索美化</span><input type="search" class="search-input" placeholder="搜索美化名称…" autocomplete="off"></label></div><div class="library" aria-label="已导入的美化"></div></div>
              <div id="source-upload" role="tabpanel" aria-labelledby="tab-upload" hidden><input class="file-input" type="file" accept=".json,application/json" hidden><button class="choose" type="button"><span class="upload-icon">${upload}</span><strong>把喜欢的美化放进来</strong><span>点击选择，或将 JSON 拖到这里</span><span class="upload-pill">选择美化文件 ${arrow}</span></button><p class="upload-note">支持 SillyTavern UI 美化 JSON · 最大 10 MB</p></div>
              <div class="selection"><span class="selection-star">${star}</span><div><span class="tiny-label">SELECTED THEME</span><div class="filename">还没有选择美化</div></div><span class="selected-indicator" aria-hidden="true">↗</span></div>
            </div>
          </section>
          <section class="settings-section"><div class="section-heading"><h3><span>02</span> 调整适配</h3><span class="caption">MAKE IT FIT</span></div><div class="settings-card"><div class="options">
            <label class="option"><span class="option-number">01</span><span><b>隐藏快速扮演按钮</b><small>隐藏墨镜黑衣人，不影响发送与角色回复。</small></span><input data-option="hideImpersonate" type="checkbox" role="switch" aria-label="隐藏快速扮演按钮"></label>
            <label class="option"><span class="option-number">02</span><span><b>保持隐藏按钮的状态</b><small>防止美化让已经隐藏的按钮重新出现。</small></span><input data-option="preserveHiddenControls" type="checkbox" role="switch" aria-label="保持隐藏按钮的状态"></label>
            <label class="option"><span class="option-number">03</span><span><b>修复布局冲突</b><small>适配聊天区域、顶部抽屉与悬浮输入栏。</small></span><input data-option="mobileGeometry" type="checkbox" role="switch" aria-label="修复布局冲突"></label>
            <label class="option"><span class="option-number">04</span><span><b>段落首行缩进</b><small>给聊天内容的每个段落增加 2em 首行缩进。</small></span><input data-option="indentParagraphs" type="checkbox" role="switch" aria-label="段落首行缩进"></label>
          </div><div class="settings-note"><span>♡</span> 可另存副本，也可直接注入所选原美化。</div></div>
          <div class="check-card"><div class="check-heading"><h3>${star} 兼容检查</h3><span class="check-count">等待选择</span></div><div class="report"><div class="risk" data-level="idle"><b>好看的开始，从选择开始</b><span>选择一款美化后，在这里查看适配建议。</span></div></div></div>
          </section>
        </div>
        <div class="bulk-modal" hidden role="dialog" aria-modal="true" aria-labelledby="bulk-title"><div class="bulk-modal-card"><div class="bulk-modal-header"><div><span class="eyebrow">THEME LIBRARY</span><h2 id="bulk-title">管理酒馆美化</h2></div><button class="bulk-close icon-button" type="button" aria-label="关闭批量管理">×</button></div><div class="bulk-toolbar"><label class="bulk-search"><span class="sr-only">搜索美化名称</span><span>⌕</span><input type="search" class="bulk-search-input" placeholder="搜索美化名称…" autocomplete="off"></label><button class="bulk-select-all text-button" type="button">全选</button></div><div class="bulk-list" role="group" aria-label="可删除的美化"></div><div class="bulk-footer"><span class="bulk-selected-count">已选 0 款</span><div><button class="bulk-cancel action" type="button">取消</button><button class="bulk-confirm-delete action danger-button" type="button" disabled>删除已选</button></div></div></div></div>
        <footer class="actions"><div class="action-buttons"><button class="action primary import-apply needs-theme" type="button" disabled>生成副本并应用 ${arrow}</button><div class="secondary-actions"><button class="action inject-original needs-theme" type="button" disabled>直接注入原美化</button><button class="action download needs-theme" type="button" disabled>↓ 仅下载适配版</button><button class="action diagnose" type="button">布局诊断 ↗</button></div></div></footer>
        <div class="status" role="status" aria-live="polite">选择美化后即可开始；直接注入会更新所选原美化。</div>
        <div class="colophon"><span>BEAUTIFY STUDIO</span><span>WITH A LITTLE ${star} & A LOT OF CARE</span><span>美化工作室</span></div>
      </div>
    </section>
  </div>`;
}

// src/ui/studio.css
var studio_default = `:host { all: initial; color-scheme: light; --ink:#272829; --muted:#737577; --line:#dedfe0; --paper:#fafafa; }
*,*::before,*::after { box-sizing:border-box; }
[hidden] { display:none !important; }
button,input { font:inherit; }
button { cursor:pointer; color:inherit; }
button:disabled { cursor:not-allowed; }
button:focus-visible,input:focus-visible { outline:2px solid #53585d; outline-offset:4px; }
svg { display:block; width:24px; height:24px; flex-shrink:0; }
.backdrop { position:fixed; inset:0; display:flex; justify-content:center; align-items:center; padding:24px; background:#68696b88; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); color:var(--ink); font:14px/1.6 "PingFang SC","Microsoft YaHei",system-ui,sans-serif; }
.panel { width:min(1000px,100%); max-height:100%; display:flex; flex-direction:column; border:1px solid #ffffffb3; border-radius:25px; background:var(--paper); box-shadow:0 28px 90px #24262830; overflow:hidden; }
.header { display:flex; align-items:center; gap:13px; padding:20px 32px; border-bottom:1px solid var(--line); background:#fafafa; }
.brand-mark { display:grid; place-items:center; width:47px; height:47px; background:linear-gradient(145deg,#f8f8f8,#c8cacc); border:1px solid #d1d2d3; border-radius:50%; box-shadow:inset 0 2px 3px white; }
.brand-mark svg { width:27px; height:27px; }
.titlebox { flex:1; }
h1,h2,h3,p { margin:0; }
h1 { font-size:20px; letter-spacing:3px; line-height:1.4; font-weight:600; }
.wordmark { display:block; font-size:10px; letter-spacing:2.5px; margin-top:3px; }
.version { font:11px/1.5 ui-monospace,monospace; letter-spacing:1px; color:#6d6f71; }
.version i { padding:0 8px; color:#b2b3b4; }
.icon-button { border:1px solid #d8d9da; border-radius:50%; width:34px; height:34px; display:grid; place-items:center; font-size:25px; line-height:1; background:transparent; margin-left:12px; padding:0; }
.icon-button:hover { background:#e9eaeb; }
.body { padding:24px 32px 18px; overflow:auto; overscroll-behavior:contain; background-image:radial-gradient(#c7c8c94a .65px,transparent .65px); background-size:7px 7px; }
.masthead { background:#292a2b; color:#f2f2f2; display:flex; justify-content:space-between; padding:10px 17px; font:10px/1.4 Georgia,serif; letter-spacing:.7px; }
.masthead span:nth-child(2) { display:flex; gap:9px; align-items:center; }
.masthead svg { width:9px; height:9px; }
.intro { display:flex; align-items:center; justify-content:flex-end; gap:20px; padding:15px 0 17px; }
.eyebrow { font:10px/1.5 ui-monospace,monospace; letter-spacing:1.7px; color:#747678; }
h2 { font-size:27px; font-weight:500; letter-spacing:2px; margin-top:7px; line-height:1.45; }
h2 em { font-style:normal; color:#808284; }
.connection { display:flex; align-items:center; gap:7px; font-size:12px; border:1px solid #d8d9da; border-radius:24px; padding:6px 12px; white-space:nowrap; background:#f7f7f7; }
.connection i { width:6px; height:6px; border-radius:50%; background:#a3a5a7; }
.connection[data-connected="true"] i { background:#607368; }
.workspace { display:grid; grid-template-columns:1.06fr 1fr; gap:26px; }
.section-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px; }
h3 { font-size:15px; font-weight:600; }
.section-heading h3>span { color:#939597; font:12px ui-monospace,monospace; margin-right:9px; }
.caption { font:9px ui-monospace,monospace; color:#777a7c; letter-spacing:1.2px; }
.source-card,.settings-card,.check-card { border:1px solid #d8dadb; border-radius:20px; background:#fafafae8; overflow:hidden; }
.source-card { padding:15px; }
.source-tabs { display:grid; grid-template-columns:1fr 1fr; background:#eceded; padding:4px; border-radius:24px; gap:4px; }
.source-tabs button { border:0; padding:9px 6px; border-radius:24px; background:transparent; font-size:13px; color:#77797b; transition:background .18s; }
.source-tabs button[aria-selected="true"] { background:#fff; color:#272829; box-shadow:0 1px 5px #00000010; }
.collection-meta { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:16px 3px 10px; font-size:12px; color:var(--muted); }
.collection-actions { display:flex; align-items:center; gap:8px; }
.collection-actions .icon-button { width:27px; height:27px; font-size:20px; margin:0; }
.collection-actions .icon-button.danger { color:#985347; font-size:17px; }
.bulk-modal { position:fixed; inset:0; z-index:20; display:grid; place-items:center; padding:18px; background:#25272966; backdrop-filter:blur(8px); }
.bulk-modal[hidden] { display:none; }
.bulk-modal-card { width:min(480px,100%); max-height:min(650px,100%); display:flex; flex-direction:column; overflow:hidden; border:1px solid #d6d8d9; border-radius:20px; background:#fafafa; box-shadow:0 20px 70px #0003; }
.bulk-modal-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 20px; border-bottom:1px solid #dedfe0; }
.bulk-modal-header h2 { font-size:20px; margin-top:3px; }
.bulk-modal-header .icon-button { margin:0; width:32px; height:32px; }
.bulk-toolbar { display:flex; align-items:center; gap:9px; padding:13px 18px 9px; }
.bulk-search { flex:1; display:flex; align-items:center; gap:8px; border:1px solid #d3d5d6; border-radius:20px; padding:0 12px; background:white; color:#777; }
.bulk-search input { min-width:0; width:100%; border:0; outline:0; padding:8px 0; background:transparent; font-size:12px; color:var(--ink); }
.bulk-select-all { white-space:nowrap; }
.bulk-list { min-height:120px; max-height:390px; overflow:auto; padding:3px 18px 12px; }
.bulk-row { display:flex; align-items:center; gap:11px; padding:12px 4px; border-bottom:1px solid #e5e6e7; cursor:pointer; font-size:13px; }
.bulk-row input { width:17px; height:17px; accent-color:#303334; }
.bulk-empty { padding:38px 10px; text-align:center; color:#777; font-size:12px; }
.bulk-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:13px 18px; border-top:1px solid #dedfe0; background:#f0f1f1; color:#707375; font-size:12px; }
.bulk-footer .action { padding:8px 13px; border-radius:18px; }
.danger-button { background:#985347; color:white; }
.danger-button:disabled { opacity:.35; }
.theme-search { padding:0 3px 9px; }
.search-input { width:100%; border:1px solid #d5d7d8; border-radius:18px; padding:8px 12px; background:#fff; color:var(--ink); font-size:12px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.text-button { background:none; border:0; padding:4px; font-size:12px; }
.text-button:hover { text-decoration:underline; }
.library { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; max-height:226px; overflow:auto; padding:3px; scrollbar-width:thin; }
.theme-card { position:relative; text-align:left; background:white; border:1px solid #dddfe0; border-radius:13px; padding:5px; min-width:0; }
.theme-card[aria-pressed="true"] { border-color:#3f4244; box-shadow:0 0 0 1px #3f4244; }
.theme-card:hover { border-color:#777b7e; }
.theme-thumbnail { height:83px; border-radius:9px; background:var(--theme-bg,#e0e1e2); position:relative; overflow:hidden; color:var(--theme-text,#373a3c); }
.preview-topbar { position:absolute; inset:0 0 auto; height:13px; background:#0002; }
.preview-avatar { position:absolute; left:8px; top:22px; width:13px; height:13px; border-radius:50%; background:var(--theme-user,#aeb4b8); }
.preview-message { position:absolute; height:12px; border-radius:7px; opacity:.9; }
.preview-message-user { left:27px; right:12px; top:23px; background:var(--theme-user,#aeb4b8); }
.preview-message-bot { left:12px; right:30px; top:46px; background:var(--theme-bot,#f0f1f1); }
.preview-composer { position:absolute; bottom:8px; left:10px; right:10px; height:7px; border-radius:6px; background:#fff9; }
.theme-card[aria-pressed="true"] .theme-thumbnail::after { content:"✓"; background:#2b2d2f; color:white; width:19px; height:19px; bottom:7px; right:7px; text-align:center; line-height:19px; border-radius:50%; font-size:11px; }
.theme-name { display:block; font-size:12px; font-weight:500; padding:5px 5px 2px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.library-empty { grid-column:1/-1; padding:27px 13px; min-height:206px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:8px; color:var(--muted); font-size:13px; }
.library-empty strong { color:var(--ink); font-weight:500; }
.selection { margin-top:15px; padding:13px 8px 1px; border-top:1px solid var(--line); display:flex; gap:11px; align-items:center; }
.selection-star svg { width:26px; height:26px; color:#7b7e80; }
.selection>div { flex:1; min-width:0; }
.tiny-label { color:#7b7e80; font:9px/1.5 ui-monospace,monospace; letter-spacing:1.3px; }
.filename { font-size:13px; margin-top:2px; overflow-wrap:anywhere; }
.selected-indicator { font-size:20px; }
.choose { display:flex; width:100%; min-height:240px; flex-direction:column; align-items:center; justify-content:center; gap:12px; border:1px dashed #c7c9cb; border-radius:14px; background:linear-gradient(135deg,#f4f4f4,#e9eaeb); margin-top:16px; }
.choose.dragover { background:#d9dcde; border-color:#3d4144; }
.choose strong { font-size:16px; font-weight:500; }
.choose>span:not(.upload-icon):not(.upload-pill) { font-size:12px; color:#747779; }
.upload-icon { padding:14px; border-radius:50%; border:1px solid #d5d7d8; background:#f8f8f8; }
.upload-pill { display:flex; align-items:center; gap:14px; font-size:12px; border-radius:20px; background:#fff; padding:7px 15px; }
.upload-pill svg { width:15px; height:15px; }
.upload-note { margin-top:10px; font-size:11px; text-align:center; color:#777a7c; }
.keepsake { display:none; }
.keepsake-copy>span { font:17px/1.3 Georgia,serif; color:#55595b; }
.keepsake-copy small { display:block; font-size:10px; color:#6d7174; margin-top:9px; }
.sticker { position:absolute; right:15px; width:66px; height:80px; border:3px solid #ffffffd9; border-radius:14px; display:grid; place-items:center; background:#e7e8e9b0; box-shadow:0 2px 5px #6661; }
.sticker svg { width:31px; height:31px; color:#fafafa; }
.s-one { right:105px; transform:rotate(-11deg); }
.s-two { right:58px; transform:rotate(-2deg); }
.s-three { transform:rotate(12deg); }
.keepsake-index { position:absolute; right:17px; bottom:9px; color:#747779; font:8px ui-monospace,monospace; letter-spacing:1px; }
.options { padding:4px 18px; }
.option { display:grid; grid-template-columns:17px 1fr 34px; align-items:center; gap:11px; padding:18px 0; cursor:pointer; }
.option+.option { border-top:1px solid #e5e6e7; }
.option-number { align-self:start; font:10px/2.3 ui-monospace,monospace; color:#939698; }
.option b { display:block; font-size:14px; font-weight:500; }
.option small { display:block; margin-top:4px; font-size:12px; color:#797c7e; line-height:1.6; }
.option input { appearance:none; width:33px; height:19px; border-radius:15px; margin:0; background:#c9ccce; position:relative; cursor:pointer; transition:background .2s; }
.option input::after { content:""; position:absolute; top:3px; left:3px; width:13px; height:13px; border-radius:50%; background:#fff; transition:transform .2s; }
.option input:checked { background:#343738; }
.option input:checked::after { transform:translateX(14px); }
.settings-note { padding:10px 14px; display:flex; gap:7px; align-items:center; justify-content:center; background:#eeeeef; font-size:11px; color:#75787a; }
.settings-note>span { font-size:17px; }
.check-card { margin-top:17px; padding:16px 18px; }
.check-heading { display:flex; justify-content:space-between; gap:8px; align-items:center; margin-bottom:12px; }
.check-heading h3 { display:flex; gap:7px; align-items:center; font-size:13px; }
.check-heading svg { width:13px; height:13px; }
.check-count { border:1px solid #dbddde; border-radius:15px; padding:2px 8px; color:#777a7b; font-size:10px; }
.report { max-height:130px; overflow:auto; scrollbar-width:thin; }
.risk { padding:10px 0 10px 13px; border-left:2px solid #a5a9ab; margin-bottom:8px; }
.risk:last-child { margin-bottom:0; }
.risk b { display:block; font-size:12px; font-weight:500; }
.risk span { display:block; font-size:11px; color:#777a7c; line-height:1.7; margin-top:4px; }
.risk[data-level="high"] { border-color:#a27a68; }
.risk[data-level="ok"] { border-color:#758779; }
.risk[data-level="idle"] { border-color:#d3d5d6; }
.actions { display:flex; align-items:center; justify-content:flex-end; gap:25px; padding:25px 0 17px; margin-top:22px; border-top:1px solid #d5d7d8; }
.action-note p { font-size:16px; line-height:1.6; margin-top:5px; letter-spacing:1px; }
.action-buttons { width:calc((100% - 26px)/2.06); }
.action { border:0; background:none; padding:7px 4px; font-size:12px; }
.primary { width:100%; display:flex; align-items:center; justify-content:space-between; gap:20px; border-radius:30px; background:#292b2c; color:#fff; min-height:48px; padding:12px 21px; font-size:14px; }
.primary:hover:not(:disabled) { background:#474a4c; }
.primary:disabled { background:#dddfe0; color:#898c8e; }
.secondary-actions { display:flex; justify-content:space-between; gap:12px; margin-top:7px; }
.secondary-actions .action { color:#666a6d; }
.secondary-actions .action:hover:not(:disabled) { text-decoration:underline; }
.secondary-actions .action:disabled { color:#a6a8aa; }
.secondary-actions .batch-import { color:#44484a; font-weight:500; }
.status { color:#777b7d; font-size:11px; line-height:1.7; padding-bottom:15px; overflow-wrap:anywhere; }
.status[data-kind="error"] { color:#985347; }
.status[data-kind="success"] { color:#516c59; }
.colophon { display:flex; justify-content:space-between; align-items:center; gap:12px; border-top:1px solid #d5d7d8; padding-top:13px; font:9px/1.4 Georgia,serif; color:#777b7d; letter-spacing:.6px; }
.colophon span:nth-child(2) { display:flex; align-items:center; gap:5px; }
.colophon svg { width:9px; height:9px; }
@media (max-width:700px) {
  .backdrop { padding: max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom)); }
  .panel { border-radius:21px; }
  .header { padding:16px 18px; gap:10px; }
  .brand-mark { width:40px; height:40px; }
  h1 { font-size:18px; letter-spacing:2px; }
  .wordmark { font-size:8px; letter-spacing:2px; }
  .version { font-size:9px; letter-spacing:0; }
  .version i { padding:0 4px; }
  .icon-button { margin-left:0; width:30px; height:30px; }
  .body { padding:18px 18px 15px; }
  .masthead { font-size:8px; padding:9px 10px; letter-spacing:0; }
  .masthead span:last-child { display:none; }
  .intro { padding:10px 0 13px; display:flex; }
  .eyebrow { font-size:8px; letter-spacing:1px; }
  h2 { font-size:24px; letter-spacing:1px; }
  .connection { width:fit-content; margin-top:12px; font-size:10px; padding:4px 9px; }
  .workspace { grid-template-columns:minmax(0,1fr); gap:24px; }
  .keepsake { display:none; }
  .keepsake-copy>span { font-size:15px; }
  .sticker { width:55px; height:65px; }
  .s-one { right:96px; }.s-two { right:54px; }
  .theme-thumbnail { height:76px; }
  .library { max-height:247px; }
  .option { padding:18px 0; }
  .option small { font-size:12px; }
  .actions { align-items:flex-start; margin-top:24px; gap:16px; flex-direction:column; padding-top:19px; }
  .action-note p br { display:none; }
  .action-note p { font-size:14px; }
  .action-buttons { width:100%; }
  .primary { min-height:49px; }
  .colophon { font-size:8px; }.colophon span:last-child { display:none; }
}
@media (prefers-reduced-motion:reduce) { *,*::before,*::after { transition:none !important; } }
:host .visual-edit{display:flex;align-items:center;gap:16px;width:100%;border:1px solid #c9cdca;border-radius:16px;padding:17px 20px;margin:0 0 22px;background:#ecefeb;color:#2e3832;text-align:left;cursor:pointer}.visual-edit>span:first-child{font-size:30px}.visual-edit div{flex:1}.visual-edit b,.visual-edit small{display:block}.visual-edit small{margin-top:4px;color:#6b756d}.visual-edit>span:last-child{font-size:12px}
/* Visual editor shares the studio's silver paper palette. */
.visual-editor{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#303331;--ve-line:#dce0da;--ve-muted:#7c827b;--ve-accent:#60705d}
.visual-editor *{box-sizing:border-box}.visual-editor [hidden]{display:none!important}.visual-editor button,.visual-editor input{font:inherit}.visual-editor button{cursor:pointer;color:inherit;border:0;background:none}.visual-editor button:disabled{opacity:.35;cursor:default}.visual-editor button:focus-visible,.visual-editor input:focus-visible,.visual-editor summary:focus-visible{outline:2px solid #62735e;outline-offset:3px}.visual-editor input{color:inherit}.visual-editor button{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.ve-masthead{position:fixed;top:0;left:0;right:0;height:58px;background:rgba(250,251,248,.94);border-bottom:1px solid var(--ve-line);display:flex;align-items:center;justify-content:space-between;padding:0 30px;pointer-events:auto}.ve-brand{display:flex;align-items:center;gap:10px;font-size:22px}.ve-brand b{font-size:14px;font-weight:600}.ve-brand i{font:10px Georgia,serif;letter-spacing:2px;color:#8a8e87;margin-left:14px}.ve-live{font-size:11px;color:#687762;display:flex;align-items:center;gap:7px}.ve-live i{width:6px;height:6px;border-radius:50%;background:#73886d;box-shadow:0 0 0 4px #e7ede2}.ve-sheet{position:fixed;left:24px;top:80px;bottom:24px;width:392px;max-height:900px;display:flex;flex-direction:column;background:#fafbf8;border:1px solid #fff;border-radius:22px;box-shadow:0 18px 65px #29352718,0 0 0 1px #d8ddd550;pointer-events:auto;overflow:hidden}.ve-sheet-head{display:flex;align-items:flex-start;justify-content:space-between;padding:22px 22px 16px}.ve-eyebrow{font:9px ui-monospace,monospace;letter-spacing:2px;color:#8b9288}.ve-sheet-head h1{font-size:19px;letter-spacing:-.7px;margin:9px 0 0;font-weight:550}.ve-sheet-head h1 span{display:inline-block;margin-left:9px;color:#9ca894;font-size:24px}.ve-icon{flex:none;width:38px;height:38px;border:1px solid var(--ve-line)!important;border-radius:11px!important;background:#fff8!important;font-size:21px!important}.ve-sheet-head .ve-icon{border:0!important;width:25px;height:28px;font-size:26px!important;color:#8b9089}.ve-theme{margin:0 22px 18px;padding:12px;display:flex;gap:10px;align-items:center;background:linear-gradient(115deg,#e7ebe4,#f2f3ef);border:1px solid #dde2d7;border-radius:12px}.ve-theme-icon{display:grid;place-items:center;width:37px;height:37px;background:#fcfdf9;border:1px solid #d2d8ca;border-radius:9px;font-size:23px;color:#76856d}.ve-theme div{flex:1}.ve-theme small{display:block;font-size:10px;color:#818979}.ve-theme b{font-size:13px;font-weight:550}.ve-draft{border:1px solid #c9d2c1;border-radius:5px;padding:1px 6px;color:#74826c;font-size:10px}.ve-tabs{display:flex;margin:0 22px;border-bottom:1px solid var(--ve-line);gap:22px}.ve-tabs button{position:relative;padding:0 0 12px;font-size:12px;color:#92978f;white-space:nowrap}.ve-tabs button[aria-pressed=true]{color:#343c30;font-weight:600}.ve-tabs button[aria-pressed=true]:after{content:"";position:absolute;height:2px;background:#56664b;bottom:-1px;left:0;right:0}.ve-note-count{font-size:10px;border-radius:4px;background:#e9ece5;padding:0 4px}.ve-scroll{overflow-y:auto;overscroll-behavior:contain;padding:20px 22px 16px;min-height:0;flex:1;scrollbar-width:thin;scrollbar-color:#d3dacf transparent}.ve-section-label{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#686e64;margin-bottom:12px}.ve-text{font-size:11px!important;color:#66775a!important;padding:3px 0}.ve-dim{color:#a1a59b;font-size:10px}.ve-targets{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ve-targets>button{position:relative;text-align:left;border:1px solid var(--ve-line);border-radius:12px;padding:14px;background:#f5f6f2}.ve-targets>button[aria-pressed=true]{border-color:#7c8f71;background:#eef2e9;box-shadow:inset 0 0 0 1px #7c8f7130}.ve-targets>button>span{font-size:24px;color:#87957b;display:block;line-height:1;margin-bottom:13px}.ve-targets b{font-size:12px;display:block;font-weight:550}.ve-targets small{display:block;color:#949b8e;font-size:10px;margin-top:3px}.ve-targets i{position:absolute;right:12px;top:10px;font-style:normal;color:#8e9c82}.ve-scope{display:flex;align-items:center;justify-content:space-between;margin:9px 0 20px;font-size:10px;color:#8b9284}.ve-properties{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}.ve-properties button{border:1px solid var(--ve-line);border-radius:9px;padding:9px 4px;color:#959b8e;font-size:20px}.ve-properties button span{display:block;font-size:11px;margin-top:2px}.ve-properties button[aria-pressed=true]{background:#e9eee2;border-color:#c2cbb7;color:#566648}.ve-value-card{padding:14px 15px 12px;border:1px solid var(--ve-line);border-radius:12px;background:#fff9}.ve-value-title{display:flex;justify-content:space-between;align-items:center;font-size:11px}.ve-value-title b{font-weight:550}.ve-unit{font:9px ui-monospace,monospace;color:#a3aa9a;letter-spacing:2px}.ve-scalar{display:flex;align-items:center;justify-content:space-between;margin:14px 0 11px}.ve-scalar>button,.ve-controller-scalar>button{height:40px;width:44px;border:1px solid #dbe0d5;border-radius:10px;background:#f1f4ec;font-size:21px}.ve-scalar label{display:flex;align-items:baseline;justify-content:center;gap:4px}.ve-number{width:76px;font:32px/1.2 Georgia,serif!important;border:0;background:transparent;text-align:center;appearance:textfield;-moz-appearance:textfield}.ve-number::-webkit-inner-spin-button{appearance:none}.ve-scalar label span{font-size:11px;color:#a1a894}.ve-range{width:100%;height:14px;accent-color:#7c8f6e;cursor:pointer}.ve-help{margin:7px 0 0;font-size:10px;color:#959c8d;line-height:1.6}.ve-handheld{display:flex;gap:12px;align-items:center;width:100%;border:1px solid #d6ddce!important;border-radius:12px;padding:13px!important;background:#edf1e6!important;margin-top:12px;text-align:left}.ve-handheld>span{font-size:23px;color:#7c8c6f}.ve-handheld>span:last-child{font-size:19px}.ve-handheld div{flex:1}.ve-handheld b{display:block;font-size:12px;font-weight:550}.ve-handheld small{display:block;font-size:10px;color:#909b85;margin-top:3px}.ve-coming{margin-top:17px;display:flex;align-items:center;gap:8px;color:#a1a799;font-size:10px}.ve-coming>span{border:1px solid #dde2d6;border-radius:4px;padding:0 4px;font-size:9px}.ve-coming small{margin-left:auto;font-size:9px}.ve-footer{padding:10px 22px 16px;border-top:1px solid var(--ve-line);background:#f6f8f1}.ve-feedback{font-size:10px;color:#7f8b73;min-height:16px;margin:0 0 10px}.ve-footer-actions{display:flex;gap:7px;align-items:center}.ve-footer-actions .ve-icon{height:37px;width:35px;font-size:19px!important}.ve-export{font-size:11px!important;padding:8px!important;white-space:nowrap}.ve-save{flex:1;background:#384331!important;color:#fff!important;border-radius:9px;padding:10px 8px!important;font-size:12px!important;white-space:nowrap}.ve-footer>small{display:block;text-align:center;font-size:9px;letter-spacing:1px;color:#a5ad9c;margin-top:11px}.ve-position-values{display:flex;gap:12px;margin:16px 0}.ve-position-values label{flex:1;color:#8b977e;font-size:11px}.ve-position-values input{display:block;width:100%;padding:7px;border:1px solid #d8dfd0;border-radius:7px;background:#f8faf4;margin-top:5px}.ve-color-row{display:flex;align-items:center;justify-content:space-between;font-size:11px;margin-top:7px}.ve-color{height:28px;width:40px;padding:2px;border:1px solid #d3dcc8;border-radius:5px;background:transparent}.ve-outline{position:fixed;border:1.5px solid #849574;border-radius:13px;pointer-events:none;box-shadow:0 0 0 3px #fcfff955;transition:width .08s,height .08s}.ve-outline:before,.ve-outline:after{content:"";position:absolute;width:5px;height:5px;background:#fafcf5;border:1px solid #849574;top:-3px}.ve-outline:before{left:-3px}.ve-outline:after{right:-3px}.ve-outline>span{position:absolute;left:-1px;top:-24px;background:#69795b;color:white;border-radius:4px;font-size:10px;white-space:nowrap;padding:2px 7px;box-shadow:0 1px 4px #0001}.ve-controller{position:fixed;width:296px;bottom:34px;left:calc(50% - 148px);border:1px solid #fff;border-radius:19px;background:#f8faf4f5;box-shadow:0 12px 65px #25301930,0 0 0 1px #dce3d580;pointer-events:auto;padding:14px 15px 10px;backdrop-filter:blur(18px)}.ve-controller-head{display:flex;align-items:center;gap:7px;font-size:12px}.ve-controller-head>.ve-text{margin-left:auto}.ve-grip{font-size:21px;color:#a3ae97;cursor:grab;touch-action:none;padding:0 5px}.ve-controller-title{font-weight:550}.ve-mini-modes{display:flex;background:#e9eee1;border-radius:7px;padding:3px;margin-top:12px}.ve-mini-modes button{font-size:10px;flex:1;border-radius:5px;padding:5px}.ve-mini-modes button[aria-pressed=true]{background:#fcfff6;color:#4c5e3c;box-shadow:0 1px 3px #0001}.ve-controller-body{padding:13px 0 8px}.ve-controller-scalar{display:flex;align-items:center;justify-content:space-around}.ve-controller-scalar>span{text-align:center;min-width:65px}.ve-mini-value{font:34px Georgia,serif}.ve-controller-scalar small{font-size:10px;margin-left:3px;color:#939f86}.ve-controller-caption{text-align:center;font-size:10px;color:#89967d;margin-top:10px}.ve-controller-foot{display:flex;align-items:center;gap:6px;border-top:1px solid #dfe5d6;padding-top:10px;font-size:10px;color:#9ca68f}.ve-controller-foot button{border:1px solid #dfe5d7;border-radius:6px;padding:5px 8px;font-size:10px;color:#6e7c60}.ve-controller-foot [aria-pressed=true]{background:#e5ecdb;border-color:#bdc9af}.ve-controller-foot .ve-done{margin-left:auto;background:#49563e;color:#fff;border-color:#49563e}.ve-mini-status{font-size:9px;color:#89957e;margin-top:6px;line-height:1.4}.ve-dpad{display:grid;grid-template-columns:44px 44px 44px;grid-template-rows:36px 36px 36px;gap:4px;justify-content:center}.ve-dpad button{border:1px solid #d8e1cd;border-radius:9px;background:#edf2e6;font-size:20px}.ve-dpad button:nth-child(1){grid-column:2}.ve-dpad button:nth-child(2){grid-column:1;grid-row:2}.ve-dpad button:nth-child(3){grid-column:2;grid-row:2;color:#91a07f;font-size:18px}.ve-dpad button:nth-child(4){grid-column:3;grid-row:2}.ve-dpad button:nth-child(5){grid-column:2;grid-row:3}.ve-description{margin:0 0 16px;font-size:12px;color:#7e8973;line-height:1.8}.ve-search{display:flex;border:1px solid #d9e0d1;border-radius:9px;background:#f4f7ee;align-items:center;padding:8px 10px;gap:8px;margin-bottom:16px}.ve-search input{font-size:11px;background:transparent;border:0;outline:none;width:100%}.ve-search>span{color:#839174;font-size:19px}.ve-note{border:1px solid #dce2d4;border-radius:10px;background:#fffffc;padding:14px;margin-bottom:10px}.ve-note>small{font:9px ui-monospace,monospace;color:#a0aa94}.ve-note>p{margin:8px 0;font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere}.ve-note summary{font-size:10px;color:#879778;cursor:pointer}.ve-note pre{font:10px/1.6 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#eef3e7;border-radius:5px;padding:8px;color:#68785a}.ve-note>.ve-text{margin-top:8px}.ve-change{padding:14px 0;border-bottom:1px solid #e1e7d9;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px}.ve-change b{font:12px ui-monospace,monospace;color:#738763}.ve-empty{padding:35px 15px;color:#969f8b;font-size:12px;text-align:center;line-height:2}.ve-reset-all{margin-top:20px;width:100%;border:1px solid #dae3cf!important;border-radius:9px;padding:10px!important;font-size:11px!important;color:#859576!important}.ve-pick-hint{position:fixed;top:76px;left:50%;transform:translateX(-50%);background:#3b4931;color:#fff;padding:12px 17px;border-radius:30px;pointer-events:auto;font-size:12px;white-space:nowrap;box-shadow:0 5px 25px #27311b30}.ve-pick-hint button{color:#d6e6c4!important;margin-left:15px;font-size:11px;border-left:1px solid #8a9d7670;padding-left:14px}
@media(max-width:700px){.ve-masthead{height:49px;padding:0 17px}.ve-brand{font-size:20px}.ve-brand b{font-size:13px}.ve-brand i{display:none}.ve-live{font-size:10px}.ve-sheet{left:8px;right:8px;width:auto;top:auto;bottom:max(8px,env(safe-area-inset-bottom));height:min(610px,72dvh);border-radius:21px;max-height:calc(100dvh - 70px)}.ve-sheet-head{padding:16px 18px 10px}.ve-sheet-head h1{font-size:17px;margin-top:4px}.ve-eyebrow{font-size:8px}.ve-theme{margin:0 18px 12px;padding:8px 10px}.ve-theme-icon{width:30px;height:30px;font-size:20px}.ve-tabs{margin:0 18px;gap:25px}.ve-tabs button{padding-bottom:9px;font-size:11px}.ve-scroll{padding:14px 18px}.ve-targets>button{padding:10px 12px}.ve-targets>button>span{font-size:20px;margin-bottom:7px}.ve-targets small{display:none}.ve-scope{margin:6px 0 14px}.ve-properties button{padding:6px;font-size:18px}.ve-value-card{padding:10px 12px}.ve-scalar{margin:9px 0}.ve-handheld{padding:10px!important}.ve-coming{margin-top:12px}.ve-footer{padding:8px 18px 11px}.ve-feedback{margin-bottom:7px}.ve-footer>small{margin-top:7px}.ve-controller{bottom:max(18px,env(safe-area-inset-bottom));width:280px;left:calc(50% - 140px)}.ve-pick-hint{top:65px;font-size:11px}.ve-outline>span{font-size:9px}.ve-number{font-size:28px!important}}
@media(prefers-reduced-motion:reduce){.visual-editor *{transition:none!important;scroll-behavior:auto!important}}

/* Compact heading and consistent curved undo/redo icons. */
.ve-sheet-head{align-items:center;padding-bottom:10px}.ve-sheet-head .ve-icon{display:grid;place-items:center}.ve-footer-actions .ve-icon,.ve-controller-foot [data-action="undo"]{display:grid;place-items:center;border-radius:50%!important}.visual-editor .ve-history-icon{width:21px;height:21px;display:block}.ve-controller-foot .ve-history-icon{width:17px;height:17px}.ve-composer-target{grid-column:1/-1;display:grid;grid-template-columns:30px 1fr;column-gap:9px;align-items:center}.ve-targets .ve-composer-target>span{grid-row:1/3;margin:0;font-size:23px}.ve-composer-target b,.ve-composer-target small{grid-column:2}.ve-properties[data-composer="true"]{grid-template-columns:repeat(2,1fr)}.ve-lift-buttons{display:flex;gap:7px;margin-bottom:12px}.ve-lift-buttons button{flex:1;border:1px solid #d6dfcc;border-radius:9px;padding:9px 5px;background:#edf2e6;font-size:12px}.ve-lift-buttons button:nth-child(2){flex:0 0 35px}.ve-controller[data-composer="true"]{bottom:auto;top:85px}.ve-controller[data-composer="true"] .ve-controller-caption{line-height:1.7}.ve-sheet-head .ve-eyebrow{font-size:10px}.ve-help{font-size:11px}.ve-history-icon path{pointer-events:none}
@media(max-width:700px){.ve-targets .ve-composer-target small{display:block}.ve-sheet-head{padding:12px 18px 9px}.ve-controller[data-composer="true"]{top:65px;bottom:auto}.ve-sheet-head .ve-icon{height:25px}}

/* Explicit centering overrides native iOS button padding and font baselines. */
.visual-editor [data-nudge],.visual-editor [data-action="undo"],.visual-editor [data-action="redo"]{display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;line-height:1!important;text-indent:0!important;box-sizing:border-box!important;appearance:none;-webkit-appearance:none;flex-shrink:0}.visual-editor .ve-step-icon,.visual-editor .ve-history-icon{display:block!important;width:22px!important;height:22px!important;margin:0!important;flex:0 0 22px;position:static!important}.ve-controller-foot [data-action="undo"]{width:32px;height:32px}.ve-footer-actions .ve-save{font-size:11px!important}
`;

// node_modules/postcss/lib/postcss.mjs
var import_postcss = __toESM(require_postcss(), 1);
var postcss_default = import_postcss.default;
var stringify = import_postcss.default.stringify;
var fromJSON = import_postcss.default.fromJSON;
var plugin = import_postcss.default.plugin;
var parse = import_postcss.default.parse;
var list = import_postcss.default.list;
var document2 = import_postcss.default.document;
var comment = import_postcss.default.comment;
var atRule = import_postcss.default.atRule;
var rule = import_postcss.default.rule;
var decl = import_postcss.default.decl;
var root = import_postcss.default.root;
var CssSyntaxError = import_postcss.default.CssSyntaxError;
var Declaration = import_postcss.default.Declaration;
var Container = import_postcss.default.Container;
var Processor = import_postcss.default.Processor;
var Document = import_postcss.default.Document;
var Comment = import_postcss.default.Comment;
var Warning = import_postcss.default.Warning;
var AtRule = import_postcss.default.AtRule;
var Result = import_postcss.default.Result;
var Input = import_postcss.default.Input;
var Rule = import_postcss.default.Rule;
var Root = import_postcss.default.Root;
var Node = import_postcss.default.Node;

// src/core/editor.js
var EDIT_START = "/* === BEAUTIFY_VISUAL_START === */";
var EDIT_END = "/* === BEAUTIFY_VISUAL_END === */";
var TARGETS = {
  character: { name: "角色头像", scope: "全部角色消息", selector: '#chat .mes[is_user="false"] .avatar', icon: "✧" },
  user: { name: "我的头像", scope: "全部用户消息", selector: '#chat .mes[is_user="true"] .avatar', icon: "◎" },
  composer: { name: "底部输入栏", scope: "输入框与底栏按钮", selector: "#form_sheld", icon: "▤" }
};
var DEFAULT_VALUES = { x: 0, y: 0, size: 48, radius: 12, border: 0, color: "#727c73", lift: 0, gap: 0 };
function parseSource(css) {
  const root2 = postcss_default.parse(String(css || ""));
  const comments = [];
  root2.walkComments((node) => {
    if (/BEAUTIFY_VISUAL_(START|END)/.test(node.text)) return;
    const next = node.next();
    comments.push({
      text: node.text.trim(),
      line: node.source?.start?.line || 1,
      selector: node.parent.type === "rule" ? node.parent.selector : next?.type === "rule" ? next.selector : "",
      code: next && next.type !== "comment" ? next.toString() : ""
    });
  });
  return comments;
}
function stepValue(values, property, delta) {
  const bounds = { x: [-300, 300], y: [-300, 300], size: [16, 200], radius: [0, 100], border: [0, 12], lift: [-120, 200], gap: [-120, 200] };
  const [min, max] = bounds[property];
  return { ...values, [property]: Math.min(max, Math.max(min, Math.round((values[property] + delta) * 10) / 10)) };
}
function buildEditedCss(source, edits) {
  const rules = [];
  for (const [key, edit] of Object.entries(edits)) {
    const target = TARGETS[key];
    if (!target) continue;
    const { values: v, changed, origin = { x: 0, y: 0 } } = edit;
    if (key === "composer") {
      const css = [];
      if (changed.includes("lift")) css.push(`translate: ${origin.x}px ${origin.y - v.lift}px !important;`);
      if (changed.includes("gap")) {
        const base = origin.safeAware ? `var(--tt-inset-bottom, env(safe-area-inset-bottom, 0px)) + ${origin.paddingAdjustment || 0}px` : `${origin.paddingBottom || 0}px`;
        css.push(`padding-bottom: max(0px, calc(${base} + ${v.gap}px)) !important;`);
      }
      if (css.length) rules.push(`/* 底部输入栏 · 正数抬高 / 增加留白；负数降低 / 减少留白 */
html body #form_sheld#form_sheld#form_sheld {
  ${css.join("\n  ")}
}`);
      continue;
    }
    const declarations = [];
    if (changed.includes("position")) declarations.push(`translate: ${origin.x + v.x}px ${origin.y + v.y}px !important;`);
    if (changed.includes("size")) declarations.push(`width: ${v.size}px !important; height: ${v.size}px !important; min-width: ${v.size}px !important; max-width: ${v.size}px !important; max-height: ${v.size}px !important; flex-shrink: 0 !important;`);
    if (changed.includes("radius")) declarations.push(`border-radius: ${v.radius}px !important;`);
    if (changed.includes("border")) declarations.push(`border: ${v.border}px solid ${v.color} !important; box-sizing: border-box !important;`);
    if (!declarations.length) continue;
    rules.push(`/* ${target.name} · 可视化微调 */
${target.selector} {
  ${declarations.join("\n  ")}
}`);
    const img = [];
    if (changed.includes("size")) img.push("width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: cover;");
    if (changed.includes("radius")) img.push("border-radius: inherit !important;");
    if (img.length) rules.push(`${target.selector} img { ${img.join(" ")} }`);
  }
  return rules.length ? `${source}

${EDIT_START}
${rules.join("\n\n")}
${EDIT_END}
` : source;
}
function createHistory(initial) {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  let items = [copy(initial)], index = 0;
  return {
    push(value) {
      items = items.slice(0, index + 1);
      items.push(copy(value));
      if (items.length > 100) items.shift();
      index = items.length - 1;
    },
    undo() {
      index = Math.max(0, index - 1);
      return copy(items[index]);
    },
    redo() {
      index = Math.min(items.length - 1, index + 1);
      return copy(items[index]);
    },
    get canUndo() {
      return index > 0;
    },
    get canRedo() {
      return index < items.length - 1;
    }
  };
}

// src/ui/editor-markup.js
var stepIcon = (plus = false) => `<svg class="ve-step-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12${plus ? "M12 6v12" : ""}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
var historyIcon = (redo = false) => `<svg class="ve-history-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"${redo ? ' style="transform:scaleX(-1)"' : ""}><path d="M4 10a8 8 0 1 1 2 9M4 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function editorMarkup() {
  return `<div class="visual-editor">
    <header class="ve-masthead"><span class="ve-brand">✦ <b>美化工作室</b><i>BEAUTIFY STUDIO</i></span><span class="ve-live"><i></i> 实时预览</span></header>
    <div class="ve-outline" hidden><span></span></div>
    <div class="ve-pick-hint" hidden>点一下头像或底部输入栏 <button data-action="cancel-pick">取消</button></div>
    <section class="ve-sheet" aria-label="可视化美化编辑器">
      <div class="ve-sheet-head"><div><span class="ve-eyebrow">MAKE IT YOURS / 01</span></div><button class="ve-icon" data-action="close" aria-label="关闭并放弃修改">×</button></div>
      <div class="ve-theme"><span class="ve-theme-icon">◈</span><div><small>正在编辑 · 当前美化</small><b class="ve-theme-name"></b></div><span class="ve-draft">草稿</span></div>
      <nav class="ve-tabs" aria-label="编辑内容"><button data-tab="parts" aria-pressed="true">按部位调整</button><button data-tab="notes" aria-pressed="false">作者说明 <span class="ve-note-count">0</span></button><button data-tab="changes" aria-pressed="false">修改记录</button></nav>
      <div class="ve-scroll">
        <div data-page="parts">
          <div class="ve-section-label"><span>01 / 选一个部位</span><button class="ve-text" data-action="pick">⌖ 去屏幕上点选</button></div>
          <div class="ve-targets"><button data-target="character" aria-pressed="true"><span>✧</span><b>角色头像</b><small>聊天里的 TA</small><i>↗</i></button><button data-target="user" aria-pressed="false"><span>◎</span><b>我的头像</b><small>聊天里的我</small><i>↗</i></button><button class="ve-composer-target" data-target="composer" aria-pressed="false"><span>▤</span><b>底部输入栏</b><small>上下位置 · 底部留白</small><i>↗</i></button></div>
          <p class="ve-scope">作用于全部角色消息 <button class="ve-text" data-action="locate">定位 ↗</button></p>
          <div class="ve-section-label"><span>02 / 想调整什么</span><span class="ve-dim">所见即所得</span></div>
          <div class="ve-properties"><button data-mode="position" aria-pressed="false">✥<span>位置</span></button><button data-mode="size" aria-pressed="false">↗<span>大小</span></button><button data-mode="radius" aria-pressed="true">▢<span>圆角</span></button><button data-mode="border" aria-pressed="false">◉<span>边框</span></button><button data-mode="lift" hidden>↕<span>上下位置</span></button><button data-mode="gap" hidden>▥<span>底部留白</span></button></div>
          <div class="ve-value-card"><div class="ve-value-title"><b class="ve-property-title">头像圆角</b><span class="ve-unit">PX</span></div><div class="ve-scalar"><button data-nudge="minus" aria-label="减小数值">${stepIcon()}</button><label><input class="ve-number" type="number" min="0" max="100" step="1" aria-label="当前数值"><span>px</span></label><button data-nudge="plus" aria-label="增大数值">${stepIcon(true)}</button></div><div class="ve-position-values" hidden><label>水平 X<input class="ve-x" type="number" min="-300" max="300" aria-label="水平偏移"></label><label>垂直 Y<input class="ve-y" type="number" min="-300" max="300" aria-label="垂直偏移"></label></div><input class="ve-range" type="range" min="0" max="100" aria-label="拖动调整数值"><label class="ve-color-row" hidden>边框颜色<input class="ve-color" type="color" value="#727c73" aria-label="边框颜色"></label><p class="ve-help">数值越大，头像的边角越圆。</p></div>
          <button class="ve-handheld" data-action="compact"><span>✥</span><div><b>打开微调手柄</b><small>收起面板，留更多空间看效果</small></div><span>↗</span></button>
          <div class="ve-coming"><span>接下来</span> 顶栏 · 消息气泡 <small>逐步开放</small></div>
        </div>
        <div data-page="notes" hidden><p class="ve-description">美化作者写在 CSS 里的小提示，都收在这里。</p><label class="ve-search"><span>⌕</span><input type="search" placeholder="搜索说明，比如：头像、颜色…" aria-label="搜索作者说明"></label><div class="ve-notes"></div></div>
        <div data-page="changes" hidden><p class="ve-description">每次调整都有迹可循。保存时写入当前美化。</p><div class="ve-changes"></div><button class="ve-reset-all" data-action="reset-all">还原全部调整</button></div>
      </div>
      <footer class="ve-footer"><div class="ve-feedback" role="status" aria-live="polite">试着把圆角加 1，看看头像的变化。</div><div class="ve-footer-actions"><button class="ve-icon" data-action="undo" aria-label="撤销">${historyIcon()}</button><button class="ve-icon" data-action="redo" aria-label="重做">${historyIcon(true)}</button><button class="ve-export" data-action="download">导出 JSON</button><button class="ve-save" data-action="save">保存当前美化</button></div><small>保存到原美化 · 未保存可关闭恢复</small></footer>
    </section>
    <section class="ve-controller" aria-label="微调手柄" hidden><div class="ve-controller-head"><span class="ve-grip" title="拖动手柄">⠿</span><b class="ve-controller-title">角色头像 · 圆角</b><button class="ve-text" data-action="expand">展开 ↗</button></div><div class="ve-mini-modes"><button data-mode="position">位置</button><button data-mode="size">大小</button><button data-mode="radius">圆角</button><button data-mode="border">边框</button><button data-mode="lift" hidden>上下位置</button><button data-mode="gap" hidden>底部留白</button></div><div class="ve-controller-body"><div class="ve-lift-buttons" hidden><button data-lift="up" aria-label="抬高底栏">↑ 抬高</button><button data-action="reset-mode" aria-label="还原底栏位置">◎</button><button data-lift="down" aria-label="降低底栏">↓ 降低</button></div><div class="ve-dpad"><button data-direction="up" aria-label="向上移动">↑</button><button data-direction="left" aria-label="向左移动">←</button><button data-action="reset-mode" aria-label="还原当前调整项">◎</button><button data-direction="right" aria-label="向右移动">→</button><button data-direction="down" aria-label="向下移动">↓</button></div><div class="ve-controller-scalar"><button data-nudge="minus" aria-label="手柄减小数值">${stepIcon()}</button><span><b class="ve-mini-value">6</b><small>px</small></span><button data-nudge="plus" aria-label="手柄增大数值">${stepIcon(true)}</button></div><div class="ve-controller-caption">圆角越大，边角越圆</div></div><div class="ve-controller-foot"><span>步长</span><button data-step="1" aria-pressed="true">1 px</button><button data-step="5" aria-pressed="false">5 px</button><button data-action="undo" aria-label="手柄撤销">${historyIcon()}</button><button class="ve-done" data-action="expand">完成</button></div><div class="ve-mini-status" role="status" aria-live="polite"></div></section>
  </div>`;
}

// src/host/visual-editor.js
function openVisualEditor({ hostWin, theme, onClose, onSave, onDownload }) {
  const doc = hostWin.document;
  const nativeStyle = doc.querySelector("#custom-style");
  if (!nativeStyle) throw new Error("没有找到当前美化的样式，请先在酒馆应用一款美化。");
  const original = nativeStyle.textContent;
  const previewStyle = doc.createElement("style");
  previewStyle.id = "beautify-visual-preview";
  doc.head.append(previewStyle);
  let draft = original;
  let state = { source: original, edits: {} };
  const history = createHistory(state);
  let targetKey = "character", mode = "radius", step = 1, compact = false, picking = false, destroyed = false, saving = false;
  let currentTarget, raf, heldTimer, heldInterval, heldButton = null, heldUntil = 0;
  const initialFocus = doc.activeElement;
  const host = doc.createElement("div");
  host.id = "beautify-visual-editor";
  host.style.cssText = "all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;";
  const root2 = host.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = studio_default;
  root2.append(style);
  const shell = doc.createElement("div");
  shell.innerHTML = editorMarkup();
  root2.append(shell);
  doc.body.append(host);
  const $ = (selector) => root2.querySelector(selector);
  const $$ = (selector) => [...root2.querySelectorAll(selector)];
  $(".ve-theme-name").textContent = theme.name;
  const baseline = {};
  const observer = new hostWin.MutationObserver(() => {
    if (nativeStyle.textContent !== original) {
      dispose(false);
      onClose("酒馆已切换或修改主题，微调预览已结束。");
    }
  });
  observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true });
  function writeCss(css) {
    draft = css;
    previewStyle.textContent = css.slice(original.length);
  }
  function visibleTarget(key) {
    const nodes = [...doc.querySelectorAll(TARGETS[key].selector)].filter((n) => n.getClientRects().length);
    return nodes.find((n) => {
      const r = n.getBoundingClientRect();
      return r.top > 50 && r.bottom < hostWin.innerHeight - 180;
    }) || nodes.at(-1);
  }
  function getBaseline(key) {
    if (baseline[key]) return baseline[key];
    const node = visibleTarget(key);
    if (!node) return null;
    const cs = hostWin.getComputedStyle(node), translation = cs.translate;
    const parts = translation === "none" || !translation ? ["0px", "0px"] : translation.split(/\s+/);
    const movable = hostWin.CSS.supports("translate", "1px 1px") && parts.length <= 2 && parts.every((p) => /^-?\d+(\.\d+)?px$/.test(p));
    const number = (value, fallback) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
    const rgb = cs.borderTopColor.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);
    const color = rgb ? "#" + rgb.slice(1, 4).map((value) => Number(value).toString(16).padStart(2, "0")).join("") : DEFAULT_VALUES.color;
    const radius = cs.borderTopLeftRadius.endsWith("%") ? number(cs.width, 48) * number(cs.borderTopLeftRadius, 0) / 100 : number(cs.borderTopLeftRadius, 0);
    let composerOrigin = {};
    if (key === "composer") {
      const probe = doc.createElement("span");
      probe.style.cssText = "all:initial!important;position:fixed!important;visibility:hidden!important;pointer-events:none!important;padding-bottom:var(--tt-inset-bottom, env(safe-area-inset-bottom, 0px))!important;";
      doc.body.append(probe);
      const inset = number(hostWin.getComputedStyle(probe).paddingBottom, 0);
      probe.remove();
      const paddingBottom = number(cs.paddingBottom, 0);
      const isTauri = Boolean(hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__);
      const safeAware = isTauri && (Math.abs(paddingBottom - inset) < 1 || /padding-bottom:\s*max\(0px,\s*calc\(var\(--tt-inset-bottom/.test(original));
      composerOrigin = { paddingBottom, safeAware, paddingAdjustment: paddingBottom - inset };
    }
    baseline[key] = {
      values: { ...DEFAULT_VALUES, size: Math.round(number(cs.width, 48)), radius: Math.round(radius), border: Math.round(number(cs.borderTopWidth, 0)), color },
      origin: { x: movable ? parseFloat(parts[0]) : 0, y: movable ? parseFloat(parts[1] || "0") : 0, ...composerOrigin },
      movable
    };
    return baseline[key];
  }
  function values() {
    return state.edits[targetKey]?.values || getBaseline(targetKey)?.values || DEFAULT_VALUES;
  }
  function feedback(text) {
    $(".ve-feedback").textContent = text;
    $(".ve-mini-status").textContent = text;
  }
  const meta = {
    position: { title: "位置", help: "箭头朝哪，头像就往哪挪；只移动外观，不挤动文字。" },
    size: { title: "大小", help: "宽高一起调整，头像保持正方形。", min: 16, max: 200 },
    radius: { title: "圆角", help: "数值越大，头像的边角越圆。", min: 0, max: 100 },
    border: { title: "边框", help: "调整边框粗细；设为 0 就是没有边框。", min: 0, max: 12 },
    lift: { title: "上下位置", help: "0 是原位置；正数抬高，负数降低。底栏仍跟随酒馆原有的键盘布局。", min: -120, max: 200 },
    gap: { title: "底部留白", help: "相对原留白调整：正数增加，负数减少，最少到 0；不会修改系统安全区。", min: -120, max: 200 }
  };
  function render() {
    const v = values(), info = meta[mode], available = Boolean(visibleTarget(targetKey));
    const composer = targetKey === "composer";
    $(".ve-properties").dataset.composer = String(composer);
    $(".ve-controller").dataset.composer = String(composer);
    $$("[data-mode]").forEach((el) => el.hidden = composer !== ["lift", "gap"].includes(el.dataset.mode));
    $(".ve-lift-buttons").hidden = mode !== "lift";
    $$("[data-target]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.target === targetKey)));
    $$("[data-mode]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.mode === mode)));
    $(".ve-scope").firstChild.textContent = `作用于${TARGETS[targetKey].scope} `;
    $(".ve-property-title").textContent = composer ? `底栏${info.title}` : `头像${info.title}`;
    $(".ve-controller-title").textContent = `${TARGETS[targetKey].name} · ${info.title}`;
    $(".ve-help").textContent = info.help;
    $(".ve-controller-caption").textContent = mode === "position" ? `X ${v.x} / Y ${v.y} px` : info.help;
    $(".ve-scalar").hidden = mode === "position";
    $(".ve-range").hidden = mode === "position";
    $(".ve-position-values").hidden = mode !== "position";
    $(".ve-color-row").hidden = mode !== "border";
    $(".ve-dpad").hidden = mode !== "position";
    $(".ve-controller-scalar").hidden = mode === "position";
    $(".ve-x").value = v.x;
    $(".ve-y").value = v.y;
    if (mode !== "position") {
      for (const el of [$(".ve-number"), $(".ve-range")]) {
        el.min = info.min;
        el.max = info.max;
        el.value = v[mode];
      }
      $(".ve-mini-value").textContent = v[mode];
    }
    $(".ve-color").value = v.color;
    $$('[data-action="undo"]').forEach((el) => el.disabled = !history.canUndo);
    $('[data-action="redo"]').disabled = !history.canRedo;
    $$("[data-nudge], [data-direction], [data-lift], .ve-number, .ve-range, .ve-x, .ve-y, .ve-color").forEach((el) => el.disabled = !available || ["position", "lift"].includes(mode) && !getBaseline(targetKey)?.movable);
    $('[data-action="save"]').disabled = !history.canUndo || saving;
    $('[data-action="download"]').disabled = !history.canUndo || saving;
    $('[data-action="reset-all"]').disabled = !history.canUndo;
    $(".ve-draft").textContent = history.canUndo ? "未保存" : "草稿";
    renderChanges();
  }
  function updateOutline() {
    if (destroyed) return;
    if (!currentTarget?.isConnected || !currentTarget.getClientRects().length) {
      const nextTarget = visibleTarget(targetKey);
      if (nextTarget !== currentTarget) {
        currentTarget = nextTarget;
        render();
      }
    }
    const outline = $(".ve-outline");
    if (currentTarget) {
      const r = currentTarget.getBoundingClientRect();
      outline.hidden = r.bottom < 45 || r.top > hostWin.innerHeight;
      outline.style.cssText = `left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;`;
      outline.querySelector("span").textContent = TARGETS[targetKey].name;
    } else outline.hidden = true;
    raf = hostWin.requestAnimationFrame(updateOutline);
  }
  function locate(scroll = true) {
    currentTarget = visibleTarget(targetKey);
    if (!currentTarget) {
      feedback(`当前画面没有${TARGETS[targetKey].name}，请打开一段含这类消息的聊天。`);
      return;
    }
    if (scroll && targetKey !== "composer") currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
    getBaseline(targetKey);
    render();
  }
  function commit(next, label, group = mode) {
    if (!getBaseline(targetKey)) return;
    if (["position", "lift"].includes(group) && !getBaseline(targetKey).movable) return;
    state.edits[targetKey] = { values: next, origin: getBaseline(targetKey).origin, changed: [.../* @__PURE__ */ new Set([...state.edits[targetKey]?.changed || [], group])] };
    history.push(state);
    writeCss(buildEditedCss(state.source, state.edits));
    render();
    feedback(label);
    hostWin.requestAnimationFrame(() => {
      if (destroyed || !currentTarget) return;
      const cs = hostWin.getComputedStyle(currentTarget);
      const origin = getBaseline(targetKey).origin;
      const expected = mode === "size" ? [cs.width, next.size] : mode === "radius" ? [cs.borderTopLeftRadius, next.radius] : mode === "border" ? [cs.borderTopWidth, next.border] : mode === "lift" ? [cs.translate.split(/\s+/)[1] || "0", origin.y - next.lift] : mode === "gap" ? [cs.paddingBottom, Math.max(0, origin.paddingBottom + next.gap)] : null;
      if (expected && Math.abs(parseFloat(expected[0]) - expected[1]) > 1) feedback("有其他样式影响了效果；可撤销本次调整并查看作者说明。");
    });
  }
  function nudge(delta) {
    const v = stepValue(values(), mode, delta * step);
    commit(v, `${TARGETS[targetKey].name}${meta[mode].title}已调整为 ${v[mode]} px`);
  }
  function move(direction) {
    if (!getBaseline(targetKey)?.movable) {
      feedback("原美化使用了复杂位移，这一版暂不调整位置。");
      return;
    }
    const property = ["left", "right"].includes(direction) ? "x" : "y";
    const delta = ["left", "up"].includes(direction) ? -step : step;
    const v = stepValue(values(), property, delta);
    commit(v, `水平 ${v.x} px · 垂直 ${v.y} px`, "position");
  }
  function setCompact(value) {
    compact = value;
    $(".ve-sheet").hidden = value;
    $(".ve-controller").hidden = !value;
    if (!value) $(".ve-controller").style.cssText = "";
    render();
  }
  function stopPick() {
    picking = false;
    $(".ve-pick-hint").hidden = true;
    $(".ve-controller").hidden = !compact;
    $(".ve-sheet").hidden = compact;
  }
  function pick(event) {
    if (!picking || event.composedPath().includes(host)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const avatar = event.target.closest?.("#chat .mes .avatar");
    const composer = event.target.closest?.("#form_sheld");
    if (!avatar && !composer) {
      feedback("请点聊天头像或底部输入栏。");
      return;
    }
    targetKey = composer ? "composer" : avatar.closest(".mes").getAttribute("is_user") === "true" ? "user" : "character";
    mode = composer ? "lift" : "radius";
    $(".ve-controller").style.cssText = "";
    currentTarget = composer || avatar;
    getBaseline(targetKey);
    compact = true;
    stopPick();
    render();
    feedback(`已选中${TARGETS[targetKey].name}，调整作用于${TARGETS[targetKey].scope}。`);
  }
  function renderNotes(query = "") {
    const container = $(".ve-notes");
    container.replaceChildren();
    let notes;
    try {
      notes = parseSource(state.source);
    } catch {
      notes = [];
      feedback("原 CSS 有语法问题；作者说明暂时无法解析，部位微调仍可使用。");
    }
    $(".ve-note-count").textContent = notes.length;
    const filtered = notes.filter((note) => (note.text + note.selector).toLowerCase().includes(query.toLowerCase()));
    for (const note of filtered) {
      const card = doc.createElement("article");
      card.className = "ve-note";
      const line = doc.createElement("small");
      line.textContent = `作者原文 / 第 ${note.line} 行`;
      const title = doc.createElement("p");
      title.textContent = note.text;
      card.append(line, title);
      if (note.code) {
        const details = doc.createElement("details"), summary = doc.createElement("summary"), code = doc.createElement("pre");
        summary.textContent = "查看附近代码";
        code.textContent = note.code;
        details.append(summary, code);
        card.append(details);
      }
      if (note.selector && /avatar/.test(note.selector)) {
        const button = doc.createElement("button");
        button.className = "ve-text";
        button.textContent = "去调整头像 ↗";
        button.addEventListener("click", () => {
          if (/is_user\s*=\s*["']?true/.test(note.selector)) targetKey = "user";
          else if (/is_user\s*=\s*["']?false/.test(note.selector)) targetKey = "character";
          else if (targetKey === "composer") targetKey = "character";
          if (["lift", "gap"].includes(mode)) mode = "radius";
          setPage("parts");
          locate();
        });
        card.append(button);
      }
      container.append(card);
    }
    if (!filtered.length) {
      const empty = doc.createElement("p");
      empty.className = "ve-empty";
      empty.textContent = notes.length ? "没有找到相关说明。" : "这款美化没有保留下来的 CSS 注释。你仍然可以按部位调整。";
      container.append(empty);
    }
  }
  function renderChanges() {
    const container = $(".ve-changes");
    container.replaceChildren();
    for (const [key, edit] of Object.entries(state.edits)) for (const item of edit.changed) {
      const row = doc.createElement("div");
      row.className = "ve-change";
      const label = doc.createElement("span"), value = doc.createElement("b");
      label.textContent = `${TARGETS[key].name} · ${meta[item].title}`;
      const prev = baseline[key]?.values || DEFAULT_VALUES;
      value.textContent = item === "position" ? `X ${edit.values.x} / Y ${edit.values.y} px` : `${prev[item]} → ${edit.values[item]} px`;
      row.append(label, value);
      container.append(row);
    }
    if (!container.childNodes.length) {
      const empty = doc.createElement("p");
      empty.className = "ve-empty";
      empty.textContent = "还没有修改，先去给头像换个圆角吧。";
      container.append(empty);
    }
  }
  function setPage(page) {
    $$("[data-page]").forEach((el) => el.hidden = el.dataset.page !== page);
    $$("[data-tab]").forEach((el) => el.setAttribute("aria-pressed", String(el.dataset.tab === page)));
  }
  function restoreHistory(next, message) {
    state = next;
    writeCss(buildEditedCss(state.source, state.edits));
    render();
    feedback(message);
  }
  function makeTheme() {
    return { ...JSON.parse(JSON.stringify(theme)), custom_css: draft, name: theme.name };
  }
  function endHold() {
    hostWin.clearTimeout(heldTimer);
    hostWin.clearInterval(heldInterval);
  }
  async function action(name) {
    if (saving) return;
    if (name === "undo") return restoreHistory(history.undo(), "已撤销上一次调整。");
    if (name === "redo") return restoreHistory(history.redo(), "已重做。");
    if (name === "compact") return setCompact(true);
    if (name === "expand") return setCompact(false);
    if (name === "locate") return locate();
    if (name === "pick") {
      picking = true;
      $(".ve-sheet").hidden = true;
      $(".ve-controller").hidden = true;
      $(".ve-pick-hint").hidden = false;
      return;
    }
    if (name === "cancel-pick") return stopPick();
    if (name === "close") {
      dispose(true);
      onClose("已关闭微调，恢复原美化。");
      return;
    }
    if (name === "reset-all") {
      history.push({ source: original, edits: {} });
      return restoreHistory({ source: original, edits: {} }, "已还原全部调整，可撤销。");
    }
    if (name === "reset-mode") {
      if (!state.edits[targetKey]) return;
      state.edits[targetKey].changed = state.edits[targetKey].changed.filter((item) => item !== mode);
      const initial = getBaseline(targetKey).values;
      for (const key of mode === "position" ? ["x", "y"] : mode === "border" ? ["border", "color"] : [mode]) state.edits[targetKey].values[key] = initial[key];
      history.push(state);
      return restoreHistory(state, "已还原当前调整项。");
    }
    if (name === "download") {
      onDownload(makeTheme());
      feedback("已导出主题 JSON，当前仍可继续编辑。");
      return;
    }
    if (name === "save") {
      const result = makeTheme();
      saving = true;
      endHold();
      render();
      feedback("正在保存到当前美化…");
      observer.disconnect();
      previewStyle.textContent = "";
      host.style.setProperty("display", "none", "important");
      try {
        await onSave(result, original);
        dispose(false);
        onClose(`已保存到当前美化「${result.name}」。`);
      } catch (error) {
        saving = false;
        host.style.removeProperty("display");
        if (nativeStyle.textContent === original) {
          writeCss(draft);
          observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true });
        } else {
          dispose(false);
          onClose(`保存未核实：${error.message}。请在美化库检查原美化。`);
          return;
        }
        render();
        feedback(`保存失败：${error.message}；可以导出 JSON。`);
      }
    }
  }
  root2.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled || saving) return;
    if (button.dataset.action) {
      void action(button.dataset.action);
      return;
    }
    if (button.dataset.target) {
      targetKey = button.dataset.target;
      mode = targetKey === "composer" ? "lift" : ["lift", "gap"].includes(mode) ? "radius" : mode;
      locate();
      render();
      feedback(`已选中${TARGETS[targetKey].name}。`);
    }
    if (button.dataset.mode) {
      mode = button.dataset.mode;
      render();
    }
    if (button.dataset.tab) setPage(button.dataset.tab);
    if (button.dataset.step) {
      step = Number(button.dataset.step);
      $$("[data-step]").forEach((el) => el.setAttribute("aria-pressed", String(Number(el.dataset.step) === step)));
    }
    if (button === heldButton && Date.now() < heldUntil) {
      heldButton = null;
      return;
    }
    if (button.dataset.nudge) nudge(button.dataset.nudge === "plus" ? 1 : -1);
    if (button.dataset.lift) nudge(button.dataset.lift === "up" ? 1 : -1);
    if (button.dataset.direction) move(button.dataset.direction);
  });
  root2.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("[data-nudge], [data-direction], [data-lift]");
    if (!button || button.disabled) return;
    heldButton = null;
    endHold();
    heldTimer = hostWin.setTimeout(() => {
      heldButton = button;
      const repeat = () => {
        heldUntil = Date.now() + 600;
        button.dataset.lift ? nudge(button.dataset.lift === "up" ? 1 : -1) : button.dataset.nudge ? nudge(button.dataset.nudge === "plus" ? 1 : -1) : move(button.dataset.direction);
      };
      repeat();
      heldInterval = hostWin.setInterval(repeat, 100);
    }, 380);
  });
  hostWin.addEventListener("pointerup", endHold);
  hostWin.addEventListener("pointercancel", endHold);
  hostWin.addEventListener("blur", endHold);
  $(".ve-number").addEventListener("change", (event) => {
    const number = Number(event.target.value);
    if (!Number.isFinite(number) || event.target.value === "") return render();
    const v = stepValue(values(), mode, number - values()[mode]);
    commit(v, `已设置为 ${v[mode]} px`);
  });
  $(".ve-range").addEventListener("input", (event) => {
    const v = { ...values(), [mode]: Number(event.target.value) };
    commit(v, `已设置为 ${v[mode]} px`);
  });
  for (const key of ["x", "y"]) $(`.ve-${key}`).addEventListener("change", (event) => {
    if (!Number.isFinite(Number(event.target.value))) return render();
    commit(stepValue(values(), key, Number(event.target.value) - values()[key]), "已更新头像位置。", "position");
  });
  $(".ve-color").addEventListener("input", (event) => commit({ ...values(), color: event.target.value }, "已更新边框颜色。", "border"));
  $(".ve-search input").addEventListener("input", (event) => renderNotes(event.target.value));
  let drag;
  $(".ve-grip").addEventListener("pointerdown", (event) => {
    const r = $(".ve-controller").getBoundingClientRect();
    drag = { dx: event.clientX - r.left, dy: event.clientY - r.top };
    event.target.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  $(".ve-grip").addEventListener("pointermove", (event) => {
    if (!drag) return;
    const pad = $(".ve-controller");
    pad.style.left = `${Math.max(8, Math.min(hostWin.innerWidth - pad.offsetWidth - 8, event.clientX - drag.dx))}px`;
    pad.style.top = `${Math.max(45, Math.min(hostWin.innerHeight - pad.offsetHeight - 8, event.clientY - drag.dy))}px`;
    pad.style.bottom = "auto";
    pad.style.right = "auto";
  });
  $(".ve-grip").addEventListener("pointerup", () => drag = null);
  $(".ve-grip").addEventListener("pointercancel", () => drag = null);
  function keyboard(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (picking) stopPick();
      else if (compact) setCompact(false);
      else void action("close");
    }
    if (event.target.matches("input,textarea")) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      void action(event.shiftKey ? "redo" : "undo");
    }
    if (compact && mode === "position" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      move(event.key.slice(5).toLowerCase());
    }
    if (compact && mode === "lift" && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      nudge(event.key === "ArrowUp" ? 1 : -1);
    }
  }
  root2.addEventListener("keydown", keyboard);
  const themeSelect = doc.querySelector("#themes");
  function themeChanged() {
    if (!saving) {
      dispose(true);
      onClose("已切换主题，微调预览已结束。");
    }
  }
  themeSelect?.addEventListener("change", themeChanged);
  doc.addEventListener("click", pick, true);
  function blockPickFocus(event) {
    if (picking && !event.composedPath().includes(host)) event.preventDefault();
  }
  doc.addEventListener("pointerdown", blockPickFocus, true);
  function dispose() {
    if (destroyed) return;
    destroyed = true;
    endHold();
    observer.disconnect();
    hostWin.cancelAnimationFrame(raf);
    previewStyle.remove();
    doc.removeEventListener("click", pick, true);
    themeSelect?.removeEventListener("change", themeChanged);
    doc.removeEventListener("pointerdown", blockPickFocus, true);
    hostWin.removeEventListener("pointerup", endHold);
    hostWin.removeEventListener("pointercancel", endHold);
    hostWin.removeEventListener("blur", endHold);
    host.remove();
    initialFocus?.focus?.();
  }
  renderNotes();
  locate(false);
  render();
  updateOutline();
  $('[data-action="close"]').focus({ preventScroll: true });
  return () => dispose(true);
}

// src/main.js
var closeVisualEditor = null;
var selectedTheme = null;
var selectedFileName = "";
var panelHost = null;
var previousFocus = null;
var busy = false;
var wandRegistrations = [];
var runtimeInteractionRegistrations = [];
function resolveHostWindow() {
  const candidates = [];
  for (const candidate of [window.parent, window.top, window]) {
    if (!candidate || candidates.includes(candidate)) continue;
    candidates.push(candidate);
  }
  for (const candidate of candidates) {
    try {
      const doc = candidate.document;
      if (doc?.querySelector?.("#sheld, #chat, #extensions_settings2, #extensions_settings")) {
        return candidate;
      }
    } catch (_) {
    }
  }
  return window.parent || window;
}
function collectRuntimeDocuments() {
  const documents = [];
  let current = window;
  for (let depth = 0; depth < 8; depth += 1) {
    try {
      if (current.document && !documents.includes(current.document)) documents.push(current.document);
      if (!current.parent || current.parent === current) break;
      void current.parent.document;
      current = current.parent;
    } catch (_) {
      break;
    }
  }
  return documents.length ? documents : [document];
}
function getHostDocument() {
  try {
    return resolveHostWindow().document;
  } catch (_) {
    return document;
  }
}
function isTauriTavern(hostWin = resolveHostWindow()) {
  try {
    return Boolean(
      hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__ || hostWin.document?.getElementById?.("ttas_agent_send_toggle") || /Tauri/i.test(hostWin.navigator?.userAgent || "")
    );
  } catch (_) {
    return false;
  }
}
function loadOptions() {
  try {
    const hostWin = resolveHostWindow();
    const stored = JSON.parse(hostWin.localStorage?.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(Object.entries(DEFAULT_OPTIONS).map(([key, fallback]) => [key, typeof stored[key] === "boolean" ? stored[key] : fallback]));
  } catch (error) {
    console.warn("[BeautifyStudio] 无法读取设置，使用默认值。", error);
    return { ...DEFAULT_OPTIONS };
  }
}
var options = loadOptions();
function saveOptions() {
  try {
    resolveHostWindow().localStorage?.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (error) {
    console.warn("[BeautifyStudio] 无法保存设置。", error);
  }
}
function buildRuntimePreferenceCss(settings = {}) {
  const rules = [
    `/* 美化工作室 v${VERSION}: runtime preferences only; TT keeps ownership of layout. */`
  ];
  if (settings.hideImpersonate) {
    rules.push("html body #mes_impersonate#mes_impersonate { display: none !important; }");
  }
  return rules.join("\n");
}
function applyRuntimeCompatibility() {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  if (!doc?.head) return;
  doc.documentElement?.classList?.toggle?.(TAURI_ROOT_CLASS, isTauriTavern(hostWin));
  let style = doc.getElementById(RUNTIME_STYLE_ID);
  if (!style) {
    style = doc.createElement("style");
    style.id = RUNTIME_STYLE_ID;
    doc.head.appendChild(style);
  }
  const nextCss = buildRuntimePreferenceCss(options);
  if (style.textContent !== nextCss) style.textContent = nextCss;
}
function findComposerShell(doc, target) {
  try {
    const closest = target?.closest?.("#form_sheld");
    if (closest) return closest;
    const shell = doc?.getElementById?.("form_sheld");
    return shell?.contains?.(target) ? shell : null;
  } catch (_) {
    return null;
  }
}
function startComposerInteractions() {
  for (const doc of collectRuntimeDocuments()) {
    if (typeof doc?.addEventListener !== "function") continue;
    const open = (shell) => {
      for (const other of doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
        if (other !== shell) other.classList?.remove?.(COMPOSER_OPEN_CLASS);
      }
      shell?.classList?.add?.(COMPOSER_OPEN_CLASS);
    };
    const close = () => {
      for (const shell of doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
        shell.classList?.remove?.(COMPOSER_OPEN_CLASS);
      }
    };
    const onPress = (event) => {
      const shell = findComposerShell(doc, event?.target);
      if (shell) open(shell);
      else close();
    };
    const onFocusIn = (event) => {
      const shell = findComposerShell(doc, event?.target);
      if (shell) open(shell);
    };
    doc.addEventListener("pointerdown", onPress, true);
    doc.addEventListener("touchstart", onPress, true);
    doc.addEventListener("focusin", onFocusIn, true);
    runtimeInteractionRegistrations.push({ doc, onPress, onFocusIn });
  }
}
function notify(kind, message, title = "美化工作室") {
  try {
    const toast = resolveHostWindow().toastr;
    if (typeof toast?.[kind] === "function") toast[kind](message, title);
  } catch (_) {
  }
}
function getThemeSelect(doc = getHostDocument()) {
  return doc?.getElementById?.("themes") || null;
}
function getUniqueThemeName(baseName) {
  const select = getThemeSelect();
  if (!select?.options) return baseName;
  const names = new Set(Array.from(select.options, (option) => String(option.value || option.textContent || "")));
  if (!names.has(baseName)) return baseName;
  let index = 2;
  while (names.has(`${baseName} (${index})`)) index += 1;
  return `${baseName} (${index})`;
}
function makeAdaptedTheme() {
  if (!selectedTheme) throw new Error("请先选择一个美化 JSON。");
  const adapted = adaptTheme(selectedTheme, options);
  adapted.name = getUniqueThemeName(adapted.name);
  return adapted;
}
function safeFileName(name) {
  return String(name || "TT适配主题").replace(/[\\/:*?"<>|]/g, "_").trim() || "TT适配主题";
}
function createThemeFile(theme) {
  const hostWin = resolveHostWindow();
  return new hostWin.File(
    [JSON.stringify(theme, null, 4)],
    `${safeFileName(theme.name)}.json`,
    { type: "application/json" }
  );
}
function readFileText(file) {
  if (typeof file?.text === "function") return file.text();
  const hostWin = resolveHostWindow();
  return new Promise((resolve, reject) => {
    const reader = new hostWin.FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("读取文件失败。"));
    reader.readAsText(file);
  });
}
function downloadTheme(theme) {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  const file = createThemeFile(theme);
  const url = hostWin.URL.createObjectURL(file);
  const anchor = doc.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.style.cssText = "display:none!important";
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2e3);
}
function delayInHost(hostWin, milliseconds) {
  return new Promise((resolve) => hostWin.setTimeout(resolve, milliseconds));
}
async function waitForHostCondition(hostWin, predicate, timeout = 1e4, interval = 100) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const value = predicate();
    if (value) return value;
    await delayInHost(hostWin, interval);
  }
  throw new Error("等待酒馆完成主题操作超时。");
}
function assignFileToNativeInput(hostWin, input, file) {
  if (typeof hostWin.DataTransfer === "function") {
    const transfer = new hostWin.DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    return;
  }
  Object.defineProperty(input, "files", {
    configurable: true,
    value: Object.freeze([file])
  });
}
async function importAndApplyTheme(theme) {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  const nativeInput = doc.getElementById("ui_preset_import_file");
  const themeSelect = getThemeSelect(doc);
  if (!nativeInput || !themeSelect) {
    throw new Error("没有找到酒馆原生主题导入控件，请打开一次“用户设置 → UI主题”后重试。");
  }
  const file = createThemeFile(theme);
  assignFileToNativeInput(hostWin, nativeInput, file);
  const EventCtor = hostWin.Event || Event;
  nativeInput.dispatchEvent(new EventCtor("change", { bubbles: true }));
  await waitForHostCondition(hostWin, () => Array.from(themeSelect.options || []).some((option) => String(option.value || option.textContent || "") === theme.name), 12e4);
  themeSelect.value = theme.name;
  const hostJquery = hostWin.jQuery || hostWin.$;
  if (typeof hostJquery === "function") {
    hostJquery(themeSelect).val(theme.name).trigger("change");
  } else {
    themeSelect.dispatchEvent(new EventCtor("change", { bubbles: true }));
  }
  await waitForHostCondition(hostWin, () => {
    const selected = String(themeSelect.value || "");
    const css = String(doc.getElementById("custom-style")?.textContent || "");
    return selected === theme.name && css === theme.custom_css;
  });
  await delayInHost(hostWin, 1400);
  if (String(themeSelect.value || "") !== theme.name) {
    throw new Error("主题导入后未保持选中，请重试。");
  }
  return theme;
}
function setPanelStatus(root2, text, kind = "info") {
  const status = root2.querySelector(".status");
  if (!status) return;
  status.textContent = text;
  status.dataset.kind = kind;
}
function setPanelActions(root2, enabled) {
  for (const button of root2.querySelectorAll(".needs-theme")) button.disabled = !enabled || busy;
  for (const control of root2.querySelectorAll(".theme-card, [data-source], [data-option], .choose, .refresh")) control.disabled = busy;
  root2.querySelector(".inject-original").disabled = busy || !enabled || selectedFileName !== "酒馆内的美化";
  root2.querySelector(".batch-delete").disabled = busy;
  if (!getThemeSelect() || !getHostDocument().getElementById("ui_preset_import_file")) root2.querySelector(".import-apply").disabled = true;
}
function renderRisks(root2, risks) {
  const report = root2.querySelector(".report");
  if (!report) return;
  report.replaceChildren();
  root2.querySelector(".check-count").textContent = risks.length ? `${risks.length} 项建议` : "检查完成";
  const list2 = risks.length ? risks : [{
    level: "ok",
    label: "没有发现常见冲突",
    detail: "仍会写入通用 TT 兼容层，导入后请实际查看一次。",
    count: 0
  }];
  for (const risk of list2) {
    const item = getHostDocument().createElement("div");
    item.className = "risk";
    item.dataset.level = risk.level;
    const title = getHostDocument().createElement("b");
    title.textContent = risk.count ? `${risk.label} × ${risk.count}` : risk.label;
    const detail = getHostDocument().createElement("span");
    detail.textContent = risk.detail;
    item.append(title, detail);
    report.appendChild(item);
  }
}
function syncPanelFromState(root2) {
  for (const input of root2.querySelectorAll("[data-option]")) {
    input.checked = Boolean(options[input.dataset.option]);
  }
  const filename = root2.querySelector(".filename");
  if (filename) {
    filename.textContent = selectedTheme ? selectedTheme.name : "还没有选择美化";
    filename.title = selectedFileName;
  }
  setPanelActions(root2, Boolean(selectedTheme));
  if (selectedTheme) renderRisks(root2, analyzeCss(selectedTheme.custom_css));
}
function closePanel() {
  if (busy) return;
  try {
    panelHost?.remove();
  } catch (_) {
  }
  panelHost = null;
  previousFocus?.focus?.();
}
async function handleSelectedFile(root2, file) {
  if (!file || busy) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error("文件超过 10 MB，请选择较小的 UI 美化文件。");
    const parsed = JSON.parse(await readFileText(file));
    validateTheme(parsed);
    selectedTheme = parsed;
    selectedFileName = file.name || "";
    for (const card of root2.querySelectorAll(".theme-card")) card.setAttribute("aria-pressed", "false");
    syncPanelFromState(root2);
    renderRisks(root2, analyzeCss(parsed.custom_css));
    const cssLength = typeof parsed.custom_css === "string" ? parsed.custom_css.length : 0;
    setPanelStatus(root2, `已读取：${parsed.name}（自定义 CSS ${cssLength.toLocaleString()} 字符）`, "success");
  } catch (error) {
    selectedTheme = null;
    selectedFileName = "";
    syncPanelFromState(root2);
    renderRisks(root2, [{ level: "high", label: "读取失败", detail: String(error?.message || error), count: 0 }]);
    setPanelStatus(root2, `读取失败：${error?.message || error}`, "error");
  }
}
function showSource(root2, source) {
  for (const tab of root2.querySelectorAll("[data-source]")) {
    const active = tab.dataset.source === source;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    root2.querySelector(`#source-${tab.dataset.source}`).hidden = !active;
  }
}
async function refreshLibrary(root2) {
  const library = root2.querySelector(".library");
  const refresh = root2.querySelector(".refresh");
  refresh.disabled = true;
  root2.querySelector(".library-count").textContent = "正在读取美化…";
  library.setAttribute("aria-busy", "true");
  library.replaceChildren();
  try {
    const themes = await readInstalledThemes(resolveHostWindow());
    root2.querySelector(".library-count").textContent = `${themes.length} 款已导入的美化`;
    if (!themes.length) throw new Error("酒馆还没有已导入的美化，可以先上传一个 JSON。");
    root2.__installedThemes = themes;
    renderThemeCards(root2, themes);
  } catch (error) {
    root2.querySelector(".library-count").textContent = "暂无可用美化";
    const empty = getHostDocument().createElement("div");
    empty.className = "library-empty";
    const heading = getHostDocument().createElement("strong");
    heading.textContent = "从你喜欢的美化开始";
    const detail = getHostDocument().createElement("span");
    detail.textContent = error.name === "AbortError" ? "读取超时，请刷新列表或上传 JSON。" : error.message;
    empty.append(heading, detail);
    library.append(empty);
  } finally {
    refresh.disabled = busy;
    library.removeAttribute("aria-busy");
  }
}
function safeColor(theme, keys, fallback) {
  const css = resolveHostWindow().CSS;
  for (const key of keys) {
    const value = String(theme?.[key] || "").trim();
    if (value && css?.supports?.("color", value)) return value;
  }
  return fallback;
}
function createThemeThumbnail(theme) {
  const thumbnail = getHostDocument().createElement("div");
  thumbnail.className = "theme-thumbnail";
  thumbnail.setAttribute("aria-hidden", "true");
  thumbnail.style.setProperty("--theme-bg", safeColor(theme, ["chat_tint_color", "blur_tint_color"], "#d5d7d8"));
  thumbnail.style.setProperty("--theme-text", safeColor(theme, ["main_text_color"], "#373a3c"));
  thumbnail.style.setProperty("--theme-user", safeColor(theme, ["user_mes_blur_tint_color", "blur_tint_color"], "#aeb4b8"));
  thumbnail.style.setProperty("--theme-bot", safeColor(theme, ["bot_mes_blur_tint_color", "blur_tint_color"], "#f0f1f1"));
  thumbnail.innerHTML = '<span class="preview-topbar"></span><span class="preview-avatar"></span><span class="preview-message preview-message-user"></span><span class="preview-message preview-message-bot"></span><span class="preview-composer"></span>';
  return thumbnail;
}
function renderThemeCards(root2, themes) {
  const library = root2.querySelector(".library");
  root2.__visibleThemes = themes;
  library.replaceChildren();
  if (!themes.length) {
    const empty = getHostDocument().createElement("div");
    empty.className = "library-empty";
    empty.textContent = "没有找到对应美化";
    library.append(empty);
    return;
  }
  for (const theme of themes) {
    const button = getHostDocument().createElement("button");
    button.type = "button";
    button.className = "theme-card";
    button.title = theme.name;
    button.setAttribute("aria-pressed", String(selectedFileName === "酒馆内的美化" && selectedTheme?.name === theme.name));
    const name = getHostDocument().createElement("span");
    name.className = "theme-name";
    name.textContent = theme.name;
    button.append(createThemeThumbnail(theme), name);
    button.addEventListener("click", () => {
      if (busy) return;
      selectedTheme = JSON.parse(JSON.stringify(theme));
      selectedFileName = "酒馆内的美化";
      for (const card of library.querySelectorAll(".theme-card")) card.setAttribute("aria-pressed", String(card === button));
      syncPanelFromState(root2);
      setPanelStatus(root2, `已选择「${theme.name}」。可以生成副本，或直接注入所选原美化。`, "success");
    });
    library.append(button);
  }
}
function openPanel(preferredDocument = null) {
  const preferredIsDocument = Boolean(preferredDocument?.createElement && preferredDocument?.body);
  const doc = preferredIsDocument ? preferredDocument : getHostDocument();
  const hostWin = doc?.defaultView || resolveHostWindow();
  if (!doc?.body) return;
  const existing = doc.getElementById(OVERLAY_HOST_ID);
  if (existing) {
    existing.style.setProperty("display", "block", "important");
    panelHost = existing;
    return;
  }
  const host = doc.createElement("div");
  host.id = OVERLAY_HOST_ID;
  host.style.cssText = "position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;";
  const root2 = host.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = studio_default;
  root2.appendChild(style);
  const shell = doc.createElement("div");
  shell.innerHTML = panelMarkup(isTauriTavern(hostWin));
  while (shell.firstChild) root2.appendChild(shell.firstChild);
  doc.body.appendChild(host);
  panelHost = host;
  previousFocus = doc.activeElement;
  syncPanelFromState(root2);
  if (selectedTheme) setPanelStatus(root2, `已选择「${selectedTheme.name}」，可以继续调整或生成适配副本。`);
  if (selectedFileName && selectedFileName !== "酒馆内的美化") showSource(root2, "upload");
  refreshLibrary(root2);
  root2.querySelector(".visual-edit")?.addEventListener("click", async () => {
    if (busy || closeVisualEditor) return;
    busy = true;
    try {
      const themes = await readInstalledThemes(hostWin);
      const activeName = getThemeSelect(doc)?.value;
      const theme = themes.find((item) => item.name === activeName);
      if (!theme) throw new Error("请先在酒馆应用并保存一款美化，再开始可视化微调。");
      host.style.setProperty("display", "none", "important");
      closeVisualEditor = openVisualEditor({
        hostWin,
        theme,
        onDownload: downloadTheme,
        onSave: (edited, originalCss) => updateActiveThemeCss(hostWin, edited, originalCss),
        onClose: (message) => {
          closeVisualEditor = null;
          host.style.setProperty("display", "block", "important");
          setPanelStatus(root2, message);
          refreshLibrary(root2);
        }
      });
    } catch (error) {
      host.style.setProperty("display", "block", "important");
      setPanelStatus(root2, error.message, "error");
    } finally {
      busy = false;
    }
  });
  for (const tab of root2.querySelectorAll("[data-source]")) {
    tab.addEventListener("click", () => showSource(root2, tab.dataset.source));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const source = event.key === "Home" ? "installed" : event.key === "End" ? "upload" : tab.dataset.source === "installed" ? "upload" : "installed";
      showSource(root2, source);
      root2.querySelector(`[data-source="${source}"]`).focus();
    });
  }
  root2.querySelector(".refresh").addEventListener("click", () => refreshLibrary(root2));
  const bulkModal = root2.querySelector(".bulk-modal");
  const bulkList = root2.querySelector(".bulk-list");
  const bulkSearch = root2.querySelector(".bulk-search-input");
  const bulkCount = root2.querySelector(".bulk-selected-count");
  const closeBulk = () => {
    bulkModal.hidden = true;
  };
  const renderBulkList = () => {
    const query = bulkSearch.value.trim().toLocaleLowerCase();
    const themes = (root2.__installedThemes || []).filter((theme) => theme.name.toLocaleLowerCase().includes(query));
    bulkList.replaceChildren();
    for (const theme of themes) {
      const row = getHostDocument().createElement("label");
      row.className = "bulk-row";
      const checkbox = getHostDocument().createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = theme.name;
      checkbox.checked = root2.__bulkSelected?.has(theme.name) || false;
      checkbox.addEventListener("change", () => {
        root2.__bulkSelected ||= /* @__PURE__ */ new Set();
        checkbox.checked ? root2.__bulkSelected.add(theme.name) : root2.__bulkSelected.delete(theme.name);
        updateBulkCount();
      });
      const name = getHostDocument().createElement("span");
      name.textContent = theme.name;
      row.append(checkbox, name);
      bulkList.append(row);
    }
    if (!themes.length) {
      const empty = getHostDocument().createElement("p");
      empty.className = "bulk-empty";
      empty.textContent = "没有找到美化";
      bulkList.append(empty);
    }
    updateBulkCount();
  };
  const updateBulkCount = () => {
    const count = root2.__bulkSelected?.size || 0;
    bulkCount.textContent = `已选 ${count} 款`;
    root2.querySelector(".bulk-confirm-delete").disabled = !count || busy;
  };
  root2.querySelector(".batch-delete").addEventListener("click", () => {
    if (busy) return;
    root2.__bulkSelected = /* @__PURE__ */ new Set();
    bulkSearch.value = "";
    bulkModal.hidden = false;
    renderBulkList();
  });
  root2.querySelector(".bulk-close").addEventListener("click", closeBulk);
  root2.querySelector(".bulk-cancel").addEventListener("click", closeBulk);
  root2.querySelector(".bulk-search-input").addEventListener("input", renderBulkList);
  root2.querySelector(".bulk-select-all").addEventListener("click", () => {
    root2.__bulkSelected ||= /* @__PURE__ */ new Set();
    const visible = [...bulkList.querySelectorAll("input")];
    const all = visible.length && visible.every((input2) => input2.checked);
    visible.forEach((input2) => {
      input2.checked = !all;
      input2.checked ? root2.__bulkSelected.add(input2.value) : root2.__bulkSelected.delete(input2.value);
    });
    updateBulkCount();
  });
  root2.querySelector(".bulk-confirm-delete").addEventListener("click", async () => {
    const names = [...root2.__bulkSelected || []];
    if (!names.length) return;
    const preview = names.length > 8 ? `${names.slice(0, 8).join("、")} 等 ${names.length} 款` : names.join("、");
    if (!resolveHostWindow().confirm(`确定彻底删除已选的 ${names.length} 款美化吗？

${preview}

删除后无法恢复。`)) return;
    busy = true;
    setPanelActions(root2, false);
    setPanelStatus(root2, `正在删除 ${names.length} 款美化…`);
    try {
      const hostWin2 = resolveHostWindow();
      const count = await deleteInstalledThemes(hostWin2, names);
      root2.__bulkSelected = /* @__PURE__ */ new Set();
      selectedTheme = null;
      selectedFileName = "";
      closeBulk();
      setPanelStatus(root2, `已从酒馆储存删除 ${count} 款美化，正在刷新酒馆以同步主题列表…`, "success");
      hostWin2.setTimeout(() => hostWin2.location.reload(), 500);
    } catch (error) {
      setPanelStatus(root2, `批量删除失败：${error?.message || error}`, "error");
    } finally {
      busy = false;
      setPanelActions(root2, Boolean(selectedTheme));
    }
  });
  const searchToggle = root2.querySelector(".search-toggle");
  const searchPanel = root2.querySelector(".theme-search");
  const searchInput = root2.querySelector(".search-input");
  searchToggle.addEventListener("click", () => {
    const expanded = searchToggle.getAttribute("aria-expanded") === "true";
    searchToggle.setAttribute("aria-expanded", String(!expanded));
    searchPanel.hidden = expanded;
    if (!expanded) searchInput.focus();
    else {
      searchInput.value = "";
      renderThemeCards(root2, root2.__installedThemes || []);
    }
  });
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    renderThemeCards(root2, (root2.__installedThemes || []).filter((theme) => theme.name.toLocaleLowerCase().includes(query)));
    root2.querySelector(".library-count").textContent = query ? `${root2.querySelectorAll(".theme-card").length} 款匹配美化` : `${(root2.__installedThemes || []).length} 款已导入的美化`;
  });
  const input = root2.querySelector(".file-input");
  root2.querySelector(".choose")?.addEventListener("click", () => input?.click());
  const dropzone = root2.querySelector(".choose");
  for (const type of ["dragover", "dragleave", "drop"]) dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.toggle("dragover", type === "dragover");
    if (type === "drop") handleSelectedFile(root2, event.dataTransfer?.files?.[0]);
  });
  input?.addEventListener("change", async () => {
    await handleSelectedFile(root2, input.files?.[0]);
    input.value = "";
  });
  for (const optionInput of root2.querySelectorAll("[data-option]")) {
    optionInput.addEventListener("change", () => {
      options = { ...options, [optionInput.dataset.option]: optionInput.checked };
      saveOptions();
      applyRuntimeCompatibility();
      if (selectedTheme) renderRisks(root2, analyzeCss(selectedTheme.custom_css));
    });
  }
  root2.querySelector(".import-apply")?.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    setPanelActions(root2, false);
    try {
      const adapted = makeAdaptedTheme();
      setPanelStatus(root2, `正在通过酒馆原生流程导入：${adapted.name}…`, "info");
      host.style.setProperty("visibility", "hidden", "important");
      await importAndApplyTheme(adapted);
      if (!await verifySavedTheme(hostWin, adapted)) throw new Error("界面已应用，但未核实副本保存，请检查酒馆连接或下载备份。");
      setPanelStatus(root2, `已导入并应用「${adapted.name}」，已核实副本保存。`, "success");
      notify("success", adapted.name, "TT 适配主题已应用");
    } catch (error) {
      console.error("[BeautifyStudio] 主题导入或应用失败。", error);
      setPanelStatus(root2, `导入失败：${error?.message || error}`, "error");
    } finally {
      host.style.removeProperty("visibility");
      busy = false;
      setPanelActions(root2, Boolean(selectedTheme));
      refreshLibrary(root2);
      root2.querySelector(".import-apply")?.focus();
    }
  });
  root2.querySelector(".inject-original")?.addEventListener("click", async () => {
    if (busy || !selectedTheme || selectedFileName !== "酒馆内的美化") return;
    busy = true;
    setPanelActions(root2, false);
    try {
      const name = selectedTheme.name;
      const installed = await readInstalledThemes(hostWin);
      const fresh = installed.find((item) => item.name === name);
      if (!fresh) throw new Error("所选美化已不存在，请刷新列表。");
      const select = getThemeSelect(doc);
      if (!select) throw new Error("没有找到酒馆主题切换控件。");
      if (select.value !== name) {
        select.value = name;
        select.dispatchEvent(new hostWin.Event("change", { bubbles: true }));
        await waitForHostCondition(hostWin, () => select.value === name && doc.getElementById("custom-style")?.textContent === (fresh.custom_css || ""));
      }
      const originalCss = doc.getElementById("custom-style")?.textContent || "";
      const edited = adaptTheme({ ...fresh, custom_css: originalCss }, options);
      edited.name = name;
      setPanelStatus(root2, `正在注入并保存原美化「${name}」…`);
      await updateActiveThemeCss(hostWin, edited, originalCss);
      selectedTheme = { ...fresh, custom_css: edited.custom_css };
      setPanelStatus(root2, `已直接注入并保存「${name}」，名称不变。`, "success");
    } catch (error) {
      setPanelStatus(root2, `注入未完成：${error.message}`, "error");
    } finally {
      busy = false;
      setPanelActions(root2, Boolean(selectedTheme));
      refreshLibrary(root2);
    }
  });
  root2.querySelector(".download")?.addEventListener("click", () => {
    try {
      const adapted = makeAdaptedTheme();
      downloadTheme(adapted);
      setPanelStatus(root2, `已生成下载：${adapted.name}.json`, "success");
      notify("success", adapted.name, "已生成 TT 适配版");
    } catch (error) {
      setPanelStatus(root2, `生成失败：${error?.message || error}`, "error");
    }
  });
  root2.querySelector(".diagnose")?.addEventListener("click", () => {
    try {
      const data = downloadLayoutDiagnostic(resolveHostWindow());
      const pins = data.chat_embedded_styles.count;
      setPanelStatus(root2, `布局诊断已下载。当前主题：${data.selected_theme || "未识别"}；聊天内嵌样式：${pins} 个。`, "success");
    } catch (error) {
      console.error("[BeautifyStudio] 布局诊断生成失败。", error);
      setPanelStatus(root2, `诊断生成失败：${error?.message || error}`, "error");
    }
  });
  root2.querySelector(".close-x")?.addEventListener("click", closePanel);
  root2.querySelector(".backdrop")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closePanel();
  });
  root2.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanel();
    if (event.key === "Tab") {
      const focusable = [...root2.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter((el) => el.getClientRects().length && el.tabIndex >= 0);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && root2.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && root2.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  root2.querySelector(".close-x")?.focus();
}
function findStandardWandButton(menu) {
  try {
    return Array.from(menu.querySelectorAll('div, button, [role="button"]')).find(
      (node) => node.id !== WAND_ENTRY_ID && String(node.textContent || "").trim() === BUTTON_NAME
    ) || null;
  } catch (_) {
    return null;
  }
}
function ensureWandEntry(doc) {
  if (!doc?.body) return;
  const menu = doc.getElementById?.("extensionsMenu");
  if (!menu) return;
  let entry = doc.getElementById?.(WAND_ENTRY_ID);
  if (findStandardWandButton(menu)) {
    entry?.remove?.();
    return;
  }
  if (!entry) {
    entry = doc.createElement("div");
    entry.id = WAND_ENTRY_ID;
    entry.setAttribute("role", "button");
    entry.setAttribute("tabindex", "0");
    entry.title = "打开 美化工作室";
    entry.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>美化工作室</span>';
    const activate = (event) => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      try {
        menu.style.display = "none";
      } catch (_) {
      }
      openPanel(doc);
    };
    entry.addEventListener("click", activate);
    entry.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") activate(event);
    });
    menu.prepend(entry);
  } else if (entry.parentElement !== menu) {
    menu.prepend(entry);
  }
  const menuButton = doc.getElementById?.("extensionsMenuButton");
  if (menuButton && menuButton.style.display === "none") menuButton.style.display = "flex";
}
function startWandEntries() {
  for (const doc of collectRuntimeDocuments()) {
    const boot = () => {
      ensureWandEntry(doc);
      if (!doc.body) return;
      const ViewMutationObserver = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
      let observer = null;
      if (typeof ViewMutationObserver === "function") {
        observer = new ViewMutationObserver(() => ensureWandEntry(doc));
        observer.observe(doc.body, { childList: true, subtree: true });
      }
      const setIntervalFn = doc.defaultView?.setInterval?.bind(doc.defaultView) || setInterval;
      const clearIntervalFn = doc.defaultView?.clearInterval?.bind(doc.defaultView) || clearInterval;
      const timer = setIntervalFn(() => ensureWandEntry(doc), 1200);
      wandRegistrations.push({ doc, observer, timer, clearIntervalFn });
    };
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
  }
}
function cleanup() {
  closeVisualEditor?.();
  closeVisualEditor = null;
  busy = false;
  closePanel();
  try {
    getHostDocument()?.getElementById?.(RUNTIME_STYLE_ID)?.remove();
  } catch (_) {
  }
  try {
    getHostDocument()?.documentElement?.classList?.remove?.(TAURI_ROOT_CLASS);
  } catch (_) {
  }
  for (const registration of runtimeInteractionRegistrations.splice(0)) {
    try {
      registration.doc.removeEventListener?.("pointerdown", registration.onPress, true);
    } catch (_) {
    }
    try {
      registration.doc.removeEventListener?.("touchstart", registration.onPress, true);
    } catch (_) {
    }
    try {
      registration.doc.removeEventListener?.("focusin", registration.onFocusIn, true);
    } catch (_) {
    }
    try {
      for (const shell of registration.doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
        shell.classList?.remove?.(COMPOSER_OPEN_CLASS);
      }
    } catch (_) {
    }
  }
  for (const registration of wandRegistrations.splice(0)) {
    try {
      registration.observer?.disconnect?.();
    } catch (_) {
    }
    try {
      registration.clearIntervalFn?.(registration.timer);
    } catch (_) {
    }
    try {
      registration.doc?.getElementById?.(WAND_ENTRY_ID)?.remove?.();
    } catch (_) {
    }
  }
}
function onUpdate() {
  setTimeout(() => {
    try {
      window.location.reload();
    } catch (_) {
    }
  }, 250);
}
function start() {
  startWandEntries();
  if (typeof appendInexistentScriptButtons === "function") {
    appendInexistentScriptButtons([{ name: BUTTON_NAME, visible: true }]);
  }
  if (typeof eventOn === "function" && typeof getButtonEvent === "function") {
    eventOn(getButtonEvent(BUTTON_NAME), openPanel);
  } else {
    console.error("[BeautifyStudio] 没有找到酒馆助手按钮接口。");
  }
  try {
    applyRuntimeCompatibility();
    startComposerInteractions();
  } catch (error) {
    console.warn("[BeautifyStudio] 运行时兼容暂未完全启用，但魔法棒入口仍可使用。", error);
  }
  window.addEventListener?.("beforeunload", cleanup, { once: true });
  console.info(`[BeautifyStudio] v${VERSION} 已加载。`);
}
try {
  start();
} catch (error) {
  console.error("[BeautifyStudio] 启动失败。", error);
}
export {
  onUpdate
};
