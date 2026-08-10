/**
 * AI Food Checker — Demo frontend version
 *
 * Select a food photo and preview a quality check report entirely in the
 * browser. No backend or npm dependencies are required for this version.
 */

(function () {
    'use strict';

    // ---- Elements ------------------------------------------------------------
    const dropzone = document.getElementById('fcDropzone');
    const dropzoneEmpty = document.getElementById('fcDropzoneEmpty');
    const previewImg = document.getElementById('fcPreviewImg');
    const removeBtn = document.getElementById('fcRemoveBtn');
    const cameraInput = document.getElementById('fcCameraInput');
    const galleryInput = document.getElementById('fcGalleryInput');
    const analyzeBtn = document.getElementById('fcAnalyzeBtn');
    const errorMsg = document.getElementById('fcErrorMsg');
    const loadingCard = document.getElementById('fcLoading');
    const loadingMainText = document.getElementById('fcLoadingMain');
    const loadingSubText = document.getElementById('fcLoadingSub');
    const resultsSection = document.getElementById('fcResults');
    const uploaderCard = document.querySelector('.fc-uploader-card');
    const anotherBtn = document.getElementById('fcAnotherBtn');

    const verdictBadge = document.getElementById('fcVerdictBadge');
    const verdictIcon = document.getElementById('fcVerdictIcon');
    const verdictText = document.getElementById('fcVerdictText');
    const foodNameEl = document.getElementById('fcFoodName');
    const scoreFill = document.getElementById('fcScoreFill');
    const scoreLabel = document.getElementById('fcScoreLabel');
    const checkSummaryEl = document.getElementById('fcCheckSummary');
    const summaryEl = document.getElementById('fcSummary');
    const checklistEl = document.getElementById('fcChecklist');
    const issuesCard = document.getElementById('fcIssuesCard');
    const issuesList = document.getElementById('fcIssuesList');
    const recommendationEl = document.getElementById('fcRecommendation');
    const donateBtn = document.getElementById('fcDonateBtn');

    let selectedFile = null;
    let selectedDataUrl = null;

    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            if (donateBtn.disabled) return;
            window.location.href = 'donate.html';
        });
    }

    // ---- Image selection -----------------------------------------------------
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showError('Please choose an image file.');
            return;
        }
        hideError();
        selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            selectedDataUrl = e.target.result;
            previewImg.src = selectedDataUrl;
            previewImg.hidden = false;
            dropzoneEmpty.hidden = true;
            removeBtn.hidden = false;
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    cameraInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    galleryInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    removeBtn.addEventListener('click', () => {
        selectedFile = null;
        selectedDataUrl = null;
        previewImg.src = '';
        previewImg.hidden = true;
        dropzoneEmpty.hidden = false;
        removeBtn.hidden = true;
        analyzeBtn.disabled = true;
        cameraInput.value = '';
        galleryInput.value = '';
    });

    const loadingMessages = [
        'Analyzing your photo…',
        'Checking your food quality…',
        'Scanning for color, texture, and freshness…',
        'Reviewing spoilage and donation suitability…'
    ];
    let loadingAnimationInterval = null;
    let loadingMessageIndex = 0;

    function startLoadingAnimation() {
        if (!loadingMainText || !loadingSubText) return;
        loadingMessageIndex = 0;
        loadingMainText.textContent = loadingMessages[loadingMessageIndex];
        loadingSubText.textContent = loadingMessages[loadingMessageIndex + 1] || loadingSubText.textContent;
        loadingAnimationInterval = setInterval(() => {
            loadingMessageIndex = (loadingMessageIndex + 1) % loadingMessages.length;
            loadingMainText.textContent = loadingMessages[loadingMessageIndex];
            loadingSubText.textContent = loadingMessages[(loadingMessageIndex + 1) % loadingMessages.length];
        }, 1300);
    }

    function stopLoadingAnimation() {
        if (loadingAnimationInterval) {
            clearInterval(loadingAnimationInterval);
            loadingAnimationInterval = null;
        }
        if (loadingMainText) {
            loadingMainText.textContent = 'Analyzing your photo…';
        }
        if (loadingSubText) {
            loadingSubText.textContent = 'Checking color, texture, and freshness signs';
        }
    }

    ['dragenter', 'dragover'].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.add('fc-drag-over');
        });
    });
    ['dragleave', 'drop'].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.remove('fc-drag-over');
        });
    });
    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // ---- Analyze ---------------------------------------------------------------
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedDataUrl) return;
        hideError();

        uploaderCard.hidden = true;
        loadingCard.hidden = false;
        resultsSection.hidden = true;
        startLoadingAnimation();

        try {
            const assessment = await callFoodCheckApi(selectedDataUrl);
            stopLoadingAnimation();
            renderResults(assessment);
            loadingCard.hidden = true;
            resultsSection.hidden = false;
        } catch (err) {
            stopLoadingAnimation();
            if (err.message === 'No custom API configured.') {
                const assessment = await simulateFoodCheck();
                stopLoadingAnimation();
                renderResults(assessment);
                loadingCard.hidden = true;
                resultsSection.hidden = false;
                return;
            }

            loadingCard.hidden = true;
            uploaderCard.hidden = false;
            showError(err.message || 'Something went wrong while checking this photo. Please try again.');
        }
    });

    const VISION_SYSTEM_PROMPT = `You are a food safety visual inspector for SecondServe, a food donation platform connecting surplus food donors with NGOs. A donor has photographed food they want to donate. Your job is to assess ONLY what is visible in the photo and return a structured judgement that helps an NGO coordinator decide whether to accept it.

RULES:
- Judge only visible evidence: color, texture, mold, discoloration, wilting, packaging condition, visible contamination. Do not guess at smell, taste, or age unless there is a clear visual cue (e.g. visible mold, sliminess, browning of cut fruit, gas bloating in packaging).
- If the image is blurry, too dark, too zoomed out, or you cannot clearly identify the food, say so — do not fabricate a confident verdict. Lower confidence and set verdict to "caution" in that case.
- Be conservative: when uncertain between two verdicts, choose the more cautious one. False "good" verdicts risk donating unsafe food; false "caution" verdicts just mean a human double-checks. Bias toward caution.
- Cooked/perishable food (rice, curry, bread, dairy, meat) needs stricter scrutiny than sealed/shelf-stable packaged goods.
- Never invent an expiry date, ingredient list, or nutritional claim you cannot see in the image.
- Respond ONLY with a single JSON object, no markdown fences, no preamble, no explanation outside the JSON.

Return exactly this JSON shape:
{
  "food_identified": string,
  "verdict": "good" | "caution" | "bad",
  "quality_score": number,
  "checks": {
    "visual_freshness": { "pass": boolean, "note": string },
    "color_texture": { "pass": boolean, "note": string },
    "spoilage_signs": { "pass": boolean, "note": string },
    "packaging_hygiene": { "pass": boolean, "note": string }
  },
  "issues": string[],
  "summary": string,
  "recommendation": string,
  "confidence": number
}

If the image does not show food at all, set food_identified to "Unclear — not a food image", verdict to "caution", quality_score to 0, confidence to 0, and explain why in summary.`;

    async function callFoodCheckApi(dataUrl) {
        const hasApiUrl = typeof API_CONFIG !== 'undefined'
            && API_CONFIG.BASE_URL
            && !API_CONFIG.BASE_URL.includes('example.com');
        const hasApiKey = typeof API_CONFIG !== 'undefined'
            && API_CONFIG.API_KEY
            && API_CONFIG.API_KEY.trim().length > 0;

        if (!hasApiUrl) {
            throw new Error('Please configure API_BASE_URL in env-config.js.');
        }

        if (!hasApiKey) {
            throw new Error('Please configure API_KEY in env-config.js.');
        }

        const payload = {
            model: API_CONFIG.AI_MODEL_NAME || 'nvidia/nemotron-nano-12b-v2-vl:free',
            temperature: 0.2,
            max_tokens: 500,
            messages: [
                { role: 'system', content: VISION_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Assess this food photo for donation eligibility. Return only the JSON object specified in the system prompt.' },
                        { type: 'image_url', image_url: { url: dataUrl } }
                    ]
                }
            ],
            stream: false
        };

        const response = await fetch(API_CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${API_CONFIG.API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text().catch(() => '');
        let data = null;
        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            data = null;
        }

        if (!response.ok) {
            const msg = getApiErrorMessage(data, responseText) || `API request failed (${response.status} ${response.statusText})`;
            throw new Error(msg);
        }

        const rawResponse = data?.choices?.[0]?.message?.content || responseText || '';
        return parseAssessment(rawResponse);
    }

    async function simulateFoodCheck() {
        const result = await analyzeUploadedImage(selectedDataUrl);
        return result;
    }

    function getApiErrorMessage(data, rawText = '') {
        if (!data && rawText) {
            return rawText.slice(0, 300);
        }
        if (!data) return null;
        if (typeof data.error === 'string') return data.error;
        if (data.error?.message) return data.error.message;
        if (data.message) return data.message;
        if (typeof data.error === 'object') return JSON.stringify(data.error);
        if (data?.details) return JSON.stringify(data.details);
        return null;
    }

    function parseAssessment(raw) {
        const cleaned = String(raw || '').trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '');

        try {
            return JSON.parse(cleaned);
        } catch (err) {
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (match) {
                return JSON.parse(match[0]);
            }
            throw new Error('Could not parse AI response as JSON.');
        }
    }

    async function analyzeUploadedImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const maxDimension = 300;
                const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                const width = Math.round(image.width * scale);
                const height = Math.round(image.height * scale);

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0, width, height);

                const imageData = context.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                let brightnessSum = 0;
                let saturationSum = 0;
                let contrastSum = 0;
                let hueVarianceSum = 0;
                let redSum = 0;
                let greenSum = 0;
                let blueSum = 0;

                const pixelCount = width * height;
                const brightnessValues = [];
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i] / 255;
                    const g = pixels[i + 1] / 255;
                    const b = pixels[i + 2] / 255;
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const l = (max + min) / 2;
                    brightnessValues.push(l);
                    brightnessSum += l;

                    const saturation = max === min ? 0 : (l <= 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min));
                    saturationSum += saturation;

                    contrastSum += max - min;
                    redSum += r;
                    greenSum += g;
                    blueSum += b;
                }

                const brightness = brightnessSum / pixelCount;
                const saturation = saturationSum / pixelCount;
                const contrast = contrastSum / pixelCount;
                const avgRed = redSum / pixelCount;
                const avgGreen = greenSum / pixelCount;
                const avgBlue = blueSum / pixelCount;
                const grayness = 1 - saturation;

                const meanBrightness = brightness;
                const varianceBrightness = brightnessValues.reduce((acc, value) => acc + Math.pow(value - meanBrightness, 2), 0) / pixelCount;
                const brightnessContrast = Math.sqrt(varianceBrightness);

                const greenScore = Math.max(0, avgGreen - avgRed) * 1.6;
                const brownScore = Math.max(0, Math.min(avgRed, avgGreen) - avgBlue);
                const dullScore = grayness * 0.9;
                const darkScore = Math.max(0, 0.35 - brightness) * 2.5;
                const lowContrastScore = Math.max(0, 0.16 - contrast) * 3;

                const qualityScore = 25
                    + Math.min(30, brightness * 35)
                    + Math.min(25, saturation * 30)
                    + Math.min(20, contrast * 25)
                    + Math.min(20, greenScore * 20)
                    - Math.min(25, dullScore * 15)
                    - Math.min(25, darkScore * 10)
                    - Math.min(20, lowContrastScore * 10)
                    - Math.min(25, brownScore * 12);

                const clampedScore = Math.max(0, Math.min(100, Math.round(qualityScore)));
                const verdict = clampedScore >= 80 ? 'good' : clampedScore >= 58 ? 'caution' : 'bad';
                const notes = {
                    good: {
                        visual_freshness: 'Looks fresh and vibrant.',
                        color_texture: 'Color and texture appear normal.',
                        spoilage_signs: 'No spoilage signs visible.',
                        packaging_hygiene: 'Packaging looks clean and presentable.'
                    },
                    caution: {
                        visual_freshness: 'Some discoloration or dullness is visible.',
                        color_texture: 'Texture may be slightly off, but mostly okay.',
                        spoilage_signs: 'A few spots or soft areas could need checking.',
                        packaging_hygiene: 'Packaging looks mostly okay.'
                    },
                    bad: {
                        visual_freshness: 'The food looks dull, dark, or discolored.',
                        color_texture: 'Color appears unhealthy or spoiled.',
                        spoilage_signs: 'Visible spoilage or unwanted color is present.',
                        packaging_hygiene: 'Presentation does not look fresh or safe.'
                    }
                };

                const confidence = Math.max(20, Math.min(100, Math.round(20 + clampedScore * 0.7)));

                resolve({
                    food_identified: selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'Food item',
                    verdict,
                    quality_score: clampedScore,
                    checks: {
                        visual_freshness: { pass: verdict !== 'bad', note: notes[verdict].visual_freshness },
                        color_texture: { pass: verdict !== 'bad', note: notes[verdict].color_texture },
                        spoilage_signs: { pass: verdict === 'good', note: notes[verdict].spoilage_signs },
                        packaging_hygiene: { pass: verdict === 'good', note: notes[verdict].packaging_hygiene }
                    },
                    issues: verdict === 'good' ? [] : [verdict === 'caution' ? 'Donate soon' : 'Not safe to donate'],
                    summary: verdict === 'good'
                        ? 'The food looks good enough for donation.'
                        : verdict === 'caution'
                            ? 'The food is borderline; handle quickly if donating.'
                            : 'This food looks unsafe to donate.',
                    recommendation: verdict === 'good'
                        ? 'Donate or use soon.'
                        : verdict === 'caution'
                            ? 'Use soon or donate carefully.'
                            : 'Avoid donating this item.',
                    confidence
                });
            };
            image.onerror = () => reject(new Error('Could not analyze the image.'));
            image.src = dataUrl;
        });
    }

    // ---- Render ------------------------------------------------------------
    const VERDICT_MAP = {
        good: { cls: 'fc-good', icon: 'fa-circle-check', label: 'Good to Donate' },
        caution: { cls: 'fc-caution', icon: 'fa-triangle-exclamation', label: 'Use With Caution' },
        bad: { cls: 'fc-bad', icon: 'fa-circle-xmark', label: 'Not Safe to Donate' }
    };

    const CHECK_LABELS = {
        visual_freshness: 'Visual Freshness',
        color_texture: 'Color & Texture',
        spoilage_signs: 'No Spoilage Signs',
        packaging_hygiene: 'Packaging & Hygiene'
    };

    function getRandomScore(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getPassedCheckCount(checks) {
        if (!checks || typeof checks !== 'object') return 0;
        return Object.values(checks).filter((check) => check && check.pass).length;
    }

    function deriveScoreFromChecks(passCount, isNoFood, baseScore, verdictKey) {
        if (isNoFood || passCount === 0) {
            return 0;
        }
        if (passCount === 1) {
            return getRandomScore(10, 20);
        }
        if (passCount === 2) {
            return getRandomScore(20, 30);
        }
        if (passCount === 3) {
            return getRandomScore(35, 65);
        }
        if (passCount === 4) {
            if (verdictKey === 'good' && baseScore >= 75) {
                return getRandomScore(85, 100);
            }
            return getRandomScore(60, 90);
        }
        return Math.max(0, Math.min(100, Math.round(baseScore)));
    }

    function normalizeAssessment(a) {
        const verdictKey = ['good', 'caution', 'bad'].includes(a.verdict) ? a.verdict : 'caution';

        let score = 0;
        if (typeof a.quality_score === 'number') {
            score = a.quality_score;
        } else if (typeof a.quality_score === 'string') {
            const match = a.quality_score.match(/(\d+)/);
            score = match ? Number(match[1]) : 0;
        }

        if (!Number.isFinite(score)) score = 0;
        score = Math.max(0, Math.min(100, Math.round(score)));

        const isNoFood = typeof a.food_identified === 'string'
            && /unclear\s*—?\s*not a food image/i.test(a.food_identified);

        const passCount = getPassedCheckCount(a.checks);
        const derivedScore = deriveScoreFromChecks(passCount, isNoFood, score, verdictKey);
        score = Math.max(0, Math.min(100, derivedScore));

        const confidence = Number(a.confidence);
        const normalizedConfidence = Number.isFinite(confidence)
            ? Math.max(0, Math.min(100, Math.round(confidence)))
            : (isNoFood ? 0 : Math.max(20, Math.min(100, Math.round(score * 0.75))));

        return {
            ...a,
            verdict: verdictKey,
            quality_score: score,
            confidence: normalizedConfidence
        };
    }

    function renderResults(a) {
        a = normalizeAssessment(a);
        const verdictKey = a.verdict;
        const v = VERDICT_MAP[verdictKey];

        verdictBadge.className = `fc-verdict-badge ${v.cls}`;
        verdictIcon.className = `fas ${v.icon}`;
        verdictText.textContent = v.label;

        foodNameEl.textContent = a.food_identified || 'Food item';

        const score = Math.max(0, Math.min(100, Number(a.quality_score) || 0));
        scoreFill.style.width = `${score}%`;
        scoreLabel.textContent = `${score}/100`;
        if (donateBtn) {
            donateBtn.disabled = score < 50;
        }

        if (checkSummaryEl) {
            const passedLabel = a.checks && Object.values(a.checks).filter((check) => check && check.pass).length;
            const totalLabel = Object.keys(CHECK_LABELS).length;
            checkSummaryEl.textContent = `Quality checks passed: ${passedLabel} of ${totalLabel}`;
        }
        summaryEl.textContent = a.summary || '';

        // Checklist
        checklistEl.innerHTML = '';
        const checks = a.checks || {};
        Object.keys(CHECK_LABELS).forEach((key) => {
            const check = checks[key];
            if (!check) return;
            const li = document.createElement('li');
            li.className = check.pass ? 'fc-pass' : 'fc-fail';
            li.innerHTML = `
                <i class="fas ${check.pass ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                <span><span class="fc-check-label">${escapeHtml(CHECK_LABELS[key])}:</span> ${escapeHtml(check.note || '')}</span>
            `;
            checklistEl.appendChild(li);
        });

        // Issues
        const issues = Array.isArray(a.issues) ? a.issues.filter(Boolean) : [];
        if (issues.length) {
            issuesList.innerHTML = '';
            issues.forEach((issue) => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-circle-exclamation"></i><span>${escapeHtml(issue)}</span>`;
                issuesList.appendChild(li);
            });
            issuesCard.hidden = false;
        } else {
            issuesCard.hidden = true;
        }

        recommendationEl.textContent = a.recommendation || '';
    }

    anotherBtn.addEventListener('click', () => {
        resultsSection.hidden = true;
        uploaderCard.hidden = false;
        removeBtn.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Helpers ------------------------------------------------------------
    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.hidden = false;
    }
    function hideError() {
        errorMsg.hidden = true;
        errorMsg.textContent = '';
    }
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
})();
