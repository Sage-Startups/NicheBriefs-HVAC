-- NicheBriefs HVAC — Demo Seed Script
-- Paste this into: Neon Console → your project → SQL Editor → Run
-- Safe to run multiple times (all inserts are ON CONFLICT DO NOTHING / idempotent)

DO $$
DECLARE
  v_user_id       uuid;
  v_workspace_id  uuid;
  v_sub_id        uuid;
  v_proj1_id      uuid;
  v_proj2_id      uuid;
  v_proj3_id      uuid;
BEGIN

  -- ── 1. Demo user ──────────────────────────────────────────────────────────
  INSERT INTO users (email, name, auth_provider, created_at, updated_at)
  VALUES ('demo@nichebriefs.com', 'Alex Morgan', 'credentials', NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO v_user_id FROM users WHERE email = 'demo@nichebriefs.com';
  RAISE NOTICE 'User id: %', v_user_id;

  -- ── 2. Workspace ──────────────────────────────────────────────────────────
  INSERT INTO workspaces (owner_user_id, name, created_at, updated_at)
  SELECT v_user_id, 'Summit Local SEO', NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM workspaces WHERE owner_user_id = v_user_id
  );

  SELECT id INTO v_workspace_id FROM workspaces WHERE owner_user_id = v_user_id;
  RAISE NOTICE 'Workspace id: %', v_workspace_id;

  -- ── 3. Subscription (trialing) ────────────────────────────────────────────
  INSERT INTO subscriptions (workspace_id, status, plan_name, current_period_end, created_at, updated_at)
  SELECT v_workspace_id, 'trialing', 'Trial', NOW() + INTERVAL '30 days', NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE workspace_id = v_workspace_id
  );

  -- ── 4. Projects ───────────────────────────────────────────────────────────
  INSERT INTO projects (workspace_id, name, default_city, default_service_area, notes, created_at, updated_at)
  SELECT v_workspace_id, 'Desert Air Pros', 'Phoenix', 'Phoenix, Scottsdale, Mesa, Tempe',
         'Family-owned HVAC company focused on emergency AC repair and maintenance plans.',
         NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE workspace_id = v_workspace_id AND name = 'Desert Air Pros'
  );

  INSERT INTO projects (workspace_id, name, default_city, default_service_area, notes, created_at, updated_at)
  SELECT v_workspace_id, 'NorthStar Heating & Cooling', 'Minneapolis', 'Minneapolis, St. Paul, Bloomington',
         'HVAC contractor specializing in furnace installation, heat pumps, and winter maintenance.',
         NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE workspace_id = v_workspace_id AND name = 'NorthStar Heating & Cooling'
  );

  INSERT INTO projects (workspace_id, name, default_city, default_service_area, notes, created_at, updated_at)
  SELECT v_workspace_id, 'Blue Ridge HVAC', 'Asheville', 'Asheville, Hendersonville, Weaverville',
         'Residential HVAC company focused on heat pumps, indoor air quality, and energy-efficient systems.',
         NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE workspace_id = v_workspace_id AND name = 'Blue Ridge HVAC'
  );

  SELECT id INTO v_proj1_id FROM projects WHERE workspace_id = v_workspace_id AND name = 'Desert Air Pros';
  SELECT id INTO v_proj2_id FROM projects WHERE workspace_id = v_workspace_id AND name = 'NorthStar Heating & Cooling';
  SELECT id INTO v_proj3_id FROM projects WHERE workspace_id = v_workspace_id AND name = 'Blue Ridge HVAC';

  -- ── 5. Demo briefs ────────────────────────────────────────────────────────

  -- Brief 1: AC Repair Phoenix
  INSERT INTO briefs (
    workspace_id, created_by_user_id, project_id, title, status,
    primary_keyword, target_city, service_type, page_type, search_intent,
    model_used, prompt_version, generated_brief_markdown, created_at, updated_at
  )
  SELECT
    v_workspace_id, v_user_id, v_proj1_id,
    'AC Repair in Phoenix SEO Brief', 'generated',
    'ac repair phoenix', 'Phoenix', 'AC repair', 'Local service page', 'Emergency service',
    'gpt-4o', 'hvac-v1',
    $brief1$# AC Repair in Phoenix SEO Brief

---

## Brief Summary
- **Keyword:** ac repair phoenix
- **Target City:** Phoenix
- **Service Type:** AC repair
- **Page Type:** Local service page
- **Search Intent:** Emergency service

## SEO Title
**Primary:** AC Repair in Phoenix, AZ | Fast & Reliable Service

