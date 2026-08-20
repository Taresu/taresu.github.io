// Verificação end-to-end: screenshots desktop/mobile, toggle PT/EN, link do CV.
// Usa o puppeteer já instalado em ../WebDev-Portfolio (evita novo download do Chromium).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(__dirname, '../WebDev-Portfolio/package.json'));
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:3100';
const outDir = path.join(__dirname, 'temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });

const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function revealAll(page) {
  await page.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y <= document.body.scrollHeight; y += 350) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await sleep(70);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await sleep(900);
}

async function gotoSection(page, id) {
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
  }, id);
  await sleep(400);
}

const results = {};
results.iconNetworkRequests = [];
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// ── Desktop ──
const page = await browser.newPage();
page.on('request', request => {
  const url = request.url();
  if (/lucide|tabler|iconify|\/icons\//i.test(url) && !url.startsWith(BASE)) {
    results.iconNetworkRequests.push(url);
  }
});
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(9000); // animação de digitação do terminal
await page.evaluate(() => document.querySelector('[data-credential]')?.scrollIntoView({ behavior: 'instant' }));
await page.waitForFunction(
  () => [...document.querySelectorAll('[data-credential-badge]')].every(image => image.complete && image.naturalWidth > 0),
  { timeout: 5000 },
);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
results.profile = await page.evaluate(() => ({
  title: document.title,
  role: document.querySelector('[data-i18n="hero.role"]')?.textContent.trim(),
  nerdz: {
    card: Boolean(document.querySelector('[data-project="nerdz"]')),
    link: document.querySelector('[data-project="nerdz"] a')?.href,
  },
  linkedProjects: ['veripkg', 'nerdz', 'portal', 'vespas'].map(name => {
    const card = document.querySelector(`[data-project="${name}"]`);
    return {
      name,
      isLink: card?.matches('a'),
      href: card?.href,
      target: card?.target,
      rel: card?.rel,
      keyboardFocusable: card?.tabIndex === 0,
      nestedLinkCount: card?.querySelectorAll('a').length,
    };
  }),
  veripkg: {
    title: document.querySelector('[data-project="veripkg"] h3')?.textContent.trim(),
    summary: document.querySelector('[data-project="veripkg"] [data-i18n="proj.veripkg.d"]')?.textContent.trim(),
    tags: [...document.querySelectorAll('[data-project="veripkg"] .chip')].map(tag => tag.textContent.trim()),
  },
  voip: {
    isLink: document.querySelector('[data-project="voip"]')?.matches('a'),
    visibility: document.querySelector('[data-project="voip"] [data-project-visibility]')?.textContent.trim(),
  },
  tcc: {
    card: Boolean(document.querySelector('[data-project="tcc"]')),
    firstProject: document.querySelector('#projetos article')?.dataset.project,
    title: document.querySelector('[data-project="tcc"] h3')?.textContent.trim(),
    summary: document.querySelector('[data-project="tcc"] [data-i18n="proj.tcc.d"]')?.textContent.trim(),
    link: document.querySelector('[data-project="tcc"] [data-tcc-link]')?.href,
    course: {
      href: document.querySelector('[data-project="tcc"] [data-course-link]')?.href,
      target: document.querySelector('[data-project="tcc"] [data-course-link]')?.target,
      rel: document.querySelector('[data-project="tcc"] [data-course-link]')?.rel,
    },
  },
  oldExperienceCount: [...document.querySelectorAll('#experiencia article')].filter(article =>
    /Estagiário de TI|IT Intern|Assistant Webmaster/i.test(article.textContent)
  ).length,
  cmcRole: document.querySelector('[data-i18n="exp.cmcRole"]')?.textContent.trim(),
  skills: document.querySelector('#skills')?.textContent,
  lineIcons: [...document.querySelectorAll('svg.line-icon')].map(icon => ({
    name: icon.dataset.icon,
    context: icon.dataset.iconContext,
    ariaHidden: icon.getAttribute('aria-hidden'),
    focusable: icon.getAttribute('focusable'),
    href: icon.querySelector('use')?.getAttribute('href'),
  })),
  iconMap: [...document.querySelectorAll('svg.line-icon')]
    .map(icon => `${icon.dataset.iconContext}:${icon.dataset.icon}`)
    .sort()
    .join('|'),
  projectIcons: [...document.querySelectorAll('svg.line-icon[data-icon-context="project"]')].map(icon => ({
    project: icon.closest('[data-project]')?.dataset.project,
    name: icon.dataset.icon,
    href: icon.querySelector('use')?.getAttribute('href'),
  })),
  skillPrompts: [...document.querySelectorAll('#skills > div > .grid > div > h3')].map(heading => heading.textContent.trim()),
  spriteSymbols: [...document.querySelectorAll('#line-icon-sprite symbol')].map(symbol => symbol.id),
  aiSkillGroup: (() => {
    const group = document.querySelector('[data-skill-group="ai"]');
    const grid = group?.parentElement;
    const heading = group?.querySelector('h3');
    const groupBounds = group?.getBoundingClientRect();
    const gridBounds = grid?.getBoundingClientRect();
    const headingBounds = heading?.getBoundingClientRect();
    return {
      title: heading?.textContent.trim(),
      spansGrid: Boolean(groupBounds && gridBounds && Math.abs(groupBounds.width - gridBounds.width) < 1),
      headingCentered: Boolean(groupBounds && headingBounds &&
        Math.abs((headingBounds.left + headingBounds.width / 2) - (groupBounds.left + groupBounds.width / 2)) < 1),
    };
  })(),
  credentials: [...document.querySelectorAll('[data-credential-link]')].map(link => ({
    title: link.closest('[data-credential]')?.querySelector('h4')?.textContent.trim(),
    href: link.href,
    target: link.target,
    rel: link.rel,
    badge: link.closest('[data-credential]')?.querySelector('[data-credential-badge]')?.src,
    badgeLoaded: Boolean(link.closest('[data-credential]')?.querySelector('[data-credential-badge]')?.complete && link.closest('[data-credential]')?.querySelector('[data-credential-badge]')?.naturalWidth),
    badgeAlt: link.closest('[data-credential]')?.querySelector('[data-credential-badge]')?.alt,
    cardIsLink: link.matches('[data-credential]'),
    keyboardFocusable: link.tabIndex === 0,
    nestedLinkCount: link.querySelectorAll('a').length,
    lineIconCount: link.querySelectorAll('.line-icon').length,
  })),
  credentialGroups: {
    cisco: Boolean(document.querySelector('[data-credential-group="cisco"]')),
    technical: Boolean(document.querySelector('[data-credential-group="technical"]')),
    professional: Boolean(document.querySelector('[data-credential-group="professional"]')),
    softSkillsHeadingAbsent: ![...document.querySelectorAll('#skills h3, #skills h4')]
      .some(heading => /^soft skills$/i.test(heading.textContent.trim())),
  },
  additionalCredentials: [...document.querySelectorAll('[data-compact-credential]')].map(card => ({
    group: card.closest('[data-credential-group]')?.dataset.credentialGroup,
    title: card.querySelector('[data-credential-title]')?.textContent.trim(),
    href: card.href,
    target: card.target,
    rel: card.rel,
    cardIsLink: card.matches('a'),
    keyboardFocusable: card.tabIndex === 0,
    nestedLinkCount: card.querySelectorAll('a').length,
    icon: card.querySelector('.line-icon')?.dataset.icon,
  })),
  employerLogos: [...document.querySelectorAll('#experiencia article img.employer-logo')].map(img => ({
    src: img.getAttribute('src'),
    alt: img.alt,
    bg: img.dataset.logoBg,
  })),
  contactIcons: [...document.querySelectorAll('[data-contact]')].map(control => ({
    channel: control.dataset.contact,
    name: control.querySelector('.line-icon')?.dataset.icon,
    visibleText: control.textContent.trim(),
  })),
  reconGraph: {
    canvasPresent: Boolean(document.querySelector('#recon-graph')),
    canvasAriaHidden: document.querySelector('#recon-graph')?.getAttribute('aria-hidden'),
    netgraphPresent: Boolean(document.querySelector('.netgraph')),
    // The attack-graph layers must not introduce any sprite icon references,
    // so the 18-instance / 16-symbol icon budget below stays exact.
    graphUseRefs: document.querySelectorAll('#recon-graph use, .netgraph use').length,
    graphLineIcons: document.querySelectorAll('#recon-graph .line-icon, .netgraph .line-icon').length,
    skillHubs: document.querySelectorAll('[data-skill-hub]').length,
    edgeCount: document.querySelectorAll('.netgraph .net-edge').length,
    nodeCount: document.querySelectorAll('.netgraph .net-node').length,
    relationCount: document.querySelectorAll('.netgraph .relation-edge').length,
    aiSatelliteCount: document.querySelectorAll('.netgraph .net-ai-satellite').length,
    aiSatelliteEdgeCount: document.querySelectorAll('.netgraph .net-ai-edge').length,
    reticlePresent: Boolean(document.querySelector('#reticle')),
  },
}));
await shot(page, 'desktop-01-hero-pt');

