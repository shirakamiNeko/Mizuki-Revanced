/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a Keyboard Key component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {import('mdast').RootContent[]} children - The children elements.
 * @returns {import('mdast').Parent} The created Keyboard component.
 */
export function KeyboardComponent(properties, children) {
	const keyText =
		properties.key ||
		(Array.isArray(children) && children.length > 0
			? children.map((c) => c.value || "").join("")
			: null);

	if (!keyText) {
		return h("span", { class: "hidden" }, [
			"Invalid directive. (Usage: :keyboard[Win])",
		]);
	}

	return h("keyboard", {}, keyText);
}
