"use strict";

/* global DateUtils, Base */

class PromiseWorker {
  constructor(path) {
    this.nextId = 0;
    this.resolveMap = {};
    this.worker = new Worker(path);
    this.worker.onmessage = msg => {
      const id = msg.data.id;
      const resolve = this.resolveMap[id];
      delete this.resolveMap[id];
      resolve(msg.data.data);
    };
  }

  async run(data) {
    const id = this.nextId;
    this.nextId++;
    if (this.nextId > 1000000) {
      this.nextId = 0;
    }

    return new Promise(resolve => {
      this.resolveMap[id] = resolve;

      this.worker.postMessage({
        data,
        id,
      });
    });
  }
}

const HTMLPathDiffWorker = new PromiseWorker("./js/path-diff-worker.js");
const HTMLTreeDiffWorker = new PromiseWorker("./js/tree-diff-worker.js");

class HTMLPathDiff {
  static diff(s1, s2) {
    return HTMLPathDiffWorker.run({
      s1,
      s2,
      type: "diff",
    });
  }

  static splitForDiff(s1, s2) {
    return HTMLPathDiffWorker.run({
      s1,
      s2,
      type: "splitForDiff",
    });
  }
}

// Calculate diff between 2 DOM tree.
class HTMLTreeDiff {
  constructor() {
    this.blockNodes = new Set(
      [
        "div", "p", "pre", "section",
        "figcaption", "figure",
        "h1", "h2",
        "ol", "ul", "li",
        "dl", "dt", "dd",
        "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      ]
    );
  }

  // Calculate diff between 2 DOM tree.
  async diff(diffNode, node1, node2) {
    this.addNumbering("1-", node1);
    this.addNumbering("2-", node2);

    await this.splitForDiff(node1, node2);

    this.combineNodes(node1, "li");
    this.combineNodes(node2, "li");

    const nodeObj1 = this.DOMTreeToPlainObject(node1);
    const nodeObj2 = this.DOMTreeToPlainObject(node2);

    const diffNodeObj = await HTMLTreeDiffWorker.run({
      nodeObj1,
      nodeObj2,
    });

    const tmp = this.plainObjectToDOMTree(diffNodeObj);
    for (const child of [...tmp.childNodes]) {
      diffNode.appendChild(child);
    }

    this.combineNodes(diffNode, "*");

    this.swapInsDel(diffNode);

    this.removeNumbering(diffNode);
  }

  // Convert DOM tree to object tree.
  DOMTreeToPlainObject(node) {
    const result = this.DOMElementToPlainObject(node);

    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (this.isUnnecessaryText(child)) {
          continue;
        }

        result.textLength += this.compressSpaces(child.textContent).length;
        this.splitTextInto(result.childNodes, child.textContent);
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const childObj = this.DOMTreeToPlainObject(child);
        result.childNodes.push(childObj);
        result.textLength += childObj.textLength;
      }
    }

