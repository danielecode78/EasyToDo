export default function Button({ children, onClick, className = "" }) {
  return (
    <button className={`button-theme ${className}`} onClick={onClick}>
      <div className="scale-div">{children}</div>
    </button>
  );
}
