import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, 'containerDirective', (node, index, parent) => {
      if (!parent || index === null) return;
      if (node.name !== 'chat') return;

      // 直接轉成 HTML node
      const html = {
        type: 'html',
        value: generateChatFromNode(node)
      };

      parent.children[index] = html;
    });
  };
}

function generateChatFromNode(node) {
  // 收集所有文字
  let fullText = '';
  
  const collectText = (n) => {
    if (n.type === 'text') {
      fullText += n.value + '\n';
    }
    if (n.children) {
      n.children.forEach(collectText);
    }
  };
  
  node.children.forEach(collectText);

  // 解析訊息
  const messages = [];
  const lines = fullText.split('\n');
  let currentMessage = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 檢查 header [name|time|position]
    const headerMatch = trimmed.match(/^\[([^\]]+)\](.*)$/);
    
    if (headerMatch) {
      if (currentMessage && currentMessage.lines.length > 0) {
        messages.push(currentMessage);
      }
      
      const parts = headerMatch[1].split('|').map(s => s.trim());
      currentMessage = {
        name: parts[0] || 'Anonymous',
        datetime: parts[1] || '',
        position: (parts[2] || 'left').toLowerCase() === 'right' ? 'right' : 'left',
        lines: []
      };
      
      const afterHeader = headerMatch[2].trim();
      if (afterHeader) {
        currentMessage.lines.push(afterHeader);
      }
    } else if (currentMessage) {
      currentMessage.lines.push(trimmed);
    }
  }

  if (currentMessage && currentMessage.lines.length > 0) {
    messages.push(currentMessage);
  }

  return generateHtml(messages);
}

function generateHtml(messages) {
  if (!messages.length) {
    return '<div class="chat-error">No messages found</div>';
  }

  return messages.map(msg => {
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

    return `<div class="etag-chat ${msg.position}">
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