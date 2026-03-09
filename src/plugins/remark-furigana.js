import { visit } from 'unist-util-visit';

// Character type detection
function isHiragana(char) {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

function isKatakana(char) {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

function isKana(char) {
  return isHiragana(char) || isKatakana(char);
}

function isKanji(char) {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf)    // CJK Unified Ideographs Extension A
  );
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Parse furigana with separators
function parseFurigana(text, reading) {
  // Handle emphasis dots: [あいう]{*} or [あいう]{*❤}
  if (reading.startsWith('*') || reading.startsWith('＊')) {
    const dot = reading.slice(1) || '・';
    return [...text].map(char => ({
      text: char,
      reading: dot
    }));
  }

  // Handle literal mode: [食べる]{=たべる}
  if (reading.startsWith('=') || reading.startsWith('＝')) {
    return [{
      text: text,
      reading: reading.slice(1)
    }];
  }

  // Separators split furigana between kanji
  const separators = /[.．。・|｜/／\s]/;
  // Combinators indicate boundary but don't split in output
  const combinators = /[+＋]/;

  const readingParts = [];
  let currentPart = '';
  let combineWithPrevious = false;

  for (const char of reading) {
    if (separators.test(char)) {
      if (currentPart) {
        readingParts.push({ text: currentPart, combine: combineWithPrevious });
        currentPart = '';
        combineWithPrevious = false;
      }
    } else if (combinators.test(char)) {
      if (currentPart) {
        readingParts.push({ text: currentPart, combine: combineWithPrevious });
        currentPart = '';
        combineWithPrevious = true;
      }
    } else {
      currentPart += char;
    }
  }
  if (currentPart) {
    readingParts.push({ text: currentPart, combine: combineWithPrevious });
  }

  // If no separators, try automatic matching
  if (readingParts.length <= 1) {
    return autoMatch(text, reading);
  }

  // Match parts to text segments
  return matchPartsToText(text, readingParts);
}

// Automatic matching of kanji to kana
function autoMatch(text, reading) {
  const results = [];
  let textIndex = 0;
  let readingIndex = 0;

  while (textIndex < text.length) {
    const char = text[textIndex];

    if (isKana(char)) {
      // Kana matches itself
      const kanaRun = getKanaRun(text, textIndex);
      results.push({ text: kanaRun, reading: null });
      textIndex += kanaRun.length;
      readingIndex += kanaRun.length;
    } else if (isKanji(char)) {
      // Find kanji run
      const kanjiRun = getKanjiRun(text, textIndex);
      // Find where next kana starts in reading
      const nextKanaInText = findNextKana(text, textIndex + kanjiRun.length);
      
      let kanjiReading;
      if (nextKanaInText) {
        // Find this kana in reading
        const kanaPos = reading.indexOf(nextKanaInText, readingIndex);
        if (kanaPos > readingIndex) {
          kanjiReading = reading.slice(readingIndex, kanaPos);
          readingIndex = kanaPos;
        } else {
          kanjiReading = reading.slice(readingIndex);
          readingIndex = reading.length;
        }
      } else {
        kanjiReading = reading.slice(readingIndex);
        readingIndex = reading.length;
      }

      results.push({ text: kanjiRun, reading: kanjiReading });
      textIndex += kanjiRun.length;
    } else {
      // Other characters (punctuation, etc)
      results.push({ text: char, reading: null });
      textIndex++;
    }
  }

  return results;
}

function getKanaRun(text, start) {
  let end = start;
  while (end < text.length && isKana(text[end])) {
    end++;
  }
  return text.slice(start, end);
}

function getKanjiRun(text, start) {
  let end = start;
  while (end < text.length && isKanji(text[end])) {
    end++;
  }
  return text.slice(start, end);
}

function findNextKana(text, start) {
  for (let i = start; i < text.length; i++) {
    if (isKana(text[i])) {
      return getKanaRun(text, i);
    }
  }
  return null;
}

function matchPartsToText(text, readingParts) {
  const results = [];
  let textIndex = 0;
  let partIndex = 0;

  while (textIndex < text.length && partIndex < readingParts.length) {
    const char = text[textIndex];

    if (isKana(char)) {
      const kanaRun = getKanaRun(text, textIndex);
      results.push({ text: kanaRun, reading: null });
      textIndex += kanaRun.length;
    } else if (isKanji(char)) {
      let kanjiRun = '';
      let combinedReading = '';

      // Collect kanji and their readings, respecting combinators
      do {
        const part = readingParts[partIndex];
        if (!part) break;

        if (partIndex > 0 && readingParts[partIndex].combine) {
          // Combine with previous
          kanjiRun += text[textIndex] || '';
          combinedReading += part.text;
        } else if (kanjiRun === '') {
          kanjiRun = getKanjiRun(text, textIndex);
          combinedReading = part.text;
        } else {
          break;
        }

        textIndex++;
        partIndex++;
      } while (partIndex < readingParts.length && readingParts[partIndex]?.combine);

      // Adjust textIndex if we grabbed too much
      if (kanjiRun.length > 1) {
        textIndex = textIndex - 1 + kanjiRun.length;
      }

      results.push({ text: kanjiRun, reading: combinedReading });
    } else {
      results.push({ text: char, reading: null });
      textIndex++;
    }
  }

  // Remaining text
  if (textIndex < text.length) {
    results.push({ text: text.slice(textIndex), reading: null });
  }

  return results;
}

// Generate ruby HTML
function generateRuby(parts, fallbackParens = '【】') {
  const openParen = fallbackParens[0] || '【';
  const closeParen = fallbackParens[1] || '】';

  return parts.map(({ text, reading }) => {
    if (!reading) {
      return escapeHtml(text);
    }
    return `<ruby>${escapeHtml(text)}<rp>${openParen}</rp><rt>${escapeHtml(reading)}</rt><rp>${closeParen}</rp></ruby>`;
  }).join('');
}

export function remarkFurigana(options = {}) {
  const { fallbackParens = '【】' } = options;

  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null) return;

      // Match [text]{reading}
      const furiganaRegex = /\[([^\]]+)\]\{([^}]+)\}/g;
      const text = node.value;

      if (!furiganaRegex.test(text)) return;

      // Reset regex
      furiganaRegex.lastIndex = 0;

      const children = [];
      let lastIndex = 0;
      let match;

      while ((match = furiganaRegex.exec(text)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
          children.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        const baseText = match[1];
        const reading = match[2];
        const parts = parseFurigana(baseText, reading);
        const rubyHtml = generateRuby(parts, fallbackParens);

        children.push({
          type: 'html',
          value: rubyHtml
        });

        lastIndex = match.index + match[0].length;
      }

      // Text after last match
      if (lastIndex < text.length) {
        children.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // Replace node with children
      parent.children.splice(index, 1, ...children);
    });
  };
}

export default remarkFurigana;
