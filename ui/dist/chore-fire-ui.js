// Chore Fire UI SDK
(function(window) {
    'use strict';
    
    const PROJECT_NAMESPACE = window.CHORE_FIRE_PROJECT_NAMESPACE || 'chore-fire';
    
    // 创建 Chore Fire 对象
    window.ChoreFire = {
        projectNamespace: PROJECT_NAMESPACE,
        
        // 初始化函数
        init: function() {
            console.log('Chore Fire SDK initialized for project:', PROJECT_NAMESPACE);
            this.addFloatingButton();
        },
        
        // 添加浮动按钮
        addFloatingButton: function() {
            const button = document.createElement('div');
            button.id = 'chore-fire-button';
            button.innerHTML = '🔥';
            button.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: #ff6b35;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: transform 0.2s;
            `;
            
            button.addEventListener('click', this.openPanel.bind(this));
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            document.body.appendChild(button);
        },
        
        // 打开面板
        openPanel: function() {
            alert('Chore Fire Panel - Coming Soon!');
            console.log('Opening Chore Fire panel for project:', this.projectNamespace);
        }
    };
    
    // 页面加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.ChoreFire.init();
        });
    } else {
        window.ChoreFire.init();
    }
    
})(window);