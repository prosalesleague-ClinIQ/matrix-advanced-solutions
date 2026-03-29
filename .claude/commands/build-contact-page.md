# Build Contact Page

## Inquiry routing (6 paths)
1. Request Catalog — fast, low-friction
2. Strategic Partnership — enterprise-grade
3. Product Questions — specific product inquiry
4. Growth Infrastructure — operational/marketing
5. Clinic Onboarding — start credentialing
6. General Contact — catch-all

## Flow
1. User sees 6 inquiry cards
2. Clicks one → card grid replaced with form
3. "Back to inquiry options" link above form
4. ContactForm renders with appropriate inquiryType and endpoint

## Form routing
- catalog → /api/request-catalog
- strategy → /api/strategy-call
- onboarding → /api/clinic-onboarding
- others → /api/contact

## Calendar placeholder
- Below form section
- "Calendar scheduling coming soon" message

## Reassurance
- Compliance note on form
- "Information will not be shared with unauthorized parties"
