import { visit } from 'unist-util-visit';

export function remarkChat() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'chat') {
        const messages = [];
        let currentMessage = null;

        for (const child of node.children) {
          if (child.type === 'paragraph' && child.children?.[0]?.type === 'text') {
            const text = child.children[0].value;
            const headerMatch = text.match(/^\[([^\]|]+)\|([^\]|]+)(?:\|(\w+))?\]/);
            
            if (headerMatch) {
              if (currentMessage) {
                messages.push(currentMessage);
              }
              
              const [fullMatch, name, date, position] = headerMatch;
              const remainingText = text.slice(fullMatch.length).trim();
              
              currentMessage = {
                name,
                date,
                position: position || 'left',
                content: []
              };
              
              if (remainingText) {
                currentMessage.content.push({ type: 'text', value: remainingText });
              }
            } else if (currentMessage) {
              currentMessage.content.push({ type: 'text', value: text });
            }
          } else if (currentMessage && child.type === 'blockquote') {
            const quoteText = child.children
              ?.flatMap(p => p.children || [])
              ?.filter(c => c.type === 'text')
              ?.map(c => c.value)
              ?.join('\n') || '';
            if (quoteText) {
              currentMessage.content.push({ type: 'quote', value: quoteText });
            }
          }
        }
        
        if (currentMessage) {
          messages.push(currentMessage);
        }

        // Generate HTML
        const html = `<div class="chat-container">
${messages.map(msg => {
          const contentHtml = msg.content.map(c => {
            if (c.type === 'quote') {
              return `<blockquote>${escapeHtml(c.value)}</blockquote>`;
            }
            return `<p>${escapeHtml(c.value)}</p>`;
          }).join('\n        ');

          return `  <div class="chat-message chat-${msg.position}">
    <div class="chat-bubble">
      <div class="chat-header">
        <span class="chat-name">${escapeHtml(msg.name)}</span>
        <span class="chat-date">${escapeHtml(msg.date)}</span>
      </div>
      <div class="chat-content">
        ${contentHtml}
      </div>
    </div>
  </div>`;
        }).join('\n')}
</div>`;

        node.type = 'html';
        node.value = html;
        node.children = undefined;
      }
    });
  };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

export default remarkChat;