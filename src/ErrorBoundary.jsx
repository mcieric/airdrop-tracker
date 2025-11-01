import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("ErrorBoundary", err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:24}}>
          <h2>Component error</h2>
          <p>Un composant a planté (probablement un JSX mal fermé ou une importation circulaire).</p>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.err)}</pre>
          <p><a href="#/">Retour à l’accueil (safe)</a></p>
        </div>
      );
    }
    return this.props.children;
  }
}
