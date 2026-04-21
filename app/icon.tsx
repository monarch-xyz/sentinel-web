import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
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
          borderRadius: '6px',
          color: '#2d3544',
          border: '1px solid rgba(92, 105, 126, 0.24)',
          fontFamily: 'sans-serif',
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        <div
          style={{
            width: 20,
            height: 14,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 19,
              height: 2,
              transform: 'rotate(-28deg)',
              backgroundColor: '#465a7a',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 14,
              height: 2,
              transform: 'translateY(5px) rotate(-28deg)',
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
