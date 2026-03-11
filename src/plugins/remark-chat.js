import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'chat') return;

      // 收集所有文字內容
      let fullText = '';
      
      const collectText = (n) => {
        if (n.type === 'text') {
          fullText += n.value;
        }
        if (n.children) {
          n.children.forEach(collectText);
        }
      };
      
      node.children.forEach(collectText);
      
      // 解析訊息
      const messages = [];
      const regex = /\[([^\]]+)\]/g;
      const parts = fullText.split(regex);
      
      // parts: ['', 'TNXG|2025-03-11 14:30', '\nmain.py...', 'AriaQwQ|...', '\n內容...']
      for (let i = 1; i < parts.length; i += 2) {
        const header = parts[i];
        const content = parts[i + 1] || '';
        
        const headerParts = header.split('|').map(s => s.trim());
        const name = headerParts[0] || 'Anonymous';
        const datetime = headerParts[1] || '';
        const position = (headerParts[2] || 'left').toLowerCase() === 'right' ? 'right' : 'left';
        
        const lines = content
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0);
        
        if (lines.length > 0 || name) {
          messages.push({ name, datetime, position, lines });
        }
      }

      node.type = 'html';
      node.value = generateChatHtml(messages);
      node.children = [];
    });
  };
}

function generateChatHtml(messages) {
  if (messages.length === 0) return '<p>No messages</p>';
  
  return messages.map(msg => {
    const positionClass = msg.position;
    
    const contentHtml = msg.lines.map(line => {
      if (line.startsWith('>') || line.startsWith('＞')) {
        const quoteText = line.replace(/^[>＞]\s*/, '');
        return `<div class="etag-chat-quote">${escapeHtml(quoteText)}</div>`;
      }
      return `<p>${escapeHtml(line)}</p>`;
    }).join('');

    const timeHtml = msg.datetime 
      ? `<span class="etag-chat-time">${escapeHtml(msg.datetime)}</span>` 
      : '';

    return `<div class="etag-chat ${positionClass}">
<div class="etag-chat-content">
<div class="etag-chat-author">${escapeHtml(msg.name)}${timeHtml}</div>
<div class="etag-chat-message">${contentHtml}</div>
</div>
</div>`;
  }).join('\n');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default remarkChat;