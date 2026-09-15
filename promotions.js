
// BNP Paribas Promotions Data
const BNPPromotions = [
    {
        id: 1,
        title: "Sustainable Investment Solutions",
        description: "Align your wealth with your values through our ESG-focused portfolio management.",
        icon: "leaf",
        color: "#059669",
        bgColor: "#ECFDF5",
        link: "#"
    },
    {
        id: 2,
        title: "Private Banking Excellence",
        description: "Exclusive access to dedicated relationship managers and bespoke financial strategies.",
        icon: "award",
        color: "#7C3AED",
        bgColor: "#F5F3FF",
        link: "#"
    },
    {
        id: 3,
        title: "International Tax Advisory",
        description: "Expert guidance on cross-border wealth structuring and tax optimization.",
        icon: "globe",
        color: "#DC2626",
        bgColor: "#FEF2F2",
        link: "#"
    }
];

// Function to create promotion banner
function createPromotionBanner(promo) {
    const iconMap = {
        'leaf': Icons.leaf || '🌱',
        'award': Icons.award || '🏆',
        'globe': Icons.globe || '🌍'
    };

    return `
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem; transition: all 0.3s; cursor: pointer;"
             onmouseover="this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)'"
             onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'">
            <div style="display: flex; align-items: start; gap: 1.5rem;">
                <div style="flex-shrink: 0; width: 3rem; height: 3rem; background: ${promo.bgColor}; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: ${promo.color}; font-size: 1.5rem;">
                    ${iconMap[promo.icon]}
                </div>
                <div style="flex: 1;">
                    <h3 style="font-size: 1.0625rem; font-weight: 600; color: var(--slate-900); margin-bottom: 0.5rem;">${promo.title}</h3>
                    <p style="font-size: 0.875rem; color: var(--slate-600); line-height: 1.5;">${promo.description}</p>
                </div>
                <div style="flex-shrink: 0; color: ${promo.color}; font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <span>Learn More</span>
                    <span style="width: 1rem; height: 1rem;">${Icons.chevronRight}</span>
                </div>
            </div>
        </div>
    `;
}