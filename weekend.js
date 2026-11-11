(function (root) {
  const dayMs = 86400000;
  const firstSaturday = '2026-11-14';
  const season = [
    'CAT CHAT CHART CHARITY',
    'PIE PINE SPINE SPLINTER',
    'BAN BRAN BRAIN BARGAIN',
    'ANT PANT PAINT PATIENT',
    'SAD SAND STAND STRANDED',
    'RISE RAISE PRAISE PARADISE',
    'TIN STING STRING STARING STARTING',
    'TOT TROT TROUT TURNOUT',
    'RAG RAGE RANGE STRANGER',
    'POD PROD PROVED APPROVED',
    'FAT FAST FEAST FORECAST',
    'HOE HOLE HOLDER SHOULDER'
  ].map((chain, index) => ({
    date: new Date(Date.parse(firstSaturday) + index * 7 * dayMs).toISOString().slice(0, 10),
    words: chain.split(' ')
  }));

  function current(date) {
    const time = Date.parse(date);
    const weekday = new Date(time).getUTCDay();
    if (weekday !== 6 && weekday !== 0) return null;
    const saturday = new Date(time - (weekday === 0 ? dayMs : 0)).toISOString().slice(0, 10);
    return season.find(chain => chain.date === saturday) || null;
  }

  function resolve(chain, bank) {
    const links = chain.words.slice(1).map((word, index) =>
      bank.find(puzzle => puzzle.s === chain.words[index] && puzzle.l === word)
    );
    return links.every(Boolean) ? links : null;
  }

  const api = { season, current, resolve };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AddOneWeekend = api;
})(typeof window !== 'undefined' ? window : globalThis);
