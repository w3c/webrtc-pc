"use strict";

// Calculate diff between 2 HTML fragments, based on text+path based LCS.
//
// The HTML fragment shouldn't omit closing tag, if it's not empty tag.
class HTMLPathDiffWorker {
  static run({ type, s1, s2 }) {
    if (type === "diff") {
      return this.diff(s1, s2);
    }
    if (type === "splitForDiff") {
      return this.splitForDiff(s1, s2);
    }
    return "";
  }

  // Calculate diff between 2 HTML fragments.
  static diff(s1, s2) {
    const seq1 = this.toSeq(s1);
    const seq2 = this.toSeq(s2);

    const C = this.LCS(seq1, seq2);
    const diff = this.LCSToDiff(seq1, seq2, C);
    const seq = this.diffToSeq(diff);

    return this.fromSeq(seq);
  }

  // Convert a HTML fragment into a sequence of text or empty tag, with
  // path information.
  static toSeq(s) {
    const seq = [];
    const name_stack = [];
    const sel_stack = [];
    const tag_stack = [];
    for (const t of this.tokenize(s)) {
      switch (t.type) {
        case "o": {
          name_stack.push(t.name);
          if (t.id) {
            sel_stack.push(t.name + "#" + t.id);
          } else {
            sel_stack.push(t.name);
          }
          tag_stack.push(t.tag);
          break;
        }
        case "c": {
          name_stack.pop();
          sel_stack.pop();
          tag_stack.pop();
          break;
        }
        case "t": {
          const text = t.text;
          const path = sel_stack.join("/");

          seq.push({
            name_stack: name_stack.slice(),
            path,
            sel_stack: sel_stack.slice(),
            tag_stack: tag_stack.slice(),
            text,
          });
        }
      }
    }
    return seq;
  }

  // Tokenize HTML fragment into text, empty tag, opening tag, and closing tag.
  static *tokenize(s) {
    const emptyTags = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    let i = 0;
    let start = 0;
    let prev = "";
    const len = s.length;

    while (i < len) {
      const c = s.charAt(i);
      if (c === "<") {
        if (start !== i) {
          yield {
            text: s.slice(start, i),
            type: "t",
          };
        }

        const re = /[^> \t\r\n]+/g;
        re.lastIndex = i + 1;
        const result = re.exec(s);

        const to = s.indexOf(">", i + 1);

        const name = result[0];
        const tag = s.slice(i, to + 1);

        if (name.startsWith("/")) {
          // If the current element has no content,
          // Put empty text, so that `toSeq` creates empty text inside
          // this element..
          //
          // Otherwise `toSeq` won't create any info about this element.
          if (prev === "o") {
            yield {
              text: "",
              type: "t",
            };
          }

          yield {
            name,
            tag,
            type: "c",
          };
          prev = "c";
        } else if (emptyTags.has(name)) {
          // Empty tag is treated as text.
          yield {
            text: tag,
            type: "t",
          };
          prev = "t";
        } else {
          // If there's opening tag immediately after closing tag,
          // put empty text, so that `toSeq` creates empty text at
          // parent node, between 2 elements
          // (one closed here, and one opened here).
          //
          // Otherwise `toSeq` will concatenate 2 elements if they're same.
          if (prev === "c") {
            yield {
              text: "",
              type: "t",
            };
          }

          let id = undefined;
          const m = tag.match(` id="([^"]+)"`);
          if (m) {
            id = m[1];
          }

          yield {
            id,
            name,
            tag,
            type: "o",
          };
          prev = "o";
        }
        i = to + 1;
        start = i;
      } else if (c.match(/[ \t\r\n]/)) {
        const re = /[ \t\r\n]+/g;
        re.lastIndex = start;
        const result = re.exec(s);
        yield {
          text: s.slice(start, i) + result[0],
          type: "t",
        };
        prev = "t";
        i += result[0].length;
        start = i;
      } else {
        i++;
      }
    }

    if (start < len) {
      yield {
        text: s.slice(start),
        type: "t",
      };
    }
  }

  // Calculate the matrix for Longest Common Subsequence of 2 sequences.
  static LCS(seq1, seq2) {
    const len1 = seq1.length;
    const len2 = seq2.length;
    const C = new Array(len1 + 1);
    for (let i = 0; i < len1 + 1; i++) {
      C[i] = new Array(len2 + 1);
    }
    for (let i = 0; i < len1 + 1; i++) {
      C[i][0] = 0;
    }
    for (let j = 0; j < len2 + 1; j++) {
      C[0][j] = 0;
    }

    function isDiff(s1, s2) {
      // Do not count the difference in attributes,h.
      return s1.text !== s2.text || s1.path !== s2.path;
    }

    for (let i = 1; i < len1 + 1; i++) {
      for (let j = 1; j < len2 + 1; j++) {
        if (!isDiff(seq1[i - 1], seq2[j - 1])) {
          C[i][j] = C[i-1][j-1] + 1;
        } else {
          C[i][j] = Math.max(C[i][j-1], C[i-1][j]);
        }
      }
    }

    return C;
  }

