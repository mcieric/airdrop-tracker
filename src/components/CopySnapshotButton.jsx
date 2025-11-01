import React,{useState}from"react";
import{buildSnapshotLink}from"../lib/snapshot";
import{getAirdropData}from"../lib/storage";

export default function CopySnapshotButton({wallet}){
  const[copied,setCopied]=useState(false);
  async function onClick(){
    try{
      const data=getAirdropData()||{};
      const url=buildSnapshotLink(wallet,data);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(()=>setCopied(false),1200);
    }catch(e){
      alert("Cannot copy, link:\n"+buildSnapshotLink(wallet,getAirdropData()||{}));
    }
  }
  return(
    <button className="btn"onClick={onClick}>
      {copied?"Copied ✓":"Copy snapshot link"}
    </button>
  );
}
