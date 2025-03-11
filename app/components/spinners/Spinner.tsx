import type React from "react"

interface SpinnerProps {
  size?: number
  color?: string
  borderWidth?: number
  speed?: number
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = "#ffffff", // Changed default to white
  borderWidth = 4,
  speed = 0.75,
  className = "",
}) => {
  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        className={className}
        style={{
          display: "inline-block",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          border: `${borderWidth}px solid rgba(255, 255, 255, 0.2)`, // Lighter white for the track
          borderLeftColor: color,
          animation: `spin ${speed}s linear infinite`,
        }}
      />
    </>
  )
}

export default Spinner