await revealAll(page);
await gotoSection(page, '#skills');
if (await page.$('[data-skill="prisma-cloud"]')) {
  await page.hover('[data-skill="prisma-cloud"]');
}
results.skillRelation = await page.evaluate(() => {
  const source = document.querySelector('[data-skill="prisma-cloud"]');
  const target = document.querySelector('[data-skill="aws"]');
  const edge = document.querySelector('[data-relation="prisma-cloud:aws"]');
  if (!source || !target || !edge) return { present: false };

  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const matrix = edge.getScreenCTM();
  const pointAt = length => {
    const point = edge.getPointAtLength(length);
    return new DOMPoint(point.x, point.y).matrixTransform(matrix);
  };
  const distanceToRect = (point, rect) => Math.hypot(
    Math.max(rect.left - point.x, 0, point.x - rect.right),
    Math.max(rect.top - point.y, 0, point.y - rect.bottom),
  );
  const start = pointAt(0);
  const end = pointAt(edge.getTotalLength());

  return {
    present: true,
    sourceActive: source.classList.contains('skill-active'),
    targetRelated: target.classList.contains('skill-related'),
    edgeHot: edge.classList.contains('hot'),
    connectsSource: distanceToRect(start, sourceRect) < 2,
    connectsTarget: distanceToRect(end, targetRect) < 2,
  };
});
await page.hover('[data-skill="mcp"]');
results.aiClusterInteraction = await page.evaluate(() => ({
  satellitePresent: Boolean(document.querySelector('[data-ai-satellite="mcp"]')),
  satelliteHot: document.querySelector('[data-ai-satellite="mcp"]')?.classList.contains('hot'),
  edgeHot: document.querySelector('[data-ai-edge="mcp"]')?.classList.contains('hot'),
}));
if (await page.$('[data-skill="kali-linux"]')) {
  await page.hover('[data-skill="kali-linux"]');
}
results.kaliRelations = await page.evaluate(() => ({
  edgeCount: document.querySelectorAll('.relation-edge.hot').length,
  relatedCount: document.querySelectorAll('.chip.skill-related').length,
}));
await page.mouse.move(0, 0);
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#skills', 'skills'], ['#contato', 'contato']]) {
  await gotoSection(page, id);
  await shot(page, `desktop-02-${name}-pt`);
}
await gotoSection(page, '[data-credential-group="technical"]');
await shot(page, 'desktop-02-credentials-technical-pt');
await gotoSection(page, '[data-credential-group="professional"]');
await shot(page, 'desktop-02-credentials-professional-pt');

