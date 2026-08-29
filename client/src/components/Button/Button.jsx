import "./Button.css";

function Button({ text }) {
  return (
    <button className="custom-btn">
      {text}
    </button>
  );
}

export default Button;