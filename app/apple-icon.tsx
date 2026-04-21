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
          background: '#f7f6ef',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '32px',
          color: '#2d3544',
          border: '3px solid rgba(92, 105, 126, 0.24)',
          fontFamily: 'sans-serif',
          fontSize: 104,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            width: 104,
            height: 76,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 98,
              height: 9,
              transform: 'rotate(-28deg)',
              backgroundColor: '#465a7a',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 72,
              height: 9,
              transform: 'translateY(24px) rotate(-28deg)',
              backgroundColor: '#a3523d',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
