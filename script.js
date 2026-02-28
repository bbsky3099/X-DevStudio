(function() {
    // ========== 1. 文档映射 ==========
    const docFiles = {
        license: 'LICENSE.md',
        privacy: 'PRIVACY_POLICY.md',
        terms: 'TERMS_OF_SERVICE.md',
        contract: 'CONTRACT_TEMPLATE.md',
        readme: 'README.md'
    };
    const docTitles = {
        license: 'MIT 许可证',
        privacy: '隐私政策',
        terms: '服务条款',
        contract: '合同模板',
        readme: '项目说明'
    };

    const modal = document.getElementById('docModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalCloseBtn');

    function closeModal() { modal.classList.remove('active'); }

    async function openModal(docKey) {
        modalTitle.textContent = docTitles[docKey] || '文档';
        modalBody.innerHTML = '<pre>加载中……</pre>';
        modal.classList.add('active');
        const fileName = docFiles[docKey];
        if (!fileName) { modalBody.innerHTML = '<pre class="error-message">错误：未找到对应的文档。</pre>'; return; }
        try {
            const response = await fetch(fileName);
            if (!response.ok) throw new Error(`无法加载文件 (HTTP ${response.status})`);
            const text = await response.text();
            modalBody.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
        } catch (error) {
            modalBody.innerHTML = `<pre class="error-message">加载失败：${error.message}\n请确认文件 ${fileName} 是否存在。</pre>`;
        }
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
    }

    document.querySelectorAll('.doc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const doc = link.getAttribute('data-doc');
            if (doc) openModal(doc);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // ========== 2. 自定义光标（优化版） ==========
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // 点立即跟随
        cursorDot.style.left = posX + 'px';
        cursorDot.style.top = posY + 'px';

        // 外圈使用 transform 平滑跟随（通过CSS过渡）
        cursorOutline.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%)`;
    });

    hoverTriggers.forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
    });

    // ========== 3. 打字机效果 ==========
    const textElement = document.getElementById('typewriter-text');
    const phrases = ["· 定制开发", "· 极致性能", "· 安全合规"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(type, typeSpeed);
    }
    document.addEventListener('DOMContentLoaded', type);

    // ========== 4. 3D倾斜卡片 ==========
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // ========== 5. 滚动动画 (Intersection Observer) ==========
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ========== 6. 鼠标轨迹特效 (粒子总数限制为20) ==========
    const trailCanvas = document.getElementById('trail-canvas');
    const ctx = trailCanvas.getContext('2d');
    let width, height;
    let trailParticles = [];
    const MAX_TRAIL = 20; // 修改为20

    function resizeTrail() {
        width = window.innerWidth;
        height = window.innerHeight;
        trailCanvas.width = width;
        trailCanvas.height = height;
    }
    window.addEventListener('resize', resizeTrail);
    resizeTrail();

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        for (let i = 0; i < 2; i++) {
            if (trailParticles.length >= MAX_TRAIL) trailParticles.shift();
            const hue = (Date.now() * 0.01 + i * 30) % 360;
            trailParticles.push({
                x: mouseX + (Math.random() - 0.5) * 40,
                y: mouseY + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                life: 0.8 + Math.random() * 0.4,
                size: 6 + Math.random() * 10,
                hue: hue,
            });
        }
    });

    function animateTrail() {
        ctx.clearRect(0, 0, width, height);
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) { trailParticles.splice(i, 1); continue; }
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
            gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 1)`);
            gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            if (i % 3 === 0 && i > 0) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(trailParticles[i-1].x, trailParticles[i-1].y);
                ctx.strokeStyle = `hsla(${p.hue}, 80%, 60%, ${p.life * 0.3})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // ========== 7. 点击特效 ==========
    const clickContainer = document.getElementById('click-effects');
    document.addEventListener('click', (e) => {
        for (let i = 0; i < 3; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.background = `radial-gradient(circle, hsl(${i*120}, 100%, 60%), transparent)`;
            ripple.style.animationDelay = i * 0.1 + 's';
            clickContainer.appendChild(ripple);
            setTimeout(() => ripple.remove(), 1000);
        }
    });

    // ========== 8. 背景粒子 ==========
    const particleCanvas = document.getElementById('particle-canvas');
    const pCtx = particleCanvas.getContext('2d');
    let pWidth, pHeight;
    let bgParticles = [];

    function resizeParticle() {
        pWidth = window.innerWidth;
        pHeight = window.innerHeight;
        particleCanvas.width = pWidth;
        particleCanvas.height = pHeight;
        initBgParticles();
    }
    window.addEventListener('resize', resizeParticle);

    function initBgParticles() {
        bgParticles = [];
        const count = Math.floor(pWidth * pHeight / 6000);
        for (let i = 0; i < count; i++) {
            bgParticles.push({
                x: Math.random() * pWidth,
                y: Math.random() * pHeight,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                hue: Math.random() * 60 + 180,
            });
        }
    }

    function animateBg() {
        pCtx.clearRect(0, 0, pWidth, pHeight);
        for (let p of bgParticles) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = pWidth;
            if (p.x > pWidth) p.x = 0;
            if (p.y < 0) p.y = pHeight;
            if (p.y > pHeight) p.y = 0;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            pCtx.fillStyle = `hsla(${p.hue}, 80%, 60%, 0.3)`;
            pCtx.fill();
        }
        requestAnimationFrame(animateBg);
    }
    resizeParticle();
    animateBg();

// ========== 9. 加载广告（随机色调） ==========
async function loadAds() {
    try {
        const response = await fetch('ads.md');
        if (!response.ok) { console.warn('未找到 ads.md'); return; }
        const text = await response.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const leftAd = document.getElementById('left-ads');
        const rightAd = document.getElementById('right-ads');
        leftAd.innerHTML = ''; rightAd.innerHTML = '';
        lines.forEach((line, idx) => {
            const card = document.createElement('div');
            card.className = 'ad-card';
            // 随机色相 180-300 (蓝到紫)
            const hue = Math.floor(Math.random() * 120) + 180; // 180~299
            card.style.setProperty('--card-hue', hue);
            card.textContent = line;
            (idx % 2 === 0 ? leftAd : rightAd).appendChild(card);
        });
    } catch (error) { console.warn('广告加载失败', error); }
}
    loadAds();

    console.log("🔒 本网站无追踪器，沟通请使用邮件: sky2099a@163.com");
})();