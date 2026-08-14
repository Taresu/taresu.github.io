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
  linkedProjects: ['nerdz', 'portal', 'vespas'].map(name => {
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
}));
await shot(page, 'desktop-01-hero-pt');

await revealAll(page);
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

// ── Link do CV ──
const resp = await page.goto(`${BASE}/assets/curriculo-thales-salata.pdf`, { timeout: 15000 }).catch(e => null);
results.cvPdf = resp ? { status: resp.status(), type: resp.headers()['content-type'] } : 'FAILED';
const respEn = await page.goto(`${BASE}/assets/resume-thales-salata-en.pdf`, { timeout: 15000 }).catch(e => null);
results.resumePdf = respEn ? { status: respEn.status(), type: respEn.headers()['content-type'] } : 'FAILED';
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

await browser.close();

const expectedSkillIcons = ['crosshair', 'shield-check', 'cloud-cog', 'code-xml', 'brain-circuit'];

const assertions = [
  [results.profile.title.includes('Full Stack'), 'title positions the profile as Full Stack'],
  [results.profile.role.includes('Full Stack') && results.profile.role.includes('DevSecOps'), 'hero combines Full Stack and DevSecOps'],
  [results.profile.nerdz.card, 'Nerdz appears as a featured project'],
  [
    [
      ['nerdz', 'https://landing.nerdz.aurasec.dev/'],
      ['portal', 'https://www.utfpr.edu.br/'],
      ['vespas', 'https://linktr.ee/vespas_utfpr'],
    ].every(([name, href]) => results.profile.linkedProjects.some(project =>
      project.name === name && project.isLink && project.href === href && project.target === '_blank' &&
        project.rel.includes('noopener') && project.keyboardFocusable && project.nestedLinkCount === 0
    )),
    'each single-destination project card is one keyboard-accessible external link',
  ],
  [results.profile.tcc.card && results.profile.tcc.firstProject === 'tcc', 'the TCC appears first among featured projects'],
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
  [results.cvPdf.status === 200 && results.cvPdf.type === 'application/pdf', 'Portuguese CV is downloadable'],
  [results.resumePdf.status === 200 && results.resumePdf.type === 'application/pdf', 'English resume is downloadable'],
  [results.tccPdf.status === 200 && results.tccPdf.type === 'application/pdf', 'TCC PDF is readable from the portfolio'],
  [results.mobileMenu.before.button && results.mobileMenu.before.menu, 'mobile navigation controls exist'],
  [results.mobileMenu.before.expanded === 'false' && results.mobileMenu.before.hidden === true, 'mobile navigation starts collapsed'],
  [results.mobileMenu.after.expanded === 'true' && results.mobileMenu.after.hidden === false, 'mobile navigation opens'],
  [results.mobileOverflowX === false, 'mobile layout has no horizontal overflow'],
  [
    results.profile.lineIcons.length === 18 && results.profile.spriteSymbols.length === 16,
    'the page renders 18 semantic instances from 16 unique local symbols',
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
  [results.profile.employerLogos.filter(l => l.bg === 'dark').length === 1, 'exactly one employer logo uses the dark pill (VESPAS)'],
];

const failures = assertions.filter(([passed]) => !passed).map(([, message]) => message);
console.log(JSON.stringify(results, null, 2));
console.log(`Screenshots em: ${outDir}`);
if (failures.length) {
  console.error(`Falhas (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
}
