/**
 * ARCHISPACE — script.js
 * Navigation, animations, chatbot IA, formulaire de contact
 */



(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const linksEl = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav__link');

  const sections = document.querySelectorAll('section[id]');
    /* Scroll-based class */
    function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
    highlightActiveSection();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Burger toggle */
  burger.addEventListener('click', () => {
    const isOpen = linksEl.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close menu when a link is clicked */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      linksEl.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* Highlight active section in nav */

  function highlightActiveSection() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('is-active', scrollPos >= top && scrollPos < top + height);
      }
    });
  }
})();


/* ============================================================
   2. HERO — ken-burns entrance
   ============================================================ */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // Slight delay to trigger CSS transition
  requestAnimationFrame(() => {
    setTimeout(() => hero.classList.add('is-loaded'), 100);
  });
})();






/* ============================================================
   4. CONTACT FORM — validation & submission
   ============================================================ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('formSubmitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFeedback();

    // Basic validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showFeedback('Merci de compléter tous les champs obligatoires.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Adresse email invalide.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    // Simulate async send (replace with real endpoint or n8n webhook)
    await new Promise(r => setTimeout(r, 1400));

    submitBtn.disabled = false;
    submitBtn.textContent = 'Envoyer ma demande';
    showFeedback('Votre demande a bien été envoyée. Nous vous répondrons sous 24h.', 'success');
    form.reset();
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `form-feedback form-feedback--${type}`;
  }
  function clearFeedback() {
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }
})();


/* ============================================================
   5. CHATBOT WIDGET — n8n webhook integration
   ============================================================ */
(function initChatbot() {

  /* ── Configuration ────────────────────────────────────── */
  const CONFIG = {
    /**
     * Remplacez cette URL par l'URL de votre webhook n8n.
     * Votre workflow n8n doit accepter un POST body { message: string }
     * et répondre avec { reply: string }.
     *
     * Exemple: 'https://your-n8n-instance.com/webhook/archispace-chat'
     */
   webhookUrl: 'https://archispace-vb.tech/webhook/chatbot',
    welcomeMessages: [
      'Bonjour et bienvenue chez Archispace. 👋',
      `Je suis votre assistant d\u00e9di\u00e9. Comment puis-je vous aider avec votre projet d'architecture ou de design d'int\u00e9rieur ?`
    ],

    /* Réponses de secours si le webhook est indisponible */
    fallbackReplies: [
      'Merci pour votre message. Notre équipe reviendra vers vous très prochainement.',
      'Votre demande a bien été prise en compte. Souhaitez-vous nous laisser vos coordonnées dans le formulaire de contact ?',
      'Je transmets votre message à l\'équipe Archispace. Attendez-vous à une réponse sous 24h.'
    ]
  };

  /* ── DOM elements ─────────────────────────────────────── */
  const toggle = document.getElementById('chatbotToggle');
  const panel = document.getElementById('chatbotPanel');
  const messagesEl = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const chatbot = document.getElementById('chatbot');
  if (!toggle || !panel) return;

  let isOpen = false;
  let welcomeSent = false;

  /* ── Toggle panel ─────────────────────────────────────── */
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    chatbot.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fermer l\'assistant' : 'Ouvrir l\'assistant');

    if (isOpen && !welcomeSent) {
      welcomeSent = true;
      sendWelcome();
    }
    if (isOpen) {
      setTimeout(() => input.focus(), 350);
    }
  });

  /* ── Welcome sequence ─────────────────────────────────── */
  function sendWelcome() {
    CONFIG.welcomeMessages.forEach((msg, i) => {
      setTimeout(() => appendMessage('bot', msg), i * 900 + 400);
    });
  }

  /* ── Send message ─────────────────────────────────────── */
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage('user', text);

    const typingEl = showTyping();

    let reply;
    try {
      reply = await fetchWebhook(text);
    } catch (_) {
      reply = CONFIG.fallbackReplies[Math.floor(Math.random() * CONFIG.fallbackReplies.length)];
    }

    // Small realistic delay
    await new Promise(r => setTimeout(r, 600));
    removeTyping(typingEl);
    appendMessage('bot', reply);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ── Webhook call ─────────────────────────────────────── */
  async function fetchWebhook(message) {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

   if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
if (false && contentType.includes('application/json')) {
      const data = await response.json();
      // Accepte { reply }, { message }, { response } ou { output }
      return data.reply || data.message || data.response || data.output
        || (typeof data === 'string' ? data : 'Merci pour votre message !');
    }
    // Réponse texte brut
    const text = await response.text();
    return text.trim() || 'Merci pour votre message !';
  }

  /* ── Local smart fallback (avant intégration n8n) ────── */
  function buildLocalReply(message) {
    const lower = message.toLowerCase();
    if (/tarif|prix|coût|budget|devis/i.test(lower)) {
      return 'Nos prestations sont sur mesure. Chaque devis est établi après une première consultation gratuite. Souhaitez-vous planifier un rendez-vous ?';
    }
    if (/contact|rendez-vous|réunion|appel|téléphone/i.test(lower)) {
      return 'Vous pouvez nous joindre directement via le formulaire de contact en bas de page, ou par email à contact@archispace.fr. Nous répondons sous 24h.';
    }
    if (/projet|maison|appartement|villa|bureau|loft|rénovation/i.test(lower)) {
      return 'Archispace accompagne de nombreux types de projets : résidentiel, tertiaire, retail. Parlez-moi de votre projet, je vous mets en relation avec l\'interlocuteur idéal.';
    }
    if (/délai|temps|durée|combien de temps/i.test(lower)) {
      return 'La durée varie selon l\'ampleur du projet. Un appartement de 100m² prend en moyenne 4 à 6 mois de la conception à la livraison. Quel est votre calendrier ?';
    }
    if (/bonjour|salut|hello|bonsoir/i.test(lower)) {
      return 'Bonjour ! Ravi de vous retrouver. Parlez-moi de votre projet, je suis là pour vous guider.';
    }
    if (/merci/i.test(lower)) {
      return 'Avec plaisir. N\'hésitez pas si vous avez d\'autres questions. L\'équipe Archispace est à votre disposition.';
    }
    return 'Merci pour votre message. Un conseiller Archispace reviendra vers vous très prochainement. En attendant, notre équipe est joignable au +33 (0)1 42 00 00 00.';
  }

  /* ── UI helpers ───────────────────────────────────────── */
  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg msg--${role}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg msg--bot msg--typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function removeTyping(el) {
    if (el && el.parentNode === messagesEl) {
      messagesEl.removeChild(el);
    }
  }

})();
