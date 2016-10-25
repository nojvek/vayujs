declare namespace JSX {
    interface Element extends Vayu.VElementNode { }
    interface IntrinsicElements {
        [name: string]: any;
    }
}

namespace Vayu {
    const INIT_HASH = 5381;

    const enum NodeType {
        Element = 1,
        Text = 3
    }

    export interface VBaseNode {
        type: NodeType;
        hash: number;
        dom: DomNode;
    }

    export interface VTextNode extends VBaseNode {
        type: NodeType.Text;
        text: string;
    }

    export interface VElementNode extends VBaseNode {
        type: NodeType.Element;
        name: string;
        attrs?: any;
        children?: VNode[];
        key?: string;
    }

    export interface Attrs {
        [attr: string]: any;
    }

    export type VNode = VElementNode | VTextNode;

    // so types don't get confusing
    type DomElement = Element;
    type DomNode = Node;

    /**
     * The main function that translates JSX into VNode's
     */
    export function createElement(name: string | Function, attrs: Attrs): VNode {
        const restIndex = 2;
        const argLen = arguments.length;
        let children: VNode[] = null;
        let key: string = null;
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

            return { type: NodeType.Element, name, hash, attrs, key, children, dom: null };
        }
        else if (typeof name === "function") {
            return name(attrs, children); // Stateless component
        }

