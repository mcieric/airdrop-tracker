// src/lib/meta.js
export function setMetaTags({ wallet, tvlUSD, realizedUSD }) {
  const title = `Airdrop Tracker — ${wallet.slice(0, 6)}…${wallet.slice(-4)}`
  const desc = `TVL : $${tvlUSD.toLocaleString()} | PnL : $${realizedUSD.toLocaleString()}`
  const image = `${window.location.origin}/og/airdrop.jpg` // image statique (tu peux la personnaliser)

  const metaTags = [
    { name: "title", content: title },
    { name: "description", content: desc },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:image", content: image },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:image", content: image },
  ]

  metaTags.forEach(({ name, property, content }) => {
    const tagName = name ? "name" : "property"
    const tagValue = name || property
    let tag = document.querySelector(`meta[${tagName}='${tagValue}']`)
    if (!tag) {
      tag = document.createElement("meta")
      tag.setAttribute(tagName, tagValue)
      document.head.appendChild(tag)
    }
    tag.setAttribute("content", content)
  })

  document.title = title
}
