
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
        }}
      >
        <LogoIcon width={32} height={32} />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
