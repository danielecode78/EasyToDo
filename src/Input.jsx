function Input({
  onKeyDown,
  onChange,
  value,
  maxLength,
  className,
  placeholder,
  inputRef,
}) {
  return (
    <input
      ref={inputRef}
      maxLength={maxLength}
      className={`input-theme w-full ${className || ""}`}
      onKeyDown={onKeyDown}
      onChange={onChange}
      value={value || ""}
      type="text"
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}

export default Input;
