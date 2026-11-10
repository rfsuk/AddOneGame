/* Shared editorial exclusions: everyday vocabulary, not specialist recall. */
(function(root){
  const specialist=['BIBTEX','DRUPAL','CHARSET','ENGADGET','USENET','PERL','DAEMON','MRNA','CATION','COMPILER','GAGE','COTE','LISTER','SCION','GAMMA','THEOREM','INTEGER','INTER','ARTERIAL','RENAL','AXIAL','RADIAL','MERIDIAN','MAXIMAL','CREATINE','SCHEMA','POINTE','BARRE','SOLDER','STAT','CEREBRAL','CORONA','ETHER','ENCODING','INLINE','BACKEND','CELLULAR','REALTY','CHANDLER','CARTE','ANTE','CHIT','SIRE','VALE','BEHOLD','FREEPORT','PROSTATE','COED','HAIRED'];
  const regional=['COLOR','COLOUR','COLORS','COLOURS','CENTER','CENTRE','CENTERS','CENTRES','THEATER','THEATRE','FAVOR','FAVOUR','FAVORED','FAVOURED','FLAVOR','FLAVOUR','HONOR','HONOUR','HARBOR','HARBOUR','ARBOR','ARBOUR','ARMORED','ARMOURED','ARMOR','ARMOUR','REALISE','REALIZE','REALISED','REALIZED','REALISING','REALIZING','PRACTISE','PRACTICE','PRACTISED','PRACTICED','AGING','AGEING','GRAY','GREY','YOGURT','YOGHURT','SULFATE','SULPHATE','MATH','MATHS','FAUCET','JEWELRY','JEWELLERY','PAJAMAS','PYJAMAS','TRAVELER','TRAVELLER','TRAVELED','TRAVELLED','CANCELED','CANCELLED','CANCELING','CANCELLING','FOCUSED','FOCUSSED','ANALYZE','ANALYSE','ORGANIZE','ORGANISE','DEFENSE','DEFENCE','LICENSE','LICENCE','TIRELESSLY','LEARNED','LEARNT','BURNED','BURNT','DREAMED','DREAMT','SPELLED','SPELT','LEAPED','LEAPT','ALRIGHT','BLONDE'];
  const names=['IMAC','ARIAL','MARX','HEBREW','AFRICA','EUROPA','EUROPEAN','CAYMAN','BELFAST','SLOVAK','RIVIERA','SATURDAY','EASTER','ORIENTAL','ALPINE','CHRIST','STAN','TURNER'];
  const additional=['ARIA','MAESTRO','TECHNO','SHEA','GLEN','ARSENAL','MATRIX','VECTOR','CONVEX','NOTATION','BLOND','BOWMAN','FINDER','ORACLE','ADWARE','SPYWARE','MALWARE','SELECTOR','BULLOCK','GOTH','DECAL','MATTE','MATT','COBALT','CYAN','VOLT','PRENATAL','SPINDLE','FORE'];
  const excluded=Object.freeze([...new Set([...specialist,...regional,...names,...additional])]);
  const words=new Set(excluded);
  const geographicalNames=Object.freeze(['FRANCE','SWEDEN','PRAGUE','PORTUGAL','BAHRAIN','ARMENIA','OMAN','PANAMA','SPAIN','BENIN','ROME','LIMA','RIGA','CUBA','CHAD','IRAN','IRAQ','INDIA','IRELAND','TIRANA','ROMANIA','TUNIS','TUNISIA','CHILE','CHINA','MALI','MALTA','NEPAL','PARIS','LONDON','TOKYO','SEOUL','MADRID','VIENNA','LISBON','OSLO','PERU']);
  function allows(s,l,c1='',c2=''){
    if(words.has(s)||words.has(l))return false;
    return ![[s,c1],[l,c2]].some(([w,c])=>w==='TIRE'&&/wheel|rubber/i.test(c));
  }
  const api={excluded,regional,names,geographicalNames,allows};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AddOneVocabulary=api;
})(typeof window!=='undefined'?window:globalThis);
