#!/bin/bash

# Zapier Integration Quick Start Script
# Automates environment setup and testing for Blue Lawns pool lead integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
  echo -e "${2}${1}${NC}"
}

print_header() {
  echo ""
  echo "============================================================"
  print_color "$1" "$BOLD"
  echo "============================================================"
  echo ""
}

print_success() {
  print_color "✓ $1" "$GREEN"
}

print_error() {
  print_color "✗ $1" "$RED"
}

print_warning() {
  print_color "⚠ $1" "$YELLOW"
}

print_info() {
  print_color "→ $1" "$CYAN"
}

# Check if running from correct directory
if [ ! -f "package.json" ]; then
  print_error "This script must be run from the project root directory"
  exit 1
fi

print_header "🔗 Blue Lawns Zapier Integration - Quick Start"

print_info "This script will help you set up the Zapier → Jobber integration"
echo ""

# Step 1: Check for .env file
print_header "Step 1: Environment Configuration"

if [ ! -f ".env" ]; then
  print_warning ".env file not found"
  
  if [ -f ".env.template" ]; then
    print_info "Creating .env from template..."
    cp .env.template .env
    print_success ".env file created"
  else
    print_error ".env.template not found. Cannot proceed."
    exit 1
  fi
else
  print_success ".env file exists"
fi

# Step 2: Check for required environment variables
print_header "Step 2: Validating Environment Variables"

ENV_FILE=".env"
REQUIRED_VARS=("ZAPIER_WEBHOOK_URL_POOL" "ECOAST_POOL_EMAIL" "RESEND_API_KEY" "CONTACT_EMAIL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=..*" "$ENV_FILE"; then
    MISSING_VARS+=("$var")
    print_error "$var is not configured"
  else
    print_success "$var is configured"
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo ""
  print_warning "Some required variables are missing or empty"
  echo ""
  print_info "To complete setup, you need to:"
  echo ""
  
  for var in "${MISSING_VARS[@]}"; do
    case $var in
      "ZAPIER_WEBHOOK_URL_POOL")
        echo "  1. Create a Zap at: https://zapier.com/app/zaps"
        echo "     - Trigger: Webhooks by Zapier → Catch Hook"
        echo "     - Copy the webhook URL"
        echo "     - Add to .env: ZAPIER_WEBHOOK_URL_POOL=<your_webhook_url>"
        echo ""
        ;;
      "RESEND_API_KEY")
        echo "  2. Get Resend API key from: https://resend.com/api-keys"
        echo "     - Add to .env: RESEND_API_KEY=re_<your_key>"
        echo ""
        ;;
      "ECOAST_POOL_EMAIL")
        echo "  3. Set Ecoast Pool Service email:"
        echo "     - Add to .env: ECOAST_POOL_EMAIL=leads@ecoastpools.com"
        echo ""
        ;;
      "CONTACT_EMAIL")
        echo "  4. Set Blue Lawns contact email:"
        echo "     - Add to .env: CONTACT_EMAIL=info@bluelawns.com"
        echo ""
        ;;
    esac
  done
  
  print_info "See detailed instructions in: integrations/zapier/SETUP-GUIDE.md"
  echo ""
  
  read -p "Have you added the missing variables to .env? (y/N) " -n 1 -r
  echo ""
  
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Please update .env file and run this script again"
    exit 1
  fi
fi

# Step 3: Test webhook connection
print_header "Step 3: Testing Webhook Connection"

print_info "Running webhook test script..."
echo ""

if bun run integrations/zapier/testWebhook.js; then
  echo ""
  print_success "Webhook test passed!"
else
  echo ""
  print_error "Webhook test failed"
  print_info "Check the error messages above for troubleshooting"
  exit 1
fi

# Step 4: Verify Zapier setup
print_header "Step 4: Next Steps"

echo ""
print_info "Integration setup is complete! Here's what to do next:"
echo ""
echo "  1. Go to your Zapier dashboard: https://zapier.com/app/zaps"
echo "  2. Find the test data that was just sent"
echo "  3. Complete the Zap configuration:"
echo "     - Action 1: Jobber → Create Client Request"
echo "     - Action 2: Email → Send to leads@ecoastpools.com"
echo "  4. Turn ON your Zap"
echo "  5. Test the form at: http://localhost:4321/pools"
echo ""
print_info "For detailed instructions, see:"
print_color "  → integrations/zapier/SETUP-GUIDE.md" "$CYAN"
echo ""

# Step 5: Deployment checklist
print_header "Step 5: Production Deployment"

echo ""
print_warning "Before deploying to production, ensure you:"
echo ""
echo "  [ ] Have tested the form locally"
echo "  [ ] Verified webhook receives data correctly"
echo "  [ ] Configured Zapier Zap completely"
echo "  [ ] Turned ON the Zap in Zapier"
echo "  [ ] Added environment variables to Vercel:"
echo "      - ZAPIER_WEBHOOK_URL_POOL"
echo "      - ECOAST_POOL_EMAIL"
echo "      - RESEND_API_KEY"
echo "      - CONTACT_EMAIL"
echo "  [ ] Tested form submission on staging/preview"
echo "  [ ] Verified email delivery to Ecoast Pools"
echo "  [ ] Confirmed lead appears in Jobber"
echo ""

print_success "Quick start complete!"
echo ""
print_info "For support or issues, refer to:"
print_color "  → output/blue-lawns/tracking-map.md" "$CYAN"
print_color "  → integrations/zapier/SETUP-GUIDE.md" "$CYAN"
echo ""

