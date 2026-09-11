(() => {
    'use strict';

    const header = document.getElementById('header');
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    const mobile = window.matchMedia('(max-width: 920px)');
    const background = [...document.querySelectorAll('main, .site-footer, .floating-whatsapp, .brand, .skip-link')];
    let open = false;

    const setMenu = (next, restoreFocus = true) => {
        open = next && mobile.matches;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        toggle.classList.toggle('is-active', open);
        header.classList.toggle('menu-active', open);
        menu.classList.toggle('is-open', open);
        menu.inert = !open;
        document.body.classList.toggle('menu-open', open);
        background.forEach(element => { element.inert = open; });
        if (!open && restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setMenu(!open));
    menu.addEventListener('click', event => {
        const link = event.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            const section = document.getElementById(href.slice(1));
            if (section) {
                event.preventDefault();
                setMenu(false, false);
                section.setAttribute('tabindex', '-1');
                section.focus({ preventScroll: true });
                if (window.location.hash === href) section.scrollIntoView({ block: 'start' });
                else window.location.hash = href;
                section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
            }
        } else {
            // Aguardar a abertura nativa do link antes de tornar o menu inerte.
            requestAnimationFrame(() => setMenu(false));
        }
    });
    document.addEventListener('keydown', event => {
        if (!open) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            setMenu(false);
        }
        if (event.key === 'Tab') {
            const items = [toggle, ...menu.querySelectorAll('a[href]')];
            const first = items[0];
            const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first.focus();
            }
        }
    });
    mobile.addEventListener('change', () => {
        if (!mobile.matches && open) {
            setMenu(false, false);
            document.querySelector('.brand').focus();
        }
    });
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('pageshow', () => { setMenu(false, false); updateHeader(); });
    updateHeader();
})();

(() => {
    'use strict';

    const tabs = [...document.querySelectorAll('.mobile-contact-tabs [role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const mobile = window.matchMedia('(max-width: 820px)');

    if (!tabs.length || panels.some(panel => !panel)) return;

    const select = index => {
        panels.forEach((panel, panelIndex) => { panel.hidden = mobile.matches && panelIndex !== index; });
        tabs.forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
    };

    tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
    mobile.addEventListener('change', () => select(0));
    select(0);
})();

(() => {
    'use strict';

    const tabs = [...document.querySelectorAll('.mobile-unit-tabs [role="tab"]')];
    const cards = [...document.querySelectorAll('.units-grid .unit-card')];
    const mobile = window.matchMedia('(max-width: 820px)');

    if (!tabs.length || cards.length < 2) return;

    cards[0].id = 'unit-one';
    cards[1].id = 'unit-two';

    const select = index => {
        const active = mobile.matches ? index : -1;
        cards.forEach((card, cardIndex) => { card.hidden = active >= 0 && cardIndex !== active; });
        tabs.forEach((tab, tabIndex) => tab.setAttribute('aria-selected', String(tabIndex === index)));
    };

    tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
    mobile.addEventListener('change', () => select(0));
    select(0);
})();

(() => {
    'use strict';

    const hero = document.querySelector('.hero');
    const background = document.querySelector('.hero-background');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 901px)');
    let frame = null;

    if (!hero || !background || reducedMotion.matches) return;

    const updateParallax = () => {
        frame = null;
        if (!desktop.matches) {
            background.style.transform = '';
            return;
        }
        const progress = Math.max(0, Math.min(1, window.scrollY / hero.offsetHeight));
        background.style.transform = `scale(1.035) translate3d(0, ${progress * 34}px, 0)`;
    };

    const onScroll = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    desktop.addEventListener('change', updateParallax);
    updateParallax();
})();

(() => {
    'use strict';

    const hero = document.querySelector('.hero');
    const mobile = window.matchMedia('(max-width: 820px)');

    if (!hero || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
        document.body.classList.toggle('hero-past', mobile.matches && !entry.isIntersecting);
    }, { threshold: 0.08 });

    observer.observe(hero);
    mobile.addEventListener('change', () => {
        if (!mobile.matches) document.body.classList.remove('hero-past');
    });
})();

