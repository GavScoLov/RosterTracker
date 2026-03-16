import { getAllowedPages, isAdmin } from '../auth.js';

const navItems = [
  {
    label: 'Dashboard',
    href: './dashboard.html',
    slug: 'dashboard',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>'
  },
  {
    label: 'Data Entry',
    href: './company-input.html',
    slug: 'company-input',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>'
  },
];

const adminNavItem = {
  label: 'Admin Panel',
  href: './admin.html',
  slug: 'admin',
  icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>'
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
