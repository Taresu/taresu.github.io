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
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
await sleep(1800);
results.slowScanIntro = await page.evaluate(() => {
  const intro = document.querySelector('#scan-intro');
  const sweep = intro?.querySelector('.scan-sweep');
  return {
    visibleAfterInitialRead: Boolean(intro && !intro.hidden && !intro.classList.contains('done')),
    sweepDurationSeconds: sweep ? Number.parseFloat(getComputedStyle(sweep).animationDuration) : 0,
  };
});
await sleep(7200); // completa o scan e a animação de digitação do terminal
await page.evaluate(() => document.querySelector('[data-credential]')?.scrollIntoView({ behavior: 'instant' }));
await page.waitForFunction(
  () => [...document.querySelectorAll('[data-credential-badge]')].every(image => image.complete && image.naturalWidth > 0),
  { timeout: 5000 },
);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
results.profile = await page.evaluate(() => ({
  title: document.title,
  role: document.querySelector('[data-i18n="hero.role"]')?.textContent.trim(),
  terminalMission: document.querySelector('#terminal-body')?.textContent,
  nerdz: {
    card: Boolean(document.querySelector('[data-project="nerdz"]')),
    link: document.querySelector('[data-project="nerdz"] a')?.href,
  },
  linkedProjects: ['veripkg', 'nerdz', 'portal', 'vespas'].map(name => {
    const card = document.querySelector(`[data-project="${name}"]`);
    const primaryLink = card?.querySelector('[data-project-link]');
    return {
      name,
      isLink: card?.matches('a'),
      isArticle: card?.matches('article'),
      href: primaryLink?.href,
      target: primaryLink?.target,
      rel: primaryLink?.rel,
      keyboardFocusable: primaryLink?.tabIndex === 0,
      nestedAnchorCount: card?.querySelectorAll('a a').length,
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
    summary: document.querySelector('[data-project="voip"] [data-i18n="proj.voip.d"]')?.textContent.trim(),
    tags: [...document.querySelectorAll('[data-project="voip"] .chip')].map(tag => ({
      label: tag.textContent.trim(),
      href: tag.href,
    })),
  },
  projectTags: Object.fromEntries(['portal', 'vespas'].map(name => [name,
    [...document.querySelectorAll(`[data-project="${name}"] .chip`)].map(tag => ({
      label: tag.textContent.trim(),
      href: tag.href,
    })),
  ])),
  projectDescriptionWords: Object.fromEntries(['portal', 'vespas'].map(name => [name,
    document.querySelector(`[data-project="${name}"] [data-i18n="proj.${name}.d"]`)
      ?.textContent.trim().split(/\s+/).length,
  ])),
  vespasChallenge: {
    href: document.querySelector('[data-project="vespas"] [data-challenge-link]')?.href,
    label: document.querySelector('[data-project="vespas"] [data-i18n="proj.vespas.challenge"]')?.textContent.trim(),
    summary: document.querySelector('[data-project="vespas"] [data-i18n="proj.vespas.d"]')?.textContent.trim(),
  },
  vespasResponsibility: {
    about: document.querySelector('[data-i18n="about.p1"]')?.textContent.trim(),
    role: document.querySelector('[data-i18n="exp.vespasRole"]')?.textContent.trim(),
    alerts: document.querySelector('[data-i18n="exp.ves1"]')?.textContent.trim(),
    labs: document.querySelector('[data-i18n="exp.ves2"]')?.textContent.trim(),
    site: document.querySelector('[data-i18n="exp.ves3"]')?.textContent.trim(),
    siteHref: document.querySelector('[data-vespas-site]')?.href,
  },
  portalLinks: {
    primary: document.querySelector('[data-project="portal"] [data-project-link]')?.href,
    team: document.querySelector('[data-project="portal"] [data-team-link]')?.href,
    teamLabel: document.querySelector('[data-project="portal"] [data-i18n="proj.portal.team"]')?.textContent.trim(),
  },
  portalActionFlow: (() => {
    const card = document.querySelector('[data-project="portal"]');
    const summary = card?.querySelector('[data-i18n="proj.portal.d"]');
    const actions = card?.querySelector('[data-portal-actions]');
    const firstTag = card?.querySelector('.chip');
    const summaryRect = summary?.getBoundingClientRect();
    const actionsRect = actions?.getBoundingClientRect();
    const tagRect = firstTag?.getBoundingClientRect();
    return {
      afterSummary: Boolean(summaryRect && actionsRect && actionsRect.top >= summaryRect.bottom - 1),
      beforeTags: Boolean(actionsRect && tagRect && actionsRect.bottom <= tagRect.top + 1),
    };
  })(),
  chipLinks: (() => {
    const chips = [...document.querySelectorAll('.chip')];
    return {
      total: chips.length,
      linked: chips.filter(chip => chip.matches('a')).length,
      allSafeExternal: chips.every(chip => chip.matches('a') && chip.href.startsWith('https://') &&
        chip.target === '_blank' && chip.rel.includes('noopener') && chip.rel.includes('noreferrer')),
      nestedInteractive: chips.filter(chip => chip.parentElement?.closest('a')).map(chip => chip.textContent.trim()),
      emptyLabels: chips.filter(chip => !chip.textContent.trim()).length,
    };
  })(),
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
  experienceGroups: Object.fromEntries(['utfpr', 'volkswagen'].map(employer => {
    const group = document.querySelector(`[data-employer-group="${employer}"]`);
    return [employer, {
      present: Boolean(group),
      employer: group?.querySelector('[data-employer-name]')?.textContent.trim(),
      roles: [...(group?.querySelectorAll('[data-experience-role]') || [])]
        .map(role => role.querySelector('[data-role-title]')?.textContent.trim()),
      logoCount: group?.querySelectorAll('.employer-logo').length || 0,
    }];
  })),
  assistantWebmasterCount: [...document.querySelectorAll('#experiencia [data-experience-role]')].filter(role =>
    /Assistant Webmaster/i.test(role.textContent)
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
    repeatedVerificationLabels: document.querySelectorAll('[data-i18n="credentials.verified"]').length,
    verificationNote: document.querySelector('[data-i18n="credentials.verificationNote"]')?.textContent.trim(),
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
  organizationNetworks: [...document.querySelectorAll('[data-org-network]')].map(network => ({
    organization: network.dataset.orgNetwork,
    logoHref: network.querySelector('[data-org-primary-logo]')?.href,
    nameHref: network.closest('article')?.querySelector('[data-org-primary-name]')?.href,
    logoTarget: network.querySelector('[data-org-primary-logo]')?.target,
    logoRel: network.querySelector('[data-org-primary-logo]')?.rel,
    hasToggle: Boolean(network.querySelector('[data-org-toggle]')),
    toggleExpanded: network.querySelector('[data-org-toggle]')?.getAttribute('aria-expanded'),
    branchesHidden: network.querySelector('[data-org-branches]')?.getAttribute('aria-hidden'),
    links: [...network.querySelectorAll('[data-org-link]')].map(link => ({
      label: link.querySelector('span:first-child')?.textContent.trim(),
      href: link.href,
      target: link.target,
      rel: link.rel,
      kind: link.dataset.orgLink,
    })),
  })),
  projectAnchorIds: ['portal', 'voip'].map(project =>
    document.querySelector(`[data-project="${project}"]`)?.id,
  ),
  contactIcons: [...document.querySelectorAll('[data-contact]')].map(control => ({
    channel: control.dataset.contact,
    name: control.querySelector('.line-icon')?.dataset.icon,
    visibleText: control.textContent.trim(),
  })),
  contactAlignment: (() => {
    const tops = [...document.querySelectorAll('#contato [data-contact]')]
      .map(control => control.getBoundingClientRect().top);
    const heights = [...document.querySelectorAll('#contato [data-contact]')]
      .map(control => control.getBoundingClientRect().height);
    return {
      topSpread: tops.length ? Math.max(...tops) - Math.min(...tops) : null,
      heightSpread: heights.length ? Math.max(...heights) - Math.min(...heights) : null,
    };
  })(),
  linkedinAvailability: (() => {
    const status = document.querySelector('[data-linkedin-availability]');
    const description = document.querySelector('[data-i18n="contact.sub"]');
    const statusRect = status?.getBoundingClientRect();
    const descriptionRect = description?.getBoundingClientRect();
    return {
      text: status?.textContent.trim(),
      position: status ? getComputedStyle(status).position : null,
      descriptionGap: statusRect && descriptionRect ? statusRect.top - descriptionRect.bottom : null,
    };
  })(),
  discordCopy: (() => {
    const control = document.querySelector('[data-discord-copy]');
    return {
      present: Boolean(control),
      isButton: control?.matches('button'),
      value: control?.dataset.copyValue,
      ariaLabel: control?.getAttribute('aria-label'),
      guide: document.querySelector('[data-discord-guide]')?.textContent.trim(),
      openHref: document.querySelector('[data-discord-open]')?.href,
      openTarget: document.querySelector('[data-discord-open]')?.target,
      openRel: document.querySelector('[data-discord-open]')?.rel,
    };
  })(),
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
    relationsByStrength: Object.fromEntries(['strong', 'medium', 'weak'].map(strength => [
      strength,
      document.querySelectorAll(`.netgraph .relation-edge[data-strength="${strength}"]`).length,
    ])),
    relationEndpointsValid: [...document.querySelectorAll('.netgraph .relation-edge')].every(edge => {
      const [from, to] = edge.dataset.relation?.split(':') || [];
      return from && to && document.querySelectorAll(`[data-skill="${from}"]`).length === 1 &&
        document.querySelectorAll(`[data-skill="${to}"]`).length === 1;
    }),
    relationKeysUnique: (() => {
      const keys = [...document.querySelectorAll('.netgraph .relation-edge')].map(edge => edge.dataset.relation);
      return new Set(keys).size === keys.length;
    })(),
    defaultStrengthOpacity: Object.fromEntries(['strong', 'medium', 'weak'].map(strength => {
      const edge = document.querySelector(`.netgraph .relation-edge[data-strength="${strength}"]`);
      return [strength, edge ? Number.parseFloat(getComputedStyle(edge).opacity) : null];
    })),
    legend: [...document.querySelectorAll('[data-skill-legend] [data-strength]')].map(item => ({
      strength: item.dataset.strength,
      label: item.textContent.trim(),
    })),
    legendTitle: document.querySelector('[data-skill-legend-title]')?.textContent.trim(),
    rightHubIconGaps: ['2', '4'].map(id => {
      const node = document.querySelector(`.net-node[data-hub-id="${id}"]`);
      const icon = document.querySelector(`[data-skill-hub="${id}"] .line-icon--skill`);
      if (!node || !icon) return null;
      return icon.getBoundingClientRect().left - node.getBoundingClientRect().right;
    }),
    aiBackboneOffset: (() => {
      const node = document.querySelector('.net-node[data-hub-id="5"]');
      const label = document.querySelector('[data-skill-group="ai"] [data-i18n="skills.g5"]');
      if (!node || !label) return null;
      const nodeRect = node.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      return Math.abs(
        (nodeRect.left + nodeRect.width / 2) - (labelRect.left + labelRect.width / 2)
      );
    })(),
    aiSatelliteCount: document.querySelectorAll('.netgraph .net-ai-satellite').length,
    aiSatelliteEdgeCount: document.querySelectorAll('.netgraph .net-ai-edge').length,
    reticlePresent: Boolean(document.querySelector('#reticle')),
  },
}));
await shot(page, 'desktop-01-hero-pt');

results.discordCopyInteraction = await page.evaluate(async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async value => { window.__discordCopied = value; } },
  });
  const control = document.querySelector('[data-discord-copy]');
  control?.click();
  await new Promise(resolve => setTimeout(resolve, 50));
  return {
    copied: window.__discordCopied,
    state: control?.dataset.copyState,
    feedback: control?.querySelector('[data-copy-feedback]')?.textContent.trim(),
  };
});

