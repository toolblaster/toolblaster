/**
 * Smart Word Counter & Text Analyzer Engine
 * Core Logic: Real-time Metrics, Keyword Density, Time Estimators, Formatting, Export & Import
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const textarea = document.getElementById('main-textarea');
    const backdrop = document.getElementById('highlight-backdrop');
    
    // Smart Paste Overlay
    const pasteOverlay = document.getElementById('paste-overlay');
    const btnPasteCenter = document.getElementById('btn-paste-center');

    // Floating Typing Indicator
    const typingIndicator = document.getElementById('typing-indicator');
    let typingTimer;

    // Stats Elements
    const statWords = document.getElementById('stat-words');
    const statChars = document.getElementById('stat-chars');
    const statSentences = document.getElementById('stat-sentences');
    const statParagraphs = document.getElementById('stat-paragraphs');
    const charNoSpace = document.getElementById('char-no-space');
    
    // Advanced Panels Toggles
    const toggleGoal = document.getElementById('toggle-goal');
    const toggleAnalysis = document.getElementById('toggle-analysis');
    const goalBody = document.getElementById('goal-body');
    const analysisBody = document.getElementById('analysis-body');

    // Writing Goal Elements
    const goalInput = document.getElementById('goal-input');
    const goalStatusText = document.getElementById('goal-status-text');
    const goalPercentage = document.getElementById('goal-percentage');
    const goalProgressBar = document.getElementById('goal-progress-bar');
    
    // Analysis & Readability
    const timeRead = document.getElementById('time-read');
    const timeSpeak = document.getElementById('time-speak');
    const readScore = document.getElementById('readability-score');
    const readLabel = document.getElementById('readability-label');
    
    // Social Limits
    const igCount = document.getElementById('ig-count');
    const fbCount = document.getElementById('fb-count');
    const twitterCount = document.getElementById('twitter-count');
    const liCount = document.getElementById('li-count');
    
    // Keyword Density Elements
    const keywordList = document.getElementById('keyword-list');
    const btnCopyKw = document.getElementById('btn-copy-kw');
    const btnExportKw = document.getElementById('btn-export-kw');
    
    // Formatting & Action Buttons
    const btnSentence = document.getElementById('btn-sentencecase'); 
    const btnUpper = document.getElementById('btn-uppercase');
    const btnLower = document.getElementById('btn-lowercase');
    const btnTitle = document.getElementById('btn-titlecase');
    const btnTrim = document.getElementById('btn-trim');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');
    
    // Export Document Buttons
    const btnPrint = document.getElementById('btn-print');
    const btnImportFile = document.getElementById('btn-import-file');
    const btnExportTxt = document.getElementById('btn-export-txt');
    const btnExportDoc = document.getElementById('btn-export-doc');
    const btnExportPdf = document.getElementById('btn-export-pdf');

    // Find & Replace Elements
    const btnToggleFind = document.getElementById('btn-toggle-find');
    const findReplacePanel = document.getElementById('find-replace-panel');
    const btnCloseFind = document.getElementById('btn-close-find');
    const findInput = document.getElementById('find-input');
    const replaceInput = document.getElementById('replace-input');
    const matchCaseCheck = document.getElementById('match-case');
    const btnReplace = document.getElementById('btn-replace');
    const btnReplaceAll = document.getElementById('btn-replace-all');

    // Toast Notification
    const toast = document.getElementById('toast-notification');
    
    // --- State ---
    let activeHighlightKW = null;
    let currentKeywordData = [];

    // --- Constants: Massive Multilingual Stop Words Dictionary ---
    const STOP_WORDS = new Set([
        // English
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 
        'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 
        'this', 'to', 'was', 'will', 'with', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 
        'why', 'has', 'have', 'had', 'been', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 
        'do', 'does', 'did', 'am', 'i', 'you', 'he', 'she', 'we', 'us', 'me', 'my', 'your', 'yours', 
        'his', 'her', 'hers', 'its', 'our', 'ours', 'them', 'from', 'about', 'out', 'up', 'down', 'so',
        
        // Hindi
        'है', 'के', 'में', 'की', 'और', 'से', 'को', 'का', 'एक', 'पर', 'कि', 'तो', 'ही', 'भी', 'ने', 
        'यह', 'हो', 'जो', 'लिए', 'अपने', 'नहीं', 'कर', 'क्या', 'था', 'साथ', 'या', 'हैं', 'करते', 'वाले',
        
        // Urdu
        'ہے', 'کے', 'میں', 'کی', 'اور', 'سے', 'کو', 'کا', 'ایک', 'پر', 'کہ', 'تو', 'ہی', 'بھی', 'نے', 
        'یہ', 'ہو', 'جو', 'لیے', 'اپنے', 'نہیں', 'کر', 'کیا', 'تھا', 'ساتھ', 'یا', 'ہیں',
        
        // Russian
        'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она', 'так', 
        'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее', 'мне', 'было', 
        'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда', 'даже', 'ну', 'вдруг', 
        'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до', 'вас', 'нибудь', 'опять', 'уж', 
        'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей', 'может', 'они', 'тут', 'где', 'есть', 
        'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем', 'была', 'сам', 'чтоб', 'без', 'будто', 'человек',
        
        // Japanese
        'は', 'の', 'に', 'を', 'た', 'が', 'て', 'と', 'で', 'し', 'いる', 'ある', 'も', 'する', 'から', 
        'な', 'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 
        'よう', 'また', 'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ', 'によって', 
        'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる', 'において', 'ば', 'なけれ', 'なく', 'しかし', 
        'について', 'せ', 'だっ', 'その後', 'できる', 'それ', 'う', 'ので', 'なお', 'のみ', 'でき', 'き', 'つ',
        
        // Chinese
        '的', '了', '和', '是', '就', '都', '而', '及', '与', '着', '或', '一个', '没有', '我们', '你们', 
        '他们', '她', '他', '它', '这', '那', '我', '你', '也', '在', '上', '有', '个', '到', '说', '里', 
        '为', '去', '又', '可', '能', '很', '要', '把', '于', '对', '等', '之', '以', '其', '从', '更', 
        '还', '被', '让', '向', '往', '所', '由', '连', '给', '管', '凭', '除了', '为了', '由于', '至于', 
        '关于', '对于', '哪怕', '按', '按照', '根据', '因为',
        
        // Tagalog (Filipino)
        'ang', 'mga', 'ng', 'sa', 'at', 'ay', 'na', 'ito', 'iya', 'iyan', 'iyon', 'dito', 'niyan', 
        'niyon', 'nito', 'nila', 'natin', 'namin', 'ko', 'mo', 'niya', 'kayo', 'tayo', 'sila', 'kami', 
        'ako', 'ikaw', 'siya', 'kay', 'kina', 'ni', 'nina', 'para', 'upang', 'dahil', 'sapagkat', 
        'kung', 'kapag', 'pag', 'nang', 'habang', 'samantala', 'hanggang', 'bago', 'pagkatapos', 
        'mula', 'kahit', 'bagaman', 'kundi', 'kaysa', 'tulad', 'gaya', 'bilang', 'ba', 'eh', 'kasi', 
        'naman', 'nga', 'pala', 'sana', 'yata', 'tuloy', 'kaya'
    ]);

    // --- Core Functions ---
    
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Sync scrolling between Textarea and Highlight Backdrop
    textarea.addEventListener('scroll', () => {
        backdrop.scrollTop = textarea.scrollTop;
        backdrop.scrollLeft = textarea.scrollLeft;
    });

    // Readability: Syllable Counter Logic (English focused)
    function countSyllables(text) {
        let count = 0;
        const words = text.match(/\b[\w'-]+\b/g) || [];
        words.forEach(word => {
            word = word.toLowerCase();
            if(word.length <= 3) { count += 1; return; }
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const syllables = word.match(/[aeiouy]{1,2}/g);
            count += syllables ? syllables.length : 1;
        });
        return count;
    }

    // --- CUSTOM CHAR-BY-CHAR HIGHLIGHTING ENGINE (Multilingual Safe) ---
    function renderHighlights() {
        const text = textarea.value;
        if (!text) {
            backdrop.innerHTML = '';
            return;
        }

        let ranges = []; 

        const addRanges = (regex, className) => {
            let match;
            while ((match = regex.exec(text)) !== null) {
                ranges.push({ start: match.index, end: match.index + match[0].length, class: className });
                if (match.index === regex.lastIndex) regex.lastIndex++;
            }
        };

        // 1. Find & Replace Highlight (Multilingual safe)
        if (!findReplacePanel.classList.contains('hidden') && findInput.value) {
            const safeFind = findInput.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const flags = matchCaseCheck.checked ? 'g' : 'gi';
            addRanges(new RegExp(safeFind, flags), 'highlight-find');
        }

        // 2. Keyword Highlight (Multilingual conditional bounds)
        if (activeHighlightKW) {
            const safeKW = activeHighlightKW.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const isNonAscii = /[^\x00-\x7F]/.test(safeKW);
            const kwRegex = isNonAscii ? new RegExp(safeKW, 'gi') : new RegExp(`\\b${safeKW}\\b`, 'gi');
            addRanges(kwRegex, 'highlight-mark');
        }

        // 3. Duplicate Words
        try {
            addRanges(/([\p{L}\p{N}_]+)(\s+)(\1)(?=[^\p{L}\p{N}_]|$)/giu, 'highlight-duplicate');
        } catch (e) {
            addRanges(/(\b\w+\b)(\s+)(\1\b)/gi, 'highlight-duplicate');
        }

        // 4. Grammar Punctuation Hint
        addRanges(/(\s+)([.!,?;:。，！、？：；])/g, 'highlight-grammar');

        if (ranges.length === 0) {
            let escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            backdrop.innerHTML = escapedText + '<br>';
            return;
        }

        let result = '';
        let currentClasses = '';
        let currentChunk = '';

        for (let i = 0; i < text.length; i++) {
            let activeClasses = new Set();
            for (let r of ranges) {
                if (i >= r.start && i < r.end) {
                    activeClasses.add(r.class);
                }
            }
            
            let classesStr = Array.from(activeClasses).sort().join(' ');
            let char = text[i];
            
            if (char === '&') char = '&amp;';
            else if (char === '<') char = '&lt;';
            else if (char === '>') char = '&gt;';

            if (classesStr !== currentClasses) {
                if (currentChunk) {
                    if (currentClasses) {
                        result += `<mark class="${currentClasses}">${currentChunk}</mark>`;
                    } else {
                        result += currentChunk;
                    }
                }
                currentClasses = classesStr;
                currentChunk = char;
            } else {
                currentChunk += char;
            }
        }
        
        if (currentChunk) {
            if (currentClasses) {
                result += `<mark class="${currentClasses}">${currentChunk}</mark>`;
            } else {
                result += currentChunk;
            }
        }

        backdrop.innerHTML = result + '<br>'; 
    }

    function analyzeText() {
        const text = textarea.value;
        
        if (text.length > 0) {
            pasteOverlay.classList.add('hidden');
        } else {
            pasteOverlay.classList.remove('hidden');
            activeHighlightKW = null; 
        }

        localStorage.setItem('tb_word_counter_autosave', text);

        const charCount = text.length;
        const charNoSpaceCount = text.replace(/\s+/g, '').length;
        
        // --- MULTILINGUAL WORD SEGMENTATION ---
        let wordsArray = [];
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
            const segments = segmenter.segment(text);
            for (const {segment, isWordLike} of segments) {
                if (isWordLike && segment.trim().length > 0) {
                    wordsArray.push(segment);
                }
            }
        } else {
            wordsArray = text.match(/\b[\w'-]+\b/g) || [];
        }
        const wordCount = wordsArray.length;
        
        const sCount = text.trim() === '' ? 0 : text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length;
        const pCount = text.trim() === '' ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;

        statChars.textContent = charCount;
        charNoSpace.textContent = `No spaces: ${charNoSpaceCount}`;
        statWords.textContent = wordCount;
        statSentences.textContent = sCount;
        statParagraphs.textContent = pCount;

        // Only calculate goal if panel is active
        if (!goalBody.classList.contains('hidden')) {
            const targetWords = parseInt(goalInput.value) || 1; 
            const progressPercent = Math.min(100, Math.floor((wordCount / targetWords) * 100));
            
            goalStatusText.textContent = `${wordCount} / ${targetWords}`;
            goalPercentage.textContent = `${progressPercent}%`;
            goalProgressBar.style.width = `${progressPercent}%`;
            
            if (wordCount >= targetWords && targetWords > 0) {
                goalProgressBar.classList.remove('bg-red-600');
                goalProgressBar.classList.add('bg-emerald-500');
                goalStatusText.classList.add('text-emerald-600');
                goalPercentage.classList.remove('text-stone-600', 'bg-white', 'border-stone-100');
                goalPercentage.classList.add('text-emerald-700', 'bg-emerald-50', 'border-emerald-200');
            } else {
                goalProgressBar.classList.remove('bg-emerald-500');
                goalProgressBar.classList.add('bg-red-600');
                goalStatusText.classList.remove('text-emerald-600');
                goalPercentage.classList.remove('text-emerald-700', 'bg-emerald-50', 'border-emerald-200');
                goalPercentage.classList.add('text-stone-600', 'bg-white', 'border-stone-100');
            }
        }

        if (igCount && fbCount && twitterCount && liCount) {
            igCount.textContent = charCount;
            fbCount.textContent = charCount;
            twitterCount.textContent = charCount;
            liCount.textContent = charCount;
            
            igCount.classList.toggle('text-red-600', charCount > 150);
            fbCount.classList.toggle('text-red-600', charCount > 250);
            twitterCount.classList.toggle('text-red-600', charCount > 280);
            liCount.classList.toggle('text-red-600', charCount > 300);
        }

        // Only calculate analysis if panel is active
        if (!analysisBody.classList.contains('hidden')) {
            const readMins = Math.ceil(wordCount / 200);
            const speakMins = Math.ceil(wordCount / 130);
            
            timeRead.textContent = wordCount > 0 ? (readMins < 1 ? '< 1 min' : `~${readMins} min`) : '0 min';
            timeSpeak.textContent = wordCount > 0 ? (speakMins < 1 ? '< 1 min' : `~${speakMins} min`) : '0 min';

            const nonLatinMatch = text.match(/[^\x00-\x7F]/g);
            const nonLatinRatio = nonLatinMatch ? nonLatinMatch.length / text.length : 0;

            if (wordCount === 0 || sCount === 0) {
                readScore.textContent = "0";
                readLabel.textContent = "N/A";
            } else if (nonLatinRatio > 0.3) {
                readScore.textContent = "N/A";
                readLabel.textContent = "Non-Latin Text";
                readScore.title = "Readability score is primarily calibrated for English/Latin scripts.";
            } else {
                const syllables = countSyllables(text);
                let grade = 0.39 * (wordCount / sCount) + 11.8 * (syllables / wordCount) - 15.59;
                grade = Math.max(0, Math.round(grade * 10) / 10);
                readScore.textContent = grade;
                readScore.title = "Flesch-Kincaid Grade Level";
                
                if (grade <= 6) readLabel.textContent = 'Easy';
                else if (grade <= 9) readLabel.textContent = 'Conversational';
                else if (grade <= 12) readLabel.textContent = 'Advanced';
                else readLabel.textContent = 'Academic';
            }
        }

        analyzeKeywords(wordsArray, wordCount);
        renderHighlights();
    }

    function analyzeKeywords(wordsArray, totalWords) {
        currentKeywordData = [];

        if (totalWords === 0) {
            keywordList.innerHTML = '<div class="flex h-full items-center justify-center text-center text-stone-600 text-[11px] font-medium py-10">Start typing to see SEO keyword density analysis.</div>';
            return;
        }

        const frequency = {};
        let validKeywordsCount = 0;

        wordsArray.forEach(word => {
            const w = word.toLowerCase();
            const isNonAscii = /[^\x00-\x7F]/.test(w);
            if (!STOP_WORDS.has(w) && (w.length > 2 || isNonAscii) && isNaN(w)) {
                frequency[w] = (frequency[w] || 0) + 1;
                validKeywordsCount++;
            }
        });

        const sortedKeys = Object.keys(frequency)
            .sort((a, b) => frequency[b] - frequency[a])
            .slice(0, 10);

        if (sortedKeys.length === 0) {
            keywordList.innerHTML = '<div class="flex h-full items-center justify-center text-center text-stone-600 text-[11px] font-medium py-10">Not enough descriptive words yet.</div>';
            return;
        }

        let html = '';
        sortedKeys.forEach(key => {
            const count = frequency[key];
            const percentage = ((count / totalWords) * 100).toFixed(1);
            
            currentKeywordData.push({ key, count, percentage });
            
            const isHigh = percentage > 3.0;
            const barColor = isHigh ? 'bg-amber-600' : 'bg-emerald-600';
            const warningIcon = isHigh ? '<i class="fa-solid fa-triangle-exclamation text-amber-600 ml-1" title="High density (Check for keyword stuffing)"></i>' : '';
            const isHighlighted = activeHighlightKW === key;
            const highlightClass = isHighlighted ? 'text-amber-600 opacity-100' : 'text-stone-500 opacity-0 group-hover/kw:opacity-100';

            html += `
                <div class="mb-1.5 group/kw relative bg-white transition-colors rounded p-0.5 ${isHighlighted ? 'ring-1 ring-amber-200' : ''}">
                    <div class="flex justify-between items-center text-[11px] font-bold text-stone-700 mb-1">
                        <span class="truncate pr-2 uppercase tracking-wide flex items-center">
                            ${key} ${warningIcon}
                            <button class="ml-2 transition-all highlight-kw-btn focus:opacity-100 focus:outline-none ${highlightClass}" data-kw="${key}" title="Highlight in text" aria-label="Highlight keyword">
                                <i class="fa-solid fa-highlighter"></i>
                            </button>
                        </span>
                        <span class="flex-shrink-0 text-stone-500">${count} <span class="opacity-60">(${percentage}%)</span></span>
                    </div>
                    <div class="w-full bg-stone-100 rounded-full h-1 overflow-hidden">
                        <div class="${barColor} h-1 rounded-full transition-all duration-300" style="width: ${Math.min(percentage * 10, 100)}%"></div>
                    </div>
                </div>
            `;
        });

        keywordList.innerHTML = html;
    }

    // --- Toggle Pro Panels Logic ---
    const showGoal = localStorage.getItem('tb_wc_show_goal') === 'true';
    const showAnalysis = localStorage.getItem('tb_wc_show_analysis') === 'true';

    toggleGoal.checked = showGoal;
    toggleAnalysis.checked = showAnalysis;

    if (showGoal) goalBody.classList.remove('hidden');
    if (showAnalysis) analysisBody.classList.remove('hidden');

    toggleGoal.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        localStorage.setItem('tb_wc_show_goal', isChecked);
        if (isChecked) {
            goalBody.classList.remove('hidden');
            analyzeText(); 
        } else {
            goalBody.classList.add('hidden');
        }
    });

    toggleAnalysis.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        localStorage.setItem('tb_wc_show_analysis', isChecked);
        if (isChecked) {
            analysisBody.classList.remove('hidden');
            analyzeText(); 
        } else {
            analysisBody.classList.add('hidden');
        }
    });

    // --- Goal Input Listener ---
    goalInput.addEventListener('input', () => {
        let val = parseInt(goalInput.value);
        if (val < 1 || isNaN(val)) val = 1;
        localStorage.setItem('tb_word_counter_goal', val);
        analyzeText();
    });

    // --- Highlight Button Delegation ---
    keywordList.addEventListener('click', (e) => {
        const btn = e.target.closest('.highlight-kw-btn');
        if (btn) {
            const kw = btn.dataset.kw;
            activeHighlightKW = (activeHighlightKW === kw) ? null : kw;
            analyzeText(); 
        }
    });

    // --- FIND & REPLACE LOGIC ---
    
    btnToggleFind.addEventListener('click', () => {
        findReplacePanel.classList.toggle('hidden');
        if (!findReplacePanel.classList.contains('hidden')) {
            findInput.focus();
        } else {
            findInput.value = '';
            replaceInput.value = '';
        }
        analyzeText();
    });

    btnCloseFind.addEventListener('click', () => {
        findReplacePanel.classList.add('hidden');
        findInput.value = '';
        replaceInput.value = '';
        analyzeText();
    });

    findInput.addEventListener('input', analyzeText);
    matchCaseCheck.addEventListener('change', analyzeText);

    btnReplace.addEventListener('click', () => {
        const findStr = findInput.value;
        if (!findStr) return;
        
        const replaceStr = replaceInput.value;
        const flags = matchCaseCheck.checked ? '' : 'i';
        const safeFind = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeFind, flags);
        
        if (regex.test(textarea.value)) {
            textarea.value = textarea.value.replace(regex, replaceStr);
            analyzeText();
            showToast("1 replacement made");
        } else {
            showToast("No matches found");
        }
    });

    btnReplaceAll.addEventListener('click', () => {
        const findStr = findInput.value;
        if (!findStr) return;
        
        const replaceStr = replaceInput.value;
        const flags = matchCaseCheck.checked ? 'g' : 'gi';
        const safeFind = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeFind, flags);
        
        const matchCount = (textarea.value.match(regex) || []).length;
        if (matchCount > 0) {
            textarea.value = textarea.value.replace(regex, replaceStr);
            analyzeText();
            showToast(`${matchCount} replacements made`);
        } else {
            showToast("No matches found");
        }
    });

    // --- EXPORT DOCUMENT LOGIC ---
    
    btnExportTxt.addEventListener('click', () => {
        const text = textarea.value;
        if (!text.trim()) return showToast("Nothing to export!");
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolblaster_document_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Exported as .TXT!");
    });

    btnExportDoc.addEventListener('click', () => {
        const text = textarea.value;
        if (!text.trim()) return showToast("Nothing to export!");
        
        // Construct a valid MS Word HTML Document format
        const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Exported Document</title></head><body>";
        const postHtml = "</body></html>";
        const html = preHtml + text.replace(/\n/g, '<br>') + postHtml;
        
        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolblaster_document_${new Date().toISOString().split('T')[0]}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Exported as Word Document!");
    });

    btnExportPdf.addEventListener('click', () => {
        const text = textarea.value;
        if (!text.trim()) return showToast("Nothing to export!");
        
        if (typeof window.jspdf === 'undefined') {
            return showToast("PDF engine loading. Please try again in a second.");
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        const margin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        
        let y = margin + 5;
        
        for (let i = 0; i < lines.length; i++) {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin + 5;
            }
            doc.text(lines[i], margin, y);
            y += 7; 
        }
        
        doc.save(`toolblaster_document_${new Date().toISOString().split('T')[0]}.pdf`);
        showToast("Exported as PDF!");
    });

    // --- Export & Copy Keywords ---
    btnCopyKw.addEventListener('click', () => {
        if(currentKeywordData.length === 0) return showToast("No keywords to copy");
        let txt = "Keyword\tCount\tPercentage\n";
        currentKeywordData.forEach(item => {
            txt += `${item.key}\t${item.count}\t${item.percentage}%\n`;
        });
        navigator.clipboard.writeText(txt).then(() => showToast("Keywords copied!"));
    });

    btnExportKw.addEventListener('click', () => {
        if(currentKeywordData.length === 0) return showToast("No keywords to export");
        let csv = "Keyword,Count,Percentage\n";
        currentKeywordData.forEach(item => {
            csv += `"${item.key}",${item.count},${item.percentage}%\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toolblaster_keywords_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // --- PRINT LOGIC ---
    btnPrint.addEventListener('click', () => {
        const text = textarea.value;
        if (!text.trim()) return showToast("Nothing to print!");
        
        const printFrame = document.getElementById('print-frame');
        const printDoc = printFrame.contentWindow.document;
        
        printDoc.open();
        printDoc.write('<html><head><title>Print Document</title>');
        printDoc.write('<style>body{font-family: sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 20px; color: #000;}</style>');
        printDoc.write('</head><body>');
        printDoc.write(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        printDoc.write('</body></html>');
        printDoc.close();
        
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
    });

    // --- SMART FILE IMPORT LOGIC ---
    btnImportFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showToast("Extracting text...");
        let extractedText = "";
        const fileName = file.name.toLowerCase();

        try {
            // Plain text formats
            if (fileName.endsWith('.txt') || fileName.endsWith('.csv') || fileName.endsWith('.md')) {
                extractedText = await file.text();
            } 
            // PDF Format
            else if (fileName.endsWith('.pdf')) {
                if (typeof window.pdfjsLib === 'undefined' || !window.pdfjsLib.getDocument) {
                    e.target.value = '';
                    return showToast("PDF engine loading. Please try again.");
                }
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    extractedText += pageText + '\n\n';
                }
            } 
            // DOCX Format
            else if (fileName.endsWith('.docx')) {
                if (typeof window.mammoth === 'undefined') {
                    e.target.value = '';
                    return showToast("DOCX engine loading. Please try again.");
                }
                const arrayBuffer = await file.arrayBuffer();
                const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                extractedText = result.value;
            } 
            // Unsupported
            else {
                e.target.value = '';
                return showToast("Unsupported format. Use TXT, PDF, or DOCX.");
            }

            if (extractedText.trim()) {
                textarea.value = extractedText;
                analyzeText();
                showToast("Document Imported!");
            } else {
                showToast("No text could be extracted.");
            }
        } catch (err) {
            console.error("Import Error:", err);
            showToast("Error extracting text. File might be corrupted.");
        }
        
        e.target.value = '';
    });

    // Handle Smart Paste Button
    btnPasteCenter.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText) {
                textarea.value = clipboardText;
                analyzeText();
                showToast("Pasted from clipboard!");
                textarea.focus();
            } else {
                showToast("Clipboard is empty.");
            }
        } catch (err) {
            showToast("Please allow clipboard permissions to use this feature.");
        }
    });

    // --- Formatting Tools ---
    btnSentence.addEventListener('click', () => {
        if (!textarea.value) return;
        textarea.value = textarea.value.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        analyzeText();
        showToast("Converted to Normal (Sentence case)");
    });

    btnUpper.addEventListener('click', () => {
        if (!textarea.value) return;
        textarea.value = textarea.value.toUpperCase();
        analyzeText();
        showToast("Converted to UPPERCASE");
    });

    btnLower.addEventListener('click', () => {
        if (!textarea.value) return;
        textarea.value = textarea.value.toLowerCase();
        analyzeText();
        showToast("Converted to lowercase");
    });

    btnTitle.addEventListener('click', () => {
        if (!textarea.value) return;
        textarea.value = textarea.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        analyzeText();
        showToast("Converted to Title Case");
    });

    btnTrim.addEventListener('click', () => {
        if (!textarea.value) return;
        textarea.value = textarea.value.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
        analyzeText();
        showToast("Extra spaces trimmed");
    });

    // --- Action Buttons ---
    btnCopy.addEventListener('click', () => {
        if (textarea.value.trim() === '') {
            showToast("Nothing to copy!");
            return;
        }
        
        try {
            navigator.clipboard.writeText(textarea.value).then(() => {
                showToast("Text copied to clipboard!");
            });
        } catch (err) {
            textarea.select();
            document.execCommand('copy');
            showToast("Text copied to clipboard!");
        }
    });

    btnClear.addEventListener('click', () => {
        if (textarea.value.trim() === '') return;
        if (confirm("Are you sure you want to clear all text?")) {
            textarea.value = '';
            analyzeText();
            showToast("Text cleared");
            textarea.focus();
        }
    });

    // --- Event Listeners & Initialization ---
    textarea.addEventListener('input', () => {
        analyzeText();
        
        // Show floating typing indicator
        if (typingIndicator) {
            typingIndicator.classList.remove('opacity-0', 'translate-y-2');
            typingIndicator.classList.add('opacity-100', 'translate-y-0');
            
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                typingIndicator.classList.remove('opacity-100', 'translate-y-0');
                typingIndicator.classList.add('opacity-0', 'translate-y-2');
            }, 800);
        }
    });
    
    // Restore Autosaved Goal & Text
    const savedGoal = localStorage.getItem('tb_word_counter_goal');
    if (savedGoal) {
        goalInput.value = savedGoal;
    }
    
    const savedText = localStorage.getItem('tb_word_counter_autosave');
    if (savedText) {
        textarea.value = savedText;
        analyzeText(); 
    } else {
        analyzeText(); // Initial run to set up 0 states
    }
});