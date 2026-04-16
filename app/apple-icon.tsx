import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
          color: '#16181a',
          fontFamily: 'sans-serif',
          fontSize: 104,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    {
      ...size,
    }
  );
}
