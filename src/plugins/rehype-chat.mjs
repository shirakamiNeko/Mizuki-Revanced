import { h } from "hastscript";

/**
 * Creates a chat component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created chat component.
 */
export function rehypeChat(properties, children) {
  console.log("[rehypeChat] called with:", { properties, childrenCount: children?.length });
  
  if (!Array.isArray(children) || children.length === 0) {
    return h("div", { class: "chat-container chat-empty" }, "No messages");
  }

  // 從 children 提取文字內容
  let textContent = '';
  const extractText = (nodes) => {
    for (const node of nodes) {
      if (node.type === 'text') {
        textContent += node.value;
      } else if (node.children) {
        extractText(node.children);
      }
      if (node.tagName === 'p') {
        textContent += '\n\n';
      } else if (node.tagName === 'br') {
        textContent += '\n';
      }
    }
  };
  extractText(children);

  console.log("[rehypeChat] textContent:", textContent);

  // 按段落分割
  const paragraphs = textContent.split(/\n\n+/).filter(p => p.trim());
  const messages = [];

  for (const para of paragraphs) {
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // 第一行應該是 [名字|時間] 或 [名字|時間|right]
    const headerMatch = lines[0].match(/^\[([^\]]+)\]$/);
    if (!headerMatch) continue;

    const meta = headerMatch[1];
    const parts = meta.split('|').map(p => p.trim());
    
    const name = parts[0] || 'Unknown';
    const time = parts[1] || '';
    const isRight = parts.includes('right');
    const alignment = isRight ? 'chat-right' : 'chat-left';

    // 剩餘行是內容
    const contentLines = lines.slice(1);
    const bubbleContent = [];
    
    for (const line of contentLines) {
      if (line.startsWith('>')) {
        // 引用
        bubbleContent.push(
          h('div', { class: 'chat-quote' }, line.slice(1).trim())
        );
      } else {
        bubbleContent.push(
          h('div', { class: 'chat-content' }, line)
        );
      }
    }

    messages.push(
      h('div', { class: `chat-message ${alignment}` }, [
        h('div', { class: 'chat-header' }, [
          h('span', { class: 'chat-name' }, name),
          h('span', { class: 'chat-time' }, time)
        ]),
        h('div', { class: 'chat-bubble' }, bubbleContent)
      ])
    );
  }

  if (messages.length === 0) {
    return h("div", { class: "chat-container chat-empty" }, "No messages");
  }

  return h('div', { class: 'chat-container' }, messages);
}
