$files = Get-ChildItem -Recurse -File -Include *.html,*.js,*.css,*.ts,*.tsx |
    Where-Object {
        $_.FullName -notmatch '\\(node_modules|dist|.git)\\'
    }

$replacements = @{
    'â€º' = '›'
    'â€¹' = '‹'
    'â€œ' = '“'
    'â€' = '”'
    'â€™' = '’'
    'â€˜' = '‘'
    'â€“' = '–'
    'â€”' = '—'
    'â€¦' = '…'
    'Â®'  = '®'
    'Â©'  = '©'
    'Â·'  = '·'
    'â†’' = '→'
    'â†' = '←'
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    foreach ($bad in $replacements.Keys) {
        $content = $content.Replace($bad, $replacements[$bad])
    }

    # Remove invalid control characters that can make Vite/parse5 fail.
    $content = [regex]::Replace(
        $content,
        '[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]',
        ''
    )

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}