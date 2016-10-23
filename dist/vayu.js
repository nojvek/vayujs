var Vayu;
(function (Vayu) {
    const INIT_HASH = 5381;
    /**
     * The main function that translates JSX into VNode's
     */
    function createElement(name, attrs) {
        const restIndex = 2;
        const argLen = arguments.length;
        let children = null;
        let key = null;
        let hash = 5381; // See djb2 hash - http://www.cse.yorku.ca/~oz/hash.html
        // Flatten arrays inside children to be a single array
        if (argLen > restIndex) {
            children = new Array(argLen - restIndex); // preallocate for perf
            for (let i = restIndex, childIndex = 0; i < argLen; i++) {
                let child = arguments[i];
                if (child instanceof Array) {
                    for (let j = 0, n = child.length; j < n; j++) {
                        let arrChild = child[j];
                        if (hasValue(arrChild)) {
                            const childNode = normalizeNode(arrChild);
                            children[childIndex++] = childNode;
                            hash = updateHashNum(hash, childNode.hash);
                        }
                    }
                }
                else if (hasValue(child)) {
                    const childNode = normalizeNode(child);
                    children[childIndex++] = childNode;
                    hash = updateHashNum(hash, childNode.hash);
                }
            }
        }
        if (typeof name === "string") {
            hash = updateHashStr(hash, name);
            if (attrs) {
                for (let attrName of Object.keys(attrs)) {
                    let attrValue = attrs[attrName];
                    if (hasValue(attrValue)) {
                        attrs[attrName] = attrValue = normalizeAttr(attrName, attrValue);
                        updateHashStr(hash, attrName);
                        updateHashStr(hash, attrValue);
                        if (attrName === "key") {
                            key = attrValue;
                        }
                    }
                }
            }
            return { type: 1 /* Element */, name, hash, attrs, key, children, dom: null };
        }
        else if (typeof name === "function") {
            return name(attrs, children); // Stateless component
        }
        throw new Error(`unrecognized node name:${name}`);
    }
    Vayu.createElement = createElement;
    function createTextNode(text) {
        return { type: 3 /* Text */, text: text, hash: updateHashStr(INIT_HASH, text), dom: null };
    }
    function hasValue(val) {
        return (val !== null && val !== void 0);
    }
    function normalizeAttr(attrName, attrValue) {
        const valueType = typeof attrValue;
        switch (typeof attrValue) {
            case "string":
                return attrValue;
            case "number":
                return attrValue.toString();
            case "boolean":
                return attrValue ? attrName : "";
            default:
                throw new Error(`attrType ${valueType} is not supported`);
        }
    }
    function normalizeNode(node) {
        switch (typeof node) {
            case "object":
                if (node.type == 1 /* Element */) {
                    return node;
                }
                break;
            case "string":
                return createTextNode(node);
            case "boolean":
            case "number":
                return createTextNode(node.toString());
        }
        throw Error("Invalid node type: " + typeof node);
    }
    function updateHashStr(hash, str) {
        for (let i = str.length; i; hash = (hash * 33) ^ str.charCodeAt(--i))
            ;
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
    function toHtml(vnode, indent = 0) {
        if (!vnode)
            return "";
        if (vnode.type == 3 /* Text */) {
            return vnode.text;
        }
        let indentStr = "  ".repeat(indent);
        let str = `${indentStr}<${vnode.name}`;
        if (vnode.attrs) {
            str += Object.keys(vnode.attrs).map(attr => ` ${attr}="${vnode.attrs[attr]}"`).join("");
        }
        if (vnode.children && vnode.children.length) {
            str += ">" + vnode.children.map(child => toHtml(child, indent + 1)).join("\n");
            str += `\n${indentStr}</${vnode.name}>`;
        }
        else {
            str += `/>`;
        }
        return str;
    }
    Vayu.toHtml = toHtml;
    function fromDomNode(domNode) {
        const name = domNode.nodeName.toLowerCase();
        const attrs = {};
        const children = [];
        let key = undefined;
        let hash = INIT_HASH;
        hash = updateHashStr(hash, name);
        for (let i = 0, attributes = domNode.attributes, len = attributes.length; i < len; ++i) {
            const elemAttr = attributes[i];
            attrs[elemAttr.name] = elemAttr.value;
            hash = updateHashStr(hash, elemAttr.name);
            hash = updateHashStr(hash, elemAttr.value);
        }
        if (attrs["key"])
            key = attrs["key"];
        for (let i = 0, childNodes = domNode.childNodes, len = childNodes.length; i < len; ++i) {
            const childNode = childNodes[i];
            const nodeType = childNode.nodeType;
            let vnode;
            if (nodeType === 1 /* Element */) {
                vnode = fromDomNode(childNode);
            }
            else if (nodeType === 3 /* Text */) {
                vnode = createTextNode(childNode.nodeValue);
            }
            if (vnode) {
                hash = updateHashNum(hash, vnode.hash);
                children.push(vnode);
            }
        }
        return { type: 1 /* Element */, name, hash, attrs, key, children, dom: domNode };
    }
    Vayu.fromDomNode = fromDomNode;
    function toDomNode(vnode) {
        let domNode;
        if (vnode.type == 1 /* Element */) {
            const { name, attrs, children } = vnode;
            domNode = document.createElement(name);
            // TODO: Setup event listeners and proper inline styles from class and style variables
            if (attrs) {
                for (let attrName of Object.keys(attrs)) {
                    domNode.setAttribute(attrName, attrs[attrName]);
                }
            }
            if (children) {
                for (let child of children) {
                    domNode.appendChild(toDomNode(child));
                }
            }
        }
        else {
            domNode = document.createTextNode(vnode.text);
        }
        vnode.dom = domNode;
        return domNode;
    }
    Vayu.toDomNode = toDomNode;
    function patchElem(parentElem, domVNode, curVNode) {
        // Create new domNode from curVNodeii
        if (!domVNode && curVNode) {
            parentElem.appendChild(toDomNode(curVNode));
        }
        else if (domVNode && !curVNode) {
            parentElem.removeChild(domVNode.dom);
        }
        else if (domVNode === curVNode || domVNode.hash === curVNode.hash) {
            return; // No subtree changes. Netflix and chill
        }
        else if (curVNode.type == 1 /* Element */ && (domVNode.type === 3 /* Text */ || curVNode.name !== domVNode.name)) {
            parentElem.replaceChild(toDomNode(curVNode), domVNode.dom);
        }
        else if (curVNode.type == 3 /* Text */) {
            if (domVNode.text !== curVNode.text) {
                domVNode.dom.nodeValue = curVNode.text;
            }
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
})(Vayu || (Vayu = {}));
//# sourceMappingURL=vayu.js.map