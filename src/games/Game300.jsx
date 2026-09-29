import GameScreen from '../components/GameScreen.jsx';
import Icon from '../components/Icon.jsx';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RulesModal from '../components/RulesModal';
import { useLanguage } from '../context/LanguageContext';
import { SetupCard, SoloEndCard } from '../components/GameShell';

// Normalisasi jawaban untuk toleransi format (koma/titik desimal, pemisah ribuan, spasi, huruf besar/kecil)
const normalizeAns = (val) => {
  if (val === undefined || val === null) return '';
  let s = val.toString().trim().toLowerCase();
  // Tangani pemisah ribuan standar (misal: 10.000 atau 10,000 menjadi 10000)
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) {
    s = s.replace(/[.,]/g, '');
  } else if (/^\d+,\d+$/.test(s)) {
    // Koma desimal menjadi titik desimal (misal 0,75 -> 0.75)
    s = s.replace(',', '.');
  }
  return s;
};

// Helper FPB & KPK
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

export default function Game300({ onBack, onNavigate }) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState(null); // null, 'practice_setup', 'war_setup', 'practice', 'war'
  const [schoolLevel, setSchoolLevel] = useState('universitas'); // 'sd', 'smp', 'sma', 'universitas'
  const [showRules, setShowRules] = useState(false);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard', 'impossible'
  const [warPagesCount, setWarPagesCount] = useState(10); // 1 to 10 pages (30 to 300 questions)
  const [practiceQuestionsCount, setPracticeQuestionsCount] = useState(30);

  const [categories, setCategories] = useState({
    // SD
    sdIntegersValue: true,
    sdBasicOps: true,
    sdProperties: true,
    sdGcdLcm: true,
    sdFractionDecimal: true,
    sdProportionScale: true,
    sdSocialBasic: true,
    // SMP
    smpNegComplex: true,
    smpExponentRoot: true,
    smpNumberPattern: true,
    smpSequences: true,
    smpProportions: true,
    smpSocialMid: true,
    // SMA
    smaAdvLog: true,
    smaAdvSequences: true,
    smaInfiniteGeom: true,
    smaInduction: true,
    smaFinance: true,
    // Universitas
    basicArithmetic: true,
    additionSubtraction: true,
    multiplicationDivision: true,
    mixed: true,
    factorial: true,
    exponentiation: true,
    root: true,
    baseConversion: true,
  });

  // Game Arena State
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [pages, setPages] = useState([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [pageResults, setPageResults] = useState({});
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalErrorsEncountered, setTotalErrorsEncountered] = useState(0);

  // Practice State
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceCount, setPracticeCount] = useState(0);

  // Refs
  const gridContainerRef = useRef(null);
  const inputsRef = useRef([]);
  const practiceInputRef = useRef(null);
  const timerRef = useRef(null);
  const penaltyRef = useRef(null);
  const practiceTimeoutRef = useRef(null);

  // Toggle checklist kategori dengan validasi minimal 1 aktif
  const toggleCategory = (key) => {
    setCategories((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      if (key === 'basicArithmetic') {
        const val = next.basicArithmetic;
        next.additionSubtraction = val;
        next.multiplicationDivision = val;
        next.mixed = val;
      } else if (['additionSubtraction', 'multiplicationDivision', 'mixed'].includes(key)) {
        next.basicArithmetic = next.additionSubtraction || next.multiplicationDivision || next.mixed;
      }

      // Pastikan ada setidaknya satu kategori aktif per tingkat
      const sdKeys = ['sdIntegersValue', 'sdBasicOps', 'sdProperties', 'sdGcdLcm', 'sdFractionDecimal', 'sdProportionScale', 'sdSocialBasic'];
      if (sdKeys.includes(key) && !sdKeys.some((k) => next[k])) return prev;

      const smpKeys = ['smpNegComplex', 'smpExponentRoot', 'smpNumberPattern', 'smpSequences', 'smpProportions', 'smpSocialMid'];
      if (smpKeys.includes(key) && !smpKeys.some((k) => next[k])) return prev;

      const smaKeys = ['smaAdvLog', 'smaAdvSequences', 'smaInfiniteGeom', 'smaInduction', 'smaFinance'];
      if (smaKeys.includes(key) && !smaKeys.some((k) => next[k])) return prev;

      const univKeys = ['basicArithmetic', 'factorial', 'exponentiation', 'root', 'baseConversion'];
      if (univKeys.includes(key) && !univKeys.some((k) => next[k])) return prev;

      return next;
    });
  };

  const setAllCategories = (enabled) => {
    setCategories((prev) => {
      const next = { ...prev };
      if (schoolLevel === 'sd') {
        ['sdIntegersValue', 'sdBasicOps', 'sdProperties', 'sdGcdLcm', 'sdFractionDecimal', 'sdProportionScale', 'sdSocialBasic'].forEach((k) => (next[k] = enabled));
        if (!enabled) next.sdBasicOps = true;
      } else if (schoolLevel === 'smp') {
        ['smpNegComplex', 'smpExponentRoot', 'smpNumberPattern', 'smpSequences', 'smpProportions', 'smpSocialMid'].forEach((k) => (next[k] = enabled));
        if (!enabled) next.smpNegComplex = true;
      } else if (schoolLevel === 'sma') {
        ['smaAdvLog', 'smaAdvSequences', 'smaInfiniteGeom', 'smaInduction', 'smaFinance'].forEach((k) => (next[k] = enabled));
        if (!enabled) next.smaAdvLog = true;
      } else {
        ['basicArithmetic', 'additionSubtraction', 'multiplicationDivision', 'mixed', 'factorial', 'exponentiation', 'root', 'baseConversion'].forEach((k) => (next[k] = enabled));
        if (!enabled) {
          next.basicArithmetic = true;
          next.additionSubtraction = true;
        }
      }
      return next;
    });
  };

  // ─── GENERATOR MATEMATIKA DINAMIS ──────────────────────────────────────────
  const generateEquation = useCallback(
    (lvl = schoolLevel) => {
      let multiplier = 1;
      if (difficulty === 'easy') multiplier = 0.5;
      else if (difficulty === 'hard') multiplier = 1.6;
      else if (difficulty === 'impossible') multiplier = 3.0;

      // 1. SD (SEKOLAH DASAR)
      if (lvl === 'sd') {
        const active = [];
        if (categories.sdIntegersValue) active.push('integersValue');
        if (categories.sdBasicOps) active.push('basicOps');
        if (categories.sdProperties) active.push('properties');
        if (categories.sdGcdLcm) active.push('gcdLcm');
        if (categories.sdFractionDecimal) active.push('fractionDecimal');
        if (categories.sdProportionScale) active.push('proportionScale');
        if (categories.sdSocialBasic) active.push('socialBasic');
        const cat = active.length > 0 ? active[Math.floor(Math.random() * active.length)] : 'basicOps';

        if (cat === 'integersValue') {
          const num = Math.floor(Math.random() * 8999) + 1000;
          const sNum = num.toString();
          const types = [
            { labelId: 'Angka ribuan dari', labelEn: 'Thousands digit of', ans: sNum[0] },
            { labelId: 'Angka ratusan dari', labelEn: 'Hundreds digit of', ans: sNum[1] },
            { labelId: 'Angka puluhan dari', labelEn: 'Tens digit of', ans: sNum[2] },
            { labelId: 'Angka satuan dari', labelEn: 'Units digit of', ans: sNum[3] },
            { labelId: 'Nilai angka ' + sNum[1] + ' dalam', labelEn: 'Value of ' + sNum[1] + ' in', ans: (parseInt(sNum[1], 10) * 100).toString() },
            { labelId: 'Nilai angka ' + sNum[2] + ' dalam', labelEn: 'Value of ' + sNum[2] + ' in', ans: (parseInt(sNum[2], 10) * 10).toString() },
          ];
          const chosen = types[Math.floor(Math.random() * types.length)];
          return {
            equation: `${lang === 'en' ? chosen.labelEn : chosen.labelId} ${num}`,
            answer: chosen.ans,
          };
        } else if (cat === 'basicOps') {
          const ops = ['+', '-', '×', '÷'];
          const op = ops[Math.floor(Math.random() * (difficulty === 'easy' ? 2 : 4))];
          if (op === '+') {
            const a = Math.floor(Math.random() * 80 * multiplier) + 10;
            const b = Math.floor(Math.random() * 80 * multiplier) + 10;
            return { equation: `${a} + ${b}`, answer: (a + b).toString() };
          } else if (op === '-') {
            const b = Math.floor(Math.random() * 60 * multiplier) + 10;
            const a = b + Math.floor(Math.random() * 60 * multiplier) + 5;
            return { equation: `${a} - ${b}`, answer: (a - b).toString() };
          } else if (op === '×') {
            const a = Math.floor(Math.random() * 12) + 2;
            const b = Math.floor(Math.random() * 12) + 2;
            return { equation: `${a} × ${b}`, answer: (a * b).toString() };
          } else {
            const b = Math.floor(Math.random() * 10) + 2;
            const ans = Math.floor(Math.random() * 12) + 2;
            const a = b * ans;
            return { equation: `${a} ÷ ${b}`, answer: ans.toString() };
          }
        } else if (cat === 'properties') {
          const a = Math.floor(Math.random() * 20) + 5;
          const b = Math.floor(Math.random() * 15) + 3;
          const c = Math.floor(Math.random() * 15) + 3;
          return {
            equation: `${a} × (${b} + ${c}) = (${a} × ${b}) + (${a} × x). x`,
            answer: c.toString(),
          };
        } else if (cat === 'gcdLcm') {
          const isGcd = Math.random() < 0.5;
          const g = Math.floor(Math.random() * 6) + 2;
          const m1 = [2, 3, 5][Math.floor(Math.random() * 3)];
          let m2 = [2, 3, 5, 7][Math.floor(Math.random() * 4)];
          if (m1 === m2) m2 += 1;
          const a = g * m1;
          const b = g * m2;
          const ans = isGcd ? gcd(a, b) : lcm(a, b);
          return {
            equation: `${isGcd ? (lang === 'en' ? 'GCD of' : 'FPB dari') : (lang === 'en' ? 'LCM of' : 'KPK dari')} ${a} & ${b}`,
            answer: ans.toString(),
          };
        } else if (cat === 'fractionDecimal') {
          const pairs = [
            { f: '1/2', p: '50', d: '0.5' },
            { f: '1/4', p: '25', d: '0.25' },
            { f: '3/4', p: '75', d: '0.75' },
            { f: '1/5', p: '20', d: '0.2' },
            { f: '2/5', p: '40', d: '0.4' },
            { f: '3/5', p: '60', d: '0.6' },
            { f: '4/5', p: '80', d: '0.8' },
          ];
          const pick = pairs[Math.floor(Math.random() * pairs.length)];
          const modeChoice = Math.random();
          if (modeChoice < 0.5) {
            return {
              equation: `${pick.f} ${lang === 'en' ? 'in percent (%)' : 'dalam persen (%)'}`,
              answer: pick.p,
            };
          } else {
            return {
              equation: `${pick.f} + ${pick.d}`,
              answer: (parseFloat(pick.d) * 2).toString(),
            };
          }
        } else if (cat === 'proportionScale') {
          const scale = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
          const mapCm = Math.floor(Math.random() * 8) + 2;
          const realM = (mapCm * scale) / 100;
          return {
            equation: `${lang === 'en' ? 'Scale' : 'Skala'} 1:${scale}, ${lang === 'en' ? 'Map' : 'Peta'} ${mapCm}cm. ${lang === 'en' ? 'Real dist (m)' : 'Jarak asli (m)'}`,
            answer: realM.toString(),
          };
        } else {
          const buy = (Math.floor(Math.random() * 40) + 10) * 1000;
          const profit = (Math.floor(Math.random() * 15) + 5) * 1000;
          return {
            equation: `${lang === 'en' ? 'Buy' : 'Beli'} ${buy}, ${lang === 'en' ? 'Profit' : 'Untung'} ${profit}. ${lang === 'en' ? 'Sell price' : 'Harga jual'}`,
            answer: (buy + profit).toString(),
          };
        }
      }

      // 2. SMP
      if (lvl === 'smp') {
        const active = [];
        if (categories.smpNegComplex) active.push('negComplex');
        if (categories.smpExponentRoot) active.push('exponentRoot');
        if (categories.smpNumberPattern) active.push('numberPattern');
        if (categories.smpSequences) active.push('sequences');
        if (categories.smpProportions) active.push('proportions');
        if (categories.smpSocialMid) active.push('socialMid');
        const cat = active.length > 0 ? active[Math.floor(Math.random() * active.length)] : 'negComplex';

        if (cat === 'negComplex') {
          const a = (Math.floor(Math.random() * 15) + 3) * -1;
          const b = Math.floor(Math.random() * 6) + 2;
          const c = Math.floor(Math.random() * 5) + 1;
          const ans = a + b * c;
          return { equation: `${a} + (${b}) × ${c}`, answer: ans.toString() };
        } else if (cat === 'exponentRoot') {
          const a = Math.floor(Math.random() * 12) + 4;
          const b = Math.floor(Math.random() * 10) + 2;
          const isAdd = Math.random() < 0.5;
          return {
            equation: `√${a * a} ${isAdd ? '+' : '-'} √${b * b}`,
            answer: (isAdd ? a + b : a - b).toString(),
          };
        } else if (cat === 'numberPattern') {
          const start = Math.floor(Math.random() * 10) + 1;
          const diff = Math.floor(Math.random() * 5) + 2;
          return {
            equation: `${start}, ${start + diff}, ${start + 2 * diff}, ${start + 3 * diff}, ... ?`,
            answer: (start + 4 * diff).toString(),
          };
        } else if (cat === 'sequences') {
          const a = Math.floor(Math.random() * 8) + 2;
          const b = Math.floor(Math.random() * 4) + 2;
          const n = Math.floor(Math.random() * 5) + 6;
          const ans = a + (n - 1) * b;
          return {
            equation: `${lang === 'en' ? `Term ${n} of` : `Suku ke-${n} dari`} ${a}, ${a + b}, ${a + 2 * b}...`,
            answer: ans.toString(),
          };
        } else if (cat === 'proportions') {
          const w1 = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
          const days1 = [6, 12, 18, 24][Math.floor(Math.random() * 4)];
          const totalWork = w1 * days1;
          const w2Options = [2, 3, 4, 6, 8, 9, 12].filter((w) => w !== w1 && totalWork % w === 0);
          const w2 = w2Options[Math.floor(Math.random() * w2Options.length)] || 2;
          const days2 = totalWork / w2;
          return {
            equation: `${w1} ${lang === 'en' ? 'workers' : 'orang'} = ${days1} ${lang === 'en' ? 'days' : 'hari'}. ${w2} ${lang === 'en' ? 'workers' : 'orang'} = ?`,
            answer: days2.toString(),
          };
        } else {
          const price = (Math.floor(Math.random() * 10) + 2) * 20000;
          const disc = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
          const paid = price * (1 - disc / 100);
          return {
            equation: `${price} ${lang === 'en' ? `discount ${disc}%` : `diskon ${disc}%`}`,
            answer: paid.toString(),
          };
        }
      }

      // 3. SMA
      if (lvl === 'sma') {
        const active = [];
        if (categories.smaAdvLog) active.push('advLog');
        if (categories.smaAdvSequences) active.push('advSequences');
        if (categories.smaInfiniteGeom) active.push('infiniteGeom');
        if (categories.smaInduction) active.push('induction');
        if (categories.smaFinance) active.push('finance');
        const cat = active.length > 0 ? active[Math.floor(Math.random() * active.length)] : 'advLog';

        if (cat === 'advLog') {
          const base = [2, 3, 5][Math.floor(Math.random() * 3)];
          const p1 = Math.floor(Math.random() * 3) + 2;
          const p2 = Math.floor(Math.random() * 2) + 1;
          const val1 = Math.pow(base, p1);
          const val2 = Math.pow(base, p2);
          return {
            equation: `^${base}log(${val1}) + ^${base}log(${val2})`,
            answer: (p1 + p2).toString(),
          };
        } else if (cat === 'advSequences') {
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 4) + 2;
          const n = [20, 25, 50][Math.floor(Math.random() * 3)];
          const ans = a + (n - 1) * b;
          return {
            equation: `${lang === 'en' ? `Term ${n} of` : `Suku ke-${n} dari`} ${a}, ${a + b}, ${a + 2 * b}...`,
            answer: ans.toString(),
          };
        } else if (cat === 'infiniteGeom') {
          const rInv = [2, 3, 4][Math.floor(Math.random() * 3)];
          const factor = Math.floor(Math.random() * 8) + 2;
          const a = (rInv - 1) * factor * 2;
          const sInf = (a * rInv) / (rInv - 1);
          return {
            equation: `S∞ = ${a} + ${a / rInv} + ${a / (rInv * rInv)} + ...`,
            answer: sInf.toString(),
          };
        } else if (cat === 'induction') {
          const n = Math.floor(Math.random() * 15) + 6;
          const isSquares = Math.random() < 0.5;
          if (isSquares) {
            return { equation: `1 + 3 + ... + (2n-1). n=${n}`, answer: (n * n).toString() };
          } else {
            return { equation: `1 + 2 + ... + n. n=${n}`, answer: ((n * (n + 1)) / 2).toString() };
          }
        } else {
          const p = (Math.floor(Math.random() * 5) + 1) * 100000;
          return {
            equation: `${lang === 'en' ? 'Compound 10%/yr' : 'Bunga Majemuk 10%/th'}: ${p} (2 ${lang === 'en' ? 'yrs' : 'thn'})`,
            answer: Math.round(p * 1.21).toString(),
          };
        }
      }

      // 4. UNIVERSITAS (University War 300 Questions Standard)
      const active = [];
      if (categories.additionSubtraction) active.push('addsub');
      if (categories.multiplicationDivision) active.push('muldiv');
      if (categories.mixed) active.push('mixed');
      if (categories.factorial) active.push('factorial');
      if (categories.exponentiation) active.push('exponentiation');
      if (categories.root) active.push('root');
      if (categories.baseConversion) active.push('baseConversion');
      const cat = active.length > 0 ? active[Math.floor(Math.random() * active.length)] : 'addsub';

      if (cat === 'addsub') {
        const a = Math.floor((Math.random() * 700 + 100) * multiplier);
        const b = Math.floor((Math.random() * 500 + 50) * multiplier);
        const c = Math.floor((Math.random() * 200 + 20) * multiplier);
        const isPlus = Math.random() < 0.5;
        const ans = isPlus ? a + b - c : a - b + c;
        return {
          equation: `${a} ${isPlus ? '+' : '-'} ${b} ${isPlus ? '-' : '+'} ${c}`,
          answer: ans.toString(),
        };
      } else if (cat === 'muldiv') {
        const c = [2, 3, 4, 5, 6, 8, 9][Math.floor(Math.random() * 7)];
        const k = Math.floor(Math.random() * 12 * multiplier) + 2;
        const b = c * k;
        const a = Math.floor((Math.random() * 200 + 50) * multiplier);
        const ans = (a * b) / c;
        return { equation: `${a} × ${b} ÷ ${c}`, answer: ans.toString() };
      } else if (cat === 'mixed') {
        const a = Math.floor((Math.random() * 150 + 20) * multiplier);
        const b = Math.floor((Math.random() * 30 + 5) * multiplier);
        const c = Math.floor(Math.random() * 15) + 3;
        return { equation: `${a} + ${b} × ${c}`, answer: (a + b * c).toString() };
      } else if (cat === 'factorial') {
        const options = [
          { eq: '5! - 4!', ans: 96 },
          { eq: '6! - 5!', ans: 600 },
          { eq: '7! - 6!', ans: 4320 },
          { eq: '5! ÷ 3!', ans: 20 },
          { eq: '6! ÷ 4!', ans: 30 },
          { eq: '4! × 3', ans: 72 },
          { eq: '5! + 4!', ans: 144 },
        ];
        const pick = options[Math.floor(Math.random() * options.length)];
        return { equation: pick.eq, answer: pick.ans.toString() };
      } else if (cat === 'exponentiation') {
        const options = [
          { eq: '3⁴ - 2⁵ + 5³', ans: 174 },
          { eq: '4³ - 3³ + 2⁶', ans: 101 },
          { eq: '9³ - 8³ + 3⁴', ans: 298 },
          { eq: '5³ - 4³ + 2⁸', ans: 317 },
          { eq: '2⁷ + 3⁴ - 4³', ans: 145 },
          { eq: '6³ - 5³ + 2⁵', ans: 123 },
        ];
        const pick = options[Math.floor(Math.random() * options.length)];
        return { equation: pick.eq, answer: pick.ans.toString() };
      } else if (cat === 'root') {
        const x = Math.floor(Math.random() * 80 + 30);
        return { equation: `√${x * x}`, answer: x.toString() };
      } else {
        const val = Math.floor(Math.random() * 120) + 20;
        const bases = [
          { name: lang === 'en' ? 'bin' : 'biner', b: 2 },
          { name: lang === 'en' ? 'oct' : 'oktal', b: 8 },
          { name: lang === 'en' ? 'hex' : 'heksa', b: 16 },
        ];
        const base = bases[Math.floor(Math.random() * bases.length)];
        let ans = val.toString(base.b).toUpperCase();
        return { equation: `${val} → ${base.name}`, answer: ans };
      }
    },
    [categories, difficulty, lang, schoolLevel]
  );

  // ─── PEMBERSIHAN MEMORY SAAT UNMOUNT ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (penaltyRef.current) clearInterval(penaltyRef.current);
      if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    };
  }, []);

  // Timer stopwatch Arena
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Penalty countdown
  useEffect(() => {
    if (penaltyTime > 0) {
      penaltyRef.current = setInterval(() => {
        setPenaltyTime((p) => {
          if (p <= 1) {
            clearInterval(penaltyRef.current);
            // Fokuskan kembali ke salah satu input yang salah
            setTimeout(() => {
              const firstWrong = inputsRef.current.find((input) => input && input.dataset.wrong === 'true');
              if (firstWrong) firstWrong.focus();
            }, 50);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => {
      if (penaltyRef.current) clearInterval(penaltyRef.current);
    };
  }, [penaltyTime]);

  // ─── PRACTICE MODE LOGIC ───────────────────────────────────────────────────
  const startPracticeMode = () => {
    setMode('practice');
    setPracticeCount(0);
    setPracticeFeedback(null);
    setPracticeInput('');
    setPracticeQuestion(generateEquation());
    setTimeout(() => practiceInputRef.current?.focus(), 150);
  };

  const submitPractice = (e) => {
    e.preventDefault();
    if (practiceFeedback === 'correct' || !practiceQuestion) return;

    const userAns = normalizeAns(practiceInput);
    const correctAns = normalizeAns(practiceQuestion.answer);

    if (userAns === correctAns) {
      setPracticeFeedback('correct');
      setPracticeCount((c) => {
        const nextVal = c + 1;
        if (nextVal < practiceQuestionsCount) {
          practiceTimeoutRef.current = setTimeout(() => {
            setPracticeQuestion(generateEquation());
            setPracticeInput('');
            setPracticeFeedback(null);
            setTimeout(() => practiceInputRef.current?.focus(), 50);
          }, 800);
        }
        return nextVal;
      });
    } else {
      setPracticeFeedback('wrong');
    }
  };

  // ─── ARENA / WAR MODE LOGIC ────────────────────────────────────────────────
  const startWarMode = () => {
    const allPages = [];
    for (let p = 0; p < warPagesCount; p++) {
      const pageQs = [];
      for (let q = 0; q < 30; q++) {
        pageQs.push(generateEquation());
      }
      allPages.push(pageQs);
    }
    setPages(allPages);
    setUserAnswers({});
    setPageResults({});
    setCurrentPageIdx(0);
    setTimer(0);
    setPenaltyTime(0);
    setTotalErrorsEncountered(0);
    setIsCompleted(false);
    setTimerActive(true);
    setMode('war');

    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 200);
  };

  const handleWarInput = (pageIdx, qIdx, val) => {
    setUserAnswers((prev) => ({
      ...prev,
      [`${pageIdx}_${qIdx}`]: val,
    }));
  };

  const handleKeyDown = (e, qIdx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (qIdx < 29) {
        inputsRef.current[qIdx + 1]?.focus();
      } else {
        checkWarPage();
      }
    } else if (e.key === 'ArrowDown' && qIdx < 29) {
      inputsRef.current[qIdx + 1]?.focus();
    } else if (e.key === 'ArrowUp' && qIdx > 0) {
      inputsRef.current[qIdx - 1]?.focus();
    }
  };

  const checkWarPage = () => {
    if (penaltyTime > 0 || !pages[currentPageIdx]) return;

    const currentQs = pages[currentPageIdx];
    let errors = 0;

    for (let q = 0; q < 30; q++) {
      const u = normalizeAns(userAnswers[`${currentPageIdx}_${q}`]);
      const c = normalizeAns(currentQs[q].answer);
      if (u !== c) errors++;
    }

    if (errors === 0) {
      // 100% Benar!
      setPageResults((prev) => ({
        ...prev,
        [currentPageIdx]: { checked: true, errorsCount: 0 },
      }));

      if (currentPageIdx === pages.length - 1) {
        // Tamat arena
        setTimerActive(false);
        setIsCompleted(true);
      } else {
        // Pindah halaman berikutnya
        setCurrentPageIdx((p) => p + 1);
        if (gridContainerRef.current) gridContainerRef.current.scrollTop = 0;
        setTimeout(() => {
          inputsRef.current[0]?.focus();
        }, 150);
      }
    } else {
      // Ada kesalahan -> Berikan penalti 10 detik
      setTotalErrorsEncountered((prev) => prev + errors);
      setPenaltyTime(10);
      setPageResults((prev) => ({
        ...prev,
        [currentPageIdx]: { checked: true, errorsCount: errors },
      }));
    }
  };

  const handleExit = () => {
    setMode(null);
    setTimerActive(false);
    setPenaltyTime(0);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── ATURAN & TEKS TERJEMAHAN ──────────────────────────────────────────────
  const rules =
    lang === 'en'
      ? [
          `In Arena Mode, solve a total of ${warPagesCount * 30} questions in rapid succession.`,
          `The test is split into ${warPagesCount} page(s) with exactly 30 questions per page.`,
          'You can only advance to the next page once ALL 30 questions on the current page are 100% correct.',
          'Submitting incorrect answers locks the inputs for a 10-second penalty.',
          'Use the Enter or Arrow keys to quickly jump between question inputs.',
        ]
      : [
          `Dalam Mode Arena, selesaikan total ${warPagesCount * 30} soal hitungan secepat mungkin.`,
          `Ujian dibagi menjadi ${warPagesCount} halaman dengan tepat 30 soal per halaman.`,
          'Anda hanya dapat melanjutkan ke halaman berikutnya jika seluruh 30 soal di halaman tersebut 100% benar.',
          'Jika terdapat jawaban salah saat mengirim halaman, input akan terkunci selama 10 detik sebagai penalti.',
          'Gunakan tombol Enter atau tombol Panah pada keyboard untuk berpindah soal secara cepat.',
        ];

  const t = {
    title: lang === 'en' ? `${warPagesCount * 30} Arithmetic War` : `Tantangan ${warPagesCount * 30} Soal Hitung`,
    selectLevel: lang === 'en' ? 'Select Education Level:' : 'Pilih Jenjang Pendidikan:',
    chooseMode: lang === 'en' ? 'Choose challenge mode:' : 'Pilih mode tantangan:',
    practiceMode: lang === 'en' ? 'Practice Mode' : 'Mode Latihan',
    warMode: lang === 'en' ? 'Arena Mode' : 'Mode Arena',
    quit: lang === 'en' ? 'Quit' : 'Keluar',
    submit: lang === 'en' ? 'Submit' : 'Kirim',
    selectAll: lang === 'en' ? 'Select All' : 'Pilih Semua',
    clearAll: lang === 'en' ? 'Reset' : 'Reset',
  };

  return (
    <GameScreen gameId="300" lang={lang} state={isCompleted || (mode === 'practice' && practiceCount >= practiceQuestionsCount) ? 'ended' : (mode || 'setup')} level={schoolLevel} onBack={onBack} onNavigate={onNavigate} onRules={() => setShowRules(true)}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        ruleList={rules}
        gameName={lang === 'en' ? 'Speed Arithmetic Arena' : 'Arena Hitung Cepat 300'}
      />



      {/* ══════════════ 1. BERANDA / PILIH MODE ══════════════ */}
      {!mode ? (
        <SetupCard heading={lang === 'en' ? 'Find your rhythm' : 'Mulai dari ritmemu'} schoolLevel={schoolLevel} onLevelChange={setSchoolLevel} lang={lang}
          desc={lang === 'en' ? 'Practice one question at a time, or challenge yourself to 30-300 questions in arena mode.' : 'Latihan satu per satu, atau tantang diri dengan 30-300 soal dalam mode arena.'}>
          <button className="uw-btn uw-btn-primary play-mode-button" onClick={() => { setDifficulty('medium'); setMode('practice_setup'); }}><Icon name="bolt" size={19}/><span><strong>{t.practiceMode}</strong><small>{lang === 'en' ? 'One question at a time' : 'Fokus satu soal setiap langkah'}</small></span><Icon name="arrow" size={17}/></button>
          <button className="uw-btn uw-btn-neutral play-mode-button" onClick={() => { setDifficulty('medium'); setMode('war_setup'); }}><Icon name="trophy" size={19}/><span><strong>{t.warMode}</strong><small>{lang === 'en' ? 'A bigger challenge' : 'Tantangan yang lebih besar'}</small></span><Icon name="arrow" size={17}/></button>
        </SetupCard>
      ) : mode === 'practice_setup' || mode === 'war_setup' ? (
        /* ══════════════ 2. SETUP (PRACTICE & WAR) ══════════════ */
        <div className="arithmetic-config" style={{ maxWidth: '580px', margin: '0 auto', padding: 'var(--uw-space-3)' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--uw-primary)', marginBottom: '16px', textAlign: 'center', }}>
            {mode === 'war_setup' ? (lang === 'en' ? 'ARENA CONFIGURATION' : 'PENGATURAN ARENA') : (lang === 'en' ? 'PRACTICE CONFIGURATION' : 'PENGATURAN LATIHAN')}
          </h3>

          {/* Checklist Box */}
          <div
            style={{
              backgroundColor: 'var(--uw-surface-strong)',
              border: '1px solid var(--uw-border)',
              borderRadius: 'var(--uw-radius-md)',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--uw-border)', paddingBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--uw-primary)', }}>
                {lang === 'en' ? 'TOPIC CATEGORIES' : 'KATEGORI MATERI'} ({schoolLevel.toUpperCase()})
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAllCategories(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--uw-secondary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t.selectAll}
                </button>
                <button
                  type="button"
                  onClick={() => setAllCategories(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--uw-text-muted)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t.clearAll}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {schoolLevel === 'sd' && (
                <>
                  <CategoryItem label={lang === 'en' ? 'Place Values (Thousands, Hundreds)' : 'Nilai Tempat (Ribuan, Ratusan)'} checked={categories.sdIntegersValue} onChange={() => toggleCategory('sdIntegersValue')} />
                  <CategoryItem label={lang === 'en' ? 'Basic Operations (+, -, ×, ÷)' : 'Operasi Dasar (+, -, ×, ÷)'} checked={categories.sdBasicOps} onChange={() => toggleCategory('sdBasicOps')} />
                  <CategoryItem label={lang === 'en' ? 'Algebraic Properties (Distributive)' : 'Sifat Operasi (Distributif)'} checked={categories.sdProperties} onChange={() => toggleCategory('sdProperties')} />
                  <CategoryItem label={lang === 'en' ? 'GCD & LCM (FPB & KPK)' : 'FPB & KPK'} checked={categories.sdGcdLcm} onChange={() => toggleCategory('sdGcdLcm')} />
                  <CategoryItem label={lang === 'en' ? 'Fractions, Decimals, & Percentages' : 'Pecahan, Desimal, & Persen'} checked={categories.sdFractionDecimal} onChange={() => toggleCategory('sdFractionDecimal')} />
                  <CategoryItem label={lang === 'en' ? 'Scale & Proportion' : 'Skala Peta & Perbandingan'} checked={categories.sdProportionScale} onChange={() => toggleCategory('sdProportionScale')} />
                  <CategoryItem label={lang === 'en' ? 'Basic Social Arithmetic (Profit/Loss)' : 'Aritmetika Sosial Dasar (Laba/Rugi)'} checked={categories.sdSocialBasic} onChange={() => toggleCategory('sdSocialBasic')} />
                </>
              )}

              {schoolLevel === 'smp' && (
                <>
                  <CategoryItem label={lang === 'en' ? 'Negative Integers Mixed Ops' : 'Bilangan Bulat Negatif Campuran'} checked={categories.smpNegComplex} onChange={() => toggleCategory('smpNegComplex')} />
                  <CategoryItem label={lang === 'en' ? 'Square Roots & Powers' : 'Akar Kuadrat & Pangkat'} checked={categories.smpExponentRoot} onChange={() => toggleCategory('smpExponentRoot')} />
                  <CategoryItem label={lang === 'en' ? 'Number Patterns' : 'Pola Bilangan'} checked={categories.smpNumberPattern} onChange={() => toggleCategory('smpNumberPattern')} />
                  <CategoryItem label={lang === 'en' ? 'Arithmetic Sequences' : 'Barisan & Deret Aritmetika'} checked={categories.smpSequences} onChange={() => toggleCategory('smpSequences')} />
                  <CategoryItem label={lang === 'en' ? 'Inverse & Direct Proportions' : 'Perbandingan Senilai & Berbalik Nilai'} checked={categories.smpProportions} onChange={() => toggleCategory('smpProportions')} />
                  <CategoryItem label={lang === 'en' ? 'Social Arithmetic (Discounts)' : 'Aritmetika Sosial (Diskon/Harga)'} checked={categories.smpSocialMid} onChange={() => toggleCategory('smpSocialMid')} />
                </>
              )}

              {schoolLevel === 'sma' && (
                <>
                  <CategoryItem label={lang === 'en' ? 'Logarithms & Powers' : 'Eksponen & Logaritma'} checked={categories.smaAdvLog} onChange={() => toggleCategory('smaAdvLog')} />
                  <CategoryItem label={lang === 'en' ? 'Advanced Sequences' : 'Barisan & Deret Lanjut'} checked={categories.smaAdvSequences} onChange={() => toggleCategory('smaAdvSequences')} />
                  <CategoryItem label={lang === 'en' ? 'Infinite Geometric Series' : 'Deret Geometri Tak Hingga'} checked={categories.smaInfiniteGeom} onChange={() => toggleCategory('smaInfiniteGeom')} />
                  <CategoryItem label={lang === 'en' ? 'Summation & Induction' : 'Notasi Sigma & Induksi'} checked={categories.smaInduction} onChange={() => toggleCategory('smaInduction')} />
                  <CategoryItem label={lang === 'en' ? 'Financial Mathematics (Compound)' : 'Bunga Majemuk'} checked={categories.smaFinance} onChange={() => toggleCategory('smaFinance')} />
                </>
              )}

              {schoolLevel === 'universitas' && (
                <>
                  <CategoryItem label={lang === 'en' ? 'Addition & Subtraction (Large)' : 'Penjumlahan & Pengurangan Besar'} checked={categories.additionSubtraction} onChange={() => toggleCategory('additionSubtraction')} />
                  <CategoryItem label={lang === 'en' ? 'Multiplication & Exact Division' : 'Perkalian & Pembagian'} checked={categories.multiplicationDivision} onChange={() => toggleCategory('multiplicationDivision')} />
                  <CategoryItem label={lang === 'en' ? 'Mixed Arithmetic (A + B × C)' : 'Operasi Campuran (A + B × C)'} checked={categories.mixed} onChange={() => toggleCategory('mixed')} />
                  <CategoryItem label={lang === 'en' ? 'Factorial Operations' : 'Operasi Faktorial'} checked={categories.factorial} onChange={() => toggleCategory('factorial')} />
                  <CategoryItem label={lang === 'en' ? 'High Exponents' : 'Eksponen Tinggi'} checked={categories.exponentiation} onChange={() => toggleCategory('exponentiation')} />
                  <CategoryItem label={lang === 'en' ? 'Square Root Extraction' : 'Penarikan Akar Kuadrat'} checked={categories.root} onChange={() => toggleCategory('root')} />
                  <CategoryItem label={lang === 'en' ? 'Base Conversion (Bin, Oct, Hex)' : 'Konversi Basis (Biner, Oktal, Heksa)'} checked={categories.baseConversion} onChange={() => toggleCategory('baseConversion')} />
                </>
              )}
            </div>
          </div>

          {/* Slider & Difficulty */}
          <div
            style={{
              backgroundColor: 'var(--uw-surface-strong)',
              border: '1px solid var(--uw-border)',
              borderRadius: 'var(--uw-radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
            }}
          >
            {mode === 'war_setup' ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    ⚔️ {lang === 'en' ? 'Total Questions:' : 'Total Jumlah Soal:'}
                  </span>
                  <span style={{ fontSize: '1.4rem', color: 'var(--uw-primary)' }}>
                    {warPagesCount * 30} ({warPagesCount} {lang === 'en' ? 'Pages' : 'Halaman'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={warPagesCount}
                  onChange={(e) => setWarPagesCount(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 5, 10].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setWarPagesCount(p)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.85rem',
                        borderRadius: '4px',
                        border: '1px solid var(--uw-border)',
                        backgroundColor: warPagesCount === p ? 'var(--uw-primary)' : 'var(--uw-bg)',
                        color: warPagesCount === p ? '#ffffff' : 'var(--uw-text)',
                        cursor: 'pointer',
                        }}
                    >
                      {p * 30} {lang === 'en' ? 'Qs' : 'Soal'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    🎯 {lang === 'en' ? 'Practice Questions:' : 'Jumlah Soal Latihan:'}
                  </span>
                  <span style={{ fontSize: '1.4rem', color: 'var(--uw-primary)' }}>
                    {practiceQuestionsCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={practiceQuestionsCount}
                  onChange={(e) => setPracticeQuestionsCount(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            )}

            {/* Tingkat Kesulitan */}
            <div style={{ borderTop: '1px solid var(--uw-border)', paddingTop: '12px' }}>
              <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '8px' }}>
                ⚡ {lang === 'en' ? 'Difficulty Scale:' : 'Tingkat Kesulitan:'}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['easy', 'medium', 'hard', 'impossible'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '0.9rem',
                      backgroundColor: difficulty === diff ? 'var(--uw-secondary)' : 'var(--uw-bg)',
                      color: difficulty === diff ? '#ffffff' : 'var(--uw-text)',
                      border: '1px solid var(--uw-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="uw-btn uw-btn-neutral" style={{ flex: 1 }} onClick={() => setMode(null)}>
              {lang === 'en' ? 'Back' : 'Kembali'}
            </button>
            <button
              className="uw-btn uw-btn-primary"
              style={{ flex: 1, padding: '12px', fontSize: '1.15rem', }}
              onClick={mode === 'war_setup' ? startWarMode : startPracticeMode}
            >
              {mode === 'war_setup' ? (lang === 'en' ? 'ENTER ARENA' : 'MASUK ARENA') : (lang === 'en' ? 'START PRACTICE' : 'MULAI LATIHAN')}
            </button>
          </div>
        </div>
      ) : mode === 'practice' ? (
        /* ══════════════ 3. MODE LATIHAN ══════════════ */
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: 'var(--uw-space-4) 0' }}>
          {practiceCount >= practiceQuestionsCount ? (
            <SoloEndCard
              heading={lang === 'en' ? 'PRACTICE COMPLETE!' : 'LATIHAN SELESAI!'}
              subtext={lang === 'en' ? `Solved ${practiceQuestionsCount} problems successfully.` : `Berhasil menyelesaikan ${practiceQuestionsCount} soal latihan.`}
              onBack={handleExit}
              onPlayAgain={startPracticeMode}
              playAgainLabel={lang === 'en' ? 'Practice Again' : 'Latihan Lagi'}
              lang={lang}
            />
          ) : (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: 600, color: 'var(--uw-text-muted)' }}>
                {lang === 'en' ? `Question ${practiceCount + 1} of ${practiceQuestionsCount}` : `Soal ${practiceCount + 1} dari ${practiceQuestionsCount}`}
              </div>

              {practiceQuestion && (
                <form className="arithmetic-practice"
                  onSubmit={submitPractice}
                  style={{
                    backgroundColor: 'var(--uw-surface-strong)',
                    padding: '28px 24px',
                    borderRadius: 'var(--uw-radius-md)',
                    border: '1px solid var(--uw-border)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 'bold',
                      color: 'var(--uw-primary)',
                      marginBottom: '20px',
                      }}
                  >
                    {practiceQuestion.equation} = ?
                  </div>

                  <input
                    ref={practiceInputRef}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    placeholder={lang === 'en' ? 'Type your answer' : 'Ketik jawaban Anda'}
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    disabled={practiceFeedback === 'correct'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '1.4rem',
                      textAlign: 'center',
                      borderRadius: 'var(--uw-radius-sm)',
                      border: '2px solid var(--uw-border)',
                      outline: 'none',
                      backgroundColor: 'var(--uw-bg)',
                      color: 'var(--uw-text)',
                      marginBottom: '16px',
                    }}
                  />

                  {practiceFeedback && (
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        color: practiceFeedback === 'correct' ? 'var(--uw-success)' : 'var(--uw-danger)',
                      }}
                    >
                      {practiceFeedback === 'correct' ? (lang === 'en' ? '✓ Correct!' : '✓ Benar!') : (lang === 'en' ? '✕ Incorrect, try again!' : '✕ Belum tepat, coba lagi!')}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="uw-btn uw-btn-neutral" style={{ flex: 1 }} onClick={handleExit}>
                      {t.quit}
                    </button>
                    <button type="submit" className="uw-btn uw-btn-primary" style={{ flex: 1 }}>
                      {t.submit}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ══════════════ 4. MODE ARENA (300 QUESTIONS WAR) ══════════════ */
        <div>
          {/* Header Bar Arena */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--uw-primary)',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: 'var(--uw-radius-sm)',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '1.15rem', }}>
              {lang === 'en' ? 'PAGE' : 'HALAMAN'} {currentPageIdx + 1} / {pages.length} &nbsp;·&nbsp;
              <span style={{ opacity: 0.8 }}>
                {lang === 'en' ? 'Q' : 'Soal'} {currentPageIdx * 30 + 1}–{currentPageIdx * 30 + 30}
              </span>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', }}>
              ⏱ {formatTime(timer)}
            </div>
          </div>

          {/* Banner Penalti */}
          {penaltyTime > 0 && (
            <div
              style={{
                backgroundColor: 'var(--uw-danger)',
                color: '#ffffff',
                padding: '12px',
                borderRadius: 'var(--uw-radius-sm)',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                marginBottom: '16px',
                boxShadow: '0 0 16px rgba(220, 38, 38, 0.4)',
              }}
            >
              ⚠️ {lang === 'en' ? `WRONG ANSWERS! LOCKED FOR ${penaltyTime}s` : `ADA JAWABAN SALAH! INPUT TERKUNCI ${penaltyTime} DETIK`}
            </div>
          )}

          {isCompleted ? (
            /* Halaman Tamat Arena */
            <div style={{ textAlign: 'center' }}>
              <SoloEndCard
                heading={lang === 'en' ? 'ARENA CONQUERED!' : 'ARENA SELESAI DITAKLUKKAN!'}
                subtext={
                  lang === 'en'
                    ? `You finished all ${pages.length * 30} arithmetic problems in ${formatTime(timer)} with ${totalErrorsEncountered} errors penalty!`
                    : `Anda menyelesaikan seluruh ${pages.length * 30} soal hitungan dalam waktu ${formatTime(timer)} dengan total ${totalErrorsEncountered} penalti kesalahan!`
                }
                onBack={handleExit}
                onPlayAgain={startWarMode}
                playAgainLabel={lang === 'en' ? 'Restart Arena' : 'Ulangi Arena'}
                lang={lang}
              />
            </div>
          ) : (
            /* Grid 30 Soal per Halaman */
            <div>
              <div
                ref={gridContainerRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                  gap: '10px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  padding: '12px',
                  backgroundColor: 'var(--uw-bg-strong)',
                  borderRadius: 'var(--uw-radius-md)',
                  border: '1px solid var(--uw-border)',
                  marginBottom: '16px',
                }}
              >
                {pages[currentPageIdx]?.map((q, idx) => {
                  const key = `${currentPageIdx}_${idx}`;
                  const isChecked = pageResults[currentPageIdx]?.checked;
                  const isWrong = isChecked && normalizeAns(userAnswers[key]) !== normalizeAns(q.answer);

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: isWrong ? '#fee2e2' : 'var(--uw-surface-strong)',
                        border: isWrong ? '2px solid var(--uw-danger)' : '1px solid var(--uw-border)',
                        borderRadius: 'var(--uw-radius-sm)',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--uw-text-muted)', fontWeight: 'bold' }}>
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: 'var(--uw-primary)',
                            maxWidth: '100%',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                          }}
                          title={q.equation}
                        >
                          {q.equation}
                        </span>
                      </div>

                      <input
                        ref={(el) => (inputsRef.current[idx] = el)}
                        aria-label={`${lang === "en" ? "Answer" : "Jawaban"} ${idx + 1}: ${q.equation}`}
                        data-wrong={isWrong ? 'true' : 'false'}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        disabled={penaltyTime > 0}
                        value={userAnswers[key] || ''}
                        onChange={(e) => handleWarInput(currentPageIdx, idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        style={{
                          width: '72px',
                          padding: '6px 4px',
                          textAlign: 'center',
                          borderRadius: '4px',
                          border: isWrong ? '1px solid var(--uw-danger)' : '1px solid var(--uw-border)',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          outline: 'none',
                          backgroundColor: penaltyTime > 0 ? 'rgba(0,0,0,0.05)' : '#ffffff',
                          color: 'var(--uw-text)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Panel Bawah Arena */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button className="uw-btn uw-btn-neutral" onClick={handleExit}>
                  {lang === 'en' ? 'Surrender / Exit' : 'Menyerah / Keluar'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {pageResults[currentPageIdx]?.checked && pageResults[currentPageIdx].errorsCount > 0 && (
                    <span style={{ color: 'var(--uw-danger)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      ⚠️ {pageResults[currentPageIdx].errorsCount} {lang === 'en' ? 'errors on this page' : 'jawaban salah'}
                    </span>
                  )}

                  <button
                    className="uw-btn uw-btn-primary"
                    onClick={checkWarPage}
                    disabled={penaltyTime > 0}
                    style={{
                      padding: '12px 28px',
                      fontSize: '1.2rem',
                      opacity: penaltyTime > 0 ? 0.6 : 1,
                    }}
                  >
                    {lang === 'en' ? `SUBMIT PAGE ${currentPageIdx + 1}` : `KIRIM HALAMAN ${currentPageIdx + 1}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </GameScreen>
  );
}

// Komponen Pembantu Item Checkbox
function CategoryItem({ label, checked, onChange }) {
  return (
    <label className="arithmetic-topic" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: 'var(--uw-text)', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--uw-primary)' }}
      />
      <span>{label}</span>
    </label>
  );
}
