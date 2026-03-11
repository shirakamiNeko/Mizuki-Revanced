import { visit } from 'unist-util-visit';

console.log('=== REMARK-CHAT FILE LOADED ===');

export function remarkChat() {
  console.log('=== REMARK-CHAT FUNCTION CALLED ===');
  return (tree) => {
    console.log('=== REMARK-CHAT TRANSFORM START ===');
    visit(tree, (node, index, parent) => {
      if (node.type === 'containerDirective') {
        console.log('Found containerDirective:', node.name);
      }
      if (node.type === 'containerDirective' && node.name === 'chat') {
        console.log('=== FOUND CHAT ===');
        
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          if (child.type === 'blockquote' && currentMessage) {
            const blockText = extractText(child);
            const lines = blockText.split('\n');
            if (lines.length > 0) {
              currentMessage.quote = lines[0];
              if (lines.length > 1) {
                currentMessage.content.push(...lines.slice(1).filter(l => l.trim()));
              }
            }
            continue;
          }

          if (child.type === 'paragraph') {
            const text = extractText(child);
            if (!text) continue;

            const lines = text.split('\n');
            const firstLine = lines[0];
            const headerMatch = firstLine.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]$/);

            if (headerMatch) {
              if (currentMessage) {
                messages.push(currentMessage);
              }

              const [, name, date, position] = headerMatch;

              currentMessage = {
                name,
                date,
                position: position || 'left',
                quote: null,
                content: []
              };

              if (lines.length > 1) {
                currentMessage.content.push(...lines.slice(1).filter(l => l.trim()));
              }
            } else if (currentMessage) {
              currentMessage.content.push(...lines.filter(l => l.trim()));
            }
          }
        }

        if (currentMessage) {
          messages.push(currentMessage);
        }

        const html = messages.map(msg => {
          let contentHtml = '';
          if (msg.quote) {
            contentHtml += `<blockquote>${escapeHtml(msg.quote)}</blockquote>`;
          }
          if (msg.content.length > 0) {
            contentHtml += msg.content.map(c => `<p>${escapeHtml(c)}</p>`).join('');
          }
          return `<div class="chat-message chat-${msg.position}"><div class="chat-bubble"><div class="chat-header"><span class="chat-name">${escapeHtml(msg.name)}</span><span class="chat-date">${escapeHtml(msg.date)}</span></div><div class="chat-content">${contentHtml}</div></div></div>`;
        }).join('');

        const htmlNode = {
          type: 'html',
          value: `<div class="chat-container">${html}</div>`
        };
        
        parent.children.splice(index, 1, htmlNode);
        return index;
      }
    });
  };
}

function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default remarkChat;