// Organization mini-graphs: pointer, keyboard toggle and Escape all expose the same state.
if (await page.$('[data-org-network="vespas"]')) {
  await gotoSection(page, '[data-org-network="vespas"]');
}
if (await page.$('[data-org-network="vespas"] [data-org-primary-logo]')) {
  await page.hover('[data-org-network="vespas"] [data-org-primary-logo]');
  await sleep(220);
}
results.desktopOrgHover = await page.evaluate(() => {
  const network = document.querySelector('[data-org-network="vespas"]');
  const branches = network?.querySelector('[data-org-branches]');
  return {
    present: Boolean(network),
    open: network?.dataset.open === 'true',
    branchesVisible: branches?.getAttribute('aria-hidden') === 'false' &&
      branches && getComputedStyle(branches).visibility === 'visible',
  };
});
if (results.desktopOrgHover.present) await shot(page, 'desktop-02-experiencia-vespas-network-pt');
await page.keyboard.press('Escape');
results.desktopOrgEscapeClosed = await page.evaluate(() =>
  document.querySelector('[data-org-network="vespas"]')?.dataset.open === 'false',
);
if (await page.$('[data-org-network="vespas"] [data-org-toggle]')) {
  await page.focus('[data-org-network="vespas"] [data-org-toggle]');
  await page.keyboard.press('Enter');
  await sleep(80);
}
results.desktopOrgKeyboard = await page.evaluate(() => {
  const network = document.querySelector('[data-org-network="vespas"]');
  const toggle = network?.querySelector('[data-org-toggle]');
  return {
    open: network?.dataset.open === 'true',
    expanded: toggle?.getAttribute('aria-expanded'),
  };
});
await page.keyboard.press('Escape');
if (await page.$('[data-org-network="vespas"] [data-org-toggle]')) {
  await page.click('[data-org-network="vespas"] [data-org-toggle]');
  await page.hover('[data-org-network="vespas"] [data-org-link="project"]');
  await sleep(100);
}
results.desktopOrgPinned = await page.evaluate(() => {
  const network = document.querySelector('[data-org-network="vespas"]');
  const branches = network?.querySelector('[data-org-branches]');
  return {
    open: network?.dataset.open,
    pinned: network?.dataset.pinned,
    linksInteractive: branches?.getAttribute('aria-hidden') === 'false' && !branches?.inert,
  };
});
await page.keyboard.press('Escape');

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
  strengths: [...document.querySelectorAll('.relation-edge.hot')].map(edge => edge.dataset.strength),
}));
await page.focus('[data-skill="owasp-top-10"]');
results.owaspRelations = await page.evaluate(() => ({
  sourceActive: document.querySelector('[data-skill="owasp-top-10"]')?.classList.contains('skill-active'),
  edgeStrengths: [...document.querySelectorAll('.relation-edge.hot')].map(edge => edge.dataset.strength).sort(),
  relatedTags: [...document.querySelectorAll('.chip.skill-related')].map(tag => ({
    skill: tag.dataset.skill,
    strength: tag.dataset.relatedStrength,
  })).sort((a, b) => a.skill.localeCompare(b.skill)),
}));
await page.mouse.move(0, 0);
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#skills', 'skills'], ['#contato', 'contato']]) {
  await gotoSection(page, id);
  await shot(page, `desktop-02-${name}-pt`);
}
await gotoSection(page, '[data-employer-group="volkswagen"]');
await shot(page, 'desktop-02-experiencia-volkswagen-pt');
await gotoSection(page, '[data-project="portal"]');
await shot(page, 'desktop-02-projeto-portal-pt');
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
  nerdzCta: document.querySelector('[data-project="nerdz"] [data-i18n="proj.nerdz.cta"]')?.textContent.trim(),
  voip: document.querySelector('[data-project="voip"]')?.textContent,
  vespas: document.querySelector('[data-project="vespas"]')?.textContent,
  vespasResponsibility: {
    about: document.querySelector('[data-i18n="about.p1"]')?.textContent.trim(),
    role: document.querySelector('[data-i18n="exp.vespasRole"]')?.textContent.trim(),
    alerts: document.querySelector('[data-i18n="exp.ves1"]')?.textContent.trim(),
    labs: document.querySelector('[data-i18n="exp.ves2"]')?.textContent.trim(),
    site: document.querySelector('[data-i18n="exp.ves3"]')?.textContent.trim(),
    siteHref: document.querySelector('[data-vespas-site]')?.href,
    project: document.querySelector('[data-i18n="proj.vespas.d"]')?.textContent.trim(),
  },
  organizationNetworkLabels: Object.fromEntries(
    [...document.querySelectorAll('[data-org-network]')].map(network => [
      network.dataset.orgNetwork,
      [...network.querySelectorAll('[data-org-link]')]
        .map(link => link.querySelector('span:first-child')?.textContent.trim()),
    ]),
  ),
  appliedAiHeading: document.querySelector('[data-skill-group="ai"] h3')?.textContent.trim(),
  relationshipLegend: [...document.querySelectorAll('[data-skill-legend] [data-strength]')]
    .map(item => item.textContent.trim()),
  relationshipLegendTitle: document.querySelector('[data-skill-legend-title]')?.textContent.trim(),
  cmcRole: document.querySelector('[data-i18n="exp.cmcRole"]')?.textContent.trim(),
  cmcEmployer: document.querySelector('[data-i18n="exp.cmcEmployer"]')?.textContent.trim(),
  cmcLogoAlt: document.querySelector('#experiencia img[src*="camara-curitiba"]')?.alt,
  vwItRole: document.querySelector('[data-i18n="exp.vwtiRole"]')?.textContent.trim(),
  discordGuide: document.querySelector('[data-i18n="contact.discordGuide"]')?.textContent.trim(),
  linkedinAvailability: document.querySelector('[data-linkedin-availability]')?.textContent.trim(),
  experienceDates: Object.fromEntries(
    [...document.querySelectorAll('[data-experience-date]')].map(label => [label.dataset.experienceDate, label.textContent.trim()]),
  ),
  localizedAriaLabels: Object.fromEntries(
    [...document.querySelectorAll('[data-i18n-aria-label]')]
      .map(element => [element.dataset.i18nAriaLabel, element.getAttribute('aria-label')]),
  ),
  multiagentSkill: document.querySelector('[data-skill="multiagent"]')?.textContent.trim(),
  additionalCredentialTitles: [...document.querySelectorAll('[data-compact-credential] [data-credential-title]')]
    .map(title => title.textContent.trim()),
  credentialVerificationNote: document.querySelector('[data-i18n="credentials.verificationNote"]')?.textContent.trim(),
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
results.englishReloadChipLinks = await page.evaluate(() => {
  const chips = [...document.querySelectorAll('.chip')];
  return { total: chips.length, linked: chips.filter(chip => chip.matches('a')).length };
});
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
results.mobileOrgNetwork = await mob.evaluate(async () => {
  const network = document.querySelector('[data-org-network="vespas"]');
  const toggle = network?.querySelector('[data-org-toggle]');
  const branches = network?.querySelector('[data-org-branches]');
  const before = {
    present: Boolean(network && toggle && branches),
    expanded: toggle?.getAttribute('aria-expanded'),
    hidden: branches?.getAttribute('aria-hidden'),
  };
  toggle?.click();
  await new Promise(resolve => setTimeout(resolve, 80));
  const logoRect = network?.querySelector('.employer-logo')?.getBoundingClientRect();
  const toggleRect = toggle?.getBoundingClientRect();
  const after = {
    expanded: toggle?.getAttribute('aria-expanded'),
    hidden: branches?.getAttribute('aria-hidden'),
    open: network?.dataset.open,
    branchCount: branches?.querySelectorAll('[data-org-link]').length,
    logoToggleDistance: logoRect && toggleRect ? Math.hypot(
      (logoRect.left + logoRect.right) / 2 - (toggleRect.left + toggleRect.right) / 2,
      (logoRect.top + logoRect.bottom) / 2 - (toggleRect.top + toggleRect.bottom) / 2,
    ) : null,
  };
  return { before, after };
});
if (results.mobileOrgNetwork.before.present) {
  await gotoSection(mob, '[data-org-network="vespas"]');
  await shot(mob, 'mobile-02-experiencia-vespas-network-pt');
}
results.mobileExperienceLogoOverlaps = await mob.evaluate(() =>
  [...document.querySelectorAll('#experiencia article')].flatMap(article => {
    const logo = article.querySelector('.employer-logo');
    if (!logo) return [];
    const logoRect = logo.getBoundingClientRect();
    return [...article.querySelectorAll('h3, [data-role-title]')].flatMap(title => {
      const titleRect = title.getBoundingClientRect();
      const overlaps = titleRect.left < logoRect.right && titleRect.right > logoRect.left &&
        titleRect.top < logoRect.bottom && titleRect.bottom > logoRect.top;
      return overlaps ? [{ title: title.textContent.trim(), logo: logo.alt }] : [];
    });
  }),
);
results.mobilePortalHeader = await mob.evaluate(() => {
  const pathLabel = document.querySelector('[data-project="portal"] > div:first-child > p');
  const actions = document.querySelector('[data-project="portal"] [data-portal-actions]');
  if (!pathLabel || !actions) return { present: false };
  const pathRect = pathLabel.getBoundingClientRect();
  const actionsRect = actions.getBoundingClientRect();
  const lineHeight = Number.parseFloat(getComputedStyle(pathLabel).lineHeight);
  return {
    present: true,
    pathFitsOneLine: pathRect.height <= lineHeight * 1.5,
    actionsUseOwnRow: actionsRect.top >= pathRect.bottom - 1,
  };
});
results.mobileProjectPathWraps = await mob.evaluate(() =>
  [...document.querySelectorAll('#projetos [data-project] > div:first-child > p')].flatMap(label => {
    const rect = label.getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
    return rect.height > lineHeight * 1.5 ? [label.textContent.trim()] : [];
  }),
);
results.mobileLinkedinAvailability = await mob.evaluate(() => {
  const status = document.querySelector('[data-linkedin-availability]');
  const rect = status?.getBoundingClientRect();
  return {
    present: Boolean(status && rect),
    fullyVisible: Boolean(rect && rect.left >= 0 && rect.right <= window.innerWidth),
    centered: Boolean(rect && Math.abs((rect.left + rect.right) / 2 - window.innerWidth / 2) <= 1),
  };
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
    graphHidden: getComputedStyle(document.querySelector('.netgraph')).display === 'none',
  };
});
for (const [id, name] of [['#sobre', 'sobre'], ['#experiencia', 'experiencia'], ['#projetos', 'projetos'], ['#skills', 'skills'], ['#contato', 'contato']]) {
  await gotoSection(mob, id);
  await shot(mob, `mobile-02-${name}-pt`);
}
await gotoSection(mob, '[data-employer-group="volkswagen"]');
await shot(mob, 'mobile-02-experiencia-volkswagen-pt');
await gotoSection(mob, '[data-project="portal"]');
await shot(mob, 'mobile-02-projeto-portal-pt');
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
  relationAnimation: (() => {
    const skill = document.querySelector('[data-skill="kali-linux"]');
    skill?.focus();
    const edge = document.querySelector('.relation-edge.hot');
    return edge ? getComputedStyle(edge).animationName : null;
  })(),
}));
results.reducedMotionOrgNetwork = await reducedMotion.evaluate(() => {
  const branches = document.querySelector('[data-org-network="vespas"] [data-org-branches]');
  return branches ? getComputedStyle(branches).transitionDuration : null;
});