**Alternatives:**
- Phoenix AC Repair — Same-Day Emergency HVAC Service
- Emergency AC Repair Phoenix | Licensed Technicians Available 24/7

## Meta Description
Need AC repair in Phoenix? Our licensed technicians respond fast — available 24/7. Serving Phoenix, Scottsdale, Mesa & Tempe. Call now for a free estimate.

## Suggested URL Slug
`/ac-repair-phoenix`

## Recommended H1
Phoenix AC Repair — Fast, Reliable Service When You Need It Most

## Search Intent Analysis
**What the searcher wants:** Immediate or same-day AC repair from a trusted local company, especially during Phoenix's extreme summer heat.

**What the page must satisfy:** Clear emergency availability, trust signals, fast contact, and evidence of local HVAC expertise.

## Content Outline
### Why Phoenix AC Repairs Can't Wait
> Extreme summer heat, health risks, property damage. Reference Phoenix average summer highs (verify).

### Common AC Problems We Repair in Phoenix
> Refrigerant leaks, frozen evaporator coils, faulty capacitors, dirty filters, compressor issues, thermostat failures.

### Our Phoenix AC Repair Process
> Step-by-step: diagnosis → transparent quote → repair → system test. No hidden fees.

### AC Repair Costs in Phoenix
> Estimated ranges (mark as estimates — verify before publishing). Financing options if available.

### Why Choose Us for AC Repair in Phoenix?
> Trust signals: years in business, AZ ROC license number, insurance, Google reviews, service area map.

### Areas We Serve
> Phoenix, Scottsdale, Mesa, Tempe, Chandler, Gilbert (verify with client).

### When to Repair vs. Replace Your AC
> Unit age (10–15 years), repair cost rule of thumb, energy efficiency upgrade benefits.

## Local SEO Recommendations
- Mention "Phoenix," "Scottsdale," "Mesa," "Tempe" naturally throughout copy
- Google Maps embed or service area section
- Schema: LocalBusiness, HVACBusiness
- Display AZ ROC contractor license number prominently
- 5-star review snippets from Google/Yelp
- 24/7 availability in H1, meta, and above-fold section
- NAP consistent with Google Business Profile

## Required Talking Points
- Arizona summer heat and health risks of AC failure
- AC failure symptoms (warm air, unusual noises, high bills, water leaks)
- Units serviced: central AC, mini-splits, heat pumps
- Refrigerant types and EPA regulations (no recharge without leak repair)
- Typical repair timeframes (same-day vs. parts-order)
- Service warranty (verify — typically 30–90 days on parts/labor)
- Arizona ROC license number — must be verified and displayed
- Bonded and insured — verify

## Competitor Angle Notes
No competitor URLs or content provided. No competitor pages crawled or analyzed. Add competitor notes in the brief form to generate differentiation guidance.

## FAQ Ideas
- How much does AC repair cost in Phoenix?
- How long does an AC repair take?
- Should I repair or replace my AC?
- Why is my AC blowing warm air?
- Do you offer 24/7 emergency AC repair in Phoenix?
- What brands of AC units do you service?
- How do I know if my AC needs refrigerant?

## Internal Link Suggestions
- /ac-installation-phoenix
- /hvac-maintenance
- /emergency-hvac-service
- /heat-pump-service

## CTA Recommendations
- Above fold: "Call Now — 24/7 Emergency Service" with phone number
- Mid-page: "Schedule AC Repair" form
- Footer: "Request a Free Estimate"
- Urgency banner: "Phoenix heat can't wait — call now for same-day service"

## Writer Instructions
Write in a confident, reassuring tone for homeowners facing urgent AC failure in Phoenix's extreme summer heat. All pricing ranges must be marked as estimates and verified with the client before publishing. Licensing numbers, insurance status, and warranty terms must be confirmed before final copy goes live. Do not make unsupported claims about response times.

---
*Generated by NicheBriefs HVAC*$brief1$,
    NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM briefs WHERE workspace_id = v_workspace_id AND title = 'AC Repair in Phoenix SEO Brief'
  );

  -- Brief 2: Furnace Installation Cost Minneapolis
  INSERT INTO briefs (
    workspace_id, created_by_user_id, project_id, title, status,
    primary_keyword, target_city, service_type, page_type, search_intent,
    model_used, prompt_version, generated_brief_markdown, created_at, updated_at
  )
  SELECT
    v_workspace_id, v_user_id, v_proj2_id,
    'Furnace Installation Cost in Minneapolis SEO Brief', 'generated',
    'furnace installation cost minneapolis', 'Minneapolis', 'Furnace installation', 'Cost guide', 'Cost research',
    'gpt-4o', 'hvac-v1',
    $brief2$# Furnace Installation Cost in Minneapolis SEO Brief

