import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users, workspaces, subscriptions, projects, briefs } from "./schema";
import { eq } from "drizzle-orm";

const DEMO_EMAIL = "demo@nichebriefs.com";

async function seed() {
  console.log("🌱 Seeding demo data...");

  // 1. Demo user
  let user = await db.query.users.findFirst({ where: eq(users.email, DEMO_EMAIL) });
  if (!user) {
    [user] = await db.insert(users).values({
      email: DEMO_EMAIL,
      name: "Alex Morgan",
      authProvider: "credentials",
    }).returning();
    console.log("✅ Created demo user:", user.email);
  } else {
    console.log("⏭ Demo user already exists");
  }

  // 2. Workspace
  let workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.ownerUserId, user.id),
  });
  if (!workspace) {
    [workspace] = await db.insert(workspaces).values({
      ownerUserId: user.id,
      name: "Summit Local SEO",
    }).returning();
    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      status: "trialing",
      planName: "Trial",
    });
    console.log("✅ Created workspace: Summit Local SEO");
  } else {
    console.log("⏭ Workspace already exists");
  }

  // 3. Projects
  const existingProjects = await db.query.projects.findMany({
    where: eq(projects.workspaceId, workspace.id),
  });

  const projectDefs = [
    {
      name: "Desert Air Pros",
      defaultCity: "Phoenix",
      defaultServiceArea: "Phoenix, Scottsdale, Mesa, Tempe",
      notes: "Family-owned HVAC company focused on emergency AC repair and maintenance plans.",
    },
    {
      name: "NorthStar Heating & Cooling",
      defaultCity: "Minneapolis",
      defaultServiceArea: "Minneapolis, St. Paul, Bloomington",
      notes: "HVAC contractor specializing in furnace installation, heat pumps, and winter maintenance.",
    },
    {
      name: "Blue Ridge HVAC",
      defaultCity: "Asheville",
      defaultServiceArea: "Asheville, Hendersonville, Weaverville",
      notes: "Residential HVAC company focused on heat pumps, indoor air quality, and energy-efficient systems.",
    },
  ];

  const projectMap: Record<string, string> = {};
  for (const def of projectDefs) {
    const existing = existingProjects.find((p) => p.name === def.name);
    if (existing) {
      projectMap[def.name] = existing.id;
      console.log(`⏭ Project already exists: ${def.name}`);
    } else {
      const [p] = await db.insert(projects).values({ workspaceId: workspace.id, ...def }).returning();
      projectMap[def.name] = p.id;
      console.log(`✅ Created project: ${def.name}`);
    }
  }

  // 4. Demo briefs
  const existingBriefs = await db.query.briefs.findMany({
    where: eq(briefs.workspaceId, workspace.id),
  });

  const briefDefs = [
    {
      title: "AC Repair in Phoenix SEO Brief",
      projectName: "Desert Air Pros",
      primaryKeyword: "ac repair phoenix",
      targetCity: "Phoenix",
      serviceType: "AC repair",
      pageType: "Local service page",
      searchIntent: "Emergency service",
      generatedBriefMarkdown: generateAcRepairBrief(),
    },
    {
      title: "Furnace Installation Cost in Minneapolis SEO Brief",
      projectName: "NorthStar Heating & Cooling",
      primaryKeyword: "furnace installation cost minneapolis",
      targetCity: "Minneapolis",
      serviceType: "Furnace installation",
      pageType: "Cost guide",
      searchIntent: "Cost research",
      generatedBriefMarkdown: generateFurnaceCostBrief(),
    },
    {
      title: "Heat Pump vs Furnace SEO Brief",
      projectName: "Blue Ridge HVAC",
      primaryKeyword: "heat pump vs furnace",
      targetCity: "Asheville",
      serviceType: "Heat pump service",
      pageType: "Comparison article",
      searchIntent: "Comparison",
      generatedBriefMarkdown: generateHeatPumpComparisonBrief(),
    },
    {
      title: "HVAC Maintenance Checklist SEO Brief",
      projectName: "Desert Air Pros",
      primaryKeyword: "hvac maintenance checklist",
      targetCity: "Denver",
      serviceType: "HVAC maintenance",
      pageType: "Seasonal maintenance guide",
      searchIntent: "Maintenance",
      generatedBriefMarkdown: generateMaintenanceBrief(),
    },
  ];

  for (const def of briefDefs) {
    const existing = existingBriefs.find((b) => b.title === def.title);
    if (existing) {
      console.log(`⏭ Brief already exists: ${def.title}`);
      continue;
    }
    const { projectName, generatedBriefMarkdown, ...rest } = def;
    await db.insert(briefs).values({
      workspaceId: workspace.id,
      createdByUserId: user.id,
      projectId: projectMap[projectName] ?? null,
      status: "generated",
      modelUsed: "gpt-4o",
      promptVersion: "hvac-v1",
      generatedBriefMarkdown,
      ...rest,
    });
    console.log(`✅ Created brief: ${def.title}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`\nDemo login:\n  Email: ${DEMO_EMAIL}\n  Password: demo`);
  process.exit(0);
}

function generateAcRepairBrief(): string {
  return `# AC Repair in Phoenix SEO Brief

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
Need AC repair in Phoenix? Our licensed technicians respond fast — available 24/7 for emergency service. Serving Phoenix, Scottsdale, Mesa & Tempe. Call now for a free estimate.

## Suggested URL Slug
\`/ac-repair-phoenix\`

## Recommended H1
Phoenix AC Repair — Fast, Reliable Service When You Need It Most

## Search Intent Analysis
**What the searcher wants:** Immediate or same-day AC repair from a trusted local company, especially during Phoenix's extreme summer heat.

**What the page must satisfy:** Clear emergency availability, trust signals, fast contact options (phone/form), and evidence of local expertise in the Phoenix area.

## Content Outline
## Why Phoenix AC Repairs Can't Wait
> Emphasize the danger of heat in Phoenix summers. Note average temperatures and health risks of AC failure. Link to emergency service section.

## Common AC Problems We Repair in Phoenix
> Cover: refrigerant leaks, frozen evaporator coils, faulty capacitors, dirty air filters, compressor issues, thermostat failures.

## Our Phoenix AC Repair Process
> Step-by-step: diagnosis, transparent quote, repair, test. Emphasize speed and no hidden fees.

## AC Repair Costs in Phoenix — What to Expect
> Provide estimated ranges (mark as estimates — verify before publishing). Factors: part type, age of unit, brand, time of day. Note financing options if available.

## Why Choose Us for AC Repair in Phoenix?
> Trust signals: years in business, licensing/insurance, service area map, reviews, BBB, warranty.

## Service Areas We Cover
> List: Phoenix, Scottsdale, Mesa, Tempe, Chandler, Gilbert (verify with client).

## When to Repair vs. Replace Your AC
> Age of unit (10–15 years), repair cost vs. replacement cost rule of thumb, energy efficiency upgrade benefits.

## Local SEO Recommendations
- Mention "Phoenix," "Scottsdale," "Mesa," and "Tempe" naturally throughout copy
- Include a Google Maps embed or service area section
- Add schema markup: LocalBusiness, HVACBusiness
- Display licensing numbers and insurance badges prominently
- Show 5-star review snippets from Google/Yelp with client names
- Note 24/7 emergency availability in the H1, meta, and above-the-fold section
- Ensure NAP (name, address, phone) is consistent with Google Business Profile

## Required Talking Points
- Arizona summer heat and AC failure health risks
- Common AC failure symptoms (warm air, unusual noises, high bills, water leaks)
- Types of AC units serviced (central AC, mini-splits, heat pumps)
- Refrigerant types and EPA regulations (do not recharge without leak repair)
- Typical repair timeframes (same-day vs. parts-order scenarios)
- Service warranty coverage (verify with client — typically 30–90 days on parts/labor)
- Financing or payment plan options
- Licensing: Arizona Registrar of Contractors (ROC) number required — verify and display
- Insurance: bonded and insured (verify)
- Safety: carbon monoxide, electrical hazards — when to shut off system

## Competitor Angle Notes
No competitor URLs or content were provided. No competitor pages were crawled or analyzed. Add competitor notes in the brief form to generate differentiation guidance.

## FAQ Ideas
- How much does AC repair cost in Phoenix?
- How long does an AC repair take?
- Is it better to repair or replace my AC unit?
- Why is my AC blowing warm air?
- Do you offer 24/7 emergency AC repair in Phoenix?
- What brands of AC units do you service?
- How do I know if my AC needs refrigerant?

## Internal Link Suggestions
- "AC installation Phoenix" → /ac-installation-phoenix
- "HVAC maintenance plans" → /hvac-maintenance
- "Emergency HVAC service" → /emergency-hvac-service
- "Heat pump repair" → /heat-pump-service

## CTA Recommendations
- Primary CTA (above fold): "Call Now — 24/7 Emergency Service" with phone number
- Secondary CTA: "Schedule AC Repair" form
- Footer CTA: "Request a Free Estimate"
- Emergency banner: "Phoenix's extreme heat can't wait — call now for same-day service"

## Writer Instructions
Write in a confident, reassuring tone appropriate for homeowners experiencing an urgent AC failure in Phoenix's extreme summer heat. Emphasize local expertise and fast response. All pricing ranges must be marked as estimates and verified with the client before publishing. Licensing numbers, insurance status, and warranty terms must be confirmed before final copy goes live. Do not make unsupported claims about response times or guarantees.

---
*Generated by NicheBriefs HVAC*`;
}

function generateFurnaceCostBrief(): string {
  return `# Furnace Installation Cost in Minneapolis SEO Brief

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
Furnace installation in Minneapolis costs $2,500–$7,500+ depending on unit size, efficiency, and labor. Get a transparent breakdown from local HVAC experts. Free estimates available.

## Suggested URL Slug
\`/furnace-installation-cost-minneapolis\`

## Recommended H1
Furnace Installation Cost in Minneapolis: What to Expect in 2024

## Search Intent Analysis
**What the searcher wants:** Transparent pricing information to budget for a new furnace installation, understand cost factors, and evaluate whether to proceed.

**What the page must satisfy:** Detailed cost breakdowns, efficiency rating explanations, financing options, and a clear path to getting a local estimate.

## Content Outline
## Average Furnace Installation Cost in Minneapolis
> Provide cost ranges by unit tier (estimate — verify): budget ($2,500–$4,000), mid-range ($4,000–$6,000), high-efficiency ($6,000–$9,000+). Note that Minneapolis winters require higher-capacity units.

## Factors That Affect Furnace Installation Cost
> Cover: BTU capacity, AFUE efficiency rating, brand, existing ductwork condition, permit fees, labor rates, time of year.

## Furnace Efficiency Ratings Explained (AFUE)
> 80% vs. 95%+ AFUE: upfront cost vs. long-term savings. Minnesota energy rebates. Cold climate recommendations.

## Labor Costs for Furnace Installation in Minneapolis
> Typical labor hours, Minneapolis HVAC contractor rates (estimate range — verify). Permit requirements.

## Furnace Brands and Price Comparison
> Note: do not rank brands without verification. List popular brands (Carrier, Lennox, Trane, Rheem) with general tier positioning. Mark as general guidance.

## Financing Options for Minneapolis Homeowners
> Manufacturer financing, utility rebates (Xcel Energy — verify current programs), federal tax credits (verify IRS guidance), in-house payment plans.

## When to Replace vs. Repair Your Furnace
> Age threshold (15–20 years), 50% rule, rising repair costs, efficiency decline.

## Getting a Furnace Installation Quote in Minneapolis
> What to expect in an in-home estimate. Questions to ask contractors.

## Local SEO Recommendations
- Reference Minneapolis, St. Paul, Bloomington, and surrounding suburbs
- Mention Minnesota winters and cold-climate furnace requirements
- Link to Minnesota energy rebate programs (verify current programs)
- Add schema: LocalBusiness, Service, FAQPage
- Display ROC/contractor license number (Minnesota Department of Labor)
- Mention Xcel Energy or CenterPoint Energy rebate eligibility

## Required Talking Points
- Furnace sizing: Manual J load calculation importance — never guess furnace size
- AFUE rating: 80% vs. 95%+ and cold-climate implications
- Minneapolis average winter temperatures and BTU requirements
- Ductwork inspection and modification costs
- Carbon monoxide detector requirement during installation
- Minnesota mechanical permit requirements (verify local requirements)
- Warranty: manufacturer warranty vs. labor warranty (verify with client)
- Timeline: typical installation time (1 day for straightforward replacement)
- Disposal of old furnace (recycling/disposal fees)

## Competitor Angle Notes
No competitor content was provided. Competitor URLs are treated as reference labels only — not analyzed. Add pasted competitor content to generate differentiation notes.

## FAQ Ideas
- How much does a new furnace cost in Minneapolis?
- What size furnace do I need for a Minneapolis home?
- Is a 95% AFUE furnace worth it in Minnesota?
- How long does furnace installation take?
- Are there rebates for furnace installation in Minneapolis?
- How long does a furnace last in Minnesota?
- What brands of furnaces do you install?

## Internal Link Suggestions
- "Furnace repair Minneapolis" → /furnace-repair-minneapolis
- "Heat pump installation" → /heat-pump-installation
- "HVAC maintenance plans" → /hvac-maintenance
- "Emergency furnace repair" → /emergency-hvac-service

## CTA Recommendations
- Primary CTA: "Get a Free Furnace Installation Estimate"
- Secondary CTA: "Call Now to Schedule an In-Home Assessment"
- Financing CTA: "Ask About Our Financing Options"
- Urgency note: "Don't wait for a breakdown — replace before winter hits"

## Writer Instructions
Write in an informative, trustworthy tone for Minneapolis homeowners researching furnace replacement. Clearly label all cost figures as estimates and direct readers to get a personalized quote. Verify all rebate programs, permit requirements, and warranty terms before publishing. Do not make specific guarantees about energy savings without verified data.

---
*Generated by NicheBriefs HVAC*`;
}

function generateHeatPumpComparisonBrief(): string {
  return `# Heat Pump vs Furnace SEO Brief

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
Heat pump or furnace? Compare costs, efficiency, and climate suitability for Asheville, NC homes. Our HVAC experts break down what works best in Western North Carolina.

## Suggested URL Slug
\`/heat-pump-vs-furnace-asheville\`

## Recommended H1
Heat Pump vs. Furnace: The Complete Guide for Asheville Homeowners

## Search Intent Analysis
**What the searcher wants:** An objective, clear comparison to help decide between a heat pump and gas furnace for their specific climate and home situation.

**What the page must satisfy:** Side-by-side comparison, pros/cons, climate suitability for Western NC, cost analysis, and a path to professional consultation.

## Content Outline
## Heat Pump vs. Furnace: Quick Comparison
> Summary table: efficiency, climate suitability, upfront cost, operating cost, fuel type, lifespan. Mark as general estimates.

## How Heat Pumps Work
> Simple explanation of heat transfer technology. Cooling capability as a bonus. Cold-climate heat pump (CCHP) option for Asheville winters.

## How Gas Furnaces Work
> Combustion heating. AFUE ratings. Reliability in very cold temperatures.

## Climate Suitability for Asheville, NC
> Asheville's mild-to-moderate winters (avg January low: ~24°F — verify). Heat pump performance at low temps. Where cold-climate heat pumps outperform standard models. Rare extreme cold events.

## Cost Comparison: Upfront and Operating
> Installation cost ranges (estimate — verify): heat pump vs. gas furnace. Operating cost factors: electricity rates vs. gas rates in Asheville area. Long-term savings potential. Federal tax credits for heat pumps (IRS Section 25C — verify current guidance).

## Pros and Cons of Heat Pumps
> Pros: efficiency, dual heating/cooling, lower carbon footprint, tax credits. Cons: performance in extreme cold, higher upfront cost, requires electrical upgrades in some homes.

## Pros and Cons of Gas Furnaces
> Pros: reliable in extreme cold, lower upfront cost, familiar technology. Cons: fuel costs, carbon emissions, requires gas line.

## Which Is Right for Your Asheville Home?
> Decision framework: existing fuel infrastructure, home insulation, budget, environmental priorities.

## Dual Fuel Systems: The Best of Both
> Brief mention of heat pump + gas backup systems as an option for Western NC homes.

## Local SEO Recommendations
- Reference Asheville, Hendersonville, Weaverville, Black Mountain service areas
- Note Western NC climate specifics (mountain climate, mild winters with occasional cold snaps)
- Link to Duke Energy or local utility rebate programs (verify current programs)
- Add schema: FAQPage, Article, LocalBusiness
- Mention NC contractor licensing requirements (verify)

## Required Talking Points
- Cold-climate heat pump (CCHP) technology — performance at sub-freezing temps
- Balance point temperature: when heat pump needs backup heating
- Asheville elevation and its effect on winter temperatures
- Ductless mini-split heat pump option for homes without ductwork
- Federal Inflation Reduction Act tax credits for heat pumps (verify current IRA guidance)
- NC Utilities Commission and local utility rebates (verify)
- Carbon footprint comparison: electricity grid mix in NC vs. natural gas
- Home insulation quality as a factor in system choice
- Timeline and disruption of installation

## Competitor Angle Notes
No competitor URLs or content were provided. No competitor pages were visited or analyzed. Add competitor content to generate differentiation recommendations.

## FAQ Ideas
- Are heat pumps effective in Asheville winters?
- Is a heat pump cheaper to run than a gas furnace?
- Can a heat pump replace my furnace completely?
- What is a cold-climate heat pump?
- How much does a heat pump cost in Asheville, NC?
- Should I get a dual fuel system in Western North Carolina?
- What tax credits are available for heat pumps in 2024?

## Internal Link Suggestions
- "Heat pump installation Asheville" → /heat-pump-installation-asheville
- "Furnace installation" → /furnace-installation
- "Indoor air quality" → /indoor-air-quality
- "HVAC maintenance" → /hvac-maintenance

## CTA Recommendations
- Primary CTA: "Talk to an Asheville HVAC Expert — Free Consultation"
- Secondary CTA: "Get a Free Heat Pump vs. Furnace Quote"
- Bottom CTA: "Schedule Your In-Home Assessment Today"

## Writer Instructions
Write in an educational, balanced tone. Do not advocate for one system over another without explaining the reader's specific situation factors. Verify all cost figures, tax credit amounts, and rebate programs before publishing — these change frequently. Climate data for Asheville should be verified against NOAA or local sources. Avoid overpromising energy savings without qualified data.

---
*Generated by NicheBriefs HVAC*`;
}

function generateMaintenanceBrief(): string {
  return `# HVAC Maintenance Checklist SEO Brief

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
Keep your HVAC running efficiently with our complete seasonal maintenance checklist for Denver homeowners. DIY tasks + when to call a pro. Schedule your annual tune-up today.

## Suggested URL Slug
\`/hvac-maintenance-checklist-denver\`

## Recommended H1
HVAC Maintenance Checklist for Denver Homeowners: Seasonal Guide

## Search Intent Analysis
**What the searcher wants:** A practical, actionable checklist for maintaining their HVAC system seasonally, understanding what they can do themselves vs. what requires a professional.

**What the page must satisfy:** Clear seasonal breakdowns, DIY vs. professional task distinction, and a clear CTA for professional tune-ups.

## Content Outline
## Why HVAC Maintenance Matters in Denver
> Colorado's wide temperature swings, high altitude considerations, and dry climate effects on HVAC systems. Cost of neglect (efficiency loss, early failure).

## Spring HVAC Maintenance Checklist (Pre-Cooling Season)
> AC inspection tasks: clean condenser coils, check refrigerant levels (professional only), test cooling operation, replace air filter, check thermostat calibration. DIY vs. pro distinction.

## Summer HVAC Maintenance Tasks
> Monthly filter checks, condenser unit clearance (12" clearance), monitoring for unusual noises, checking drainage line.

## Fall HVAC Maintenance Checklist (Pre-Heating Season)
> Furnace inspection: heat exchanger inspection (professional only — carbon monoxide risk), burner cleaning, flue inspection, test heat operation, humidifier maintenance (Denver's dry climate).

## Winter HVAC Maintenance Tasks
> Monthly filter checks, thermostat settings, checking for ice on outdoor unit (heat pump), carbon monoxide detector testing, keeping vents clear.

## DIY HVAC Maintenance Tasks
> Safe tasks: filter replacement (frequency guide), thermostat battery, vent cleaning, outdoor unit clearance, drainage line flushing.

## When to Call a Denver HVAC Professional
> Tasks requiring pros: refrigerant handling (EPA Section 608), heat exchanger inspection, electrical component testing, gas line work, ductwork inspection.

## Denver-Specific Maintenance Considerations
> High altitude air pressure effects, dry climate and static, wildfire smoke and air filtration, hailstorm damage inspection.

## HVAC Maintenance Plans vs. One-Time Tune-Ups
> Comparison of service options. What a maintenance plan typically includes. Cost vs. DIY.

## Local SEO Recommendations
- Reference Denver, Aurora, Lakewood, Englewood, Littleton service areas
- Note Colorado's altitude and climate specifics
- Mention Denver wildfire smoke season and air quality considerations
- Add schema: HowTo, FAQPage, LocalBusiness
- Link to Colorado state contractor licensing info (verify)
- Reference ENERGY STAR maintenance guidance as authority source

## Required Talking Points
- Air filter types and replacement frequency (1-inch: monthly, 4-inch: every 6–12 months — verify)
- Denver altitude: ~5,280 ft and effects on HVAC efficiency
- Dry climate: humidifier importance and maintenance
- Carbon monoxide: annual heat exchanger inspection is non-negotiable safety item
- Refrigerant: homeowners cannot handle refrigerant — EPA Section 608 certified tech required
- Wildfire smoke season and MERV filter recommendations for Denver
- Hail damage: Denver hailstorms can damage outdoor units — annual inspection recommended
- ENERGY STAR certified systems and maintenance requirements for warranty

## Competitor Angle Notes
No competitor data was provided. No competitor websites were visited or analyzed. Add pasted competitor content to generate differentiation guidance.

## FAQ Ideas
- How often should HVAC be serviced in Denver?
- What does an HVAC tune-up include?
- Can I do HVAC maintenance myself?
- How often should I change my air filter in Denver?
- What HVAC maintenance is needed before winter in Colorado?
- How much does an HVAC tune-up cost in Denver?
- Does Denver's altitude affect HVAC performance?

## Internal Link Suggestions
- "AC repair Denver" → /ac-repair-denver
- "Furnace repair Denver" → /furnace-repair-denver
- "Indoor air quality Denver" → /indoor-air-quality
- "HVAC maintenance plans" → /hvac-maintenance-plans

## CTA Recommendations
- Primary CTA: "Schedule Your Annual HVAC Tune-Up in Denver"
- Secondary CTA: "Join Our Maintenance Plan — Save on Annual Service"
- Seasonal urgency CTA: "Don't skip fall maintenance — book before the first cold snap"

## Writer Instructions
Write in a practical, helpful tone for Denver homeowners who want to be proactive about HVAC care. Clearly distinguish between DIY tasks and tasks that require a licensed HVAC technician. Never encourage homeowners to handle refrigerant or inspect heat exchangers — these are professional-only tasks with safety and legal implications. Verify all filter replacement schedules, altitude claims, and rebate information before publishing.

---
*Generated by NicheBriefs HVAC*`;
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
