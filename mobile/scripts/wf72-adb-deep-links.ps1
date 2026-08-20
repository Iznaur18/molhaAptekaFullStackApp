# WF-7.2 cold-open deep links on Samsung (USB + adb).
# Usage: .\mobile\scripts\wf72-adb-deep-links.ps1 -ProductId <mongoId> [-RaffleId ..] [-UserId ..] [-SellerId ..]

param(
  [string]$ProductId = "REPLACE_PRODUCT_ID",
  [string]$RaffleId = "REPLACE_RAFFLE_ID",
  [string]$UserId = "REPLACE_USER_ID",
  [string]$SellerId = "REPLACE_SELLER_ID"
)

$links = @(
  "gitorg://product/$ProductId",
  "gitorg://raffle/$RaffleId",
  "gitorg://seller/$SellerId",
  "gitorg://user/$UserId",
  "gitorg://users",
  "gitorg://hub/wishlist",
  "gitorg://orders",
  "https://gitorg.ru/product/$ProductId"
)

foreach ($uri in $links) {
  Write-Host "`n>>> $uri" -ForegroundColor Cyan
  adb shell am start -a android.intent.action.VIEW -d $uri
  Read-Host "Проверь экран, Enter для следующей ссылки"
}