---

## Brief Summary
- **Keyword:** furnace installation cost minneapolis
- **Target City:** Minneapolis
- **Service Type:** Furnace installation
- **Page Type:** Cost guide
- **Search Intent:** Cost research

## SEO Title
**Primary:** Furnace Installation Cost in Minneapolis (2024 Guide)

**Alternatives:**
- How Much Does Furnace Installation Cost in Minneapolis?
- Minneapolis Furnace Installation Prices — What to Budget

## Meta Description
Furnace installation in Minneapolis costs $2,500–$7,500+ depending on unit size, efficiency, and labor. Transparent breakdown from local HVAC experts. Free estimates available.

## Suggested URL Slug
`/furnace-installation-cost-minneapolis`

## Recommended H1
Furnace Installation Cost in Minneapolis: What to Expect in 2024

## Search Intent Analysis
**What the searcher wants:** Transparent pricing to budget for a new furnace, understand cost factors, and evaluate next steps.

**What the page must satisfy:** Detailed cost breakdowns, efficiency rating explanations, financing options, and a clear path to getting a local estimate.

## Content Outline
### Average Furnace Installation Cost in Minneapolis
> Tiers (estimate — verify): budget $2,500–$4,000, mid-range $4,000–$6,000, high-efficiency $6,000–$9,000+.

### Factors That Affect Cost
> BTU capacity, AFUE rating, brand, existing ductwork condition, permit fees, labor rates, time of year.

### Furnace Efficiency Ratings (AFUE) Explained
> 80% vs. 95%+ AFUE: upfront cost vs. long-term savings. Minnesota rebates. Cold-climate recommendations.

### Labor Costs in Minneapolis
> Typical labor hours and contractor rates (estimate — verify). Permit requirements.

### Financing Options
> Manufacturer financing, Xcel Energy rebates (verify current programs), federal tax credits (verify IRS guidance), in-house plans.

### When to Replace vs. Repair
> Age threshold (15–20 years), 50% rule, rising repair costs, efficiency decline.

## Local SEO Recommendations
- Reference Minneapolis, St. Paul, Bloomington, and suburbs
- Mention Minnesota winters and cold-climate furnace requirements
- Schema: LocalBusiness, Service, FAQPage
- Minnesota Dept. of Labor contractor license number
- Xcel Energy or CenterPoint Energy rebate mention

## Required Talking Points
- Manual J load calculation — never guess furnace size
- AFUE 80% vs. 95%+ for cold-climate homes
- Minneapolis winter BTU requirements
- Ductwork inspection and modification costs
- Minnesota mechanical permit requirements (verify)
- Carbon monoxide detector requirement
- Warranty: manufacturer vs. labor (verify)
- Typical install time (1 day for straightforward replacement)

## Competitor Angle Notes
No competitor content provided. No competitor pages visited or analyzed.

## FAQ Ideas
- How much does a new furnace cost in Minneapolis?
- What size furnace do I need for a Minneapolis home?
- Is 95% AFUE worth it in Minnesota?
- How long does furnace installation take?
- Are there rebates for furnace installation in Minneapolis?
- How long does a furnace last in Minnesota?
- What brands do you install?

## Internal Link Suggestions
- /furnace-repair-minneapolis
- /heat-pump-installation
- /hvac-maintenance
- /emergency-hvac-service

## CTA Recommendations
- Primary: "Get a Free Furnace Installation Estimate"
- Secondary: "Call to Schedule an In-Home Assessment"
- Financing: "Ask About Our Financing Options"

## Writer Instructions
Informative, trustworthy tone for Minneapolis homeowners researching furnace replacement. Label all cost figures as estimates. Verify all rebate programs, permit requirements, and warranty terms before publishing.

---
*Generated by NicheBriefs HVAC*$brief2$,
    NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM briefs WHERE workspace_id = v_workspace_id AND title = 'Furnace Installation Cost in Minneapolis SEO Brief'
  );

  -- Brief 3: Heat Pump vs Furnace
  INSERT INTO briefs (
    workspace_id, created_by_user_id, project_id, title, status,
    primary_keyword, target_city, service_type, page_type, search_intent,
    model_used, prompt_version, generated_brief_markdown, created_at, updated_at
  )
  SELECT
    v_workspace_id, v_user_id, v_proj3_id,
    'Heat Pump vs Furnace SEO Brief', 'generated',
    'heat pump vs furnace', 'Asheville', 'Heat pump service', 'Comparison article', 'Comparison',
    'gpt-4o', 'hvac-v1',
    $brief3$# Heat Pump vs Furnace SEO Brief

