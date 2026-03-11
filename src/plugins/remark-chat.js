import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'chat') return;

      const messages = [];
      let currentMessage = null;

      node.children.forEach(child => {
        if (child.type === 'paragraph') {
          const text = extractText(child);
          const headerMatch = text.match(/^\[([^\]]+)\](.*)$/s);
          
          if (headerMatch) {
            if (currentMessage) {
              messages.push(currentMessage);
            }
            
            const headerParts = headerMatch[1].split('|').map(s => s.trim());
            
            currentMessage = {
              name: headerParts[0] || 'Anonymous',
              datetime: headerParts[1] || '',
              position: (headerParts[2] || 'left').toLowerCase() === 'right' ? 'right' : 'left',
              lines: []
            };
            
            const content = headerMatch[2].trim();
            if (content) currentMessage.lines.push(content);
          } else if (currentMessage) {
            currentMessage.lines.push(text);
          }
        }
      });
      
      if (currentMessage) {
        messages.push(currentMessage);
      }

      node.type = 'html';
      node.value = generateChatHtml(messages);
      node.children = [];
    });
  };
}

function extractText(node) {
  if (node.type === 'text') return node.value;
  if (node.children) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function generateChatHtml(messages) {
  const messagesHtml = messages.map(msg => {
    const positionClass = msg.position === 'right' ? 'chat-right' : 'chat-left';
    
    const contentHtml = msg.lines.map(line => {
      if (line.startsWith('>') || line.startsWith('＞')) {
        const quoteText = line.slice(1).trim();
        return `<div class="chat-quote">${escapeHtml(quoteText)}</div>`;
      }
      return `<p>${escapeHtml(line)}</p>`;
    }).join('');

    return `
      <div class="chat-message ${positionClass}">
        <div class="chat-bubble">
          <div class="chat-header">
            <span class="chat-name">${escapeHtml(msg.name)}</span>
            ${msg.datetime ? `<span class="chat-time">${escapeHtml(msg.datetime)}</span>` : ''}
          </div>
          <div class="chat-content">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="chat-container">${messagesHtml}</div>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default remarkChat;