import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Megabat - The sensing layer for DeFi agents';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#16181a',
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255, 159, 28, 0.08) 0%, transparent 40%)',
          padding: '48px',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Left side - Branding */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '50%',
            paddingRight: '32px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: '#ff6b35',
                color: '#16181a',
                fontSize: '28px',
                fontWeight: 700,
                fontFamily: 'sans-serif',
              }}
            >
              M
            </div>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'white',
                marginLeft: '12px',
                fontFamily: 'sans-serif',
              }}
            >
              Megabat
            </span>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'sans-serif',
                lineHeight: 1.2,
              }}
            >
              Detect Subtle Movement
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'sans-serif',
                lineHeight: 1.2,
              }}
            >
              Before It Gets Loud
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '20px',
              color: '#8e8e8e',
              fontFamily: 'sans-serif',
            }}
          >
            State, indexed, and raw signals for DeFi agents • Built by Monarch
          </div>
        </div>

        {/* Right side - Code Preview */}
        <div
          style={{
            display: 'flex',
            width: '50%',
            paddingLeft: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: '#1e2124',
              borderRadius: '12px',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Code window header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#16181a',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27ca40' }} />
              </div>
              <span style={{ marginLeft: '16px', color: '#6e6e6e', fontSize: '14px', fontFamily: 'monospace' }}>
                signal.json
              </span>
            </div>

            {/* Code content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                fontFamily: 'monospace',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#e0e0e0',
              }}
            >
              <span><span style={{ color: '#6e6e6e' }}>{'{'}</span></span>
              <span style={{ paddingLeft: '20px' }}>
                <span style={{ color: '#ff9f1c' }}>{'"type"'}</span><span style={{ color: '#6e6e6e' }}>:</span> <span style={{ color: '#a5d6ff' }}>{'"threshold"'}</span><span style={{ color: '#6e6e6e' }}>,</span>
              </span>
              <span style={{ paddingLeft: '20px' }}>
                <span style={{ color: '#ff9f1c' }}>{'"metric"'}</span><span style={{ color: '#6e6e6e' }}>:</span> <span style={{ color: '#a5d6ff' }}>{'"ERC4626.Position.shares"'}</span><span style={{ color: '#6e6e6e' }}>,</span>
              </span>
              <span style={{ paddingLeft: '20px' }}>
                <span style={{ color: '#ff9f1c' }}>{'"operator"'}</span><span style={{ color: '#6e6e6e' }}>:</span> <span style={{ color: '#a5d6ff' }}>{'">"'}</span><span style={{ color: '#6e6e6e' }}>,</span>
              </span>
              <span style={{ paddingLeft: '20px' }}>
                <span style={{ color: '#ff9f1c' }}>{'"value"'}</span><span style={{ color: '#6e6e6e' }}>:</span> <span style={{ color: '#79c0ff' }}>0.9</span><span style={{ color: '#6e6e6e' }}>,</span>
              </span>
              <span style={{ paddingLeft: '20px' }}>
                <span style={{ color: '#ff9f1c' }}>{'"window"'}</span><span style={{ color: '#6e6e6e' }}>:</span> <span style={{ color: '#a5d6ff' }}>{'"1h"'}</span>
              </span>
              <span><span style={{ color: '#6e6e6e' }}>{'}'}</span></span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
