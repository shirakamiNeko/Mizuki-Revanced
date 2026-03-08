/// <reference types="mdast" />
import { h } from "hastscript";

export function KeyboardComponent(properties, children) {
	const keyText = properties.key || "?";
	return h("kbd", {}, keyText);
}
