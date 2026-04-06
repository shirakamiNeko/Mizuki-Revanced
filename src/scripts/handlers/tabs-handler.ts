function initTabs() {
  const tabRadios = document.querySelectorAll('.tab-radio');
  
  tabRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const tabIndex = target.id.split('-').pop();
      const container = target.closest('.tabs-container');
      
      if (!container) return;
      
      const contents = container.querySelectorAll('.tab-content');
      contents.forEach(content => {
        content.classList.remove('tab-content-active');
      });
      
      const activeContent = container.querySelector(`.tab-content[data-tab-index="${tabIndex}"]`);
      if (activeContent) {
        activeContent.classList.add('tab-content-active');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initTabs);
document.addEventListener('swup:page:view', initTabs);