// ── Toggle EN ──
await page.evaluate(() => { window.scrollTo({ top: 0, behavior: 'instant' }); });
await page.click('#lang-en');
await sleep(300);
results.en = await page.evaluate(() => ({
  htmlLang: document.documentElement.lang,
  heroRole: document.querySelector('[data-i18n="hero.role"]').textContent.trim(),
  aboutTitle: document.querySelector('[data-i18n="about.title"]').textContent.trim(),
  contactTitle: document.querySelector('[data-i18n="contact.title"]').textContent.trim(),
  tcc: document.querySelector('[data-project="tcc"]')?.textContent,
  credentials: document.querySelector('[data-credentials]')?.textContent,
  veripkg: document.querySelector('[data-project="veripkg"]')?.textContent,
  voip: document.querySelector('[data-project="voip"]')?.textContent,
  appliedAiHeading: document.querySelector('[data-skill-group="ai"] h3')?.textContent.trim(),
  cmcRole: document.querySelector('[data-i18n="exp.cmcRole"]')?.textContent.trim(),
  saved: localStorage.getItem('lang'),
  untranslated: [...document.querySelectorAll('[data-i18n]')].filter(el => !el.textContent.trim()).length,
  iconMap: [...document.querySelectorAll('svg.line-icon')]
    .map(icon => `${icon.dataset.iconContext}:${icon.dataset.icon}`)
    .sort()
    .join('|'),
}));
await shot(page, 'desktop-03-hero-en');
await gotoSection(page, '#experiencia');
await shot(page, 'desktop-04-experiencia-en');
await gotoSection(page, '#contato');
await shot(page, 'desktop-05-contato-en');

