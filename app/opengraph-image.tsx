import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Iruka - Open data signals for smarter agents';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function SocialImage() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        backgroundColor: '#f7f6ef',
        color: '#2d3544',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(91, 105, 126, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(91, 105, 126, 0.08) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: '0 auto auto 0',
          width: '100%',
          height: '150px',
          backgroundColor: 'rgba(70, 90, 122, 0.06)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          gap: '28px',
        }}
      >
        <div
          style={{
            width: '54%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                border: '1px solid rgba(91, 105, 126, 0.28)',
                backgroundColor: '#fbfaf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '24px',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', width: '32px', height: '3px', transform: 'translateY(9px) rotate(-28deg)', backgroundColor: '#465a7a' }} />
                <div style={{ position: 'absolute', width: '24px', height: '3px', transform: 'translate(5px, 17px) rotate(-28deg)', backgroundColor: '#a3523d' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '58px', lineHeight: 1, fontWeight: 500 }}>Iruka</span>
              <span style={{ fontSize: '16px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7480' }}>
                Open Data Signals
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '52px', lineHeight: 1.08, fontWeight: 500 }}>
              Onchain conditions, kept quietly in view.
            </div>
            <div style={{ fontSize: '22px', lineHeight: 1.5, color: '#566270' }}>
              State, indexed history, and raw events for agents built on open data.
            </div>
          </div>
        </div>

        <div
          style={{
            width: '46%',
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '8px',
              border: '1px solid rgba(91, 105, 126, 0.24)',
              backgroundColor: '#fbfaf4',
              overflow: 'hidden',
              boxShadow: '0 18px 38px -28px rgba(31, 45, 68, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderBottom: '1px solid rgba(91, 105, 126, 0.18)',
                backgroundColor: 'rgba(247, 246, 239, 0.92)',
              }}
            >
              <span style={{ fontSize: '15px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8e7c6b' }}>
                Condition Set
              </span>
              <span style={{ fontSize: '14px', color: '#465a7a' }}>Ready</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '22px 20px' }}>
              {[
                'State: ERC4626.Position.shares dropped 22%',
                'Indexed: net supply turned negative over 6h',
                'Raw: USDC transfer burst crossed the threshold',
              ].map((line, index) => (
                <div
                  key={line}
                  style={{
                    borderRadius: '7px',
                    border: '1px solid rgba(91, 105, 126, 0.18)',
                    backgroundColor: index === 0 ? 'rgba(232, 234, 226, 0.72)' : 'rgba(248, 247, 241, 0.96)',
                    padding: '16px',
                    fontSize: '18px',
                    lineHeight: 1.45,
                    color: '#2d3544',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Image() {
  return new ImageResponse(<SocialImage />, { ...size });
}
