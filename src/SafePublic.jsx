import React from "react";
import { useParams } from "react-router-dom";

export default function SafePublic(){
  const { wallet } = useParams();
  return (
    <div style={{padding:24}}>
      <h2>Public — Safe</h2>
      <div style={{marginTop:8}}>Wallet : <code>{wallet}</code></div>
      <p style={{marginTop:16}}>
        Si tu vois cette page, le routage & le rendu fonctionnent.
        Le bug vient donc probablement d'un composant UI modifié (ex: Toolbar.jsx / PublicDashboard.jsx).
      </p>
      <p>
        Prochaine étape : réintroduire tes composants un par un.
      </p>
    </div>
  );
}
