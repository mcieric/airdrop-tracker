import { Link } from "react-router-dom";

export default function PublicLinkButton({ wallet }) {
  const fallback = "0x88ac3d64230c8a453492ff908a02daa27e9b3429";
  const w = (wallet || fallback).toLowerCase();

  return (
    <Link
      to={`/public/${w}`}
      className="btn btn-ghost"
      style={{
        marginLeft: "10px",
        padding: "6px 14px",
        fontSize: "0.9rem",
        fontWeight: "500",
        border: "1px solid #ffd54f",
        color: "#ffd54f",
        backgroundColor: "transparent",
        borderRadius: "12px",
        transition: "all 0.2s ease",
      }}
    >
      View public page
    </Link>
  );
}
