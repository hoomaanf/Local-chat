export default function Loading({ color }) {
  return (
    <div className="flex space-x-2">
      <div
        className={`w-3 h-3 bg-white !bg-${color} rounded-full animate-bounce [animation-delay:-0.3s]`}
      ></div>
      <div
        className={`w-3 h-3 bg-white !bg-${color} rounded-full animate-bounce [animation-delay:-0.15s]`}
      ></div>
      <div
        className={`w-3 h-3 bg-white !bg-${color} rounded-full animate-bounce`}
      ></div>
    </div>
  );
}