  // Convert 2 sequences and the LCS matrix into a sequence of diff.
  static LCSToDiff(seq1, seq2, C) {
    const len1 = seq1.length;
    const len2 = seq2.length;
    const diff = [];

    for (let i = len1, j = len2; i > 0 || j > 0;) {
      if ((i > 0 && j > 0 && C[i][j] === C[i - 1][j - 1]) ||
          (j > 0 && C[i][j] === C[i][j - 1])) {
        diff.push({
          item: seq2[j - 1],
          op: "+",
        });
        j--;
      } else if (i > 0 && C[i][j] === C[i - 1][j]) {
        diff.push({
          item: seq1[i - 1],
          op: "-",
        });
        i--;
      } else {
        diff.push({
          item: seq1[i - 1],
          item2: seq2[j - 1],
          op: " ",
        });
        i--;
        j--;
      }
    }

    diff.reverse();

    return diff;
  }

  // Convert a sequence of diff into a sequence of text or empty tag, with
  // path information.
  static diffToSeq(diff) {
    const seq = [];

    const INS_NAME = `ins`;
    const INS_TAG = `<ins class="htmldiff-ins htmldiff-change">`;
    const DEL_NAME = `del`;
    const DEL_TAG = `<del class="htmldiff-del htmldiff-change">`;

    for (const d of diff) {
      switch (d.op) {
        case " ": {
          seq.push(d.item);
          break;
        }
        case "+":
        case "-": {
          const new_name_stack = d.item.name_stack.slice();
          const new_sel_stack = d.item.sel_stack.slice();
          const new_tag_stack = d.item.tag_stack.slice();

          // FIXME: Instead of the leaf, put ins/del somewhere in the stack.
          //        https://github.com/arai-a/ecma262-compare/issues/13
          switch (d.op) {
            case "+": {
              new_name_stack.push(INS_NAME);
              new_sel_stack.push(INS_NAME);
              new_tag_stack.push(INS_TAG);
              break;
            }
            case "-": {
              new_name_stack.push(DEL_NAME);
              new_sel_stack.push(DEL_NAME);
              new_tag_stack.push(DEL_TAG);
              break;
            }
          }

          seq.push({
            name_stack: new_name_stack,
            path: new_sel_stack.join("/"),
            sel_stack: new_sel_stack,
            tag_stack: new_tag_stack,
            text: d.item.text,
          });
          break;
        }
      }
    }

    return seq;
  }

  // Convert a sequence of text or empty tag, with path information into
  // HTML fragment.
  static fromSeq(seq) {
    const name_stack = [];
    const sel_stack = [];
    const tag_stack = [];

    const ts = [];

    for (const s of seq) {
      let i = 0;
      // Skip common ancestor.
      for (; i < s.sel_stack.length; i++) {
        if (s.sel_stack[i] !== sel_stack[i]) {
          break;
        }
      }

      // Close tags that are not part of current text.
      while (i < name_stack.length) {
        sel_stack.pop();
        tag_stack.pop();
        const name = name_stack.pop();
        ts.push(`</${name}>`);
      }

      // Open remaining tags that are ancestor of current text.
      for (; i < s.name_stack.length; i++) {
        name_stack.push(s.name_stack[i]);
        sel_stack.push(s.sel_stack[i]);
        const tag = s.tag_stack[i];
        tag_stack.push(tag);
        ts.push(tag);
      }

      ts.push(s.text);
    }

    return ts.join("");
  }

  static splitForDiff(s1, s2) {
    const seq1 = this.toSeq(s1);
    const seq2 = this.toSeq(s2);

    const C = this.LCS(seq1, seq2);
    const diff = this.LCSToDiff(seq1, seq2, C);

    const [splitSeq1, splitSeq2] = this.split(diff);
    return [this.fromSeq(splitSeq1), this.fromSeq(splitSeq2)];
  }

  static split(diff) {
    let prevStackDepth1 = 0;
    let prevStackDepth2 = 0;

    const splitSeq1 = [];
    const splitSeq2 = [];
    for (const d of diff) {
      switch (d.op) {
        case " ": {
          splitSeq1.push(d.item);
          prevStackDepth1 = d.item.path.length;

          splitSeq2.push(d.item2);
          prevStackDepth2 = d.item.path.length;
          break;
        }
        case "-": {
          splitSeq1.push(d.item);
          prevStackDepth1 = d.item.path.length;

          if (prevStackDepth2 > d.item.path.length) {
            splitSeq2.push({
              name_stack: d.item.name_stack,
              path: d.item.path,
              sel_stack: d.item.sel_stack,
              tag_stack: d.item.tag_stack,
              text: "",
            });
            prevStackDepth2 = d.item.path.length;
          }
          break;
        }
        case "+": {
          if (prevStackDepth1 > d.item.path.length) {
            splitSeq1.push({
              name_stack: d.item.name_stack,
              path: d.item.path,
              sel_stack: d.item.sel_stack,
              tag_stack: d.item.tag_stack,
              text: "",
            });
            prevStackDepth1 = d.item.path.length;
          }
          splitSeq2.push(d.item);
          prevStackDepth2 = d.item.path.length;
          break;
        }
      }
    }

    return [splitSeq1, splitSeq2];
  }
}

onmessage = msg => {
  const id = msg.data.id;
  const data = HTMLPathDiffWorker.run(msg.data.data);
  postMessage({
    data,
    id,
  });
};