    return result;
  }

  compressSpaces(s) {
    return s.replace(/\s+/, " ");
  }

  // Remove unnecessary whitespace texts that can confuse diff algorithm.
  //
  // Diff algorithm used here isn't good at finding diff in repeating
  // structure, such as list element, separated by same whitespaces.
  //
  // Remove such whitespaces between each `li`, to reduce the confusion.
  isUnnecessaryText(node) {
    if (!/^[ \r\n\t]*$/.test(node.textContent)) {
      return false;
    }

    if (node.previousSibling) {
      if (node.previousSibling.nodeType === Node.COMMENT_NODE ||
          this.isBlock(node.previousSibling)) {
        return true;
      }
    }
    if (node.nextSibling) {
      if (node.nextSibling.nodeType === Node.COMMENT_NODE ||
          this.isBlock(node.nextSibling)) {
        return true;
      }
    }

    return false;
  }

  isBlock(node) {
    const name = node.nodeName.toLowerCase();
    return this.blockNodes.has(name);
  }

  // Convert single DOM element to object, without child nodes.
  DOMElementToPlainObject(node) {
    const attributes = {};
    if (node.attributes) {
      for (const attr of node.attributes) {
        attributes[attr.name] = attr.value;
      }
    }

    return this.createPlainObject(
      node.nodeName.toLowerCase(), node.id, attributes);
  }

  // Create a plain object representation for an empty DOM element.
  createPlainObject(name, id = undefined, attributes = {}) {
    return {
      attributes,
      childNodes: [],
      id,
      name,
      textLength: 0,
    };
  }

  // Split text by whitespaces and punctuation, given that
  // diff is performed on the tree of nodes, and text is the
  // minimum unit.
  //
  // Whitespaces are appended to texts before it, instead of creating Text
  // node with whitespace alone.
  // This is necessary to avoid matching each whitespace in different sentence.
  splitTextInto(childNodes, text) {
    while (true) {
      const spaceIndex = text.search(/\s[^\s]/);
      const punctIndex = text.search(/[.,:;?!()[\]]/);
      if (spaceIndex === -1 && punctIndex === -1) {
        break;
      }

      if (punctIndex !== -1 && (spaceIndex === -1 || punctIndex < spaceIndex)) {
        if (punctIndex > 0) {
          childNodes.push(text.slice(0, punctIndex));
        }
        childNodes.push(text.slice(punctIndex, punctIndex + 1));
        text = text.slice(punctIndex + 1);
      } else {
        childNodes.push(text.slice(0, spaceIndex + 1));
        text = text.slice(spaceIndex + 1);
      }
    }
    if (text) {
      childNodes.push(text);
    }
  }

  // Add unique ID ("tree-diff-num" attribute) to each element.
  //
  // See `splitForDiff` for more details.
  addNumbering(prefix, node) {
    let i = 0;
    for (const child of node.getElementsByTagName("*")) {
      child.setAttribute("tree-diff-num", prefix + i);
      i++;
    }
  }

  // Split both DOM tree, using text+path based LCS, to have similar tree
  // structure.
  //
  // This is a workaround for the issue that raw tree LCS cannot handle
  // split/merge.
  //
  // To solve the issue, split both tree by `splitForDiff` to make each text
  // match even if parent tree gets split/merged.
  //
  // This caused another issue when `splitForDiff` split more than necessary
  // (like, adding extra list element).
  //
  // Such nodes are combined in `combineNodes`, based on the unique ID
  // added by `addNumbering`, and those IDs are removed in `removeNumbering`.
  //
  // Also, `LCSToDiff` always places `ins` after `del`, but `combineNodes` can
  // merge 2 nodes where first one ends with `ins` and the second one starts
  // with `del`. `swapInsDel` fixes up the order.
  async splitForDiff(node1, node2) {
    const [html1, html2] = await HTMLPathDiff.splitForDiff(
      node1.innerHTML, node2.innerHTML);
    node1.innerHTML = html1;
    node2.innerHTML = html2;
  }

  // Convert object tree to DOM tree.
  plainObjectToDOMTree(nodeObj) {
    if (typeof nodeObj === "string") {
      return document.createTextNode(nodeObj);
    }

    const result = document.createElement(nodeObj.name);
    for (const [key, value] of Object.entries(nodeObj.attributes)) {
      result.setAttribute(key, value);
    }
    for (const child of nodeObj.childNodes) {
      result.appendChild(this.plainObjectToDOMTree(child));
    }

    return result;
  }

  // Combine adjacent nodes with same ID ("tree-diff-num" attribute) into one
  //
  // See `splitForDiff` for more details.
  combineNodes(node, name) {
    const removedNodes = new Set();

    for (const child of [...node.getElementsByTagName(name)]) {
      if (removedNodes.has(child)) {
        continue;
      }

      if (!child.hasAttribute("tree-diff-num")) {
        continue;
      }

      const num = child.getAttribute("tree-diff-num");
      while (true) {
        if (!child.nextSibling) {
          break;
        }

        if (!(child.nextSibling instanceof Element)) {
          break;
        }

        const next = child.nextSibling;
        if (next.getAttribute("tree-diff-num") !== num) {
          break;
        }

        while (next.firstChild) {
          child.appendChild(next.firstChild);
        }

        removedNodes.add(next);
        next.remove();
      }
    }
  }

  // Swap `ins`+`del` to `del`+`ins`.
  //
  // See `splitForDiff` for more details.
  swapInsDel(node) {
    for (const child of [...node.getElementsByClassName("htmldiff-ins")]) {
      if (!child.nextSibling) {
        continue;
      }

      if (!(child.nextSibling instanceof Element)) {
        continue;
      }

      if (child.nextSibling.classList.contains("htmldiff-del")) {
        child.before(child.nextSibling);
      }
    }
  }

  // Add "tree-diff-num" attribute from all elements.
  //
  // See `splitForDiff` for more details.
  removeNumbering(node) {
    for (const child of node.getElementsByTagName("*")) {
      //child.removeAttribute("tree-diff-num");
    }
  }
}
