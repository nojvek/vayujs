var Vayu;
(function (Vayu) {
    function createElement(tag, attrs) {
        const restIndex = 2;
        const argLen = arguments.length;
        let children = null;
        let key = null;
        let hash = 5381; // See djb2 hash
        // Flatten arrays inside children to be a single array
        if (argLen > restIndex) {
            children = new Array(argLen - restIndex); // preallocate for perf
            for (let i = restIndex, childIndex = 0; i < argLen; i++) {
                let child = arguments[i];
                if (child instanceof Array) {
                    for (let j = 0, n = child.length; j < n; j++) {
                        let arrChild = child[j];
                        if (hasValue(arrChild)) {
                            arrChild = normalizeChild(arrChild);
                            children[childIndex++] = arrChild;
                            hash = updateHashNode(hash, arrChild);
                        }
                    }
                }
                else if (hasValue(child)) {
                    child = normalizeChild(child);
                    children[childIndex++] = child;
                    hash = updateHashNode(hash, child);
                }
            }
        }
        if (typeof tag === "string") {
            hash = updateHashStr(hash, tag);
            if (attrs) {
                for (let attrName in attrs) {
                    let attrValue = attrs[attrName].toString();
                    attrs[attrName] = attrValue;
                    updateHashStr(hash, attrName);
                    updateHashStr(hash, attrValue);
                    if (attrName === "key") {
                        key = attrValue;
                    }
                }
            }
            return { tag, hash, attrs, key, children };
        }
        else if (typeof tag === "function") {
            return tag(attrs, children); // Stateless component
        }
        throw new Error(`unrecognized node name:${tag}`);
    }
    Vayu.createElement = createElement;
    function hasValue(val) {
        return (val !== null && val !== void 0);
    }
    function normalizeChild(node) {
        const nodeType = typeof node;
        if (nodeType === "boolean" || nodeType === "number") {
            return node.toString();
        }
        return node;
    }
    function updateHashNode(hash, node) {
        if (typeof node === "string") {
            return updateHashStr(hash, node);
        }
        else if (node.hash) {
            return updateHashNum(hash, node.hash);
        }
    }
    function updateHashStr(hash, str) {
        for (let i = str.length; i; hash = (hash * 33) ^ str.charCodeAt(--i))
            ;
        hash = ~hash; // Bit flip
        return hash;
    }
    function updateHashNum(hash, num) {
        return (hash * 33) ^ num;
    }
    function apply(elem, node) {
        //console.log(toHtml(node));
        //console.log(node);
        patchElem(elem, elem.firstElementChild, node);
    }
    Vayu.apply = apply;
    function toHtml(node, indent = 0) {
        if (!node)
            return "";
        if (typeof node === "string")
            return node;
        let indentStr = "  ".repeat(indent);
        let str = `${indentStr}<${node.tag}`;
        if (node.attrs) {
            str += Object.keys(node.attrs).map(attr => ` ${attr}="${node.attrs[attr]}"`).join("");
        }
        if (node.children && node.children.length) {
            str += ">" + node.children.map(child => toHtml(child, indent + 1)).join("\n");
            str += `\n${indentStr}</${node.tag}>`;
        }
        else {
            str += `/>`;
        }
        return str;
    }
    Vayu.toHtml = toHtml;
    function fromDomElem(elem) {
        const tag = elem.nodeName.toLowerCase();
        const attrs = {};
        const children = [];
        let key = undefined;
        for (let i = 0, attributes = elem.attributes, len = attributes.length; i < len; ++i) {
            const elemAttr = attributes[i];
            attrs[elemAttr.name] = elemAttr.value;
        }
        if (attrs.key)
            key = attrs.key;
        for (let i = 0, childNodes = elem.childNodes, len = childNodes.length; i < len; ++i) {
            const childNode = childNodes[i];
            const nodeType = childNode.nodeType;
            if (nodeType === 1 /* Element */) {
                children.push(fromDomElem(childNode));
            }
            else if (nodeType === 3 /* Text */) {
                children.push(childNode.nodeValue);
            }
        }
        return { tag, attrs, key, children };
    }
    Vayu.fromDomElem = fromDomElem;
    function toDomElem(node) {
        const { tag, attrs, children } = node;
        const elem = document.createElement(tag);
        if (attrs) {
            for (let attrName in attrs) {
                const attrValue = attrs[attrName];
                const attrType = typeof attrValue;
                if (attrType === "boolean" || attrType === "number" || attrType === "string") {
                    elem.setAttribute(attrName, attrValue.toString());
                }
                else {
                    throw new Error(`unrecognized type for attrName:attrValue ${attrName}:${attrValue}`);
                }
            }
        }
        if (children) {
            for (let child of children) {
                if (child) {
                    if (typeof child === "string") {
                        elem.appendChild(document.createTextNode(child));
                    }
                    else {
                        elem.appendChild(toDomElem(child));
                    }
                }
            }
        }
        return elem;
    }
    Vayu.toDomElem = toDomElem;
    function patchElem(parentElem, elem, newNode) {
        // Create new elem from newNode
        if (!elem) {
            parentElem.appendChild(toDomElem(newNode));
        }
        else if (!newNode) {
            parentElem.removeChild(elem);
        }
        else if (elem.nodeName.toLowerCase() !== newNode.tag) {
            parentElem.replaceChild(toDomElem(newNode), elem);
        }
        else {
        }
    }
    Vayu.patchElem = patchElem;
    function patchAttrs(elem, oldAttrs, newAttrs) {
        // Add/edit attributes
        for (let attr of Object.keys(newAttrs || {})) {
            const attrExists = oldAttrs.hasOwnProperty(attr);
            if (!attrExists || newAttrs[attr] !== oldAttrs[attr]) {
                elem.setAttribute(attr, newAttrs[attr]);
            }
            if (attrExists) {
                delete oldAttrs[attr];
            }
        }
        // Remove attributes
        for (let key of Object.keys(oldAttrs)) {
            elem.removeAttribute(key);
        }
    }
    Vayu.patchAttrs = patchAttrs;
    function patchChildren(elem, oldChildren, newChildren = []) {
        const oldKeys = {};
        const newKeys = {};
        let nodeCountMap = {};
        // Compute old & new keys. We assign keys to child.
        // Children of same type match. If a key is defined, it is used for matching
        for (let i = 0, len = oldChildren.length; i < len; ++i) {
            const childNode = oldChildren[i];
            const nodeType = childNode.nodeType;
            if (nodeType === 1 /* Element */ || nodeType === 3 /* Text */) {
                const nodeName = childNode.nodeName.toLowerCase();
                if (nodeType === 1 /* Element */ && childNode.hasAttribute("key")) {
                    oldKeys[`${nodeName}_${childNode.getAttribute("key")}`] = childNode;
                }
                else {
                    const nodeCount = (nodeCountMap[nodeName] ? ++nodeCountMap[nodeName] : nodeCountMap[nodeName] = 1);
                    oldKeys[`${nodeName}${nodeCount}`] = childNode;
                }
            }
        }
        nodeCountMap = {};
        for (let i = 0, len = newChildren.length; i < len; ++i) {
            const childNode = newChildren[i];
            if (childNode) {
                const nodeName = (typeof childNode === "string") ? "#text" : childNode.tag;
                if (typeof childNode !== "string" && childNode.key) {
                    newKeys[`${nodeName}_${childNode.key}`] = childNode;
                }
                else {
                    const nodeCount = (nodeCountMap[nodeName] ? ++nodeCountMap[nodeName] : nodeCountMap[nodeName] = 1);
                    newKeys[`${nodeName}${nodeCount}`] = childNode;
                }
            }
        }
        for (let key of Object.keys(newKeys)) {
            // Patch element
            const newNode = newKeys[key];
            if (oldKeys.hasOwnProperty(key)) {
                if (typeof newNode === "string") {
                    oldKeys[key].nodeValue = newNode;
                }
                else {
                    patchElem(elem, oldKeys[key], newNode);
                }
                delete oldKeys[key];
            }
            else {
                if (typeof newNode === "string") {
                    elem.appendChild(document.createTextNode(newNode));
                }
                else {
                    elem.appendChild(toDomElem(newNode));
                }
            }
        }
        // Remove elements
        for (let key of Object.keys(oldKeys)) {
            elem.removeChild(oldKeys[key]);
        }
        // console.log(oldKeys, newKeys);
    }
    Vayu.patchChildren = patchChildren;
})(Vayu || (Vayu = {}));
//# sourceMappingURL=vayu.js.map