await browser.close();

const expectedSkillIcons = ['crosshair', 'shield-check', 'cloud-cog', 'code-xml', 'brain-circuit'];

const assertions = [
  [results.profile.title.includes('Full Stack'), 'title positions the profile as Full Stack'],
  [
    results.slowScanIntro.visibleAfterInitialRead && results.slowScanIntro.sweepDurationSeconds >= 2.3,
    'the first-visit recon scan remains readable for roughly 2.4 seconds',
  ],
  [results.profile.role.includes('Full Stack') && results.profile.role.includes('DevSecOps'), 'hero combines Full Stack and DevSecOps'],
  [
    ['Build resilient products.', 'Automate the path to production.', 'Turn attack insight into defense.']
      .every(line => results.profile.terminalMission?.includes(line)),
    'the terminal mission states a distinctive product, delivery and defense philosophy',
  ],
  [results.profile.nerdz.card, 'Nerdz appears as a featured project'],
  [
    [
      ['nerdz', 'https://landing.nerdz.aurasec.dev/'],
      ['veripkg', 'https://github.com/Taresu/veripkg'],
      ['portal', 'https://www.utfpr.edu.br/'],
      ['vespas', 'https://github.com/vespas-utfpr'],
    ].every(([name, href]) => results.profile.linkedProjects.some(project =>
      project.name === name && !project.isLink && project.isArticle && project.href === href &&
        project.target === '_blank' && project.rel.includes('noopener') && project.keyboardFocusable &&
        project.nestedAnchorCount === 0
    )),
    'linked project cards use a safe explicit primary link so their documentation chips are valid',
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
    !results.profile.voip.isLink &&
      results.profile.voip.visibility === 'projeto interno · CMC' &&
      results.profile.voip.summary?.startsWith('Bot de web scraping em Python') &&
      results.profile.voip.summary?.includes('~370 telefones VoIP'),
    'the private VoIP project is non-interactive and describes the scraping bot and its impact',
  ],
  [
    results.profile.voip.tags.some(tag => tag.label === 'GitHub' && tag.href === 'https://github.com/CMCuritiba'),
    'the private CMC project links its GitHub tag to the public CMCuritiba organization',
  ],
  [
    ['GitLab', 'ClickUp'].every(label => results.profile.projectTags.portal.some(tag => tag.label === label)),
    'the Portal UTFPR project includes its GitLab and ClickUp workflow tags',
  ],
  [
    results.profile.portalLinks.primary === 'https://www.utfpr.edu.br/' &&
      results.profile.portalLinks.team === 'https://www.utfpr.edu.br/comunicacao/asport' &&
      results.profile.portalLinks.teamLabel === 'Conheça a equipe',
    'the Portal card prioritizes the institutional site and exposes ASport as a clearly named secondary link',
  ],
  [
    results.profile.portalActionFlow.afterSummary && results.profile.portalActionFlow.beforeTags,
    'the Portal actions sit between the project description and its technology tags',
  ],
  [
    [
      ['OWASP Top 10', 'https://owasp.org/www-project-top-ten/'],
      ['MITRE ATT&CK', 'https://attack.mitre.org/'],
      ['GitHub', 'https://github.com/vespas-utfpr'],
    ].every(([label, href]) => results.profile.projectTags.vespas.some(tag => tag.label === label && tag.href === href)),
    'the VESPAS project includes linked OWASP Top 10, MITRE ATT&CK and GitHub tags',
  ],
  [
    results.profile.vespasChallenge.href === 'https://github.com/vespas-utfpr/ainjection' &&
      results.profile.vespasChallenge.label === 'AInjection 2026' &&
      ['AInjection', 'OWASP GenAI Top 10', 'Prompt Injection', 'trust boundaries', 'aplicações com LLM']
        .every(term => results.profile.vespasChallenge.summary?.includes(term)) &&
      [
        ['OWASP GenAI Top 10', 'https://genai.owasp.org/llm-top-10/'],
        ['Trust Boundaries', 'https://en.wikipedia.org/wiki/Trust_boundary'],
        ['TypeScript', 'https://www.typescriptlang.org/docs/'],
      ].every(([label, href]) => results.profile.projectTags.vespas.some(tag => tag.label === label && tag.href === href)),
    'the VESPAS card links and describes the public AInjection 2026 challenge with its core security concepts',
  ],
  [
    results.profile.projectDescriptionWords.vespas <= results.profile.projectDescriptionWords.portal + 10,
    'the VESPAS description stays close to the Portal card density',
  ],
  [
    results.profile.vespasResponsibility.about?.includes('um dos coordenadores voluntários do Canal de Alertas') &&
      results.profile.vespasResponsibility.role === 'Voluntário — Alertas, CTF & Site' &&
      results.profile.vespasResponsibility.alerts?.startsWith('Sou um dos coordenadores') &&
      results.profile.vespasResponsibility.labs?.startsWith('Colaboro') &&
      results.profile.vespasResponsibility.site?.startsWith('Também sou um dos mantenedores') &&
      results.profile.vespasResponsibility.siteHref === 'https://utfpr.curitiba.br/vespas/' &&
      !results.profile.vespasChallenge.summary?.includes('Coordeno os labs'),
    'the Portuguese VESPAS copy distinguishes Alerts Channel coordination from CTF-lab collaboration',
  ],
  [
    results.profile.chipLinks.total === 94 && results.profile.chipLinks.linked === 94 &&
      results.profile.chipLinks.allSafeExternal && results.profile.chipLinks.nestedInteractive.length === 0 &&
      results.profile.chipLinks.emptyLabels === 0,
    'all 94 experience, project and skill chips are safe external documentation links without nested interactions',
  ],
  [
    results.profile.tcc.title?.includes('Educação em Cibersegurança') &&
      results.profile.tcc.summary?.startsWith('No meu TCC, desenvolvi e avaliei') &&
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
  [
    results.profile.experienceGroups.utfpr.present &&
      results.profile.experienceGroups.utfpr.employer === 'UTFPR' &&
      results.profile.experienceGroups.utfpr.logoCount === 1 &&
      JSON.stringify(results.profile.experienceGroups.utfpr.roles) === JSON.stringify([
        'Desenvolvedor Full Stack', 'Desenvolvedor Web | Frontend',
      ]),
    'the two UTFPR positions are correlated inside one employer timeline group with one logo',
  ],
  [
    results.profile.experienceGroups.volkswagen.present &&
      results.profile.experienceGroups.volkswagen.employer === 'Volkswagen do Brasil' &&
      results.profile.experienceGroups.volkswagen.logoCount === 1 &&
      JSON.stringify(results.profile.experienceGroups.volkswagen.roles) === JSON.stringify([
        'Estagiário de Segurança da Informação', 'Estagiário de TI',
      ]),
    'the two Volkswagen internships are correlated chronologically inside one employer group',
  ],
  [results.profile.assistantWebmasterCount === 0, 'the unrelated legacy Webmaster entry remains absent'],
  [results.profile.cmcRole === 'Estagiário DevOps', 'the CMC role is written naturally in Portuguese'],
  [
    [
      ['utfpr', 'https://www.utfpr.edu.br/', 2, true],
      ['vespas', 'https://linktr.ee/vespas_utfpr', 3, true],
      ['cmc', 'https://www.curitiba.pr.leg.br/', 2, true],
      ['volkswagen', 'https://www.vw.com.br/', 0, false],
    ].every(([organization, href, branchCount, hasToggle]) =>
      results.profile.organizationNetworks.some(network =>
        network.organization === organization && network.logoHref === href && network.nameHref === href &&
        network.logoTarget === '_blank' && network.logoRel.includes('noopener') &&
        network.links.length === branchCount && network.hasToggle === hasToggle
      )),
    'organization logos and names share safe primary links while only project-related employers expose branches',
  ],
  [
    [
      ['utfpr', 'Projeto Portal', `${BASE}/#project-portal`, 'project'],
      ['utfpr', 'Equipe ASport', 'https://www.utfpr.edu.br/comunicacao/asport', 'resource'],
      ['vespas', 'AInjection 2026', 'https://github.com/vespas-utfpr/ainjection', 'project'],
      ['vespas', 'Site VESPAS', 'https://utfpr.curitiba.br/vespas/', 'resource'],
      ['vespas', 'GitHub VESPAS', 'https://github.com/vespas-utfpr', 'resource'],
      ['cmc', 'Projeto VoIP', `${BASE}/#project-voip`, 'project'],
      ['cmc', 'GitHub CMC', 'https://github.com/CMCuritiba', 'resource'],
    ].every(([organization, label, href, kind]) =>
      results.profile.organizationNetworks.find(network => network.organization === organization)
        ?.links.some(link => link.label === label && link.href === href && link.kind === kind &&
          (href.startsWith(BASE) ? !link.target : link.target === '_blank' && link.rel.includes('noopener')))
    ) && JSON.stringify(results.profile.projectAnchorIds) === JSON.stringify(['project-portal', 'project-voip']),
    'organization branches lead to the approved useful resource or related project destination',
  ],
  [
    results.desktopOrgHover.present && results.desktopOrgHover.open && results.desktopOrgHover.branchesVisible &&
      results.desktopOrgEscapeClosed && results.desktopOrgKeyboard.open &&
      results.desktopOrgKeyboard.expanded === 'true' && results.desktopOrgPinned.open === 'true' &&
      results.desktopOrgPinned.pinned === 'true' && results.desktopOrgPinned.linksInteractive,
    'the VESPAS mini-graph opens through pointer and keyboard interaction and closes with Escape',
  ],
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
    results.profile.credentialGroups.repeatedVerificationLabels === 0 &&
      results.profile.credentialGroups.verificationNote === 'links externos de verificação',
    'credential verification is communicated once at section level instead of repeated on every card',
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
    results.profile.contactAlignment.topSpread <= 1 && results.profile.contactAlignment.heightSpread <= 1,
    'all four contact buttons share the same top edge and height',
  ],
  [
    results.profile.linkedinAvailability.text === 'Open to Work ativo · visível apenas para recrutadores' &&
      results.profile.linkedinAvailability.position === 'absolute' &&
      results.profile.linkedinAvailability.descriptionGap >= 40,
    'LinkedIn shows the recruiter-only Open to Work status without affecting button alignment',
  ],
  [
    results.profile.discordCopy.present && results.profile.discordCopy.isButton &&
      results.profile.discordCopy.value === 'tsalada' && results.profile.discordCopy.ariaLabel &&
      results.profile.discordCopy.guide === 'Copie o usuário e abra Amigos → Adicionar amigo.' &&
      results.profile.discordCopy.openHref === 'https://discord.com/channels/@me' &&
      results.profile.discordCopy.openTarget === '_blank' &&
      results.profile.discordCopy.openRel.includes('noopener') &&
      results.discordCopyInteraction.copied === 'tsalada' &&
      results.discordCopyInteraction.state === 'copied' &&
      results.discordCopyInteraction.feedback === 'Copiado',
    'Discord is an accessible copy-username button with immediate Portuguese feedback',
  ],
  [
    [
      'Education in Cybersecurity', 'For my final paper, I developed and evaluated', 'Portal Sophia-CT',
      '7.54 → 9.85', 'Generative AI', 'Mixed methods', 'Access course', 'Sophia-CT login',
    ].every(text => results.en.tcc?.includes(text)),
    'the TCC content, course access and technical labels are translated in the English portfolio',
  ],
  [
    results.en.tcc?.includes('final paper') && !/\bTCC\b/.test(results.en.tcc),
    'the English research card uses “final paper” instead of the Portuguese TCC acronym',
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
  [results.en.nerdzCta === 'View product', 'the Nerdz project action is translated in English'],
  [
    JSON.stringify(results.en.experienceDates) === JSON.stringify({
      utfs: 'Mar 2026',
      utf: 'Sep 2025 — Jul 2026',
      cmc: 'Mar 2025',
      vwSecurity: 'May 2024 — Feb 2025',
      vwIt: 'May 2023 — Apr 2024',
    }),
    'experience month labels use English abbreviations in the English portfolio',
  ],
  [
    [
      ['nav.mobileOpen', 'Open navigation'],
      ['nav.mobileLabel', 'Mobile navigation'],
      ['hero.terminalLabel', 'Animated terminal with profile summary'],
      ['proj.tcc.metaLabel', 'Research results and metadata'],
      ['skills.relation.ariaLabel', 'Strength of skill relationships'],
    ].every(([key, label]) => results.en.localizedAriaLabels[key] === label),
    'visible controls and landmarks expose English accessibility labels after switching language',
  ],
  [
    results.en.voip?.includes('internal project · CMC') &&
      results.en.voip?.includes('Python web-scraping bot') &&
      results.en.voip?.includes('~370 VoIP phones'),
    'the private VoIP project context, implementation and impact are translated in English',
  ],
  [
    ['AInjection 2026', 'LLM applications', 'OWASP GenAI Top 10', 'Prompt Injection', 'trust boundaries']
      .every(term => results.en.vespas?.includes(term)),
    'the AInjection challenge context is translated in the English VESPAS card',
  ],
  [
    results.en.vespasResponsibility.about?.includes('one of the coordinators of the VESPAS Alerts Channel') &&
      results.en.vespasResponsibility.role === 'Volunteer — Alerts, CTF & Website' &&
      results.en.vespasResponsibility.alerts?.startsWith('I am one of the coordinators') &&
      results.en.vespasResponsibility.labs?.startsWith('I contribute') &&
      results.en.vespasResponsibility.site?.startsWith('I am also one of the maintainers') &&
      results.en.vespasResponsibility.siteHref === 'https://utfpr.curitiba.br/vespas/' &&
      results.en.vespasResponsibility.project?.startsWith('I contribute') &&
      !results.en.vespasResponsibility.project?.includes('I coordinate VESPAS labs'),
    'the English VESPAS copy preserves the distinction between channel coordination and lab collaboration',
  ],
  [results.en.appliedAiHeading === 'Applied AI', 'the applied-AI heading is translated concisely in English'],
  [
    ['direct', 'workflow', 'context'].every(label => results.en.relationshipLegend.includes(label)),
    'the relationship-strength legend is translated in English',
  ],
  [results.en.relationshipLegendTitle === 'correlation', 'the relationship legend heading is translated in English'],
  [results.en.cmcRole === 'DevOps Intern', 'the CMC role remains correctly titled in English'],
  [
    results.en.cmcEmployer === 'Curitiba City Council' && results.en.cmcLogoAlt === 'Curitiba City Council',
    'the CMC employer name and logo alternative text are localized in English',
  ],
  [results.en.vwItRole === 'IT Intern', 'the earlier Volkswagen role is translated in English'],
  [
    results.en.linkedinAvailability === 'Open to Work active · visible to recruiters only',
    'the recruiter-only LinkedIn availability status is translated in English',
  ],
  [
    [
      ['utfpr', ['Portal project', 'ASport team']],
      ['vespas', ['AInjection 2026', 'VESPAS website', 'VESPAS GitHub']],
      ['cmc', ['VoIP project', 'CMC GitHub']],
      ['volkswagen', []],
    ].every(([organization, labels]) =>
      JSON.stringify(results.en.organizationNetworkLabels[organization]) === JSON.stringify(labels)),
    'organization branch labels are localized in English without changing their destinations',
  ],
  [
    results.en.discordGuide === 'Copy the username, then open Friends → Add Friend.',
    'the Discord add-friend guidance is translated in English',
  ],
  [results.en.multiagentSkill === 'Multi-agent Orchestration', 'the multi-agent skill tag is translated in English'],
  [
    JSON.stringify(results.en.additionalCredentialTitles) === JSON.stringify([
      'Digital Back-End Track — Santander Tech+',
      'Cybersecurity Fundamentals',
      'Emotional Intelligence 2.0',
      'Productivity and Time Management',
    ]),
    'additional credential titles are translated for the English presentation',
  ],
  [
    results.en.credentialVerificationNote === 'external verification links',
    'the consolidated credential-verification note is translated in English',
  ],
  [
    results.englishReloadChipLinks.total === 94 && results.englishReloadChipLinks.linked === 94,
    'all documentation chips remain linked when English is the saved language at page load',
  ],
  [results.tccPdf.status === 200 && results.tccPdf.type === 'application/pdf', 'TCC PDF is readable from the portfolio'],
  [results.mobileMenu.before.button && results.mobileMenu.before.menu, 'mobile navigation controls exist'],
  [results.mobileMenu.before.expanded === 'false' && results.mobileMenu.before.hidden === true, 'mobile navigation starts collapsed'],
  [results.mobileMenu.after.expanded === 'true' && results.mobileMenu.after.hidden === false, 'mobile navigation opens'],
  [
    results.mobileOrgNetwork.before.present && results.mobileOrgNetwork.before.expanded === 'false' &&
      results.mobileOrgNetwork.before.hidden === 'true' && results.mobileOrgNetwork.after.expanded === 'true' &&
      results.mobileOrgNetwork.after.hidden === 'false' && results.mobileOrgNetwork.after.open === 'true' &&
      results.mobileOrgNetwork.after.branchCount === 3 && results.mobileOrgNetwork.after.logoToggleDistance <= 48,
    'the dedicated mobile node button expands the VESPAS branch list without relying on hover',
  ],
  [results.mobileOverflowX === false, 'mobile layout has no horizontal overflow'],
  [results.mobileExperienceLogoOverlaps.length === 0, 'mobile employer logos do not overlap experience titles'],
  [
    results.mobilePortalHeader.present && results.mobilePortalHeader.pathFitsOneLine &&
      results.mobilePortalHeader.actionsUseOwnRow,
    'the Portal path stays readable and its two actions use a separate row on mobile',
  ],
  [results.mobileProjectPathWraps.length === 0, 'project path labels remain readable on one line at mobile width'],
  [
    results.mobileLinkedinAvailability.present && results.mobileLinkedinAvailability.fullyVisible &&
      results.mobileLinkedinAvailability.centered,
    'the LinkedIn availability status stays fully visible and centered on mobile',
  ],
  [results.mobileAiSkillGroup.graphHidden, 'the dense relationship graph remains hidden on mobile'],
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
  [results.reducedMotionOrgNetwork === '0s', 'reduced-motion mode removes organization-graph transitions'],
  [results.profile.employerLogos.length === 4, 'each employer group has one logo'],
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
    results.profile.reconGraph.rightHubIconGaps.every(gap => gap >= 22),
    'right-column graph hubs keep comfortable clearance from their heading icons',
  ],
  [
    results.profile.reconGraph.aiBackboneOffset !== null && results.profile.reconGraph.aiBackboneOffset <= 1.5,
    'the applied-AI backbone is centered on the text label rather than the combined icon-and-label heading',
  ],
  [
    results.profile.reconGraph.relationCount === 59 &&
      results.profile.reconGraph.relationsByStrength.strong === 26 &&
      results.profile.reconGraph.relationsByStrength.medium === 24 &&
      results.profile.reconGraph.relationsByStrength.weak === 9 &&
      results.profile.reconGraph.relationEndpointsValid && results.profile.reconGraph.relationKeysUnique &&
      results.skillRelation.present &&
      results.skillRelation.sourceActive && results.skillRelation.targetRelated &&
      results.skillRelation.edgeHot && results.skillRelation.connectsSource && results.skillRelation.connectsTarget,
    'the weighted relationship map has valid unique endpoints and paths connected to tag boundaries',
  ],
  [
    results.profile.reconGraph.defaultStrengthOpacity.strong > results.profile.reconGraph.defaultStrengthOpacity.medium &&
      results.profile.reconGraph.defaultStrengthOpacity.medium > results.profile.reconGraph.defaultStrengthOpacity.weak &&
      results.profile.reconGraph.legendTitle === 'correlação' &&
      ['direta', 'fluxo', 'contexto'].every(label =>
        results.profile.reconGraph.legend.some(item => item.label === label)),
    'strong, workflow and contextual relationships have a clear resting-state hierarchy and labeled Portuguese legend',
  ],
  [
    results.kaliRelations.edgeCount === 4 && results.kaliRelations.relatedCount === 4 &&
      results.kaliRelations.strengths.every(strength => strength === 'strong'),
    'Kali Linux acts as a visual hub for Nmap, Burp Suite, Metasploit and Wireshark',
  ],
  [
    results.owaspRelations.sourceActive &&
      results.owaspRelations.edgeStrengths.join('|') === 'medium|medium|medium|strong|weak' &&
      [
        ['apis-rest', 'medium'], ['burp-suite', 'strong'], ['cvss', 'medium'],
        ['iso-27001', 'weak'], ['nestjs', 'medium'],
      ].every(([skill, strength]) => results.owaspRelations.relatedTags.some(tag =>
        tag.skill === skill && tag.strength === strength)),
    'keyboard focus reveals OWASP Top 10 relationships at their correct strength levels',
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
    results.reducedMotionRecon.canvasAnimating === 'false' && !results.reducedMotionRecon.scanIntroPresent &&
      results.reducedMotionRecon.relationAnimation === 'none',
    'reduced-motion halts the recon animation loop, skips the scan intro and keeps relationships static',
  ],
];

const failures = assertions.filter(([passed]) => !passed).map(([, message]) => message);
console.log(JSON.stringify(results, null, 2));
console.log(`Screenshots em: ${outDir}`);
if (failures.length) {
  console.error(`Falhas (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
}
