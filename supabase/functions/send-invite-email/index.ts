import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteEmailPayload {
  to: string;
  role: string;
  invitedBy?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured in Supabase Secrets.');
    }

    const body: InviteEmailPayload = await req.json();
    const { to, role, invitedBy } = body;

    if (!to || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [to],
        subject: `You've been invited to QAFlow Pro`,
        html: [
          '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; max-width: 480px; margin: 0 auto; background: #0B0D19; color: #E2E8F0; border-radius: 16px; overflow: hidden; border: 1px solid #1E2130;">',
          '  <div style="background: linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%); padding: 32px; text-align: center;">',
          '    <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: white; margin-bottom: 16px;">QF</div>',
          '    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: white;">You\'re Invited!</h1>',
          '    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">QAFlow Pro — Enterprise Testing Platform</p>',
          '  </div>',
          '  <div style="padding: 32px;">',
          '    <p style="font-size: 15px; line-height: 1.6; color: #CBD5E1; margin: 0 0 20px;">',
                 invitedBy ? '<strong style="color: white;">' + invitedBy + '</strong> has invited you' : 'You have been invited',
          '      to join the QAFlow Pro workspace as a <strong style="color: #818CF8;">' + role + '</strong>.',
          '    </p>',
          '    <div style="background: #13162C; border: 1px solid #1E2130; border-radius: 12px; padding: 16px; margin: 24px 0;">',
          '      <p style="margin: 0; font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Access Role</p>',
          '      <p style="margin: 4px 0 0; font-size: 18px; font-weight: 800; color: #818CF8;">' + role + '</p>',
          '    </div>',
          '    <a href="' + (Deno.env.get('APP_URL') || 'https://qa-report.vercel.app') + '" ',
          '       style="display: block; text-align: center; background: #4F46E5; color: white; padding: 14px 24px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px; margin: 24px 0;">',
          '      Accept Invitation & Sign In →',
          '    </a>',
          '    <p style="font-size: 12px; color: #475569; text-align: center; margin: 0;">',
          '      Click the button above and sign in with Google using this email address.<br/>',
          '      Access is restricted to invited users only.',
          '    </p>',
          '  </div>',
          '</div>'
        ].join('\n'),
      }),
    });

    const resendData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', resendData);
      throw new Error(resendData.message || 'Failed to send email via Resend');
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
