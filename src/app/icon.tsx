
import { ImageResponse } from 'next/og'
import { LogoIcon } from '@/components/logo-icon'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '5px',
          background: 'linear-gradient(to bottom right, hsl(250, 80%, 60%), hsl(25, 100%, 50%))',
        }}
      >
        <text
            x="50%"
            y="50%"
            fontFamily="--font-poppins, sans-serif"
            fontSize="24"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            dy=".38em"
        >
            S
        </text>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
