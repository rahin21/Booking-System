import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const path = u.pathname; // /<cloud>/<type>/upload/<optional transforms>/v1234/folder/name.jpg
    const uploadIndex = path.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    const afterUpload = path.slice(uploadIndex + '/upload/'.length);

    // Prefer extracting content AFTER the version segment (v1234/), skipping any transforms
    const versionMatch = afterUpload.match(/^(?:[^/]+\/)*v\d+\/(.+)$/);
    let withoutVersionOrTransforms: string;
    if (versionMatch && versionMatch[1]) {
      withoutVersionOrTransforms = versionMatch[1];
    } else {
      // Fallback: if no version is present, assume no transforms and use the remainder
      withoutVersionOrTransforms = afterUpload;
    }

    // Remove extension
    const lastDot = withoutVersionOrTransforms.lastIndexOf('.');
    const publicId = lastDot !== -1 ? withoutVersionOrTransforms.slice(0, lastDot) : withoutVersionOrTransforms;
    return publicId || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, public_id } = body || {};

    let pid = public_id as string | undefined;
    if (!pid && url) {
      pid = getPublicIdFromUrl(url) || undefined;
    }

    if (!pid) {
      return NextResponse.json({ error: 'Missing public_id or parsable url' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(pid);
    if (result.result !== 'ok' && result.result !== 'not found') {
      // not found is acceptable if asset already deleted
      return NextResponse.json({ error: 'Cloudinary deletion failed', result }, { status: 500 });
    }

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: error?.message || 'Delete failed' }, { status: 500 });
  }
}