import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Note: Mobile upload might not have a session cookie if it's a direct link.
    // We should allow upload if a valid sessionId is provided in the form data.
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let userId = user?.id;
    let rewardHistoryId: string | null = null;

    if (sessionId) {
      // Validate session
      const { data: session, error: sessionError } = await supabase
        .from('upload_sessions')
        .select('*, reward_history(*)')
        .eq('id', sessionId)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
      }

      userId = session.user_id;
      rewardHistoryId = session.reward_history_id;
      
      // Mark session as used
      await supabase
        .from('upload_sessions')
        .update({ used: true })
        .eq('id', sessionId);
    } else if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Proxy the upload to Cloudinary using the unsigned preset
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const data = await cloudinaryResponse.json();

    if (!data.secure_url) {
      return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }

    // If we have a rewardHistoryId, update it immediately
    if (rewardHistoryId) {
      await supabase
        .from('reward_history')
        .update({ image_url: data.secure_url })
        .eq('id', rewardHistoryId);
    }

    return NextResponse.json({
      imageUrl: data.secure_url,
      publicId: data.public_id,
      rewardHistoryId
    });
  } catch (error: any) {
    console.error('UPLOAD API ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
