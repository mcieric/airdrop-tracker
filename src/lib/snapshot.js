function toB64Url(b64) { return b64.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function fromB64Url(u) {
  const pad = u.length % 4 === 2 ? '==' : u.length % 4 === 3 ? '=' : '';
  return u.replace(/-/g,"+").replace(/_/g,"/")+pad;
}
export function encodeSnapshot(obj){
  try {
    const json=JSON.stringify(obj||{});
    return toB64Url(btoa(unescape(encodeURIComponent(json))));
  }catch(e){return "";}
}
export function decodeSnapshotFromHash(hashStr){
  try{
    const h=String(hashStr||"");
    const m=h.match(/(?:^#|&|^)s=([^&]+)/);
    if(!m)return null;
    const raw=fromB64Url(m[1]);
    const json=decodeURIComponent(escape(atob(raw)));
    return JSON.parse(json);
  }catch(e){return null;}
}
export function buildSnapshotLink(wallet,data){
  const base=window.location.origin;
  const w=(wallet||"").toLowerCase();
  const token=encodeSnapshot(data);
  return `${base}/public/${w}#s=${token}`;
}
