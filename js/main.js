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

    const storageKey = 'alyson-cintra-feedbacks';
    const dialog = document.getElementById('feedbackDialog');
    const form = document.getElementById('feedbackForm');
    const cards = document.getElementById('feedbackCards');
    const status = document.getElementById('feedbackStatus');
    const triggers = document.querySelectorAll('.feedback-trigger');
    const closeButton = dialog?.querySelector('.feedback-close');
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
            cards.innerHTML = '<article class="testimonial-card testimonial-empty"><blockquote>Seja a primeira pessoa a compartilhar sua experiência ou enviar uma pergunta.</blockquote><footer><strong>Alyson Cintra Barbearia</strong><span>Aguardando</span></footer></article>';
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

        feedbacks.unshift({ name, message, type, rating });
        saveFeedbacks(feedbacks.slice(0, 24));
        feedbacks = feedbacks.slice(0, 24);
        renderFeedbacks();
        form.reset();
        status.textContent = 'Mensagem publicada nos cards abaixo.';
    });

    renderFeedbacks();
})();