---

## Brief Summary
- **Keyword:** heat pump vs furnace
- **Target City:** Asheville
- **Service Type:** Heat pump service
- **Page Type:** Comparison article
- **Search Intent:** Comparison

## SEO Title
**Primary:** Heat Pump vs Furnace: Which Is Right for Asheville Homes?

**Alternatives:**
- Heat Pump vs. Gas Furnace — Asheville Homeowner's Guide
- Comparing Heat Pumps and Furnaces for Western NC Homes

## Meta Description
Heat pump or furnace? Compare costs, efficiency, and climate suitability for Asheville, NC. Our HVAC experts break down what works best in Western North Carolina.

## Suggested URL Slug
`/heat-pump-vs-furnace-asheville`

## Recommended H1
Heat Pump vs. Furnace: The Complete Guide for Asheville Homeowners

## Search Intent Analysis
**What the searcher wants:** An objective comparison to decide between a heat pump and gas furnace for their specific climate and home.

**What the page must satisfy:** Side-by-side comparison, pros/cons, Western NC climate suitability, cost analysis, and a path to consultation.

## Content Outline
### Quick Comparison Table
> Efficiency, climate fit, upfront cost, operating cost, fuel type, lifespan. Mark as general estimates.

### How Heat Pumps Work
> Heat transfer technology. Dual heating/cooling. Cold-climate heat pump (CCHP) for Asheville winters.

### How Gas Furnaces Work
> Combustion heating. AFUE ratings. Reliability in very cold temps.

### Climate Suitability for Asheville, NC
> Mild-to-moderate winters. Heat pump performance at low temps. CCHP performance. Mountain elevation context.

### Cost Comparison: Upfront and Operating
> Install ranges (estimate — verify). Operating costs. IRS Section 25C credits (verify).

### Heat Pump Pros and Cons
> Pros: efficiency, dual heating/cooling, lower carbon footprint. Cons: extreme cold performance, higher upfront cost.

### Gas Furnace Pros and Cons
> Pros: reliable in extreme cold, lower upfront cost. Cons: fuel costs, emissions.

### Which Is Right for Your Asheville Home?
> Decision framework: existing infrastructure, home insulation, budget, environmental priorities.

### Dual Fuel Systems
> Heat pump + gas backup as an option for Western NC homes.

## Local SEO Recommendations
- Reference Asheville, Hendersonville, Weaverville, Black Mountain
- Western NC mountain climate context
- Duke Energy or local utility rebate links (verify)
- Schema: FAQPage, Article, LocalBusiness
- NC contractor licensing mention (verify)

## Required Talking Points
- Cold-climate heat pump (CCHP) technology and balance point temperature
- Asheville elevation and winter temperature effects
- Ductless mini-split option for homes without ductwork
- Federal IRA heat pump tax credits (verify current guidance)
- NC utility rebates (verify)
- Carbon footprint: NC electricity grid mix vs. natural gas
- Home insulation quality as a factor in system choice

## Competitor Angle Notes
No competitor URLs or content provided. No competitor pages visited or analyzed.

## FAQ Ideas
- Are heat pumps effective in Asheville winters?
- Is a heat pump cheaper to run than a gas furnace?
- Can a heat pump replace my furnace completely?
- What is a cold-climate heat pump?
- How much does a heat pump cost in Asheville, NC?
- Should I get a dual fuel system in Western NC?
- What tax credits are available for heat pumps?

## Internal Link Suggestions
- /heat-pump-installation-asheville
- /furnace-installation
- /indoor-air-quality
- /hvac-maintenance

## CTA Recommendations
- Primary: "Talk to an Asheville HVAC Expert — Free Consultation"
- Secondary: "Get a Free Heat Pump vs. Furnace Quote"
- Bottom: "Schedule Your In-Home Assessment Today"

## Writer Instructions
Educational, balanced tone. Verify all cost figures, tax credit amounts, and rebate programs before publishing — these change frequently. Do not advocate for one system without explaining the reader's specific situation factors.

---
*Generated by NicheBriefs HVAC*$brief3$,
    NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM briefs WHERE workspace_id = v_workspace_id AND title = 'Heat Pump vs Furnace SEO Brief'
  );

  -- Brief 4: HVAC Maintenance Checklist
  INSERT INTO briefs (
    workspace_id, created_by_user_id, project_id, title, status,
    primary_keyword, target_city, service_type, page_type, search_intent,
    model_used, prompt_version, generated_brief_markdown, created_at, updated_at
  )
  SELECT
    v_workspace_id, v_user_id, v_proj1_id,
    'HVAC Maintenance Checklist SEO Brief', 'generated',
    'hvac maintenance checklist', 'Denver', 'HVAC maintenance', 'Seasonal maintenance guide', 'Maintenance',
    'gpt-4o', 'hvac-v1',
    $brief4$# HVAC Maintenance Checklist SEO Brief