        throw new Error(`unrecognized node name:${name}`);
    }

    function createTextNode(text: string, domNode: DomNode = null): VTextNode {
        return { type: NodeType.Text, text: text, hash: updateHashStr(INIT_HASH, text), dom: domNode };
    }

    function hasValue(val: any): boolean {
        return (val !== null && val !== void 0);
    }

    function normalizeAttr(attrName: string, attrValue: any): string {
        const valueType = typeof attrValue;
        switch(typeof attrValue) {
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

    function normalizeNode(node: any): VNode {
        switch (typeof node) {
            case "object":
                if (node.type == NodeType.Element) {
                    return node
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


    function updateHashStr(hash: number, str: string): number {
        for (let i = str.length; i; hash = (hash * 33) ^ str.charCodeAt(--i));
        return hash;
    }

    function updateHashNum(hash: number, num: number): number {
        return (hash * 33) ^ num;
    }


    export function render(domElem: DomElement, nextVNode: VNode) {
        const domVNode = (<any>domElem).vnode || fromDomNode(domElem.firstElementChild);
        //console.log("renderFrame", domVNode, nextVNode)
        nextVNode = updateElem(domElem, domVNode, nextVNode);
        if (nextVNode && domVNode.vnode !== nextVNode) {
            (<any>domElem).vnode = nextVNode;
        }
    }

    export function toHtml(vnode: VNode, indent = 0, pretty = true): string {
        if (!vnode) return "";

        let indentStr = pretty ? (<any>"  ").repeat(indent) : "";

        if (vnode.type == NodeType.Text) {
            return vnode.text ? `${indentStr}${vnode.text}\n` : "";
        }

        let str = `${indentStr}<${vnode.name}`;

        if (vnode.attrs) {
            for (let attr of Object.keys(vnode.attrs)) {
                str += ` ${attr}="${vnode.attrs[attr]}"`
            }
        }

        if (vnode.children && vnode.children.length) {
            str += ">\n";
            for (let child of vnode.children) {
                str += toHtml(child, indent + 1, pretty);
            }
            str += `${indentStr}</${vnode.name}>\n`;
        }
        else {
            str += `/>\n`;
        }

        return str;
    }

    export function fromDomNode(domNode: DomNode): VNode {
        if (!domNode) return null;

        if (domNode.nodeType === NodeType.Text) {
            return createTextNode(domNode.nodeValue.trim(), domNode);
        }

        const name = domNode.nodeName.toLowerCase();
        const attrs: Attrs = {};
        const children: VNode[] = [];
        let key: string = undefined;
        let hash = INIT_HASH;

        hash = updateHashStr(hash, name);

        for (let i = 0, attributes = domNode.attributes, len = attributes.length; i < len; ++i) {
            const elemAttr = attributes[i];
            attrs[elemAttr.name] = elemAttr.value;
            hash = updateHashStr(hash, elemAttr.name)
            hash = updateHashStr(hash, elemAttr.value)
        }

        if (attrs["key"])
            key = attrs["key"];

        for (let i = 0, childNodes = domNode.childNodes, len = childNodes.length; i < len; ++i) {
            const childNode = childNodes[i];
            const nodeType = childNode.nodeType;

            if (nodeType === NodeType.Element || nodeType === NodeType.Text) {
                const vnode = fromDomNode(childNode);
                hash = updateHashNum(hash, vnode.hash);
                children.push(vnode);
            }
        }

        return { type: NodeType.Element, name, hash, attrs, key, children, dom: domNode };
    }

    export function toDomNode(vnode: VNode): DomNode {
        let domNode: DomNode;

        if (vnode.type == NodeType.Element) {
            const {attrs} = vnode;
            //TODO: Handle SVG here
            domNode = document.createElement(vnode.name);

            // TODO: Setup event listeners and proper inline styles from class and style variables
            if (attrs) {
                for (let attrName of Object.keys(attrs)) {
                    (<DomElement>domNode).setAttribute(attrName, attrs[attrName]);
                }
            }

            if (vnode.children) {
                updateChildren(domNode, null, vnode);
            }

        } else {
            domNode = document.createTextNode(vnode.text);
        }

        vnode.dom = domNode;
        return domNode;
    }

    export function updateElem(parentElem: DomNode, domVNode: VNode, nextVNode: VNode): VNode {
        // Create new domNode from curVNodeii
        if (!domVNode && nextVNode) {
            parentElem.appendChild(toDomNode(nextVNode));
            //console.log("appendChild", nextVNode);
        }
        // Remove existing domNode
        else if (domVNode && !nextVNode) {
            parentElem.removeChild(domVNode.dom);
            //console.log("removeChild", domVNode);
        }
        // Hashes match, return existing domVNode
        else if (domVNode.hash === nextVNode.hash) {
            return domVNode;
        }
        // elem->text or text->elem change, replace node
        else if (domVNode.type !== nextVNode.type) {
            parentElem.replaceChild(toDomNode(nextVNode), domVNode.dom);
            //console.log("replaceChild", domVNode, nextVNode);

        }
        // Edit Text
        else if (domVNode.type === NodeType.Text && nextVNode.type === NodeType.Text) {
            if (domVNode.text !== nextVNode.text) {
                domVNode.dom.nodeValue = nextVNode.text;
                //console.log("replaceText", nextVNode.text)
            }
            nextVNode.dom = domVNode.dom
        }
        // Edit DomElement
        else if(domVNode.type == NodeType.Element && nextVNode.type == NodeType.Element){
            // Different dom kinds of dom elements e.g iframe -> div. Replace element
            if (domVNode.name !== nextVNode.name) {
                parentElem.replaceChild(toDomNode(nextVNode), domVNode.dom);
                //console.log("replaceChild", domVNode, nextVNode);
            }
            else {
                updateChildren(domVNode.dom, domVNode, nextVNode);
                nextVNode.dom = domVNode.dom
            }
        }

        return nextVNode;
    }


    export function updateAttrs(domElem: DomElement, oldAttrs: any, newAttrs: any) {
        // Add/edit attributes
        for (let attr of Object.keys(newAttrs || {})) {
            const attrExists = oldAttrs.hasOwnProperty(attr);
            if (!attrExists || newAttrs[attr] !== oldAttrs[attr]) {
                domElem.setAttribute(attr, newAttrs[attr]);
                //console.log("setAttribute", elem, attr, oldAttrs[attr], newAttrs[attr]);
            }
            if (attrExists) {
                delete oldAttrs[attr];
            }
        }

        // Remove attributes
        for (let key of Object.keys(oldAttrs)) {
            domElem.removeAttribute(key);
            //console.log("removeAttribute", elem, key);
        }
    }

    export function updateChildren(domNode:DomNode, domVNode: VElementNode, nextVNode: VElementNode) {
        const domChildren = domVNode && domVNode.children;
        const domChildrenLen = domChildren ? domChildren.length : 0;
        const nextChildren = nextVNode && nextVNode.children;
        const nextChildrenLen = nextChildren ? nextChildren.length : 0;
        let i = 0;

        // Upsert children
        for (; i < nextChildrenLen; ++i) {
            nextChildren[i] = updateElem(domNode, (i < domChildrenLen) ? domChildren[i] : null, nextChildren[i]);
        }

        // Remove children
        for (; i < domChildrenLen; ++i) {
            updateElem(domNode, domChildren[i], null);
        }
    }
}


    /*
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
    */