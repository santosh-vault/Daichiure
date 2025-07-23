import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of blocked domains (temporary/disposable email services)
const BLOCKED_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'temp-mail.org', 'throwaway.email', 'getnada.com', '20minutemail.com',
  'fakeinbox.com', 'dispostable.com', 'yopmail.com', 'maildrop.cc',
  'mailnesia.com', 'trashmail.com', 'sharklasers.com', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'mohmal.com', 'mytrashmail.com', 'spamgourmet.com', 'tempr.email',
  'emailondeck.com', 'guerrillamailblock.com', 'spam4.me', 'tempail.com',
  'tmailor.com', 'burnermail.io', 'tempmailo.com', 'minuteinbox.com',
  '33mail.com', 'dropmail.me', 'emailfake.com', 'temporarymail.com'
]

// Email validation function
function validateEmail(email: string): { isValid: boolean; message?: string } {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' }
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return { isValid: false, message: 'Invalid email domain' }
  }

  // Check if domain is in blocked list
  if (BLOCKED_DOMAINS.some(blocked => domain.includes(blocked) || blocked.includes(domain))) {
    return { 
      isValid: false, 
      message: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address.' 
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = ['temp', 'fake', 'test', 'disposable', 'trash', 'spam']
  if (suspiciousPatterns.some(pattern => domain.includes(pattern))) {
    return { isValid: false, message: 'Please use a legitimate email address' }
  }

  // Check domain structure
  if (!domain.includes('.') || domain.split('.').length < 2) {
    return { isValid: false, message: 'Invalid email domain structure' }
  }

  // Validate TLD
  const domainParts = domain.split('.')
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2 || tld.length > 6) {
    return { isValid: false, message: 'Invalid top-level domain' }
  }

  return { isValid: true }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Debug logging
    console.log('Environment check:', {
      hasUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      url: Deno.env.get('SUPABASE_URL'),
      serviceKeyLength: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length
    })

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, fullName } = await req.json()

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return new Response(
        JSON.stringify({ error: emailValidation.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Additional password validation
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers()
    const emailExists = existingUser?.users?.some(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    )

    if (emailExists) {
      return new Response(
        JSON.stringify({ error: 'Email already registered. Please try logging in instead.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If validation passes, proceed with signup
    const { data, error } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName || '',
      },
      email_confirm: false // Set to true if you want email confirmation
    })

    if (error) {
      console.error('Signup error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize user rewards data
    try {
      const initResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/initialize-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ user_id: data.user.id })
      })
      
      if (!initResponse.ok) {
        console.error('Failed to initialize user rewards')
      }
    } catch (initError) {
      console.error('Error initializing user rewards:', initError)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Account created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
