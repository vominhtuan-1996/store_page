export function searchChunks(chunks, query) {
  return chunks
    .map((c) => ({
      text: c,
      score: score(c, query),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => c.text);
}

function score(text, query) {
  const words = query.toLowerCase().split(' ');
  let s = 0;
  words.forEach((w) => {
    if (text.toLowerCase().includes(w)) s++;
  });
  return s;
}
