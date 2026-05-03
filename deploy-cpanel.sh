#!/usr/bin/env bash
set -euo pipefail

FTP_HOST="amyr.ir"
FTP_USER="dastyar@amyr.ir"
FTP_PASS="amiR#3039023"
FTP_DIR="/"

echo "==> Building static export..."
BUILD_OUTPUT=export \
BASE_PATH=/dastyar \
NEXT_PUBLIC_API_URL=https://dastyar.xenops.ir \
NEXT_PUBLIC_API_PROXY=https://amyr.ir/pr \
npm run build

echo "==> Uploading to cPanel FTP..."
lftp -c "
  set ssl:verify-certificate no
  open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
  mirror --reverse --delete --verbose --exclude-glob .git/ ./out/ $FTP_DIR
  bye
"

echo "==> Done. https://amyr.ir/dastyar"
