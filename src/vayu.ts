declare namespace JSX {
    interface Element extends Vayu.VNode { }
    interface IntrinsicElements {
        [name: string]: any;
    }
}

namespace Vayu {
    export type VChildNode = string | VNode;

    const enum NodeType {
        Element = 1,
        Text = 3
    }

    export interface VNode {
        tag: string;
        hash?: number,
        attrs?: any;
        children?: VChildNode[];
        key?: string;
        elem?: Element;
    }

    export function createElement(tag: string | Function, attrs: any): VNode {
        const restIndex = 2;
        const argLen = arguments.length;
        let children: VNode[] = null;
        let key: string = null;
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

    function hasValue(val: any): boolean {
        return (val !== null && val !== void 0);
    }

    function normalizeChild(node: VChildNode): VChildNode {
        const nodeType = typeof node;
        if (nodeType === "boolean" || nodeType === "number") {
            return node.toString();
        }
        return node;
    }

    function updateHashNode(hash: number, node: VChildNode): number {
        if (typeof node === "string") {
            return updateHashStr(hash, node)
        }
        else if (node.hash) {
            return updateHashNum(hash, node.hash);
        }
    }

    function updateHashStr(hash: number, str: string): number {
        for (let i = str.length; i; hash = (hash * 33) ^ str.charCodeAt(--i));
        hash = ~hash; // Bit flip
        return hash;
    }

    function updateHashNum(hash: number, num: number): number {
        return (hash * 33) ^ num;
    }


    export function apply(elem: Element, node: VNode) {
        //console.log(toHtml(node));
        //console.log(node);
        patchElem(elem, elem.firstElementChild, node);
    }

    export function toHtml(node: VNode | string, indent = 0): string {
        if (!node) return "";
        if (typeof node === "string") return node;

        let indentStr = (<any>"  ").repeat(indent);
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

    export function fromDomElem(elem: Element): VNode {
        const tag = elem.nodeName.toLowerCase();
        const attrs: any = {};
        const children: any[] = [];
        let key: string = undefined;

        for (let i = 0, attributes = elem.attributes, len = attributes.length; i < len; ++i) {
            const elemAttr = attributes[i];
            attrs[elemAttr.name] = elemAttr.value;
        }

        if (attrs.key)
            key = attrs.key;

        for (let i = 0, childNodes = elem.childNodes, len = childNodes.length; i < len; ++i) {
            const childNode = childNodes[i];
            const nodeType = childNode.nodeType;
            if (nodeType === NodeType.Element) {
                children.push(fromDomElem(<Element>childNode));
            }
            else if (nodeType === NodeType.Text) {
                children.push(childNode.nodeValue);
            }
        }

        return { tag, attrs, key, children };
    }

    export function toDomElem(node: VNode) {
        const {tag, attrs, children} = node;
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

    export function patchElem(parentElem: Element, elem: Element, newNode: VNode) {
        // Create new elem from newNode
        if (!elem) {
            parentElem.appendChild(toDomElem(newNode));
        }
        // Remove elem
        else if (!newNode) {
            parentElem.removeChild(elem);
        }
        // Elem nodeName is not same, replace with new node
        else if (elem.nodeName.toLowerCase() !== newNode.tag) {
            parentElem.replaceChild(toDomElem(newNode), elem);
        }
        // Elem and newNode match nodeName, patch attrs and children
        else {
            //patchAttrs(elem, getElemAttrs(elem), newNode.attrs);
            //patchChildren(elem, elem.childNodes, newNode.children);
        }
    }

    export function patchAttrs(elem: Element, oldAttrs: any, newAttrs: any) {
        // Add/edit attributes
        for (let attr of Object.keys(newAttrs || {})) {
            const attrExists = oldAttrs.hasOwnProperty(attr);
            if (!attrExists || newAttrs[attr] !== oldAttrs[attr]) {
                elem.setAttribute(attr, newAttrs[attr]);
                //console.log("setAttribute", elem, attr, oldAttrs[attr], newAttrs[attr]);
            }
            if (attrExists) {
                delete oldAttrs[attr];
            }
        }

        // Remove attributes
        for (let key of Object.keys(oldAttrs)) {
            elem.removeAttribute(key);
            //console.log("removeAttribute", elem, key);
        }
    }

    export function patchChildren(elem: Element, oldChildren: NodeList, newChildren: VChildNode[] = []) {
        const oldKeys: { [key: string]: Node } = {};
        const newKeys: { [key: string]: VChildNode } = {};
        let nodeCountMap: { [key: string]: number } = {};

        // Compute old & new keys. We assign keys to child.
        // Children of same type match. If a key is defined, it is used for matching
        for (let i = 0, len = oldChildren.length; i < len; ++i) {
            const childNode = oldChildren[i];
            const nodeType = childNode.nodeType;

            if (nodeType === NodeType.Element || nodeType === NodeType.Text) {
                const nodeName = childNode.nodeName.toLowerCase();
                if (nodeType === NodeType.Element && (<Element>childNode).hasAttribute("key")) {
                    oldKeys[`${nodeName}_${(<Element>childNode).getAttribute("key")}`] = childNode;
                } else {
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
                if (typeof childNode !== "string" && childNode.key){
                    newKeys[`${nodeName}_${childNode.key}`] = childNode;
                } else {
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
                    //console.log("setText", elem, key);
                }
                else {
                    patchElem(elem, <Element>oldKeys[key], newNode);
                }
                delete oldKeys[key];
            }
            else {
                if (typeof newNode === "string") {
                    elem.appendChild(document.createTextNode(newNode));
                    //console.log("createText", elem, key);
                }
                else {
                    elem.appendChild(toDomElem(newNode));
                    //console.log("addChild", elem, key);
                }
            }
        }

        // Remove elements
        for (let key of Object.keys(oldKeys)) {
            elem.removeChild(oldKeys[key]);
            //console.log("removeChild", elem, key);
        }

        // console.log(oldKeys, newKeys);
    }
}