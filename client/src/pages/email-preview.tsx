import logoPath from "@assets/inkalchemy_1752303410066.png";

export default function EmailPreview() {
  // Sample confirmation URL for preview
  const sampleConfirmationURL = "https://your-supabase-project.supabase.co/auth/v1/verify?token=sample-token&type=signup";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-900 mb-4">Email Template Preview</h1>
          <p className="text-brand-600">This is how your verification email will look to users</p>
        </div>

        {/* Email Preview Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div style={{ fontFamily: 'Cairo, Arial, sans-serif' }}>
            {/* Email Content */}
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, hsl(45, 70%, 96%) 0%, hsl(45, 67%, 88%) 100%)',
                padding: '40px 30px',
                textAlign: 'center' as const,
                borderBottom: '2px solid hsl(44, 59%, 53%)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 20px'
                }}>
                  <img 
                    src={logoPath}
                    alt="InkAlchemy Logo"
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain' as const
                    }}
                  />
                </div>
                <h1 style={{ 
                  margin: '0', 
                  color: 'hsl(26, 55%, 14%)', 
                  fontSize: '28px', 
                  fontWeight: '800' 
                }}>
                  InkAlchemy
                </h1>
                <p style={{ 
                  margin: '8px 0 0', 
                  color: 'hsl(35, 62%, 33%)', 
                  fontSize: '14px' 
                }}>
                  Worldbuilding Management Platform
                </p>
              </div>
              
              {/* Content */}
              <div style={{
                padding: '40px 30px',
                textAlign: 'center' as const
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'hsl(26, 55%, 14%)',
                  marginBottom: '16px'
                }}>
                  Welcome to Your Creative Journey!
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: 'hsl(29, 48%, 26%)',
                  lineHeight: '1.6',
                  marginBottom: '32px'
                }}>
                  Thank you for joining InkAlchemy! We're excited to help you build incredible worlds and tell amazing stories.
                  <br /><br />
                  To get started with your worldbuilding adventure, please confirm your email address by clicking the button below.
                </p>
                
                <a 
                  href={sampleConfirmationURL}
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'hsl(44, 59%, 53%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '14px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'hsl(41, 62%, 46%)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'hsl(44, 59%, 53%)'}
                >
                  Confirm Your Account
                </a>
              </div>
              
              {/* Footer */}
              <div style={{
                backgroundColor: 'hsl(45, 70%, 96%)',
                padding: '30px',
                textAlign: 'center' as const,
                borderTop: '1px solid hsl(45, 67%, 88%)'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: 'hsl(35, 62%, 33%)',
                  marginBottom: '8px'
                }}>
                  <strong>Having trouble clicking the button?</strong><br />
                  Copy and paste this link into your browser:
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'hsl(38, 61%, 40%)',
                  wordBreak: 'break-all' as const,
                  margin: '8px 0'
                }}>
                  {sampleConfirmationURL}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'hsl(35, 62%, 33%)',
                  marginTop: '20px'
                }}>
                  If you didn't create an InkAlchemy account, you can safely ignore this email.
                </p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}