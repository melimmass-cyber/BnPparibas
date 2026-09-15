const portfolioBase = '/lu/en/your-goals/protect-and-grow-your-wealth'

export const navigation = [
  {
    label: 'YOUR GOALS',
    href: `${portfolioBase}/design-your-portfolio.html`,
    children: [
      { label: 'Protect & grow your wealth', href: `${portfolioBase}/design-your-portfolio.html` },
      { label: 'Design your portfolio', href: `${portfolioBase}/design-your-portfolio.html` },
      { label: 'Investment universe', href: `${portfolioBase}/investment-universe.html` },
      { label: 'Level of service', href: `${portfolioBase}/level-of-service.html` },
      { label: 'Prepare for your future', href: '/lu/en/your-goals/prepare-for-your-future.html' },
      { label: 'Finance your projects', href: '/lu/en/your-goals/finance-your-projects.html' },
    ],
  },
  {
    label: 'WEALTH MANAGEMENT SERVICES',
    href: '/mywealth.html',
    children: [
      { label: 'myWealth', href: '/mywealth.html' },
      { label: 'Portfolio overview', href: '/dashboard.html' },
      { label: 'Accounts', href: '/accounts.html' },
      { label: 'Estate & succession hub', href: '/estate-hub.html' },
    ],
  },
  {
    label: 'ABOUT YOU', href: '/lu/en/about-you.html', children: [
      { label: 'Entrepreneurs & Families', href: '#' },
      { label: 'External Wealth Managers', href: '#' },
    ],
  },
  { label: 'INSIGHTS', href: '/lu/en/insights.html' },
  { label: 'CONTACT', href: '#contact' },
]
