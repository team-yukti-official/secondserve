document.addEventListener('DOMContentLoaded', function () {
    const MAGIC_LINK_REDIRECT_URL = 'https://secondserve.in/signup.html';

    /* â”€â”€ Temporary flag to disable OTP verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const OTP_VERIFICATION_DISABLED = true;

    /* â”€â”€ DOM refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const passwordInput         = document.getElementById('password');
    const confirmPasswordInput  = document.getElementById('confirmPassword');
    const passwordToggle        = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const fullNameInput         = document.getElementById('fullName');
    const emailInput            = document.getElementById('email');
    const cityInput             = document.getElementById('city');
    const phoneInput            = document.getElementById('phone');
    const userTypeSelect        = document.getElementById('userType');
    const donorTypeField        = document.getElementById('donorTypeField');
    const donorTypeSelect       = document.getElementById('donorType');
    const signupForm            = document.getElementById('signupForm');
    const submitBtn             = document.querySelector('.signup-submit');
    const useLocationBtn        = document.getElementById('useLocationBtn');
    const latitudeInput         = document.getElementById('latitude');
    const longitudeInput        = document.getElementById('longitude');
    const locationStatus        = document.getElementById('locationStatus');

    /* Magic link UI refs */
    const sendMagicLinkBtn   = document.getElementById('sendMagicLinkBtn');
    const magicLinkSection   = document.getElementById('magicLinkSection');
    const magicLinkStatus    = document.getElementById('magicLinkStatus');
    const magicLinkNote      = document.getElementById('magicLinkNote');

    /* Country code refs */
    const countryCodeBtn     = document.getElementById('countryCodeBtn');
    const countryDropdown    = document.getElementById('countryDropdown');
    const ccSearch           = document.getElementById('ccSearch');
    const ccList             = document.getElementById('ccList');
    const selectedFlag       = document.getElementById('selectedFlag');
    const selectedCode       = document.getElementById('selectedCode');
    const countryCodeHidden  = document.getElementById('countryCode');

    /* State */
    let emailVerified = false;
    let emailVerificationRequired = true;
    let emailVerificationToken = '';
    let emailResendInterval = null;
    let emailVerificationPollInterval = null;
    let emailVerificationSyncTimeout = null;
    let pendingVerificationEmail = '';

    /* ================================================================
       COUNTRY LIST
       ================================================================ */
    const COUNTRIES = [
        { flag:'ðŸ‡¦ðŸ‡«', name:'Afghanistan',           code:'+93'  },
        { flag:'ðŸ‡¦ðŸ‡±', name:'Albania',               code:'+355' },
        { flag:'ðŸ‡©ðŸ‡¿', name:'Algeria',               code:'+213' },
        { flag:'ðŸ‡¦ðŸ‡·', name:'Argentina',             code:'+54'  },
        { flag:'ðŸ‡¦ðŸ‡²', name:'Armenia',               code:'+374' },
        { flag:'ðŸ‡¦ðŸ‡º', name:'Australia',             code:'+61'  },
        { flag:'ðŸ‡¦ðŸ‡¹', name:'Austria',               code:'+43'  },
        { flag:'ðŸ‡¦ðŸ‡¿', name:'Azerbaijan',            code:'+994' },
        { flag:'ðŸ‡§ðŸ‡­', name:'Bahrain',               code:'+973' },
        { flag:'ðŸ‡§ðŸ‡©', name:'Bangladesh',            code:'+880' },
        { flag:'ðŸ‡§ðŸ‡¾', name:'Belarus',               code:'+375' },
        { flag:'ðŸ‡§ðŸ‡ª', name:'Belgium',               code:'+32'  },
        { flag:'ðŸ‡§ðŸ‡·', name:'Brazil',                code:'+55'  },
        { flag:'ðŸ‡§ðŸ‡³', name:'Brunei',                code:'+673' },
        { flag:'ðŸ‡§ðŸ‡¬', name:'Bulgaria',              code:'+359' },
        { flag:'ðŸ‡¨ðŸ‡¦', name:'Canada',                code:'+1'   },
        { flag:'ðŸ‡¨ðŸ‡±', name:'Chile',                 code:'+56'  },
        { flag:'ðŸ‡¨ðŸ‡³', name:'China',                 code:'+86'  },
        { flag:'ðŸ‡¨ðŸ‡´', name:'Colombia',              code:'+57'  },
        { flag:'ðŸ‡¨ðŸ‡·', name:'Costa Rica',            code:'+506' },
        { flag:'ðŸ‡­ðŸ‡·', name:'Croatia',               code:'+385' },
        { flag:'ðŸ‡¨ðŸ‡¾', name:'Cyprus',                code:'+357' },
        { flag:'ðŸ‡¨ðŸ‡¿', name:'Czech Republic',        code:'+420' },
        { flag:'ðŸ‡©ðŸ‡°', name:'Denmark',               code:'+45'  },
        { flag:'ðŸ‡ªðŸ‡¬', name:'Egypt',                 code:'+20'  },
        { flag:'ðŸ‡ªðŸ‡ª', name:'Estonia',               code:'+372' },
        { flag:'ðŸ‡ªðŸ‡¹', name:'Ethiopia',              code:'+251' },
        { flag:'ðŸ‡«ðŸ‡®', name:'Finland',               code:'+358' },
        { flag:'ðŸ‡«ðŸ‡·', name:'France',                code:'+33'  },
        { flag:'ðŸ‡¬ðŸ‡ª', name:'Georgia',               code:'+995' },
        { flag:'ðŸ‡©ðŸ‡ª', name:'Germany',               code:'+49'  },
        { flag:'ðŸ‡¬ðŸ‡­', name:'Ghana',                 code:'+233' },
        { flag:'ðŸ‡¬ðŸ‡·', name:'Greece',                code:'+30'  },
        { flag:'ðŸ‡¬ðŸ‡¹', name:'Guatemala',             code:'+502' },
        { flag:'ðŸ‡­ðŸ‡°', name:'Hong Kong',             code:'+852' },
        { flag:'ðŸ‡­ðŸ‡º', name:'Hungary',               code:'+36'  },
        { flag:'ðŸ‡®ðŸ‡¸', name:'Iceland',               code:'+354' },
        { flag:'ðŸ‡®ðŸ‡³', name:'India',                 code:'+91'  },
        { flag:'ðŸ‡®ðŸ‡©', name:'Indonesia',             code:'+62'  },
        { flag:'ðŸ‡®ðŸ‡·', name:'Iran',                  code:'+98'  },
        { flag:'ðŸ‡®ðŸ‡¶', name:'Iraq',                  code:'+964' },
        { flag:'ðŸ‡®ðŸ‡ª', name:'Ireland',               code:'+353' },
        { flag:'ðŸ‡®ðŸ‡±', name:'Israel',                code:'+972' },
        { flag:'ðŸ‡®ðŸ‡¹', name:'Italy',                 code:'+39'  },
        { flag:'ðŸ‡¯ðŸ‡µ', name:'Japan',                 code:'+81'  },
        { flag:'ðŸ‡¯ðŸ‡´', name:'Jordan',                code:'+962' },
        { flag:'ðŸ‡°ðŸ‡¿', name:'Kazakhstan',            code:'+7'   },
        { flag:'ðŸ‡°ðŸ‡ª', name:'Kenya',                 code:'+254' },
        { flag:'ðŸ‡°ðŸ‡¼', name:'Kuwait',                code:'+965' },
        { flag:'ðŸ‡±ðŸ‡»', name:'Latvia',                code:'+371' },
        { flag:'ðŸ‡±ðŸ‡§', name:'Lebanon',               code:'+961' },
        { flag:'ðŸ‡±ðŸ‡¹', name:'Lithuania',             code:'+370' },
        { flag:'ðŸ‡±ðŸ‡º', name:'Luxembourg',            code:'+352' },
        { flag:'ðŸ‡²ðŸ‡¾', name:'Malaysia',              code:'+60'  },
        { flag:'ðŸ‡²ðŸ‡»', name:'Maldives',              code:'+960' },
        { flag:'ðŸ‡²ðŸ‡¹', name:'Malta',                 code:'+356' },
        { flag:'ðŸ‡²ðŸ‡½', name:'Mexico',                code:'+52'  },
        { flag:'ðŸ‡²ðŸ‡©', name:'Moldova',               code:'+373' },
        { flag:'ðŸ‡²ðŸ‡³', name:'Mongolia',              code:'+976' },
        { flag:'ðŸ‡²ðŸ‡¦', name:'Morocco',               code:'+212' },
        { flag:'ðŸ‡²ðŸ‡²', name:'Myanmar',               code:'+95'  },
        { flag:'ðŸ‡³ðŸ‡µ', name:'Nepal',                 code:'+977' },
        { flag:'ðŸ‡³ðŸ‡±', name:'Netherlands',           code:'+31'  },
        { flag:'ðŸ‡³ðŸ‡¿', name:'New Zealand',           code:'+64'  },
        { flag:'ðŸ‡³ðŸ‡¬', name:'Nigeria',               code:'+234' },
        { flag:'ðŸ‡³ðŸ‡´', name:'Norway',                code:'+47'  },
        { flag:'ðŸ‡´ðŸ‡²', name:'Oman',                  code:'+968' },
        { flag:'ðŸ‡µðŸ‡°', name:'Pakistan',              code:'+92'  },
        { flag:'ðŸ‡µðŸ‡¦', name:'Panama',                code:'+507' },
        { flag:'ðŸ‡µðŸ‡­', name:'Philippines',           code:'+63'  },
        { flag:'ðŸ‡µðŸ‡±', name:'Poland',                code:'+48'  },
        { flag:'ðŸ‡µðŸ‡¹', name:'Portugal',              code:'+351' },
        { flag:'ðŸ‡¶ðŸ‡¦', name:'Qatar',                 code:'+974' },
        { flag:'ðŸ‡·ðŸ‡´', name:'Romania',               code:'+40'  },
        { flag:'ðŸ‡·ðŸ‡º', name:'Russia',                code:'+7'   },
        { flag:'ðŸ‡¸ðŸ‡¦', name:'Saudi Arabia',          code:'+966' },
        { flag:'ðŸ‡·ðŸ‡¸', name:'Serbia',                code:'+381' },
        { flag:'ðŸ‡¸ðŸ‡¬', name:'Singapore',             code:'+65'  },
        { flag:'ðŸ‡¸ðŸ‡°', name:'Slovakia',              code:'+421' },
        { flag:'ðŸ‡¿ðŸ‡¦', name:'South Africa',          code:'+27'  },
        { flag:'ðŸ‡ªðŸ‡¸', name:'Spain',                 code:'+34'  },
        { flag:'ðŸ‡±ðŸ‡°', name:'Sri Lanka',             code:'+94'  },
        { flag:'ðŸ‡¸ðŸ‡ª', name:'Sweden',                code:'+46'  },
        { flag:'ðŸ‡¨ðŸ‡­', name:'Switzerland',           code:'+41'  },
        { flag:'ðŸ‡¹ðŸ‡¼', name:'Taiwan',                code:'+886' },
        { flag:'ðŸ‡¹ðŸ‡¿', name:'Tanzania',              code:'+255' },
        { flag:'ðŸ‡¹ðŸ‡­', name:'Thailand',              code:'+66'  },
        { flag:'ðŸ‡¹ðŸ‡³', name:'Tunisia',               code:'+216' },
        { flag:'ðŸ‡¹ðŸ‡·', name:'Turkey',                code:'+90'  },
        { flag:'ðŸ‡ºðŸ‡¬', name:'Uganda',                code:'+256' },
        { flag:'ðŸ‡ºðŸ‡¦', name:'Ukraine',               code:'+380' },
        { flag:'ðŸ‡¦ðŸ‡ª', name:'UAE',                   code:'+971' },
        { flag:'ðŸ‡¬ðŸ‡§', name:'United Kingdom',        code:'+44'  },
        { flag:'ðŸ‡ºðŸ‡¸', name:'United States',         code:'+1'   },
        { flag:'ðŸ‡ºðŸ‡¿', name:'Uzbekistan',            code:'+998' },
        { flag:'ðŸ‡»ðŸ‡³', name:'Vietnam',               code:'+84'  },
        { flag:'ðŸ‡¾ðŸ‡ª', name:'Yemen',                 code:'+967' },
        { flag:'ðŸ‡¿ðŸ‡²', name:'Zambia',                code:'+260' },
        { flag:'ðŸ‡¿ðŸ‡¼', name:'Zimbabwe',              code:'+263' },
    ];

    /* ================================================================
       COUNTRY DROPDOWN
       ================================================================ */
    let selectedCountry = COUNTRIES.find(c => c.code === '+91') || COUNTRIES[0];
    let ccFocusedIndex  = -1;

    function renderCountryList(filter = '') {
        ccList.innerHTML = '';
        ccFocusedIndex = -1;

        const term = filter.toLowerCase().trim();
        const filtered = term
            ? COUNTRIES.filter(c => c.name.toLowerCase().includes(term) || c.code.includes(term))
            : COUNTRIES;

        if (!filtered.length) {
            const empty = document.createElement('li');
            empty.style.cssText = 'padding:12px 14px;color:var(--text-light);font-size:0.85rem;cursor:default;text-align:center;';
            empty.textContent = 'No countries found';
            ccList.appendChild(empty);
            return;
        }

        filtered.forEach(c => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            if (c.code === selectedCountry.code && c.name === selectedCountry.name) {
                li.classList.add('selected');
            }
            li.innerHTML = `<span class="li-flag">${c.flag}</span>
                            <span class="li-name">${c.name}</span>
                            <span class="li-code">${c.code}</span>`;
            li.addEventListener('click', () => selectCountry(c));
            ccList.appendChild(li);
        });

        // Scroll current selection into view
        const sel = ccList.querySelector('.selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
    }

    function selectCountry(c) {
        selectedCountry          = c;
        selectedFlag.textContent = c.flag;
        selectedCode.textContent = c.code;
        countryCodeHidden.value  = c.code;
        closeDropdown();
    }

    function openDropdown() {
        // Portal-position: place dropdown below the button using fixed coords
        // so it escapes any overflow:hidden parent (like .field-row)
        const r = countryCodeBtn.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dropdownWidth = Math.min(Math.max(r.width, 270), viewportWidth - 24);
        const left = Math.min(Math.max(12, r.left), viewportWidth - dropdownWidth - 12);

        countryDropdown.style.top = (r.bottom + 6) + 'px';
        countryDropdown.style.left = left + 'px';
        countryDropdown.style.width = dropdownWidth + 'px';

        countryDropdown.classList.add('open');
        countryCodeBtn.setAttribute('aria-expanded', 'true');
        ccSearch.value = '';
        renderCountryList();
        requestAnimationFrame(() => ccSearch.focus());
    }

    function closeDropdown() {
        countryDropdown.classList.remove('open');
        countryCodeBtn.setAttribute('aria-expanded', 'false');
        ccFocusedIndex = -1;
    }

    function setCcFocus(index) {
        const items = [...ccList.querySelectorAll('li[role="option"]')];
        if (!items.length) return;
        ccFocusedIndex = Math.max(0, Math.min(index, items.length - 1));
        items.forEach((li, i) => li.classList.toggle('focused', i === ccFocusedIndex));
        items[ccFocusedIndex].scrollIntoView({ block: 'nearest' });
    }

    // Toggle open/close
    countryCodeBtn.addEventListener('click', e => {
        e.stopPropagation();
        countryDropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    });

    // Live search filter
    ccSearch.addEventListener('input', () => renderCountryList(ccSearch.value));

    // Keyboard navigation inside search
    ccSearch.addEventListener('keydown', e => {
        const items = [...ccList.querySelectorAll('li[role="option"]')];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setCcFocus(ccFocusedIndex < 0 ? 0 : ccFocusedIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setCcFocus(ccFocusedIndex <= 0 ? 0 : ccFocusedIndex - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (ccFocusedIndex >= 0 && items[ccFocusedIndex]) {
                items[ccFocusedIndex].click();
            } else if (items.length === 1) {
                items[0].click();
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
            countryCodeBtn.focus();
        }
    });

    // Close on outside click â€” must check both wrapper and the portal dropdown
    document.addEventListener('click', e => {
        if (!e.target.closest('.country-code-wrapper') &&
            !e.target.closest('#countryDropdown')) {
            closeDropdown();
        }
    });

    // Escape from anywhere
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && countryDropdown.classList.contains('open')) {
            closeDropdown();
            countryCodeBtn.focus();
        }
    });

    // Reposition on scroll (dropdown stays anchored to button)
    window.addEventListener('scroll', () => {
        if (countryDropdown.classList.contains('open')) openDropdown();
    }, { passive: true });

    // Close on resize to avoid stale position
    window.addEventListener('resize', () => {
        if (countryDropdown.classList.contains('open')) closeDropdown();
    });

    renderCountryList();

    /* ================================================================
       MAGIC LINK HELPERS
       ================================================================ */
    function setStatus(el, msg, type) {
        if (!el) return;
        el.textContent = msg;
        el.className = 'magic-link-status' + (type ? ' ' + type : '');
    }

    async function loadEmailVerificationStatus() {
        try {
            const response = await APIUtils.get(
                API_CONFIG.ENDPOINTS.AUTH.SIGNUP_EMAIL_VERIFICATION_STATUS,
                { includeAuth: false, showError: false }
            );

            emailVerificationRequired = !!response?.data?.required;
            if (!emailVerificationRequired) {
                emailVerified = true;
                emailVerificationToken = '';
                if (sendMagicLinkBtn) {
                    sendMagicLinkBtn.disabled = true;
                }
                if (magicLinkSection) {
                    magicLinkSection.classList.add('visible', 'verified');
                }
                setStatus(magicLinkStatus, 'Email verification is temporarily paused.', 'success');
                if (magicLinkNote) {
                    magicLinkNote.textContent = 'You can continue without opening a magic link.';
                }
            }
        } catch (error) {
            emailVerificationRequired = true;
        }
    }

    function startResendTimer(sendBtn, resendEl, existingInterval, callback) {
        let secs = 60;
        if (resendEl) {
            resendEl.innerHTML = `Resend link in <strong>${secs}s</strong>`;
        }
        if (existingInterval) clearInterval(existingInterval);

        const t = setInterval(() => {
            secs--;
            if (secs <= 0) {
                clearInterval(t);
                if (resendEl) {
                    resendEl.innerHTML = `Didn't receive it? <a id="resendLink">Resend link</a>`;
                }
                if (sendBtn) {
                    sendBtn.disabled = false;
                }
                document.getElementById('resendLink')?.addEventListener('click', callback);
            } else {
                if (resendEl) {
                    resendEl.innerHTML = `Resend link in <strong>${secs}s</strong>`;
                }
            }
        }, 1000);
        return t;
    }

    function stopVerificationPolling() {
        if (emailVerificationPollInterval) {
            clearInterval(emailVerificationPollInterval);
            emailVerificationPollInterval = null;
        }
        if (emailVerificationSyncTimeout) {
            clearTimeout(emailVerificationSyncTimeout);
            emailVerificationSyncTimeout = null;
        }
        pendingVerificationEmail = '';
        localStorage.removeItem('pendingSignupMagicLinkEmail');
    }

    function queueVerificationPolling(email) {
        if (!emailVerificationRequired) {
            return;
        }

        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail || !validateEmail(normalizedEmail)) {
            stopVerificationPolling();
            return;
        }

        if (emailVerificationSyncTimeout) {
            clearTimeout(emailVerificationSyncTimeout);
        }

        emailVerificationSyncTimeout = setTimeout(() => {
            startVerificationPolling(normalizedEmail);
        }, 300);
    }

    function applyVerifiedState(email, verificationToken, message = 'Magic link verified successfully!') {
        emailVerified = true;
        emailVerificationToken = verificationToken || '';

        if (email) {
            emailInput.value = email;
        }
        emailInput.classList.add('verified');
        emailInput.readOnly = true;

        if (magicLinkSection) {
            magicLinkSection.classList.add('visible', 'verified');
        }
        if (sendMagicLinkBtn) {
            sendMagicLinkBtn.disabled = true;
            sendMagicLinkBtn.classList.add('sent');
            sendMagicLinkBtn.innerHTML = '<i class="fas fa-check"></i><span>Link Verified</span>';
        }
        setStatus(magicLinkStatus, message, 'success');
        if (magicLinkNote) {
            magicLinkNote.textContent = 'Verified and synced across devices.';
        }

        if (emailResendInterval) {
            clearInterval(emailResendInterval);
            emailResendInterval = null;
        }

        stopVerificationPolling();
    }

    async function pollVerificationStatus() {
        if (!pendingVerificationEmail || emailVerified) {
            return;
        }

        try {
            const response = await APIUtils.get(
                `${API_CONFIG.ENDPOINTS.AUTH.SIGNUP_EMAIL_VERIFICATION_STATUS}?email=${encodeURIComponent(pendingVerificationEmail)}`,
                { includeAuth: false, showError: false }
            );

            const data = response?.data || {};
            if (data.paused) {
                if (magicLinkNote) {
                    magicLinkNote.textContent = `Verification paused until ${data.resumeAt ? new Date(data.resumeAt).toLocaleString() : 'later'}.`;
                }
                stopVerificationPolling();
                return;
            }

            if (data.verified && data.verificationToken) {
                applyVerifiedState(
                    data.email || pendingVerificationEmail,
                    data.verificationToken,
                    'Email verified on another device!'
                );
            } else if (data.pending && magicLinkNote) {
                magicLinkNote.textContent = 'Waiting for you to tap the link on another device...';
            }
        } catch (error) {
            // Temporary network glitches should not break the polling flow.
        }
    }

    function startVerificationPolling(email) {
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (!normalizedEmail) {
            return;
        }

        stopVerificationPolling();
        pendingVerificationEmail = normalizedEmail;
        localStorage.setItem('pendingSignupMagicLinkEmail', normalizedEmail);

        pollVerificationStatus();
        emailVerificationPollInterval = setInterval(pollVerificationStatus, 2000);
    }

    async function handleMagicLinkSend() {
        if (!emailVerificationRequired) {
            return;
        }

        const email = emailInput.value.trim();
        if (!email || !validateEmail(email)) {
            setStatus(magicLinkStatus, 'Enter a valid email first.', 'error');
            emailInput.focus();
            return;
        }

        if (sendMagicLinkBtn) {
            sendMagicLinkBtn.disabled = true;
            sendMagicLinkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
        }

        try {
            await APIUtils.post(
                API_CONFIG.ENDPOINTS.AUTH.SEND_SIGNUP_MAGIC_LINK,
                { email, redirectTo: MAGIC_LINK_REDIRECT_URL },
                { includeAuth: false }
            );
        } catch (error) {
            setStatus(magicLinkStatus, error.message || 'Failed to send magic link', 'error');
            if (sendMagicLinkBtn) {
                sendMagicLinkBtn.disabled = false;
                sendMagicLinkBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send Magic Link</span>';
            }
            return;
        }

        emailVerified = false;
        emailVerificationToken = '';
        emailInput.classList.remove('verified');
        emailInput.readOnly = false;

        if (magicLinkSection) {
            magicLinkSection.classList.add('visible');
            magicLinkSection.classList.remove('verified');
        }

        if (sendMagicLinkBtn) {
            sendMagicLinkBtn.disabled = true;
            sendMagicLinkBtn.innerHTML = '<i class="fas fa-check"></i><span>Link Sent</span>';
            sendMagicLinkBtn.classList.add('sent');
        }

        setStatus(magicLinkStatus, 'Magic link sent. Check your inbox.', 'success');
        if (magicLinkNote) {
            magicLinkNote.textContent = 'Waiting for you to tap the link on another device...';
        }

        startVerificationPolling(email);
        emailResendInterval = startResendTimer(sendMagicLinkBtn, magicLinkNote, emailResendInterval, handleMagicLinkSend);
    }

    async function tryVerifyEmailFromMagicLink() {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));

            const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash') || '';
            const type = queryParams.get('type') || hashParams.get('type') || 'email';
            const accessToken = hashParams.get('access_token') || '';

            let response = null;
            if (tokenHash) {
                response = await APIUtils.post(
                    API_CONFIG.ENDPOINTS.AUTH.VERIFY_SIGNUP_EMAIL_LINK,
                    { tokenHash, type },
                    { includeAuth: false, showError: false }
                );
            } else if (accessToken) {
                response = await APIUtils.post(
                    API_CONFIG.ENDPOINTS.AUTH.VERIFY_SIGNUP_EMAIL_SESSION,
                    { accessToken },
                    { includeAuth: false, showError: false }
                );
            } else {
                return;
            }

            const email = response?.data?.email || '';
            const verificationToken = response?.data?.verificationToken || '';
            if (!email || !verificationToken) {
                return;
            }

            applyVerifiedState(email, verificationToken);

            const clean = `${window.location.origin}${window.location.pathname}`;
            window.history.replaceState({}, document.title, clean);
        } catch (error) {
            // Keep the polling path available if the direct callback fails.
        }
    }

    if (sendMagicLinkBtn) {
        sendMagicLinkBtn.addEventListener('click', handleMagicLinkSend);
    }
    loadEmailVerificationStatus();

    const storedPendingEmail = localStorage.getItem('pendingSignupMagicLinkEmail');
    if (storedPendingEmail && !emailInput.value.trim()) {
        emailInput.value = storedPendingEmail;
        queueVerificationPolling(storedPendingEmail);
    }

    tryVerifyEmailFromMagicLink().finally(() => {
        if (emailVerified) {
            stopVerificationPolling();
        }
    });

    queueVerificationPolling(emailInput.value);

    emailInput.addEventListener('input', () => {
        emailVerified = false;
        emailVerificationToken = '';
        emailInput.readOnly = false;
        stopVerificationPolling();
        if (sendMagicLinkBtn) {
            sendMagicLinkBtn.disabled = false;
            sendMagicLinkBtn.classList.remove('sent');
            sendMagicLinkBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Send Magic Link</span>';
        }
        if (magicLinkSection) {
            magicLinkSection.classList.remove('verified');
        }
        if (magicLinkNote) {
            magicLinkNote.textContent = 'The page will update automatically when you open the link on any device.';
        }
        setStatus(magicLinkStatus, '', '');
        queueVerificationPolling(emailInput.value);
    });

    window.addEventListener('focus', () => {
        if (!emailVerified) {
            queueVerificationPolling(emailInput.value);
        }
    });

    /* ================================================================
       PASSWORD TOGGLES  (original)
       ================================================================ */
    function setupPasswordToggle(input, button) {
        if (!input || !button) return;
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    setupPasswordToggle(passwordInput, passwordToggle);
    setupPasswordToggle(confirmPasswordInput, confirmPasswordToggle);

    /* ================================================================
       PASSWORD MATCH FEEDBACK  (original)
       ================================================================ */
    function validatePasswordMatch() {
        const existingError   = confirmPasswordInput.parentElement.querySelector('.error-message');
        const existingSuccess = confirmPasswordInput.parentElement.querySelector('.success-message');
        if (existingError)   existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        if (passwordInput.value && confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = '#f44336';
                confirmPasswordInput.style.boxShadow  = '0 0 5px rgba(244,67,54,0.3)';
                const e = document.createElement('small');
                e.className = 'error-message';
                e.textContent = 'âœ— Passwords do not match';
                confirmPasswordInput.parentElement.appendChild(e);
            } else {
                confirmPasswordInput.style.borderColor = '#4caf50';
                confirmPasswordInput.style.boxShadow  = '0 0 5px rgba(76,175,80,0.3)';
                const s = document.createElement('small');
                s.className = 'success-message';
                s.textContent = 'âœ“ Passwords match';
                confirmPasswordInput.parentElement.appendChild(s);
            }
        } else {
            confirmPasswordInput.style.borderColor = '';
            confirmPasswordInput.style.boxShadow  = '';
        }
    }
    if (passwordInput)        passwordInput.addEventListener('input', validatePasswordMatch);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    /* ================================================================
       DONOR TYPE TOGGLE  (original)
       ================================================================ */
    if (userTypeSelect && donorTypeField && donorTypeSelect) {
        const toggleDonorField = function () {
            if (userTypeSelect.value === 'donor') {
                donorTypeField.classList.add('show');
                donorTypeField.style.display = 'block';
                donorTypeSelect.required = true;
            } else {
                donorTypeField.classList.remove('show');
                donorTypeField.style.display = 'none';
                donorTypeSelect.required = false;
                donorTypeSelect.value = '';
            }
        };
        userTypeSelect.addEventListener('change', toggleDonorField);
        toggleDonorField();
    }

    /* ================================================================
       USE CURRENT LOCATION  (original)
       ================================================================ */
    async function handleUseLocation() {
        if (!useLocationBtn) return;
        if (!navigator.geolocation) { APIUtils.showErrorMessage('Geolocation is not supported.'); return; }
        useLocationBtn.disabled = true;
        const icon = useLocationBtn.querySelector('i');
        const orig = icon ? icon.className : '';
        if (icon) icon.className = 'fas fa-spinner fa-spin';
        if (locationStatus) locationStatus.textContent = 'Locating...';

        navigator.geolocation.getCurrentPosition(async pos => {
            const lat = pos.coords.latitude, lon = pos.coords.longitude;
            if (latitudeInput)  latitudeInput.value  = lat;
            if (longitudeInput) longitudeInput.value = lon;
            try {
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, { headers: { Accept: 'application/json' } });
                if (resp.ok) {
                    const data = await resp.json();
                    const addr = data.address || {};
                    if (cityInput) cityInput.value = addr.city || addr.town || addr.village || addr.county || addr.state || data.display_name || '';
                    if (locationStatus) locationStatus.textContent = 'Location detected';
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (icon) icon.className = orig;
                useLocationBtn.disabled = false;
            }
        }, err => {
            console.error(err);
            APIUtils.showErrorMessage('Unable to get your location. Please allow location access.');
            if (icon) icon.className = orig;
            useLocationBtn.disabled = false;
            if (locationStatus) locationStatus.textContent = '';
        }, { timeout: 10000 });
    }
    if (useLocationBtn) useLocationBtn.addEventListener('click', handleUseLocation);

    /* ================================================================
       FORM SUBMIT  (original logic + magic-link gate)
       ================================================================ */
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const userData = {
                userType:        userTypeSelect.value,
                donorType:       donorTypeSelect.value || null,
                fullName:        fullNameInput.value.trim(),
                email:           emailInput.value.trim(),
                password:        passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                city:            cityInput.value.trim(),
                address:         cityInput.value.trim(),
                phone:           phoneInput.value.trim() ? (countryCodeHidden.value + phoneInput.value.trim()) : null,
                emailVerificationToken,
            };

            if (!userData.userType)                                     { APIUtils.showErrorMessage('Please select your role'); return; }
            if (userData.userType === 'donor' && !userData.donorType)   { APIUtils.showErrorMessage('Please select your donor type'); return; }
            if (!userData.fullName)                                      { APIUtils.showErrorMessage('Please enter your full name'); return; }
            if (!userData.email || !validateEmail(userData.email))       { APIUtils.showErrorMessage('Please enter a valid email address'); return; }
            if (emailVerificationRequired && !emailVerified)              { APIUtils.showErrorMessage('Please verify your email with the magic link first.'); sendMagicLinkBtn.scrollIntoView({ behavior:'smooth', block:'center' }); return; }
            if (!userData.password || userData.password.length < 8)     { APIUtils.showErrorMessage('Password must be at least 8 characters'); return; }
            if (userData.password !== userData.confirmPassword)          { APIUtils.showErrorMessage('Passwords do not match!'); confirmPasswordInput.focus(); return; }
            if (!userData.city)                                          { APIUtils.showErrorMessage('Please enter your city'); return; }

            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            try {
                const sendData = { ...userData };
                delete sendData.confirmPassword;

                const result = await APIUtils.signup(sendData);
                const createdUser = result?.data?.user || {};

                if (result?.success && result?.data?.token) {
                    const resolvedType = createdUser.userType || createdUser.user_type || userData.userType;
                    const resolvedName = createdUser.full_name || createdUser.fullName || userData.fullName;
                    const resolvedEmail = createdUser.email || userData.email;
                    const resolvedAddress = (createdUser.address || createdUser.city || userData.address || userData.city || '').trim();

                    sessionStorage.setItem('userType', resolvedType);
                    sessionStorage.setItem('userEmail', resolvedEmail);
                    sessionStorage.setItem('userName', resolvedName);

                    const existingUserData = APIUtils.getUserData() || {};
                    APIUtils.setUserData({
                        ...existingUserData,
                        ...createdUser,
                        userType: resolvedType,
                        full_name: resolvedName,
                        email: resolvedEmail,
                        address: resolvedAddress,
                        city: resolvedAddress
                    });

                    const profileSnapshot = {
                        ...createdUser,
                        name: resolvedName,
                        full_name: resolvedName,
                        email: resolvedEmail,
                        address: resolvedAddress,
                        city: resolvedAddress,
                        location: resolvedAddress,
                        phone: createdUser.phone || userData.phone || ''
                    };
                    if (resolvedType === 'ngo') {
                        localStorage.setItem('ngoProfile', JSON.stringify(profileSnapshot));
                    } else if (resolvedType === 'donor') {
                        localStorage.setItem('donorProfile', JSON.stringify(profileSnapshot));
                    }

                    APIUtils.showSuccessMessage('Account created successfully! Redirecting...');
                    window.location.href = 'index.html';
                } else {
                    APIUtils.showErrorMessage(result?.data?.message || 'Failed to create account. Please try again.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled  = false;
                }
            } catch (err) {
                console.error(err);
                APIUtils.showErrorMessage(err?.message || 'An error occurred. Please try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled  = false;
            }
        });
    }
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
