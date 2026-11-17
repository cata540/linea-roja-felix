param([int]$Rate = -2)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'data\voice'
New-Item -ItemType Directory -Force $out | Out-Null
$sent = Get-Content (Join-Path $root 'data\sentences.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('Microsoft Helena Desktop')
$s.Rate = $Rate
$s.Volume = 100
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($x in $sent) {
  $f = Join-Path $out ('s_{0:D4}.wav' -f $x.id)
  if (Test-Path $f) { continue }
  $s.SetOutputToWaveFile($f, $fmt)
  $s.Speak($x.tts)
  $s.SetOutputToNull()
}
$s.Dispose()
Write-Output ("hechas: " + (Get-ChildItem $out -Filter *.wav).Count)
