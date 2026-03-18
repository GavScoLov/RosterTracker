import { getAllowedPages, isAdmin } from '../auth.js';

const navItems = [
  {
    label: 'Dashboard',
    href: './dashboard.html',
    slug: 'dashboard',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>'
  },
];

const adminNavItem = {
  label: 'Settings',
  href: './settings.html',
  slug: 'settings',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>'
};

export async function renderSidebar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const allowedPages = await getAllowedPages();
  const userIsAdmin = await isAdmin();

  // Filter nav items based on allowed pages
  const filteredItems = navItems.filter(item => {
    if (item.divider) return true;
    if (!item.slug) return true;
    if (allowedPages === null) return true; // admin sees all
    return allowedPages.includes(item.slug);
  });

  // Remove orphaned dividers
  const cleanedItems = filteredItems.filter((item, i, arr) => {
    if (!item.divider) return true;
    if (i === 0 || i === arr.length - 1) return false;
    if (arr[i - 1]?.divider) return false;
    return true;
  });

  // Add admin panel link for admins
  if (userIsAdmin) {
    cleanedItems.push({ divider: true });
    cleanedItems.push(adminNavItem);
  }

  const navHTML = cleanedItems.map(item => {
    if (item.divider) return '<hr class="sidebar-section-divider">';
    const isActive = item.href.replace('./', '') === currentPage ? 'active' : '';
    return `<a href="${item.href}" class="sidebar-nav-item ${isActive}">${item.icon}<span>${item.label}</span></a>`;
  }).join('');

  const sidebar = document.createElement('div');
  sidebar.innerHTML = `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">RT</div>
        <span class="sidebar-app-name">RosterTracker</span>
      </div>
      <nav class="sidebar-nav">${navHTML}</nav>
    </aside>
  `;

  document.body.prepend(sidebar);

  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  });
}

export function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
