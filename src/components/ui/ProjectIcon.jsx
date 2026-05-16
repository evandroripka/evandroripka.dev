const paths = {
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </>
  ),
  screen: (
    <>
      <path d="M4 5h16v10H4z" />
      <path d="M8 19h8" />
      <path d="M12 15v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 7v6c0 4 3.5 7 8 8 4.5-1 8-4 8-8V7l-8-4Z" />
      <path d="M9 12h6" />
      <path d="M12 9v6" />
    </>
  ),
}

export default function ProjectIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name] || paths.layers}
    </svg>
  )
}
