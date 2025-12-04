
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
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '5px',
        }}
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            width="32"
            height="32"
        >
            <defs>
                <linearGradient id="logo-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stop-color="hsl(250, 80%, 60%)" />
                <stop offset="100%" stop-color="hsl(25, 100%, 50%)" />
                </linearGradient>
            </defs>
            <rect width="200" height="200" rx="40" fill="url(#logo-gradient)"></rect>
            <text
                x="50%"
                y="50%"
                font-family="Poppins, sans-serif"
                font-size="120"
                font-weight="bold"
                fill="hsl(0, 0%, 98%)"
                text-anchor="middle"
                dy=".38em"
            >
                S
            </text>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