// volta para PT e confere persistência
await page.reload({ waitUntil: 'networkidle0' });
results.persistedAfterReload = await page.evaluate(() => localStorage.getItem('lang'));
await page.evaluate(() => localStorage.removeItem('lang'));

// ── Published PDFs ──
// Personal CV/résumé PDFs are intentionally not hosted (kept local-only); only the TCC research PDF is published.
const tccResp = await page.goto(`${BASE}/assets/TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf`, { timeout: 15000 }).catch(e => null);
results.tccPdf = tccResp ? { status: tccResp.status(), type: tccResp.headers()['content-type'] } : 'FAILED';

// ── Mobile ──
const mob = await browser.newPage();
await mob.setViewport({ width: 390, height: 844 });
await mob.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(9000);
results.mobileMenu = await mob.evaluate(async () => {
  const button = document.querySelector('#mobile-menu-button');
  const menu = document.querySelector('#mobile-menu');
  const before = {
    button: Boolean(button),
    menu: Boolean(menu),
    expanded: button?.getAttribute('aria-expanded'),
    hidden: menu?.hidden,
  };
  button?.click();
  await new Promise(resolve => setTimeout(resolve, 50));
  const after = {
    expanded: button?.getAttribute('aria-expanded'),
    hidden: menu?.hidden,
  };
  button?.click();
  await new Promise(resolve => setTimeout(resolve, 50));
  return { before, after };
});
results.mobileExperienceLogoOverlaps = await mob.evaluate(() =>
  [...document.querySelectorAll('#experiencia article')].flatMap(article => {
    const title = article.querySelector('h3');
    const logo = article.querySelector('.employer-logo');
    if (!title || !logo) return [];
    const titleRect = title.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const overlaps = titleRect.left < logoRect.right && titleRect.right > logoRect.left &&
      titleRect.top < logoRect.bottom && titleRect.bottom > logoRect.top;
    return overlaps ? [{ title: title.textContent.trim(), logo: logo.alt }] : [];
  }),
);
await shot(mob, 'mobile-01-hero-pt');
await revealAll(mob);
await gotoSection(mob, '#skills');
results.mobileAiSkillGroup = await mob.evaluate(() => {
  const group = document.querySelector('[data-skill-group="ai"]');
  const heading = group?.querySelector('h3');
  const groupBounds = group?.getBoundingClientRect();
  const headingBounds = heading?.getBoundingClientRect();
  return {
    headingLeftAligned: Boolean(groupBounds && headingBounds && Math.abs(headingBounds.left - groupBounds.left) < 1),
  };
});
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#skills', 'skills'], ['#contato', 'contato']]) {
  await gotoSection(mob, id);
  await shot(mob, `mobile-02-${name}-pt`);
}
await gotoSection(mob, '[data-credential]');
await shot(mob, 'mobile-03-credentials-pt');
await gotoSection(mob, '[data-credential-group="technical"]');
await shot(mob, 'mobile-03-credentials-technical-pt');
await gotoSection(mob, '[data-credential-group="professional"]');
await shot(mob, 'mobile-03-credentials-professional-pt');
results.mobileOverflowX = await mob.evaluate(() => document.body.scrollWidth > window.innerWidth);