(() => {
    'use strict';

    const items = document.querySelectorAll([
        '.trust-strip-content',
        '.about-grid',
        '.units .section-heading',
        '.unit-card',
        '.services .section-heading',
        '.service-card',
        '.professionals .section-heading',
        '.professional-card',
        '.gallery .section-heading',
        '.gallery-item',
        '.faq-grid',
        '.booking-content',
        '.contact-grid'
    ].join(','));

    if (!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    items.forEach((item, index) => {
        item.dataset.reveal = '';
        item.style.transitionDelay = `${Math.min(index % 4, 3) * 50}ms`;
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.01, rootMargin: '0px 0px -15% 0px' });

    items.forEach(item => observer.observe(item));
})();

(() => {
    'use strict';

    const dialog = document.getElementById('galleryDialog');
    const image = document.getElementById('galleryDialogImage');
    const caption = document.getElementById('galleryCaption');
    const closeButton = dialog?.querySelector('.gallery-close');
    const items = document.querySelectorAll('.gallery-item[data-gallery-image]');
    let opener = null;

    if (!dialog || !image || !caption || !closeButton || !items.length) return;

    const close = () => dialog.close();

    items.forEach(item => item.addEventListener('click', () => {
        opener = item;
        image.src = item.dataset.galleryImage;
        image.alt = item.dataset.galleryCaption;
        caption.textContent = item.dataset.galleryCaption;
        dialog.showModal();
        closeButton.focus();
    }));

    closeButton.addEventListener('click', close);
    dialog.addEventListener('click', event => {
        if (event.target === dialog) close();
    });
    dialog.addEventListener('close', () => {
        image.removeAttribute('src');
        opener?.focus();
    });
})();

(() => {
    'use strict';

    const storageKey = 'alyson-cintra-feedbacks';
    const whatsappUrl = 'https://wa.me/5564981366855';
    const dialog = document.getElementById('feedbackDialog');
    const form = document.getElementById('feedbackForm');
    const cards = document.getElementById('feedbackCards');
    const status = document.getElementById('feedbackStatus');
    const triggers = document.querySelectorAll('.feedback-trigger');
    const closeButton = dialog?.querySelector('.feedback-close');
    const typeSelect = document.getElementById('feedbackType');
    const ratingFieldset = form?.querySelector('.rating-fieldset');
    let opener = null;

    if (!dialog || !form || !cards) return;

    const getFeedbacks = () => {
        try {
            const stored = JSON.parse(window.localStorage?.getItem(storageKey) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch {
            return [];
        }
    };

    const saveFeedbacks = feedbacks => {
        try {
            window.localStorage?.setItem(storageKey, JSON.stringify(feedbacks));
        } catch {
            status.textContent = 'Não foi possível salvar a mensagem neste navegador.';
        }
    };

    const createCard = feedback => {
        const card = document.createElement('article');
        const rating = document.createElement('p');
        const quote = document.createElement('blockquote');
        const footer = document.createElement('footer');
        const name = document.createElement('strong');
        const type = document.createElement('span');

        const stars = Math.max(0, Math.min(5, Number(feedback.rating) || 0));

        card.className = 'testimonial-card';
        rating.className = 'testimonial-rating';
        rating.setAttribute('aria-label', `${stars} de 5 estrelas`);
        rating.textContent = `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
        quote.textContent = feedback.message;
        name.textContent = feedback.name;
        type.textContent = feedback.type;
        footer.append(name, type);
        card.append(rating, quote, footer);
        return card;
    };

    let feedbacks = getFeedbacks();

    const renderFeedbacks = () => {
        cards.replaceChildren();
        cards.classList.toggle('testimonials-pending', feedbacks.length === 0);

        if (!feedbacks.length) {
            cards.innerHTML = '<article class="testimonial-card testimonial-empty"><blockquote>Seja a primeira pessoa a compartilhar sua experiência.</blockquote><footer><strong>Alyson Cintra Barbearia</strong><span>Aguardando</span></footer></article>';
            return;
        }

        feedbacks.forEach(feedback => cards.append(createCard(feedback)));
    };

    triggers.forEach(trigger => trigger.addEventListener('click', () => {
        opener = trigger;
        status.textContent = '';
        dialog.showModal();
        document.getElementById('feedbackName').focus();
    }));

    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => opener?.focus());

    const updateMessageType = () => {
        const isQuestion = typeSelect.value === 'Pergunta';
        ratingFieldset.hidden = isQuestion;
        ratingFieldset.disabled = isQuestion;
    };

    typeSelect.addEventListener('change', updateMessageType);
    updateMessageType();

    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get('name') || '').trim();
        const message = String(data.get('message') || '').trim();
        const type = String(data.get('type') || 'Feedback');
        const rating = Math.max(0, Math.min(5, Number(data.get('rating')) || 0));

        if (!name || !message) {
            status.textContent = 'Informe seu nome e escreva uma mensagem.';
            return;
        }

        if (type === 'Pergunta') {
            const text = `Olá, sou ${name}. Tenho uma pergunta: ${message}`;
            window.open(`${whatsappUrl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
            form.reset();
            updateMessageType();
            status.textContent = 'Abrindo o WhatsApp para você enviar sua pergunta.';
            return;
        }

        feedbacks.unshift({ name, message, type, rating });
        saveFeedbacks(feedbacks.slice(0, 24));
        feedbacks = feedbacks.slice(0, 24);
        renderFeedbacks();
        form.reset();
        updateMessageType();
        status.textContent = 'Mensagem publicada nos cards abaixo.';
    });

    renderFeedbacks();
})();