---

## Brief Summary
- **Keyword:** hvac maintenance checklist
- **Target City:** Denver
- **Service Type:** HVAC maintenance
- **Page Type:** Seasonal maintenance guide
- **Search Intent:** Maintenance

## SEO Title
**Primary:** HVAC Maintenance Checklist for Denver Homeowners (2024)

**Alternatives:**
- Complete HVAC Maintenance Checklist — Denver & Front Range Guide
- Seasonal HVAC Maintenance Checklist for Colorado Homes

## Meta Description
Keep your HVAC efficient with our seasonal maintenance checklist for Denver homeowners. DIY tasks + when to call a pro. Schedule your annual tune-up today.

## Suggested URL Slug
`/hvac-maintenance-checklist-denver`

## Recommended H1
HVAC Maintenance Checklist for Denver Homeowners: Seasonal Guide

## Search Intent Analysis
**What the searcher wants:** A practical, actionable checklist for maintaining their HVAC system seasonally — DIY vs. professional task breakdown.

**What the page must satisfy:** Seasonal breakdowns, clear DIY vs. pro distinction, and a CTA for professional tune-ups.

## Content Outline
### Why HVAC Maintenance Matters in Denver
> Colorado's wide temperature swings, high altitude, dry climate effects. Cost of neglect.

### Spring Checklist (Pre-Cooling Season)
> Clean condenser coils, check refrigerant (pro only), test cooling, replace filter, thermostat calibration.

### Summer Tasks
> Monthly filter checks, condenser clearance (12"), monitor for issues, check drainage line.

### Fall Checklist (Pre-Heating Season)
> Furnace: heat exchanger (pro only — CO risk), burner cleaning, flue inspection, humidifier maintenance.

### Winter Tasks
> Monthly filter checks, heat pump ice check, CO detector test, keep vents clear.

### DIY Tasks
> Filter replacement, thermostat battery, vent cleaning, outdoor clearance, drainage flushing.

### When to Call a Denver HVAC Pro
> Refrigerant (EPA 608), heat exchanger, electrical, gas line, ductwork inspection.

### Denver-Specific Considerations
> High altitude pressure, dry climate static, wildfire smoke filtration, hailstorm damage inspection.

## Local SEO Recommendations
- Reference Denver, Aurora, Lakewood, Englewood, Littleton
- Colorado altitude and climate specifics
- Wildfire smoke season and air quality
- Schema: HowTo, FAQPage, LocalBusiness
- ENERGY STAR maintenance guidance as authority source

## Required Talking Points
- Filter types and frequency (1-inch: monthly, 4-inch: 6–12 months — verify)
- Denver altitude (~5,280 ft) and HVAC efficiency effects
- Dry climate: humidifier importance
- Heat exchanger: annual inspection is a safety non-negotiable (CO risk)
- Refrigerant: homeowners cannot handle — EPA 608 tech required
- Wildfire smoke: MERV filter recommendations
- Hail damage: outdoor unit inspection after storms

## Competitor Angle Notes
No competitor data provided. No competitor websites visited or analyzed.

## FAQ Ideas
- How often should HVAC be serviced in Denver?
- What does an HVAC tune-up include?
- Can I do HVAC maintenance myself?
- How often should I change my air filter in Denver?
- What maintenance is needed before winter in Colorado?
- How much does an HVAC tune-up cost in Denver?
- Does Denver's altitude affect HVAC performance?

## Internal Link Suggestions
- /ac-repair-denver
- /furnace-repair-denver
- /indoor-air-quality
- /hvac-maintenance-plans

## CTA Recommendations
- Primary: "Schedule Your Annual HVAC Tune-Up in Denver"
- Secondary: "Join Our Maintenance Plan — Save on Annual Service"
- Seasonal urgency: "Don't skip fall maintenance — book before the first cold snap"

## Writer Instructions
Practical, helpful tone for Denver homeowners. Clearly separate DIY from professional tasks. Never encourage homeowners to handle refrigerant or inspect heat exchangers — safety and legal requirements. Verify all claims before publishing.

---
*Generated by NicheBriefs HVAC*$brief4$,
    NOW(), NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM briefs WHERE workspace_id = v_workspace_id AND title = 'HVAC Maintenance Checklist SEO Brief'
  );

  RAISE NOTICE 'Seed complete. Demo login: demo@nichebriefs.com / demo';

END $$;
