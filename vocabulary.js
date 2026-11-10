/* Shared editorial exclusions: everyday vocabulary, not specialist recall. */
(function(root){
  const excluded=Object.freeze(['BIBTEX','DRUPAL','CHARSET','ENGADGET','USENET','PERL','DAEMON','MRNA','CATION','COMPILER','GAGE','COTE','LISTER','SCION']);
  const words=new Set(excluded);
  const api={excluded,allows:(s,l)=>!words.has(s)&&!words.has(l)};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AddOneVocabulary=api;
})(typeof window!=='undefined'?window:globalThis);