// ── Reduced motion ──
const reducedMotion = await browser.newPage();
await reducedMotion.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await reducedMotion.setViewport({ width: 1440, height: 900 });
await reducedMotion.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await reducedMotion.hover('[data-project="tcc"]');
results.reducedMotion = await reducedMotion.$eval(
  '[data-project="tcc"] .line-icon--project',
  icon => ({ iconTransform: getComputedStyle(icon).transform }),
);
results.reducedMotionRecon = await reducedMotion.evaluate(() => ({
  canvasAnimating: document.querySelector('#recon-graph')?.dataset.animating,
  scanIntroPresent: Boolean(document.querySelector('#scan-intro')),
}));

await browser.close();

const expectedSkillIcons = ['crosshair', 'shield-check', 'cloud-cog', 'code-xml', 'brain-circuit'];

const assertions = [
  [results.profile.title.includes('Full Stack'), 'title positions the profile as Full Stack'],
  [results.profile.role.includes('Full Stack') && results.profile.role.includes('DevSecOps'), 'hero combines Full Stack and DevSecOps'],
  [results.profile.nerdz.card, 'Nerdz appears as a featured project'],
  [
    [
      ['nerdz', 'https://landing.nerdz.aurasec.dev/'],
      ['veripkg', 'https://github.com/Taresu/veripkg'],
      ['portal', 'https://www.utfpr.edu.br/'],
      ['vespas', 'https://github.com/vespas-utfpr'],
    ].every(([name, href]) => results.profile.linkedProjects.some(project =>
      project.name === name && project.isLink && project.href === href && project.target === '_blank' &&
        project.rel.includes('noopener') && project.keyboardFocusable && project.nestedLinkCount === 0
    )),
    'each single-destination project card is one keyboard-accessible external link',
  ],
  [results.profile.tcc.card && results.profile.tcc.firstProject === 'tcc', 'the TCC appears first among featured projects'],
  [
    results.profile.veripkg.title === 'VeriPkg — verificação honesta de downloads' &&
      results.profile.veripkg.summary?.includes('Go') &&
      results.profile.veripkg.summary?.includes('nível de confiança') &&
      ['Go', 'Supply Chain Security', 'OpenPGP', 'SHA-256'].every(tag => results.profile.veripkg.tags.includes(tag)),
    'VeriPkg is presented as a Go supply-chain verification CLI with its trust model and core technologies',
  ],
  [
    !results.profile.voip.isLink && results.profile.voip.visibility === 'projeto interno · CMC',
    'the private VoIP project is non-interactive and identified as internal CMC work',
  ],
  [
    results.profile.tcc.title?.includes('Educação em Cibersegurança') &&
      results.profile.tcc.summary?.includes('Portal Sophia-CT') &&
      results.profile.tcc.summary?.includes('7,54') &&
      results.profile.tcc.summary?.includes('9,85'),
    'the TCC card communicates the research subject, intervention and pilot result',
  ],
  [
    results.profile.tcc.link === `${BASE}/assets/TCC_Thales_Sgarbi_Salata_corrigido_revisado-1.pdf`,
    'the TCC card links to the published research PDF',
  ],
  [
    results.profile.tcc.course.href === 'https://sophia.ct.utfpr.edu.br/course/view.php?id=118' &&
      results.profile.tcc.course.target === '_blank' &&
      results.profile.tcc.course.rel.includes('noopener'),
    'the TCC card links safely to the course developed on Sophia-CT',
  ],
  [results.profile.oldExperienceCount === 0, 'legacy IT and Webmaster entries are absent'],
  [results.profile.cmcRole === 'Estagiário DevOps', 'the CMC role is written naturally in Portuguese'],
  [['React Native', 'NestJS', 'PostgreSQL', 'Active Directory', 'MCP'].every(skill => results.profile.skills.includes(skill)), 'current development, IAM and agentic AI skills are present'],
  [
    expectedSkillIcons.every(name => results.profile.lineIcons.some(icon =>
      icon.name === name && icon.context === 'skill' && icon.href === `#icon-${name}`
    )),
    'the five skill categories use their specified semantic icons',
  ],
  [
    [
      ['tcc', 'graduation-cap'],
      ['veripkg', 'shield-check'],
      ['nerdz', 'smartphone'],
      ['voip', 'phone-call'],
      ['portal', 'panels-top-left'],
      ['vespas', 'flag'],
    ].every(([project, iconName]) => results.profile.projectIcons.some(icon =>
      icon.project === project && icon.name === iconName && icon.href === `#icon-${iconName}`
    )),
    'each featured project has its specified semantic type marker',
  ],
  [
    results.profile.lineIcons.filter(icon => icon.context === 'skill').length === 5 &&
      results.profile.skillPrompts.every(text => !text.startsWith('$')),
    'skill icons replace all five visual dollar prompts',
  ],
  [
    results.profile.lineIcons.every(icon => icon.ariaHidden === 'true' && icon.focusable === 'false'),
    'all line icons are decorative and removed from the accessibility tree',
  ],
  [
    results.profile.aiSkillGroup.spansGrid && results.profile.aiSkillGroup.headingCentered &&
      results.mobileAiSkillGroup.headingLeftAligned,
    'the applied-AI skill group spans and centers on desktop while remaining left-aligned on mobile',
  ],
  [results.profile.aiSkillGroup.title === 'IA aplicada', 'the applied-AI group uses the concise Portuguese heading'],
  [results.profile.credentials.length === 4, 'the four Cisco courses are presented as separate verifiable credentials'],
  [
    results.profile.credentials.every(credential => credential.cardIsLink && credential.keyboardFocusable && credential.nestedLinkCount === 0),
    'each credential card is one keyboard-accessible link without nested anchors',
  ],
  [
    [
      ['CyberOps Associate', 'https://www.credly.com/badges/19585ed5-1d40-4697-b22f-3cb52a220dc3?source=linked_in_profile', `${BASE}/assets/CyberOpsAssoc.png`],
      ['Endpoint Security', 'https://www.credly.com/badges/28d753d2-ab77-4cc0-a71f-8e3acc6e478a/linked_in_profile', `${BASE}/assets/EndpointSecurity.png`],
      ['Cybersecurity Essentials', 'https://www.credly.com/badges/5bf1788d-2873-459b-b066-2ba41a2bfdc4?source=linked_in_profile', `${BASE}/assets/CyberEssentials.png`],
      ['CCNA: Introduction to Networks (ITN)', 'https://www.credly.com/badges/df801995-970f-4c9c-8c4e-47da78ed9db4?source=linked_in_profile', `${BASE}/assets/CCNAITN__1_.png`],
    ].every(([title, href, badge]) => results.profile.credentials.some(credential =>
      credential.title === title && credential.href === href && credential.target === '_blank' && credential.rel.includes('noopener') &&
        credential.badge === badge && credential.badgeLoaded && credential.badgeAlt?.includes(title)
    )),
    'each Cisco credential pairs its local badge with the matching Credly verification page',
  ],
  [
    results.profile.credentialGroups.cisco && results.profile.credentialGroups.technical &&
      results.profile.credentialGroups.professional && results.profile.credentialGroups.softSkillsHeadingAbsent,
    'credentials are organized into Cisco, technical and professional groups without a soft-skills label',
  ],
  [
    results.profile.skills.includes('desenvolvimento profissional & pessoal'),
    'personal-development credentials use the professional and personal development label in Portuguese',
  ],
  [results.profile.additionalCredentials.length === 4, 'the four additional verifiable credentials are presented'],
  [
    results.profile.additionalCredentials.every(credential =>
      credential.cardIsLink && credential.target === '_blank' && credential.rel.includes('noopener') &&
      credential.keyboardFocusable && credential.nestedLinkCount === 0
    ),
    'each additional credential is one keyboard-accessible external link without nested anchors',
  ],
  [
    [
      ['technical', 'Trilha Digital Back-End — Santander Tech+', 'https://ada.tech/certificado?code=de946b1e-6997-80f6-49ba-26078f14bbb3'],
      ['technical', 'Fundamentos em Cibersegurança', 'https://apl.utfpr.edu.br/extensao/validar/D194E4D801ECCEB67D8F29742731D299'],
      ['professional', 'Inteligência Emocional 2.0', 'https://conquerplus.com.br/certificates/362c41cd-3800-4a28-9bb1-c816f0c484f8'],
      ['professional', 'Produtividade e Gestão do Tempo', 'https://www.conquerplus.com.br/certificates/efc5142f-0c55-4e3d-a8be-623bf706f61c'],
    ].every(([group, title, href]) => results.profile.additionalCredentials.some(credential =>
      credential.group === group && credential.title === title && credential.href === href
    )),
    'each additional credential links to its matching verification page in the correct group',
  ],
  [
    [
      ['Trilha Digital Back-End — Santander Tech+', 'code-xml'],
      ['Fundamentos em Cibersegurança', 'shield-check'],
      ['Inteligência Emocional 2.0', 'brain'],
      ['Produtividade e Gestão do Tempo', 'timer'],
    ].every(([title, iconName]) => results.profile.additionalCredentials.some(credential =>
      credential.title === title && credential.icon === iconName
    )),
    'compact credentials use their specified semantic icons',
  ],
  [
    results.profile.credentials.every(credential => credential.lineIconCount === 0),
    'Cisco badge cards do not receive redundant line icons',
  ],
  [
    [
      ['email', 'mail'],
      ['linkedin', 'briefcase-business'],
      ['github', 'git-branch'],
      ['discord', 'message-circle'],
    ].every(([channel, iconName]) => results.profile.contactIcons.some(icon =>
      icon.channel === channel && icon.name === iconName && icon.visibleText.length > 0
    )),
    'all four contact channels keep text labels and use semantic icons',
  ],
  [
    ['Education in Cybersecurity', 'Portal Sophia-CT', '7.54 → 9.85', 'Generative AI', 'Mixed methods', 'Access course', 'Sophia-CT login'].every(text => results.en.tcc?.includes(text)),
    'the TCC content, course access and technical labels are translated in the English portfolio',
  ],
  [
    ['Technical credentials', 'Cisco Networking Academy', 'Development and security', 'Professional & personal development', 'View credential']
      .every(text => results.en.credentials?.includes(text)),
    'credential hierarchy and actions are translated in the English portfolio',
  ],
  [
    ['VeriPkg — honest download verification', 'Go CLI', 'trust tier'].every(text => results.en.veripkg?.includes(text)),
    'the VeriPkg project is translated in the English portfolio',
  ],
  [results.en.voip?.includes('internal project · CMC'), 'the private VoIP project context is translated in English'],
  [results.en.appliedAiHeading === 'Applied AI', 'the applied-AI heading is translated concisely in English'],
  [results.en.cmcRole === 'DevOps Intern', 'the CMC role remains correctly titled in English'],
  [results.tccPdf.status === 200 && results.tccPdf.type === 'application/pdf', 'TCC PDF is readable from the portfolio'],
  [results.mobileMenu.before.button && results.mobileMenu.before.menu, 'mobile navigation controls exist'],
  [results.mobileMenu.before.expanded === 'false' && results.mobileMenu.before.hidden === true, 'mobile navigation starts collapsed'],
  [results.mobileMenu.after.expanded === 'true' && results.mobileMenu.after.hidden === false, 'mobile navigation opens'],
  [results.mobileOverflowX === false, 'mobile layout has no horizontal overflow'],
  [results.mobileExperienceLogoOverlaps.length === 0, 'mobile employer logos do not overlap experience titles'],
  [
    results.profile.lineIcons.length === 19 && results.profile.spriteSymbols.length === 16,
    'the page renders 19 semantic instances from 16 unique local symbols',
  ],
  [
    results.profile.lineIcons.every(icon => icon.href?.startsWith('#icon-')),
    'every line icon references the local inline sprite',
  ],
  [results.iconNetworkRequests.length === 0, 'no runtime request is made to an external icon service'],
  [results.en.iconMap === results.profile.iconMap, 'switching to English preserves the semantic icon map'],
  [results.reducedMotion.iconTransform === 'none', 'reduced-motion mode disables icon hover translation'],
  [results.profile.employerLogos.length === 5, 'all five experience entries have an employer logo'],
  [results.profile.employerLogos.every(l => l.alt && l.alt.length > 0), 'all employer logos have alt text'],
  [results.profile.employerLogos.filter(l => l.bg === 'light').length === 1, 'only Volkswagen uses the light pill'],
  [
    results.profile.reconGraph.canvasPresent && results.profile.reconGraph.canvasAriaHidden === 'true',
    'the recon-graph canvas exists and is decorative (aria-hidden)',
  ],
  [
    results.profile.reconGraph.netgraphPresent && results.profile.reconGraph.skillHubs === 5 &&
      results.profile.reconGraph.nodeCount === 5 && results.profile.reconGraph.edgeCount === 5,
    'the skills constellation uses five aligned domain nodes and a restrained five-edge backbone',
  ],
  [
    results.profile.reconGraph.relationCount === 12 && results.skillRelation.present &&
      results.skillRelation.sourceActive && results.skillRelation.targetRelated &&
      results.skillRelation.edgeHot && results.skillRelation.connectsSource && results.skillRelation.connectsTarget,
    'skill tags reveal curated green relationships connected to the related tag boundaries',
  ],
  [
    results.kaliRelations.edgeCount === 4 && results.kaliRelations.relatedCount === 4,
    'Kali Linux acts as a visual hub for Nmap, Burp Suite, Metasploit and Wireshark',
  ],
  [
    results.profile.reconGraph.aiSatelliteCount === 4 &&
      results.profile.reconGraph.aiSatelliteEdgeCount === 4 &&
      results.aiClusterInteraction.satellitePresent && results.aiClusterInteraction.satelliteHot &&
      results.aiClusterInteraction.edgeHot,
    'applied AI is marked by four semantic satellites that respond to their related tags',
  ],
  [!results.profile.reconGraph.reticlePresent, 'the cursor-like reticle is absent'],
  [
    results.profile.reconGraph.graphUseRefs === 0 && results.profile.reconGraph.graphLineIcons === 0,
    'attack-graph layers add no sprite icon references (18/16 icon budget stays intact)',
  ],
  [
    results.reducedMotionRecon.canvasAnimating === 'false' && !results.reducedMotionRecon.scanIntroPresent,
    'reduced-motion halts the recon animation loop and skips the scan intro',
  ],
];

const failures = assertions.filter(([passed]) => !passed).map(([, message]) => message);
console.log(JSON.stringify(results, null, 2));
console.log(`Screenshots em: ${outDir}`);
if (failures.length) {
  console.error(`Falhas (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
}
