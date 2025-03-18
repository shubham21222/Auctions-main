// No "use client" needed, works in Server Components

function FadeInStaggerTwo({ children, className = "", id = "" }) {
	return (
	  <div
		className={`animate-fade-in ${className}`} // Simple fade-in animation
		id={id}
	  >
		{children}
	  </div>
	);
  }
  
  function FadeInStaggerTwoChildren({ children, className = "", id = "" }) {
	return (
	  <div className={className} id={id}>
		{children} {/* No animation here, just a wrapper */}
	  </div>
	);
  }
  
  export { FadeInStaggerTwo, FadeInStaggerTwoChildren };