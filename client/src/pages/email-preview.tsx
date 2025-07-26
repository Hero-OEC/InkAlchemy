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
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '40px 30px',
                textAlign: 'center' as const,
                borderBottom: '2px solid #0ea5e9'
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
                  color: '#0c4a6e', 
                  fontSize: '28px', 
                  fontWeight: '800' 
                }}>
                  InkAlchemy
                </h1>
                <p style={{ 
                  margin: '8px 0 0', 
                  color: '#0369a1', 
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
                  color: '#0c4a6e',
                  marginBottom: '16px'
                }}>
                  Welcome to Your Creative Journey!
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#374151',
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
                    backgroundColor: '#0ea5e9',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '14px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                >
                  Confirm Your Account
                </a>
              </div>
              
              {/* Footer */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '30px',
                textAlign: 'center' as const,
                borderTop: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  <strong>Having trouble clicking the button?</strong><br />
                  Copy and paste this link into your browser:
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  wordBreak: 'break-all' as const,
                  margin: '8px 0'
                }}>
                  {sampleConfirmationURL}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginTop: '20px'
                }}>
                  If you didn't create an InkAlchemy account, you can safely ignore this email.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-brand-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brand-900 mb-4">How to Apply This Template</h3>
          <ol className="list-decimal list-inside space-y-2 text-brand-700">
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to <strong>Authentication → Email Templates</strong></li>
            <li>Select <strong>"Confirm signup"</strong> template</li>
            <li>Copy the HTML content from <code>email-templates/confirm-signup.html</code></li>
            <li>Replace the default template content</li>
            <li>Save your changes</li>
          </ol>
          <p className="mt-4 text-sm text-brand-600">
            The template uses Supabase variables like <code>{"{{ .ConfirmationURL }}"}</code> which will be automatically replaced with real confirmation links.
          </p>
        </div>
      </div>
    </div>
  );
}